import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { BridgeFirestoreService } from "../src/services/firestoreBridge.js";
import { createBridgeToolExecutor } from "../src/bridge-agent/tools.js";
import { createFakeFirestore } from "./helpers/fakeFirestore.js";
import { installFetchMock, openAIJsonResult, exaResults } from "./helpers/fetchMock.js";

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
  users: { emp1: { companyName: "BuildTech", website: "buildtech.sg", role: "employer" } },
  reviews: { r1: { company: "BuildTech", rating: 4, review: "good", reviewerName: "A" } },
};

let fetchMock;
beforeEach(() => {
  fetchMock = installFetchMock();
});
afterEach(() => {
  fetchMock.restore();
});

function setup(extraSeed = {}) {
  const db = createFakeFirestore({ ...seed, ...extraSeed });
  const svc = new BridgeFirestoreService(db);
  return { db, svc };
}

async function withUser(svc, phone = "6591234567") {
  return svc.loadOrCreateWhatsAppUser({ phone });
}

test("routes profile, search, and job tools to the data layer", async () => {
  const { svc } = setup();
  const user = await withUser(svc);
  const exec = createBridgeToolExecutor({ bridgeService: svc, openAIConfig, exaApiKey: "", userId: user.id });

  await exec("create_or_update_profile", { skills: ["Welding"], language: "en" });
  const profile = await exec("get_profile", {});
  assert.deepEqual(profile.skills, ["Welding"]);

  const search = await exec("search_jobs", {});
  assert.equal(search.jobs[0].id, "jobV");

  const job = await exec("get_job", { jobId: "jobV" });
  assert.equal(job.company, "BuildTech");
});

test("unknown tool throws", async () => {
  const { svc } = setup();
  const user = await withUser(svc);
  const exec = createBridgeToolExecutor({ bridgeService: svc, openAIConfig, exaApiKey: "", userId: user.id });
  await assert.rejects(() => exec("definitely_not_a_tool", {}), /Unknown tool/);
});

test("start_assessment generates via OpenAI then submit_assessment scores", async () => {
  const questions = [
    { question: "Q1", options: ["a", "b", "c", "d"], correctAnswer: 0 },
    { question: "Q2", options: ["a", "b", "c", "d"], correctAnswer: 1 },
    { question: "Q3", options: ["a", "b", "c", "d"], correctAnswer: 2 },
  ];
  fetchMock.onOpenAI(() => openAIJsonResult({ questions }));

  const { svc, db } = setup();
  const user = await withUser(svc);
  const exec = createBridgeToolExecutor({ bridgeService: svc, openAIConfig, exaApiKey: "", userId: user.id });

  const started = await exec("start_assessment", { skill: "Welding", difficulty: "beginner" });
  assert.equal(started.total, 3);
  assert.equal(started.questions[0].correctAnswer, undefined);

  const result = await exec("submit_assessment", { answers: ["A", "B", "C"] });
  assert.equal(result.score, 100);
  assert.equal(result.badgeAwarded, true);
  assert.equal(db._dump("badges").length, 1);
});

test("get_achievements and get_employer_reviews route correctly", async () => {
  const { svc } = setup({ badges: { b1: { userId: "wa_6591234567", skill: "Welding", level: "beginner" } } });
  const user = await withUser(svc);
  const exec = createBridgeToolExecutor({ bridgeService: svc, openAIConfig, exaApiKey: "", userId: user.id });

  const ach = await exec("get_achievements", {});
  assert.equal(ach.skillBadges.length, 1);

  const reviews = await exec("get_employer_reviews", { company: "BuildTech" });
  assert.equal(reviews.reviewCount, 1);
  assert.equal(reviews.averageRating, 4);
});

test("verify_employer runs Exa + OpenAI and updates the job's verification", async () => {
  fetchMock.onExa(() => exaResults([{ title: "BuildTech", url: "https://buildtech.sg", text: "registered firm" }]));
  fetchMock.onOpenAI(() =>
    openAIJsonResult({
      verificationStatus: "verified",
      riskLevel: "low",
      trustScore: 90,
      feeRequired: false,
      riskReasons: [],
      workerExplanation: "Looks legit",
    })
  );

  const { svc, db } = setup();
  const user = await withUser(svc);
  const exec = createBridgeToolExecutor({ bridgeService: svc, openAIConfig, exaApiKey: "exa-key", userId: user.id });

  const result = await exec("verify_employer", { jobId: "jobV" });
  assert.equal(result.verificationStatus, "verified");
  assert.equal(result.jobId, "jobV");

  const job = await svc.getJob({ jobId: "jobV" });
  assert.equal(job.verificationStatus, "verified");
  assert.equal(db._dump("verificationRuns").length, 1);
});

test("scam_check analyzes a pasted offer and records a verification run", async () => {
  fetchMock.onExa(() => exaResults([{ title: "complaint", url: "https://x", text: "upfront fee scam" }]));
  fetchMock.onOpenAI(() =>
    openAIJsonResult({
      verificationStatus: "flagged",
      riskLevel: "high",
      trustScore: 10,
      feeRequired: true,
      riskReasons: ["Asks for upfront fee"],
      workerExplanation: "Do not pay.",
    })
  );

  const { svc, db } = setup();
  const user = await withUser(svc);
  const exec = createBridgeToolExecutor({ bridgeService: svc, openAIConfig, exaApiKey: "exa-key", userId: user.id });

  const result = await exec("scam_check", { offerText: "Pay $500 fee to start", company: "Sketchy" });
  assert.equal(result.riskLevel, "high");
  assert.equal(result.feeRequired, true);
  assert.equal(db._dump("verificationRuns").length, 1);
});

test("request_support routes to ticket creation", async () => {
  const { svc, db } = setup();
  const user = await withUser(svc);
  const exec = createBridgeToolExecutor({ bridgeService: svc, openAIConfig, exaApiKey: "", userId: user.id });
  const out = await exec("request_support", { topic: "salary", message: "unpaid wages" });
  assert.equal(out.status, "open");
  assert.equal(db._dump("supportTickets").length, 1);
});
