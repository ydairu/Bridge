import { test } from "node:test";
import assert from "node:assert/strict";

import {
  createTelegramSecretMiddleware,
  createTelegramWebhookHandler,
} from "../src/telegram/webhook.js";
import { BridgeFirestoreService } from "../src/services/firestoreBridge.js";
import { createFakeFirestore } from "./helpers/fakeFirestore.js";
import { installFetchMock, openAIText } from "./helpers/fetchMock.js";

const secret = "telegram_webhook_secret_1234567890";

function responseRecorder() {
  return {
    statusCode: 200,
    headers: {},
    body: null,
    status(code) { this.statusCode = code; return this; },
    set(name, value) { this.headers[name] = value; return this; },
    json(value) { this.body = value; return this; },
  };
}

function makeWebhookHandler(options = {}) {
  return createTelegramWebhookHandler({
    bridgeService: new BridgeFirestoreService(createFakeFirestore()),
    openAIConfig: { apiKey: "key", model: "gpt-4o-mini" },
    exaApiKey: "",
    token: "TG_TOKEN",
    logger: { log() {}, warn() {}, error() {} },
    ...options,
  });
}

test("webhook rejects an invalid secret before body parsing", () => {
  const middleware = createTelegramSecretMiddleware(secret);
  const res = responseRecorder();
  let nextCalled = false;
  middleware({ get: () => "invalid", body: undefined }, res, () => { nextCalled = true; });
  assert.equal(res.statusCode, 401);
  assert.deepEqual(res.body, { error: "Unauthorized" });
  assert.equal(nextCalled, false);
});

test("webhook processes an authenticated private message", async () => {
  const fetchMock = installFetchMock();
  fetchMock.onOpenAI(() => openAIText("Hello from the webhook."));
  fetchMock.onTelegram(() => ({ data: { ok: true, result: { message_id: 1 } } }));
  try {
    const handler = makeWebhookHandler();
    const res = responseRecorder();
    await handler({
      body: {
        update_id: 101,
        message: {
          message_id: 5,
          from: { id: 42, first_name: "Sam" },
          chat: { id: 42, type: "private" },
          text: "hello",
        },
      },
    }, res);

    assert.equal(res.statusCode, 200);
    assert.deepEqual(res.body, { ok: true });
    assert.equal(fetchMock.callsOfKind("openai").length, 1);
    assert.equal(fetchMock.callsOfKind("telegram").length, 1);
  } finally {
    fetchMock.restore();
  }
});

test("webhook acknowledges group and malformed authenticated updates without AI work", async () => {
  const fetchMock = installFetchMock();
  try {
    const handler = makeWebhookHandler();
    const groupResponse = responseRecorder();
    await handler({
      body: {
        update_id: 102,
        message: { from: { id: 42 }, chat: { id: -10, type: "group" }, text: "hello" },
      },
    }, groupResponse);

    const malformedResponse = responseRecorder();
    await handler({ body: {} }, malformedResponse);

    assert.equal(groupResponse.statusCode, 200);
    assert.equal(malformedResponse.statusCode, 200);
    assert.equal(fetchMock.callsOfKind("openai").length, 0);
  } finally {
    fetchMock.restore();
  }
});
