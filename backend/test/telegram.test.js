import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { BridgeFirestoreService } from "../src/services/firestoreBridge.js";
import {
  extractTelegramInbound,
  inlineKeyboardFromInteractive,
  truncateForTelegram,
} from "../src/telegram/client.js";
import { handleTelegramUpdate } from "../src/telegram/poller.js";
import { handleBridgeMessage } from "../src/bridge-agent/orchestrator.js";
import { createFakeFirestore } from "./helpers/fakeFirestore.js";
import { installFetchMock, openAIText, openAIToolCalls } from "./helpers/fetchMock.js";

const openAIConfig = { apiKey: "k", model: "gpt-4o-mini" };

const jobsSeed = {
  jobs: {
    jobV: {
      title: "Welder", company: "BuildTech", employerId: "emp1", location: "west",
      category: "construction", type: "full-time", skills: ["Welding"], salary: 3000,
      status: "active", verificationStatus: "verified", description: "weld",
    },
  },
  users: { emp1: { companyName: "BuildTech", role: "employer" } },
};

// ---- pure parsing ----

test("extractTelegramInbound maps a text message", () => {
  const inbound = extractTelegramInbound({
    update_id: 10,
    message: { message_id: 5, from: { id: 42, first_name: "Sam", last_name: "Lee" }, chat: { id: 42 }, text: "hi" },
  });
  assert.equal(inbound.channel, "telegram");
  assert.equal(inbound.from, "42");
  assert.equal(inbound.chatId, "42");
  assert.equal(inbound.text, "hi");
  assert.equal(inbound.displayName, "Sam Lee");
  assert.equal(inbound.id, "tg:10");
});

test("extractTelegramInbound maps a callback query and rewrites job: ids", () => {
  const inbound = extractTelegramInbound({
    update_id: 11,
    callback_query: { id: "cb1", from: { id: 42, username: "sam" }, message: { chat: { id: 42 } }, data: "job:jobV" },
  });
  assert.equal(inbound.type, "interactive");
  assert.equal(inbound.callbackData, "job:jobV");
  assert.equal(inbound.callbackQueryId, "cb1");
  assert.match(inbound.text, /id: jobV/);
});

test("extractTelegramInbound ignores unsupported updates", () => {
  assert.equal(extractTelegramInbound({ update_id: 1 }), null);
  assert.equal(extractTelegramInbound(null), null);
  assert.equal(extractTelegramInbound({ update_id: 2, message: { from: { id: 1 }, chat: { id: 1 } } }), null);
});

test("inlineKeyboardFromInteractive builds one button per row, capped", () => {
  const kb = inlineKeyboardFromInteractive({
    type: "list",
    rows: Array.from({ length: 12 }, (_, i) => ({ id: `job:${i}`, title: "T".repeat(80) })),
  });
  assert.equal(kb.inline_keyboard.length, 10);
  assert.ok(kb.inline_keyboard[0][0].text.length <= 60);
  assert.ok(kb.inline_keyboard[0][0].callback_data.length <= 64);
  assert.equal(inlineKeyboardFromInteractive(null), undefined);
  assert.equal(inlineKeyboardFromInteractive({ type: "text" }), undefined);
});

test("truncateForTelegram caps at 4096", () => {
  assert.ok(truncateForTelegram("a".repeat(5000)).length <= 4096);
  assert.equal(truncateForTelegram("hi"), "hi");
});

// ---- channel-aware user ----

test("loadOrCreateUser creates a tg_<id> user with telegram source", async () => {
  const svc = new BridgeFirestoreService(createFakeFirestore());
  const user = await svc.loadOrCreateUser({ channel: "telegram", externalId: "42", displayName: "Sam" });
  assert.equal(user.id, "tg_42");
  assert.equal(user.source, "telegram");
  assert.equal(user.telegramId, "42");
  // idempotent
  const again = await svc.loadOrCreateUser({ channel: "telegram", externalId: "42" });
  assert.equal(again.id, "tg_42");
});

test("orchestrator routes a telegram inbound to a tg_ user", async () => {
  const fetchMock = installFetchMock();
  fetchMock.onOpenAI(() => openAIText("Hello from Bridge."));
  try {
    const svc = new BridgeFirestoreService(createFakeFirestore(jobsSeed));
    const result = await handleBridgeMessage({
      bridgeService: svc,
      openAIConfig,
      exaApiKey: "",
      inboundMessage: { id: "tg:1", channel: "telegram", from: "777", chatId: "777", type: "text", text: "hi", displayName: "T", raw: {} },
    });
    assert.equal(result.user.id, "tg_777");
    assert.match(result.reply, /Bridge/);
  } finally {
    fetchMock.restore();
  }
});

// ---- full poll -> reply cycle ----

test("handleTelegramUpdate runs the agent and sends a reply with inline keyboard", async () => {
  const fetchMock = installFetchMock();
  // search_jobs tool call, then final text -> interactive list -> inline keyboard
  fetchMock.onOpenAI(() => openAIToolCalls([{ name: "search_jobs", args: {} }]));
  fetchMock.onOpenAI(() => openAIText("Here is a verified welding job."));
  fetchMock.onTelegram(() => ({ ok: true, data: { ok: true, result: { message_id: 1 } } }));
  try {
    const svc = new BridgeFirestoreService(createFakeFirestore(jobsSeed));
    await handleTelegramUpdate({
      update: {
        update_id: 99,
        message: { message_id: 1, from: { id: 555, first_name: "Rin" }, chat: { id: 555 }, text: "find welding jobs" },
      },
      bridgeService: svc,
      openAIConfig,
      exaApiKey: "",
      token: "TG_TOKEN",
      logger: { log() {}, warn() {}, error() {} },
    });

    const sends = fetchMock.calls.filter((c) => c.url.includes("/sendMessage"));
    assert.equal(sends.length, 1);
    assert.equal(sends[0].body.chat_id, "555");
    assert.match(sends[0].body.text, /welding job/i);
    assert.ok(sends[0].body.reply_markup?.inline_keyboard?.length >= 1, "inline keyboard attached");
    assert.equal(sends[0].body.reply_markup.inline_keyboard[0][0].callback_data, "job:jobV");
  } finally {
    fetchMock.restore();
  }
});
