// Offline smoke test for the WhatsApp plumbing that has no external deps.
// Covers: signature verification, inbound message parsing, and interactive
// list payload construction. Run with: node scripts/smoke-whatsapp.js
import crypto from "crypto";
import { verifyWhatsAppSignature } from "../src/whatsapp/signature.js";
import { extractInboundMessages, listMessage, textMessage } from "../src/whatsapp/client.js";

let failures = 0;
function check(name, condition) {
  const ok = Boolean(condition);
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}`);
  if (!ok) failures += 1;
}

// 1. Signature verification over the exact raw body bytes.
const appSecret = "test_app_secret";
const rawBody = Buffer.from(JSON.stringify({ hello: "world" }));
const goodSig = `sha256=${crypto.createHmac("sha256", appSecret).update(rawBody).digest("hex")}`;
check("valid signature accepted", verifyWhatsAppSignature({ appSecret, rawBody, signatureHeader: goodSig }));
check("tampered body rejected", !verifyWhatsAppSignature({ appSecret, rawBody: Buffer.from("x"), signatureHeader: goodSig }));
check("missing signature rejected", !verifyWhatsAppSignature({ appSecret, rawBody, signatureHeader: "" }));
check("missing secret rejected", !verifyWhatsAppSignature({ appSecret: "", rawBody, signatureHeader: goodSig }));

// 2. Inbound message parsing from a realistic Meta webhook payload.
const payload = {
  entry: [
    {
      changes: [
        {
          value: {
            metadata: { phone_number_id: "PNID123" },
            contacts: [{ wa_id: "6591234567", profile: { name: "Rahim" } }],
            messages: [
              { id: "wamid.1", from: "6591234567", timestamp: "1700000000", type: "text", text: { body: "construction job" } },
            ],
          },
        },
      ],
    },
  ],
};
const parsed = extractInboundMessages(payload);
check("one message parsed", parsed.length === 1);
check("text extracted", parsed[0]?.text === "construction job");
check("sender display name extracted", parsed[0]?.displayName === "Rahim");
check("phone number id extracted", parsed[0]?.phoneNumberId === "PNID123");
check("status-only events yield no messages", extractInboundMessages({ entry: [{ changes: [{ value: { statuses: [{}] } }] }] }).length === 0);

// 3. Interactive + text payload shaping (truncation / row caps).
const list = listMessage({
  body: "Choose a job:",
  buttonText: "View jobs",
  rows: Array.from({ length: 15 }, (_, i) => ({ id: `job:${i}`, title: `Job ${i}`, description: "x".repeat(100) })),
});
check("list type is interactive", list.type === "interactive" && list.interactive.type === "list");
check("list capped at 10 rows", list.interactive.action.sections[0].rows.length === 10);
check("row title capped at 24 chars", list.interactive.action.sections[0].rows[0].title.length <= 24);
check("row description capped at 72 chars", list.interactive.action.sections[0].rows[0].description.length <= 72);
check("text payload truncated to 3900", textMessage("a".repeat(5000)).text.body.length <= 3900);

console.log(failures === 0 ? "\nAll smoke checks passed." : `\n${failures} check(s) failed.`);
process.exit(failures === 0 ? 0 : 1);
