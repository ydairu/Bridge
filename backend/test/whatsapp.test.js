import { test } from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import { verifyWhatsAppSignature } from "../src/whatsapp/signature.js";
import { extractInboundMessages, listMessage, buttonMessage, textMessage } from "../src/whatsapp/client.js";

test("signature verification accepts valid and rejects tampered/missing", () => {
  const appSecret = "secret";
  const rawBody = Buffer.from(JSON.stringify({ a: 1 }));
  const good = `sha256=${crypto.createHmac("sha256", appSecret).update(rawBody).digest("hex")}`;
  assert.equal(verifyWhatsAppSignature({ appSecret, rawBody, signatureHeader: good }), true);
  assert.equal(verifyWhatsAppSignature({ appSecret, rawBody: Buffer.from("x"), signatureHeader: good }), false);
  assert.equal(verifyWhatsAppSignature({ appSecret, rawBody, signatureHeader: "sha256=deadbeef" }), false);
  assert.equal(verifyWhatsAppSignature({ appSecret: "", rawBody, signatureHeader: good }), false);
  assert.equal(verifyWhatsAppSignature({ appSecret, rawBody, signatureHeader: "" }), false);
});

test("extractInboundMessages parses text and interactive replies", () => {
  const payload = {
    entry: [
      {
        changes: [
          {
            value: {
              metadata: { phone_number_id: "PNID" },
              contacts: [{ wa_id: "65900", profile: { name: "Sam" } }],
              messages: [
                { id: "m1", from: "65900", type: "text", text: { body: "hi" } },
                {
                  id: "m2",
                  from: "65900",
                  type: "interactive",
                  interactive: { list_reply: { id: "job:1", title: "Welder" } },
                },
              ],
            },
          },
        ],
      },
    ],
  };
  const messages = extractInboundMessages(payload);
  assert.equal(messages.length, 2);
  assert.equal(messages[0].text, "hi");
  assert.equal(messages[0].displayName, "Sam");
  assert.equal(messages[0].phoneNumberId, "PNID");
  assert.equal(messages[1].listReplyId, "job:1");
  assert.equal(messages[1].listReplyTitle, "Welder");
});

test("extractInboundMessages ignores status-only webhooks and empty payloads", () => {
  assert.deepEqual(extractInboundMessages({ entry: [{ changes: [{ value: { statuses: [{}] } }] }] }), []);
  assert.deepEqual(extractInboundMessages({}), []);
  assert.deepEqual(extractInboundMessages(null), []);
});

test("listMessage enforces WhatsApp limits (10 rows, title 24, desc 72)", () => {
  const list = listMessage({
    body: "Pick one",
    buttonText: "Choose",
    rows: Array.from({ length: 15 }, (_, i) => ({
      id: `row:${i}`,
      title: "T".repeat(40),
      description: "D".repeat(120),
    })),
  });
  const rows = list.interactive.action.sections[0].rows;
  assert.equal(rows.length, 10);
  assert.ok(rows[0].title.length <= 24);
  assert.ok(rows[0].description.length <= 72);
});

test("buttonMessage caps at 3 reply buttons with 20-char titles", () => {
  const msg = buttonMessage({
    body: "Confirm?",
    buttons: [
      { id: "yes", title: "Y".repeat(30) },
      { id: "no", title: "No" },
      { id: "maybe", title: "Maybe" },
      { id: "extra", title: "Extra" },
    ],
  });
  const buttons = msg.interactive.action.buttons;
  assert.equal(buttons.length, 3);
  assert.ok(buttons[0].reply.title.length <= 20);
});

test("textMessage truncates very long bodies", () => {
  assert.ok(textMessage("a".repeat(5000)).text.body.length <= 3900);
  assert.equal(textMessage("short").text.body, "short");
});
