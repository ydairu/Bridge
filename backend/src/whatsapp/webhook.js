import { getEnv, getOpenAIModel } from "../config/env.js";
import { handleBridgeMessage } from "../bridge-agent/orchestrator.js";
import {
  extractInboundMessages,
  sendWhatsAppMessage,
  textMessage,
  listMessage,
} from "./client.js";
import { verifyWhatsAppSignature } from "./signature.js";

export function registerWhatsAppWebhookRoutes({ app, bridgeService }) {
  app.get("/webhooks/whatsapp", (req, res) => {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode === "subscribe" && token === getEnv("WHATSAPP_VERIFY_TOKEN")) {
      return res.status(200).send(challenge);
    }

    return res.sendStatus(403);
  });

  app.post("/webhooks/whatsapp", async (req, res) => {
    const validSignature = verifyWhatsAppSignature({
      appSecret: getEnv("WHATSAPP_APP_SECRET"),
      rawBody: req.rawBody,
      signatureHeader: req.header("X-Hub-Signature-256"),
    });

    if (!validSignature) {
      return res.status(401).json({ error: "Invalid WhatsApp signature" });
    }

    const messages = extractInboundMessages(req.body);
    res.sendStatus(200);

    for (const inboundMessage of messages) {
      processWhatsAppMessage({ bridgeService, inboundMessage }).catch((error) => {
        console.error("[whatsapp] async message processing failed:", error);
      });
    }
  });
}

async function processWhatsAppMessage({ bridgeService, inboundMessage }) {
  const result = await handleBridgeMessage({
    bridgeService,
    inboundMessage,
    openAIConfig: {
      apiKey: getEnv("OPENAI_API_KEY"),
      model: getOpenAIModel(),
    },
    exaApiKey: getEnv("EXA_API_KEY"),
  });

  if (result.duplicate || !result.reply) return;

  const token = getEnv("WHATSAPP_TOKEN");
  const phoneNumberId = inboundMessage.phoneNumberId || getEnv("WHATSAPP_PHONE_NUMBER_ID");

  let payload = textMessage(result.reply);
  if (result.interactive?.type === "list") {
    payload = listMessage({
      body: result.interactive.body,
      buttonText: result.interactive.buttonText,
      rows: result.interactive.rows,
    });
  }

  try {
    await sendWhatsAppMessage({
      token,
      phoneNumberId,
      to: inboundMessage.from,
      payload,
    });
  } catch (error) {
    console.warn("[whatsapp] interactive send failed, retrying as text:", error.message);
    await sendWhatsAppMessage({
      token,
      phoneNumberId,
      to: inboundMessage.from,
      payload: textMessage(result.reply),
    });
  }
}
