const GRAPH_VERSION = "v20.0";

export function extractInboundMessages(payload) {
  const messages = [];
  const entries = payload?.entry || [];

  for (const entry of entries) {
    for (const change of entry.changes || []) {
      const value = change.value || {};
      const phoneNumberId = value.metadata?.phone_number_id;

      for (const message of value.messages || []) {
        const contact = value.contacts?.find((item) => item.wa_id === message.from);
        messages.push({
          id: message.id,
          from: message.from,
          phoneNumberId,
          timestamp: message.timestamp,
          type: message.type,
          text: message.text?.body || "",
          buttonText: message.button?.text || "",
          listReplyId: message.interactive?.list_reply?.id || "",
          listReplyTitle: message.interactive?.list_reply?.title || "",
          buttonReplyId: message.interactive?.button_reply?.id || "",
          buttonReplyTitle: message.interactive?.button_reply?.title || "",
          displayName: contact?.profile?.name || "",
          raw: message,
        });
      }
    }
  }

  return messages;
}

export async function sendWhatsAppMessage({ token, phoneNumberId, to, payload }) {
  const response = await fetch(
    `https://graph.facebook.com/${GRAPH_VERSION}/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to,
        ...payload,
      }),
    }
  );

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = data?.error?.message || response.statusText;
    throw new Error(`WhatsApp send failed: ${detail}`);
  }

  return data;
}

export function textMessage(body) {
  return {
    type: "text",
    text: {
      preview_url: false,
      body: truncateForWhatsApp(body),
    },
  };
}

export function listMessage({ body, buttonText = "Choose", rows = [] }) {
  const safeRows = rows.slice(0, 10).map((row, index) => ({
    id: String(row.id || `row_${index}`).slice(0, 200),
    title: String(row.title || `Option ${index + 1}`).slice(0, 24),
    description: String(row.description || "").slice(0, 72),
  }));

  return {
    type: "interactive",
    interactive: {
      type: "list",
      body: { text: truncateForWhatsApp(body, 1024) },
      action: {
        button: String(buttonText).slice(0, 20),
        sections: [{ title: "Bridge", rows: safeRows }],
      },
    },
  };
}

export function buttonMessage({ body, buttons = [] }) {
  return {
    type: "interactive",
    interactive: {
      type: "button",
      body: { text: truncateForWhatsApp(body, 1024) },
      action: {
        buttons: buttons.slice(0, 3).map((button, index) => ({
          type: "reply",
          reply: {
            id: String(button.id || `button_${index}`).slice(0, 256),
            title: String(button.title || `Option ${index + 1}`).slice(0, 20),
          },
        })),
      },
    },
  };
}

export function truncateForWhatsApp(text, limit = 3900) {
  const value = String(text || "");
  if (value.length <= limit) return value;
  return `${value.slice(0, limit - 1)}…`;
}
