import { test } from "node:test";
import assert from "node:assert/strict";
import { BridgeFirestoreService } from "../src/services/firestoreBridge.js";
import { createFakeFirestore } from "./helpers/fakeFirestore.js";

function makeService(seed = {}) {
  const db = createFakeFirestore(seed);
  return { svc: new BridgeFirestoreService(db), db };
}

const jobsSeed = {
  jobV: {
    title: "Senior Welder",
    company: "BuildTech",
    employerId: "emp1",
    location: "west",
    category: "construction",
    type: "full-time",
    skills: ["Welding", "Metal Fabrication"],
    salary: 3000,
    salaryDisplay: "$3,000 - $3,600",
    status: "active",
    verificationStatus: "verified",
    description: "Welding role",
  },
  jobU: {
    title: "General Worker",
    company: "Rapid Build",
    employerId: "emp2",
    location: "east",
    category: "manufacturing",
    type: "part-time",
    skills: ["General"],
    salary: 2000,
    status: "active",
    description: "general",
  },
  jobFee: {
    title: "Quick Cash Job",
    company: "Sketchy Co",
    location: "west",
    category: "construction",
    type: "contract",
    skills: ["Welding"],
    salary: 9000,
    status: "active",
    feeRequired: true,
    description: "pay fee",
  },
  jobFlagged: {
    title: "Scam Listing",
    company: "Fraud Inc",
    location: "west",
    status: "active",
    verificationStatus: "flagged",
    description: "scam",
  },
  jobClosed: {
    title: "Old Job",
    company: "BuildTech",
    location: "west",
    status: "closed",
    description: "closed",
  },
};

const usersSeed = {
  emp1: { name: "Sarah", role: "employer", companyName: "BuildTech", website: "buildtech.sg" },
  emp2: { name: "Kevin", role: "employer", companyName: "Rapid Build" },
};

// ---- user / profile ----

test("loadOrCreateWhatsAppUser backfills name for existing user without one", async () => {
  const { svc } = makeService({ users: { wa_6591234567: { waPhone: "6591234567", role: "jobseeker" } } });
  const user = await svc.loadOrCreateWhatsAppUser({ phone: "+65 9123 4567", displayName: "Rahim" });
  assert.equal(user.id, "wa_6591234567");
  assert.equal(user.name, "Rahim");
});

test("updateProfile only persists allowed fields, coerces skills, ignores empties", async () => {
  const { svc } = makeService();
  const user = await svc.loadOrCreateWhatsAppUser({ phone: "6590000000" });
  const updated = await svc.updateProfile({
    userId: user.id,
    profile: {
      name: "Aman",
      skills: "Welding, Scaffolding ,",
      language: "bn",
      countryOfOrigin: "Bangladesh",
      experience: "",
      hacker: "should-not-persist",
    },
  });
  assert.equal(updated.name, "Aman");
  assert.deepEqual(updated.skills, ["Welding", "Scaffolding"]);
  assert.equal(updated.language, "bn");
  assert.equal(updated.countryOfOrigin, "Bangladesh");
  assert.equal(updated.hacker, undefined);
  assert.equal(updated.experience, undefined); // empty string ignored
});

// ---- message logging / dedupe ----

test("logMessage dedupes by waMessageId", async () => {
  const { svc } = makeService();
  const first = await svc.logMessage({ userId: "u1", direction: "in", waMessageId: "wamid.1", body: "hi" });
  assert.equal(first.duplicate, false);
  const second = await svc.logMessage({ userId: "u1", direction: "in", waMessageId: "wamid.1", body: "hi again" });
  assert.equal(second.duplicate, true);
});

test("logMessage without id always creates; isDuplicateMessage reflects state", async () => {
  const { svc } = makeService();
  const r1 = await svc.logMessage({ userId: "u1", direction: "out", body: "reply" });
  const r2 = await svc.logMessage({ userId: "u1", direction: "out", body: "reply2" });
  assert.notEqual(r1.id, r2.id);
  assert.equal(await svc.isDuplicateMessage("wamid.x"), false);
  await svc.logMessage({ userId: "u1", direction: "in", waMessageId: "wamid.x", body: "y" });
  assert.equal(await svc.isDuplicateMessage("wamid.x"), true);
});

test("getRecentMessages returns chronological order limited", async () => {
  const { svc } = makeService();
  for (let i = 1; i <= 10; i++) {
    await svc.logMessage({ userId: "u1", direction: "in", waMessageId: `m${i}`, body: `msg${i}` });
  }
  const recent = await svc.getRecentMessages({ userId: "u1", limit: 3 });
  assert.equal(recent.length, 3);
  // chronological (oldest-first of the most recent slice)
  assert.deepEqual(recent.map((m) => m.body), ["msg8", "msg9", "msg10"]);
});

