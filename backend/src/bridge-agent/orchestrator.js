import { BRIDGE_TOOLS } from "./schemas.js";
import { buildSystemPrompt } from "./systemPrompt.js";
import { createBridgeToolExecutor } from "./tools.js";
import { openAIChat, parseToolArguments } from "../services/openai.js";

function inboundTextFromMessage(message) {
  return (
    message.text ||
    message.buttonText ||
    message.buttonReplyTitle ||
    message.buttonReplyId ||
    message.listReplyTitle ||
    message.listReplyId ||
    ""
  ).trim();
}

function recentMessagesToChat(messages) {
  return messages
    .filter((message) => message.body)
    .map((message) => ({
      role: message.direction === "out" ? "assistant" : "user",
      content: String(message.body).slice(0, 1200),
    }));
}

function fallbackReply(profile) {
  const language = profile?.language || "en";
  if (language === "bn") {
    return "দুঃখিত, এখন একটু সমস্যা হচ্ছে। চাকরি খোঁজা, আবেদন, বা সন্দেহজনক অফার যাচাই করতে আবার লিখুন।";
  }
  if (language === "ta") {
    return "மன்னிக்கவும், இப்போது சிறிய சிக்கல் உள்ளது. வேலை தேட, விண்ணப்பிக்க, அல்லது சந்தேகமான வேலை செய்தியை சரிபார்க்க மீண்டும் எழுதுங்கள்.";
  }
  return "Sorry, Bridge is having trouble right now. Please message again to search jobs, apply, or check a suspicious offer.";
}

export async function handleBridgeMessage({
  bridgeService,
  openAIConfig,
  exaApiKey,
  inboundMessage,
}) {
  const channel = inboundMessage.channel || "whatsapp";
  const user =
    channel === "whatsapp"
      ? await bridgeService.loadOrCreateWhatsAppUser({
          phone: inboundMessage.from,
          displayName: inboundMessage.displayName,
        })
      : await bridgeService.loadOrCreateUser({
          channel,
          externalId: inboundMessage.from,
          displayName: inboundMessage.displayName,
        });

  const duplicate = await bridgeService.logMessage({
    userId: user.id,
    direction: "in",
    waMessageId: inboundMessage.id,
    body: inboundTextFromMessage(inboundMessage),
    raw: inboundMessage.raw,
    kind: inboundMessage.type,
  });

  if (duplicate.duplicate) {
    return { user, duplicate: true, reply: "" };
  }

  const profile = await bridgeService.getProfile({ userId: user.id });
  const state = await bridgeService.getConversationState({ userId: user.id });
  const recentMessages = await bridgeService.getRecentMessages({ userId: user.id, limit: 8 });
  const userContent = inboundTextFromMessage(inboundMessage);

  if (!userContent) {
    const reply = "Please send a text message. Bridge can help you find verified jobs, apply, and check suspicious offers.";
    await bridgeService.logMessage({ userId: user.id, direction: "out", body: reply, kind: "text" });
    return { user, reply };
  }

  const executeTool = createBridgeToolExecutor({
    bridgeService,
    openAIConfig,
    exaApiKey,
    userId: user.id,
  });

  const messages = [
    { role: "system", content: buildSystemPrompt({ profile, state }) },
    ...recentMessagesToChat(recentMessages),
  ];

  try {
    const first = await openAIChat({
      ...openAIConfig,
      messages,
      tools: BRIDGE_TOOLS,
    });

    const assistantMessage = first.choices?.[0]?.message || {};
    const toolCalls = assistantMessage.tool_calls || [];
    let toolResults = [];

    if (toolCalls.length > 0) {
      messages.push(assistantMessage);

      for (const call of toolCalls) {
        const name = call.function?.name;
        const args = parseToolArguments(call.function?.arguments);
        const result = await executeTool(name, args);
        toolResults.push({ name, args, result });
        messages.push({
          role: "tool",
          tool_call_id: call.id,
          content: JSON.stringify(result || {}),
        });
      }

      const second = await openAIChat({
        ...openAIConfig,
        messages,
        tools: BRIDGE_TOOLS,
        toolChoice: "none",
      });

      const reply =
        second.choices?.[0]?.message?.content ||
        "I found some Bridge information, but I could not write the reply. Please try again.";

      await bridgeService.logMessage({
        userId: user.id,
        direction: "out",
        body: reply,
        raw: { toolResults },
        kind: "text",
      });

      return {
        user,
        reply,
        toolResults,
        interactive: buildInteractiveSuggestion(toolResults),
      };
    }

    const reply =
      assistantMessage.content ||
      "I can help with Bridge job search, applications, skills checks, application status, or scam checks.";
    await bridgeService.logMessage({ userId: user.id, direction: "out", body: reply, kind: "text" });
    return { user, reply, toolResults };
  } catch (error) {
    console.error("[bridge-agent] error:", error);
    const reply = fallbackReply(profile);
    await bridgeService.logMessage({
      userId: user.id,
      direction: "out",
      body: reply,
      raw: { error: error.message },
      kind: "error",
    });
    return { user, reply, error };
  }
}

function buildInteractiveSuggestion(toolResults) {
  const search = [...toolResults].reverse().find((item) => item.name === "search_jobs");
  const jobs = search?.result?.jobs || [];
  if (jobs.length === 0) return null;

  return {
    type: "list",
    body: "Choose a job to view details:",
    buttonText: "View jobs",
    rows: jobs.map((job) => ({
      id: `job:${job.id}`,
      title: job.title,
      description: `${job.company} • ${job.verificationStatus}`,
    })),
  };
}
