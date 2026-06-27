import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { verifyEmployerOrOffer } from "../src/services/verification.js";
import { searchExa } from "../src/services/exa.js";
import { installFetchMock, openAIJsonResult, exaResults } from "./helpers/fetchMock.js";

const openAIConfig = { apiKey: "test-key", model: "gpt-4o-mini" };

let fetchMock;
beforeEach(() => {
  fetchMock = installFetchMock();
});
afterEach(() => {
  fetchMock.restore();
});

test("searchExa skips gracefully when no API key", async () => {
  const out = await searchExa({ apiKey: "", query: "x" });
  assert.equal(out.skipped, true);
  assert.deepEqual(out.results, []);
  assert.equal(fetchMock.callsOfKind("exa").length, 0);
});

test("verifyEmployerOrOffer returns verdict with evidence", async () => {
  fetchMock.onExa(() =>
    exaResults([{ title: "Company", url: "https://co", text: "registered legitimate firm", highlights: ["good"] }])
  );
  fetchMock.onOpenAI(() =>
    openAIJsonResult({
      verificationStatus: "verified",
      riskLevel: "low",
      trustScore: 88,
      feeRequired: false,
      riskReasons: [],
      verifiedSignals: ["registered"],
      workerExplanation: "Safe",
    })
  );

  const result = await verifyEmployerOrOffer({
    openAIConfig,
    exaApiKey: "exa-key",
    target: { company: "Company" },
  });

  assert.equal(result.verificationStatus, "verified");
  assert.equal(result.evidence.length, 1);
  assert.equal(result.evidence[0].url, "https://co");
});

test("verifyEmployerOrOffer still produces a verdict when Exa fails", async () => {
  fetchMock.onExa(() => ({ ok: false, status: 500, data: { message: "exa down" } }));
  fetchMock.onOpenAI(() =>
    openAIJsonResult({
      verificationStatus: "unverified",
      riskLevel: "medium",
      trustScore: 40,
      feeRequired: false,
      riskReasons: ["No evidence found"],
      workerExplanation: "Cannot confirm",
    })
  );

  const result = await verifyEmployerOrOffer({
    openAIConfig,
    exaApiKey: "exa-key",
    target: { company: "Mystery" },
    offerText: "Pay fee to start",
  });

  assert.equal(result.verificationStatus, "unverified");
  assert.deepEqual(result.evidence, []);
  // OpenAI was still asked to analyze despite the Exa failure.
  assert.equal(fetchMock.callsOfKind("openai").length, 1);
});

test("evidence text is truncated to keep prompts small", async () => {
  const longText = "x".repeat(2000);
  fetchMock.onExa(() => exaResults([{ title: "t", url: "https://u", text: longText }]));
  fetchMock.onOpenAI(() => openAIJsonResult({ verificationStatus: "pending", riskLevel: "low" }));

  const result = await verifyEmployerOrOffer({
    openAIConfig,
    exaApiKey: "exa-key",
    target: { company: "Trunc" },
  });
  assert.ok(result.evidence[0].text.length <= 600);
});
