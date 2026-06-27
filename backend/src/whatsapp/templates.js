import { sendWhatsAppMessage } from "./client.js";

export async function sendTemplate({
  token,
  phoneNumberId,
  to,
  templateName,
  languageCode = "en",
  components = [],
}) {
  return sendWhatsAppMessage({
    token,
    phoneNumberId,
    to,
    payload: {
      type: "template",
      template: {
        name: templateName,
        language: { code: languageCode },
        components,
      },
    },
  });
}
