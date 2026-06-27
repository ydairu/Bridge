import { test } from "node:test";
import assert from "node:assert/strict";
import {
  normalizeDifficulty,
  sanitizeQuestions,
  coerceAnswerToIndex,
  scoreAssessment,
} from "../src/services/assessments.js";

test("normalizeDifficulty clamps to known values", () => {
  assert.equal(normalizeDifficulty("Advanced"), "advanced");
  assert.equal(normalizeDifficulty("INTERMEDIATE"), "intermediate");
  assert.equal(normalizeDifficulty("nonsense"), "beginner");
  assert.equal(normalizeDifficulty(undefined), "beginner");
});

test("sanitizeQuestions drops malformed entries", () => {
  const ok = { question: "Q1", options: ["a", "b", "c", "d"], correctAnswer: 2 };
  const badOptions = { question: "Q2", options: ["a", "b"], correctAnswer: 0 };
  const badIndex = { question: "Q3", options: ["a", "b", "c", "d"], correctAnswer: 9 };
  const noQuestion = { options: ["a", "b", "c", "d"], correctAnswer: 0 };
  const result = sanitizeQuestions([ok, badOptions, badIndex, noQuestion, null]);
  assert.equal(result.length, 1);
  assert.deepEqual(result[0], ok);
});

test("sanitizeQuestions returns [] for non-arrays", () => {
  assert.deepEqual(sanitizeQuestions(null), []);
  assert.deepEqual(sanitizeQuestions({}), []);
});

test("coerceAnswerToIndex handles indices, letters, and text", () => {
  const options = ["Apple", "Banana", "Cherry", "Date"];
  assert.equal(coerceAnswerToIndex(0, options), 0);
  assert.equal(coerceAnswerToIndex(3, options), 3);
  assert.equal(coerceAnswerToIndex(1, options), 1);
  assert.equal(coerceAnswerToIndex("2", options), 2);
  assert.equal(coerceAnswerToIndex("4", options), 3); // 1-based string
  assert.equal(coerceAnswerToIndex("A", options), 0);
  assert.equal(coerceAnswerToIndex("d", options), 3);
  assert.equal(coerceAnswerToIndex("banana", options), 1);
  assert.equal(coerceAnswerToIndex("nope", options), -1);
  assert.equal(coerceAnswerToIndex(null, options), -1);
});

test("scoreAssessment computes score, pass threshold, breakdown", () => {
  const questions = [
    { question: "Q1", options: ["a", "b", "c", "d"], correctAnswer: 0 },
    { question: "Q2", options: ["a", "b", "c", "d"], correctAnswer: 1 },
    { question: "Q3", options: ["a", "b", "c", "d"], correctAnswer: 2 },
    { question: "Q4", options: ["a", "b", "c", "d"], correctAnswer: 3 },
    { question: "Q5", options: ["a", "b", "c", "d"], correctAnswer: 0 },
  ];
  const perfect = scoreAssessment(questions, ["A", "B", "C", "D", "A"]);
  assert.equal(perfect.score, 100);
  assert.equal(perfect.passed, true);
  assert.equal(perfect.correct, 5);

  const four = scoreAssessment(questions, [0, 1, 2, 3, 1]);
  assert.equal(four.score, 80);
  assert.equal(four.passed, true);

  const three = scoreAssessment(questions, [0, 1, 2, 0, 1]);
  assert.equal(three.score, 60);
  assert.equal(three.passed, false);
});

test("scoreAssessment handles empty/missing answers", () => {
  const questions = [{ question: "Q1", options: ["a", "b", "c", "d"], correctAnswer: 0 }];
  const result = scoreAssessment(questions, []);
  assert.equal(result.score, 0);
  assert.equal(result.passed, false);
  assert.equal(result.breakdown[0].chosen, -1);
});