// ---- job search ----

test("searchJobs excludes closed + flagged and ranks verified/skill-match first", async () => {
  const { svc } = makeService({ jobs: jobsSeed, users: usersSeed });
  const user = await svc.loadOrCreateWhatsAppUser({ phone: "6591110000" });
  await svc.updateProfile({ userId: user.id, profile: { skills: ["Welding"] } });

  const { jobs } = await svc.searchJobs({ userId: user.id });
  const ids = jobs.map((j) => j.id);
  assert.ok(!ids.includes("jobFlagged"), "flagged excluded");
  assert.ok(!ids.includes("jobClosed"), "closed excluded");
  assert.equal(jobs[0].id, "jobV", "verified + skill match ranked first");
  assert.equal(jobs[jobs.length - 1].id, "jobFee", "fee-required penalized to last");
});

test("searchJobs honors location, category, and type filters", async () => {
  const { svc } = makeService({ jobs: jobsSeed, users: usersSeed });
  const byLoc = await svc.searchJobs({ location: "east" });
  assert.deepEqual(byLoc.jobs.map((j) => j.id), ["jobU"]);

  const byCat = await svc.searchJobs({ category: "manufacturing" });
  assert.deepEqual(byCat.jobs.map((j) => j.id), ["jobU"]);

  const byType = await svc.searchJobs({ type: "part-time" });
  assert.deepEqual(byType.jobs.map((j) => j.id), ["jobU"]);
});

test("getJob enriches with employer and returns null when missing", async () => {
  const { svc } = makeService({ jobs: jobsSeed, users: usersSeed });
  const job = await svc.getJob({ jobId: "jobV" });
  assert.equal(job.company, "BuildTech");
  assert.equal(job.employer.companyName, "BuildTech");
  assert.equal(job.verificationStatus, "verified");
  assert.equal(await svc.getJob({ jobId: "nope" }), null);
});

// ---- applications ----

test("startApplication blocks flagged and fee-required jobs", async () => {
  const { svc } = makeService({ jobs: jobsSeed, users: usersSeed });
  const user = await svc.loadOrCreateWhatsAppUser({ phone: "6592220000" });
  await assert.rejects(() => svc.startApplication({ userId: user.id, jobId: "jobFee" }), /risky/i);
  // flagged is excluded from getJob? no — getJob returns it; startApplication should still block
  await assert.rejects(() => svc.startApplication({ userId: user.id, jobId: "jobFlagged" }), /risky/i);
});

test("submitApplication creates application with reference code and clears state", async () => {
  const { svc } = makeService({ jobs: jobsSeed, users: usersSeed });
  const user = await svc.loadOrCreateWhatsAppUser({ phone: "6593330000", displayName: "Liu" });
  await svc.updateProfile({ userId: user.id, profile: { skills: ["Welding"] } });
  await svc.startApplication({ userId: user.id, jobId: "jobV" });
  const result = await svc.submitApplication({ userId: user.id, jobId: "jobV" });
  assert.match(result.referenceCode, /^BR-/);
  assert.equal(result.status, "pending");

  const { applications } = await svc.listApplications({ userId: user.id });
  assert.equal(applications.length, 1);
  assert.equal(applications[0].source, "whatsapp");
  assert.equal(applications[0].jobId, "jobV");

  const state = await svc.getConversationState({ userId: user.id });
  assert.equal(state.currentFlow, "idle");
});

test("getApplicationStatus enforces ownership and returns latest by default", async () => {
  const { svc } = makeService({ jobs: jobsSeed, users: usersSeed });
  const user = await svc.loadOrCreateWhatsAppUser({ phone: "6594440000" });
  const a1 = await svc.submitApplication({ userId: user.id, jobId: "jobV" });
  const latest = await svc.getApplicationStatus({ userId: user.id });
  assert.equal(latest.id, a1.applicationId);

  // foreign application
  const other = await svc.submitApplication({ userId: "wa_other", jobId: "jobU" });
  await assert.rejects(
    () => svc.getApplicationStatus({ userId: user.id, applicationId: other.applicationId }),
    /does not belong/i
  );
});

// ---- verification / support ----

test("updateJobVerification merges verification fields", async () => {
  const { svc } = makeService({ jobs: jobsSeed, users: usersSeed });
  const updated = await svc.updateJobVerification({
    jobId: "jobU",
    verification: { verificationStatus: "flagged", riskLevel: "high", riskReasons: ["fee"], feeRequired: true },
  });
  assert.equal(updated.verificationStatus, "flagged");
  assert.equal(updated.riskLevel, "high");
  assert.equal(updated.feeRequired, true);
});

