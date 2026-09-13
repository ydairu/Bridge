import { handleBridgeMessage } from "../bridge-agent/orchestrator.js";
import {
  sendTelegramMessage,
  answerCallbackQuery,
  extractTelegramInbound,
  inlineKeyboardFromInteractive,
} from "./client.js";

export async function handleTelegramUpdate({
  update,
  inboundMessage = extractTelegramInbound(update),
  bridgeService,
  openAIConfig,
  exaApiKey,
  token,
  logger = console,
}) {
  if (!inboundMessage) return { ignored: true };

  if (inboundMessage.callbackQueryId) {
    await answerCallbackQuery({ token, callbackQueryId: inboundMessage.callbackQueryId });
  }

  const result = await handleBridgeMessage({ bridgeService, openAIConfig, exaApiKey, inboundMessage });
  if (result.duplicate) {
    // A previous attempt may have generated a reply but failed while sending it.
    // Re-send the latest reply; Telegram delivery is intentionally at-least-once.
    const recentMessages = await bridgeService.getRecentMessages({ userId: result.user.id, limit: 2 });
    const cachedReply = recentMessages.find((message) => message.direction === "out" && message.body);
    if (!cachedReply) return { ...result, ignored: true };
    result.reply = cachedReply.body;
  }
  if (!result.reply) return { ...result, ignored: true };

  const replyMarkup = inlineKeyboardFromInteractive(result.interactive);
  try {
    await sendTelegramMessage({ token, chatId: inboundMessage.chatId, text: result.reply, replyMarkup });
  } catch (error) {
    logger.warn?.("[telegram] send with keyboard failed, retrying as plain text:", error.message);
    await sendTelegramMessage({ token, chatId: inboundMessage.chatId, text: result.reply });
  }

  return result;
}
