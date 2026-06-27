import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { BridgeFirestoreService } from "../src/services/firestoreBridge.js";
import { handleBridgeMessage } from "../src/bridge-agent/orchestrator.js";
import { createFakeFirestore } from "./helpers/fakeFirestore.js";
import { installFetchMock, openAIToolCalls, openAIText } from "./helpers/fetchMock.js";

const openAIConfig = { apiKey: "test-key", model: "gpt-4o-mini" };

const seed = {
  jobs: {
    jobV: {
      title: "Welder",
      company: "BuildTech",
      employerId: "emp1",
      location: "west",
      category: "construction",
      type: "full-time",
      skills: ["Welding"],
      salary: 3000,
      status: "active",
      verificationStatus: "verified",
      description: "weld",
    },
  },
  users: { emp1: { companyName: "BuildTech", role: "employer" } },
};

let fetchMock;
beforeEach(() => {
  fetchMock = installFetchMock();
});
afterEach(() => {
  fetchMock.restore();
});

function inbound(overrides = {}) {
  return {
    id: "wamid.in1",
    from: "6591234567",
    phoneNumberId: "PNID",
    type: "text",
    text: "hello",
    displayName: "Rahim",
    raw: {},
    ...overrides,
  };
}

function makeService(extra = {}) {
  const db = createFakeFirestore({ ...seed, ...extra });
  return { svc: new BridgeFirestoreService(db), db };
}

test("duplicate inbound message is ignored (no reply, no OpenAI call)", async () => {
  const { svc } = makeService({ waMessages: { "wamid.in1": { userId: "wa_6591234567", direction: "in" } } });
  const result = await handleBridgeMessage({
    bridgeService: svc,
    openAIConfig,
    exaApiKey: "",
    inboundMessage: inbound(),
  });
  assert.equal(result.duplicate, true);
  assert.equal(result.reply, "");
  assert.equal(fetchMock.callsOfKind("openai").length, 0);
});

test("empty message prompts for text without calling OpenAI", async () => {
  const { svc } = makeService();
  const result = await handleBridgeMessage({
    bridgeService: svc,
    openAIConfig,
    exaApiKey: "",
    inboundMessage: inbound({ text: "   " }),
  });
  assert.match(result.reply, /send a text message/i);
  assert.equal(fetchMock.callsOfKind("openai").length, 0);
});

test("plain assistant reply (no tool calls) is returned and logged", async () => {
  fetchMock.onOpenAI(() => openAIText("Hi! I can help you find verified jobs."));
  const { svc, db } = makeService();
  const result = await handleBridgeMessage({
    bridgeService: svc,
    openAIConfig,
    exaApiKey: "",
    inboundMessage: inbound({ text: "hello" }),
  });
  assert.match(result.reply, /verified jobs/);
  const out = db._dump("waMessages").filter((m) => m.direction === "out");
  assert.equal(out.length, 1);
});

test("tool-call flow executes the tool and builds an interactive job list", async () => {
  // First OpenAI call: ask to search jobs. Second call: final text reply.
  fetchMock.onOpenAI(() => openAIToolCalls([{ name: "search_jobs", args: {} }]));
  fetchMock.onOpenAI(() => openAIText("Here is a verified welding job."));

  const { svc } = makeService();
  const result = await handleBridgeMessage({
    bridgeService: svc,
    openAIConfig,
    exaApiKey: "",
    inboundMessage: inbound({ text: "find welding jobs" }),
  });

  assert.match(result.reply, /welding job/i);
  assert.equal(result.toolResults[0].name, "search_jobs");
  assert.equal(result.interactive.type, "list");
  assert.equal(result.interactive.rows[0].id, "job:jobV");
  assert.equal(fetchMock.callsOfKind("openai").length, 2);
});

test("OpenAI failure falls back to a localized message in the user's language", async () => {
  // Pre-create the user with Bengali language so fallback is localized.
  const { svc } = makeService({
    users: { wa_6591234567: { waPhone: "6591234567", role: "jobseeker", language: "bn" } },
  });
  fetchMock.onOpenAI(() => ({ ok: false, status: 500, data: { error: { message: "boom" } } }));

  const result = await handleBridgeMessage({
    bridgeService: svc,
    openAIConfig,
    exaApiKey: "",
    inboundMessage: inbound({ text: "hello" }),
  });

  assert.ok(result.error, "error captured");
  // Bengali fallback string starts with the Bengali word for "sorry".
  assert.match(result.reply, /দুঃখিত/);
});
