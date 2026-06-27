// Telegram Bot API adapter. Mirrors the WhatsApp client but for Telegram, so the
// same Bridge orchestrator can serve a Telegram bot. Long-polling means no public
// URL / tunnel is required — ideal as a WhatsApp fallback for demos.

const apiBase = (token) => `https://api.telegram.org/bot${token}`;

export async function getUpdates({ token, offset = 0, timeout = 25 }) {
  const params = new URLSearchParams({
    timeout: String(timeout),
    offset: String(offset),
    allowed_updates: JSON.stringify(["message", "callback_query"]),
  });
  const response = await fetch(`${apiBase(token)}/getUpdates?${params.toString()}`);
  const data = await response.json().catch(() => ({}));
  if (!data.ok) throw new Error(`Telegram getUpdates failed: ${data.description || response.statusText}`);
  return data.result || [];
}

export async function sendTelegramMessage({ token, chatId, text, replyMarkup }) {
  const response = await fetch(`${apiBase(token)}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: truncateForTelegram(text),
      reply_markup: replyMarkup,
    }),
  });
  const data = await response.json().catch(() => ({}));
  if (!data.ok) throw new Error(`Telegram sendMessage failed: ${data.description || response.statusText}`);
  return data;
}

export async function answerCallbackQuery({ token, callbackQueryId }) {
  if (!callbackQueryId) return;
  await fetch(`${apiBase(token)}/answerCallbackQuery`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ callback_query_id: callbackQueryId }),
  }).catch(() => {});
}

export async function deleteWebhook({ token }) {
  await fetch(`${apiBase(token)}/deleteWebhook?drop_pending_updates=false`).catch(() => {});
}

function fullName(user = {}) {
  return [user.first_name, user.last_name].filter(Boolean).join(" ") || user.username || "";
}

// Normalize a Telegram update into the channel-agnostic inbound shape the Bridge
// orchestrator consumes. Returns null for updates we don't handle.
export function extractTelegramInbound(update) {
  if (!update || typeof update !== "object") return null;

  if (update.message && typeof update.message.text === "string") {
    const message = update.message;
    return {
      id: `tg:${update.update_id}`,
      channel: "telegram",
      from: String(message.from?.id ?? ""),
      chatId: String(message.chat?.id ?? message.from?.id ?? ""),
      type: "text",
      text: message.text,
      displayName: fullName(message.from),
      raw: update,
    };
  }

  if (update.callback_query) {
    const cq = update.callback_query;
    const data = String(cq.data || "");
    // Make button presses legible to the LLM: "job:<id>" -> a clear instruction.
    const text = data.startsWith("job:")
      ? `Show me details for this job (id: ${data.slice(4)})`
      : data;
    return {
      id: `tg:${update.update_id}`,
      channel: "telegram",
      from: String(cq.from?.id ?? ""),
      chatId: String(cq.message?.chat?.id ?? cq.from?.id ?? ""),
      type: "interactive",
      text,
      callbackData: data,
      callbackQueryId: cq.id,
      displayName: fullName(cq.from),
      raw: update,
    };
  }

  return null;
}

// Convert the orchestrator's interactive "list" suggestion into a Telegram inline
// keyboard (one button per row, callback_data carries the row id).
export function inlineKeyboardFromInteractive(interactive) {
  if (!interactive || interactive.type !== "list") return undefined;
  const rows = (interactive.rows || []).slice(0, 10).map((row) => [
    {
      text: String(row.title || "Option").slice(0, 60),
      callback_data: String(row.id || "").slice(0, 64),
    },
  ]);
  if (rows.length === 0) return undefined;
  return { inline_keyboard: rows };
}

export function truncateForTelegram(text, limit = 4096) {
  const value = String(text || "");
  if (value.length <= limit) return value;
  return `${value.slice(0, limit - 1)}…`;
}
