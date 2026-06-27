// Telegram long-polling worker. Reuses the Bridge orchestrator end-to-end, so the
// Telegram bot has the same capabilities as WhatsApp. No public URL is required.

import { handleBridgeMessage } from "../bridge-agent/orchestrator.js";
import {
  getUpdates,
  sendTelegramMessage,
  answerCallbackQuery,
  deleteWebhook,
  extractTelegramInbound,
  inlineKeyboardFromInteractive,
} from "./client.js";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function handleTelegramUpdate({ update, bridgeService, openAIConfig, exaApiKey, token, logger = console }) {
  const inboundMessage = extractTelegramInbound(update);
  if (!inboundMessage) return;

  if (inboundMessage.callbackQueryId) {
    await answerCallbackQuery({ token, callbackQueryId: inboundMessage.callbackQueryId });
  }

  const result = await handleBridgeMessage({ bridgeService, openAIConfig, exaApiKey, inboundMessage });
  if (result.duplicate || !result.reply) return;

  const replyMarkup = inlineKeyboardFromInteractive(result.interactive);
  try {
    await sendTelegramMessage({ token, chatId: inboundMessage.chatId, text: result.reply, replyMarkup });
  } catch (error) {
    logger.warn?.("[telegram] send with keyboard failed, retrying as plain text:", error.message);
    await sendTelegramMessage({ token, chatId: inboundMessage.chatId, text: result.reply });
  }
}

// Starts the polling loop. Returns { stop } to halt it. Resolves once polling has
// begun (after clearing any existing webhook so getUpdates is allowed).
export async function startTelegramPoller({ bridgeService, openAIConfig, exaApiKey, token, logger = console }) {
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN is required to start the Telegram poller");

  await deleteWebhook({ token }); // getUpdates and webhooks are mutually exclusive
  let running = true;
  let offset = 0;

  (async function loop() {
    logger.log?.("[telegram] long-poll loop started");
    while (running) {
      try {
        const updates = await getUpdates({ token, offset, timeout: 25 });
        for (const update of updates) {
          offset = update.update_id + 1;
          await handleTelegramUpdate({ update, bridgeService, openAIConfig, exaApiKey, token, logger }).catch(
            (error) => logger.error?.("[telegram] update failed:", error.message)
          );
        }
      } catch (error) {
        logger.error?.("[telegram] poll error:", error.message);
        await sleep(2000); // back off on transient errors (network / 409 conflicts)
      }
    }
    logger.log?.("[telegram] long-poll loop stopped");
  })();

  return { stop: () => { running = false; } };
}