test("requestSupport opens a ticket", async () => {
  const { svc, db } = makeService();
  const user = await svc.loadOrCreateWhatsAppUser({ phone: "6595550000" });
  const ticket = await svc.requestSupport({ userId: user.id, topic: "salary", message: "unpaid" });
  assert.equal(ticket.status, "open");
  const tickets = db._dump("supportTickets");
  assert.equal(tickets.length, 1);
  assert.equal(tickets[0].topic, "salary");
});

// ---- assessments ----

const sampleQuestions = [
  { question: "Q1", options: ["a", "b", "c", "d"], correctAnswer: 0 },
  { question: "Q2", options: ["a", "b", "c", "d"], correctAnswer: 1 },
  { question: "Q3", options: ["a", "b", "c", "d"], correctAnswer: 2 },
  { question: "Q4", options: ["a", "b", "c", "d"], correctAnswer: 3 },
  { question: "Q5", options: ["a", "b", "c", "d"], correctAnswer: 0 },
];

test("startAssessment stores questions in state and hides correct answers", async () => {
  const { svc } = makeService();
  const user = await svc.loadOrCreateWhatsAppUser({ phone: "6596660000" });
  const out = await svc.startAssessment({
    userId: user.id,
    skill: "Welding",
    difficulty: "beginner",
    questions: sampleQuestions,
  });
  assert.equal(out.total, 5);
  assert.equal(out.questions[0].number, 1);
  assert.equal(out.questions[0].correctAnswer, undefined, "correct answer not leaked");

  const state = await svc.getConversationState({ userId: user.id });
  assert.equal(state.scratch.assessment.questions.length, 5);
});

test("submitAssessment without active assessment throws", async () => {
  const { svc } = makeService();
  const user = await svc.loadOrCreateWhatsAppUser({ phone: "6597770000" });
  await assert.rejects(() => svc.submitAssessment({ userId: user.id, answers: [] }), /no active assessment/i);
});

test("submitAssessment passing awards badge + writes profile assessment", async () => {
  const { svc, db } = makeService();
  const user = await svc.loadOrCreateWhatsAppUser({ phone: "6598880000" });
  await svc.startAssessment({ userId: user.id, skill: "Welding", difficulty: "beginner", questions: sampleQuestions });
  const result = await svc.submitAssessment({ userId: user.id, answers: ["A", "B", "C", "D", "A"] });
  assert.equal(result.score, 100);
  assert.equal(result.passed, true);
  assert.equal(result.badgeAwarded, true);

  assert.equal(db._dump("badges").length, 1);
  assert.equal(db._dump("quizResults").length, 1);
  const profile = await svc.getProfile({ userId: user.id });
  assert.equal(profile.assessments.Welding.score, 100);

  const state = await svc.getConversationState({ userId: user.id });
  assert.equal(state.currentFlow, "idle", "assessment cleared after submit");
});

test("submitAssessment failing does not award badge", async () => {
  const { svc, db } = makeService();
  const user = await svc.loadOrCreateWhatsAppUser({ phone: "6599990000" });
  await svc.startAssessment({ userId: user.id, skill: "Welding", difficulty: "beginner", questions: sampleQuestions });
  const result = await svc.submitAssessment({ userId: user.id, answers: [0, 0, 0, 0, 0] });
  assert.equal(result.passed, false);
  assert.equal(result.badgeAwarded, false);
  assert.equal(db._dump("badges").length, 0);
});

// ---- achievements / reviews ----

test("getAchievements aggregates earned + skill badges + stats", async () => {
  const { svc } = makeService({
    earnedBadges: { e1: { userId: "u1", badgeId: "bronze_performer" } },
    badges: { b1: { userId: "u1", skill: "Welding", level: "beginner" } },
    userStats: { u1: { totalPlays: 5, totalWins: 3, bestScore: 90, perfectScores: 1 } },
  });
  const ach = await svc.getAchievements({ userId: "u1" });
  assert.equal(ach.earnedBadges.length, 1);
  assert.equal(ach.skillBadges.length, 1);
  assert.equal(ach.stats.bestScore, 90);
  assert.equal(ach.totalBadges, 2);
});

test("getEmployerReviews filters by company and averages rating", async () => {
  const { svc } = makeService({
    reviews: {
      r1: { company: "BuildTech", rating: 5, review: "great", reviewerName: "A" },
      r2: { companyName: "BuildTech Construction", rating: 3, review: "ok", reviewerName: "B" },
      r3: { company: "Other Co", rating: 1, review: "bad", reviewerName: "C" },
    },
  });
  const out = await svc.getEmployerReviews({ company: "BuildTech" });
  assert.equal(out.reviewCount, 2);
  assert.equal(out.averageRating, 4);
  assert.ok(out.reviews.every((r) => r.review !== "bad"));
});
