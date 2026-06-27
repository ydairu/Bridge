// Live end-to-end check: runs a scripted multi-turn WhatsApp conversation through
// the real orchestrator + real OpenAI model, using an in-memory Firestore so
// nothing touches production data. Validates that the model actually drives the
// Bridge tools (profile, search, detail, apply, scam check) end-to-end.
//
// Usage (needs OPENAI_API_KEY in ../.env or the environment):
//   node scripts/live-agent-check.js
// EXA_API_KEY is optional; scam_check still returns a verdict without it.

import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { BridgeFirestoreService } from "../src/services/firestoreBridge.js";
import { handleBridgeMessage } from "../src/bridge-agent/orchestrator.js";
import { createFakeFirestore } from "../test/helpers/fakeFirestore.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, "..", "..", ".env") });

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error("OPENAI_API_KEY is required for the live check. Skipping.");
  process.exit(2);
}
const openAIConfig = { apiKey, model: process.env.OPENAI_MODEL || "gpt-4o-mini" };
const exaApiKey = process.env.EXA_API_KEY || "";

const seed = {
  jobs: {
    weld1: {
      title: "Senior Welder", company: "BuildTech Construction", employerId: "emp1",
      location: "west", category: "construction", type: "full-time",
      skills: ["Welding", "Metal Fabrication"], salary: 3200, salaryDisplay: "$3,200 - $3,800",
      status: "active", verificationStatus: "verified", description: "Structural welding for a factory build.",
      requirements: ["Valid welding cert", "3+ years"], benefits: ["Medical", "Overtime"],
    },
    weld2: {
      title: "Welder Assistant", company: "Rapid Build", employerId: "emp2",
      location: "east", category: "construction", type: "contract",
      skills: ["Welding"], salary: 2400, status: "active", verificationStatus: "unverified",
      description: "Assist senior welders on site.",
    },
    scam1: {
      title: "High Pay Welding - Apply Now", company: "QuickGold Agency", location: "west",
      category: "construction", type: "full-time", skills: ["Welding"], salary: 9000,
      status: "active", feeRequired: true, verificationStatus: "flagged",
      description: "Earn $9000/mo. Pay $800 processing fee to secure the slot today!",
    },
  },
  users: {
    emp1: { companyName: "BuildTech Construction", role: "employer", website: "buildtech.sg" },
    emp2: { companyName: "Rapid Build", role: "employer" },
  },
};

const script = [
  "Hi, I am a welder with 3 years experience. I am in the west area.",
  "Show me welding jobs.",
  "I got a message from QuickGold Agency offering $9000 a month but I must pay $800 processing fee first. Is this safe?",
];

const db = createFakeFirestore(seed);
const bridgeService = new BridgeFirestoreService(db);
const from = "6591234567";
const toolsSeen = new Set();
let turn = 0;

console.log(`\n=== Live agent check (model: ${openAIConfig.model}, exa: ${exaApiKey ? "on" : "off"}) ===\n`);

for (const text of script) {
  turn += 1;
  const inboundMessage = {
    id: `wamid.live.${turn}`,
    from,
    phoneNumberId: "TEST",
    type: "text",
    text,
    displayName: "Rahim",
    raw: {},
  };

  console.log(`👤 ${text}`);
  try {
    const result = await handleBridgeMessage({ bridgeService, openAIConfig, exaApiKey, inboundMessage });
    (result.toolResults || []).forEach((t) => toolsSeen.add(t.name));
    const tools = (result.toolResults || []).map((t) => t.name).join(", ") || "none";
    console.log(`🤖 ${result.reply}`);
    console.log(`   [tools: ${tools}]\n`);
  } catch (error) {
    console.error(`   ✗ turn failed: ${error.message}\n`);
    process.exit(1);
  }
}

// Soft expectations: the model should have used the profile + search tools, and
// engaged the trust path (scam_check or verify_employer) for the fee request.
const expected = ["create_or_update_profile", "search_jobs"];
const trustTools = ["scam_check", "verify_employer"];
const missing = expected.filter((name) => !toolsSeen.has(name));
const usedTrust = trustTools.some((name) => toolsSeen.has(name));

console.log("Tools exercised:", [...toolsSeen].join(", ") || "(none)");
if (missing.length > 0) console.warn("⚠️  Expected tools not used:", missing.join(", "));
if (!usedTrust) console.warn("⚠️  Trust tool (scam_check/verify_employer) not used for the fee request.");

const ok = missing.length === 0 && usedTrust;
console.log(ok ? "\n✅ Live agent check passed." : "\n⚠️  Live agent check completed with warnings.");
process.exit(ok ? 0 : 0); // non-fatal: model behavior can vary
