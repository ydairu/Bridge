import { openAIJson } from "./openai.js";

const VALID_DIFFICULTIES = ["beginner", "intermediate", "advanced"];

export function normalizeDifficulty(value) {
  const lower = String(value || "").toLowerCase();
  return VALID_DIFFICULTIES.includes(lower) ? lower : "beginner";
}

// Generate a short multiple-choice skill assessment via OpenAI. Returns an array
// of { question, options[4], correctAnswer } where correctAnswer is a 0-3 index.
// The correct answers stay server-side; only questions/options are shown to the
// worker. Kept small (default 3 questions) for WhatsApp speed.
export async function generateAssessmentQuestions({ openAIConfig, skill, difficulty, count = 3 }) {
  const cleanSkill = String(skill || "").trim();
  if (!cleanSkill) throw new Error("A skill is required to start an assessment.");

  const result = await openAIJson({
    ...openAIConfig,
    instructions:
      "You write short, practical skills assessments for migrant workers in Singapore. " +
      "Output strict JSON only with a top-level 'questions' array. Each question has " +
      "'question' (string), 'options' (array of exactly 4 short strings), and " +
      "'correctAnswer' (integer 0-3 index of the correct option). Keep wording simple.",
    input: {
      skill: cleanSkill,
      difficulty: normalizeDifficulty(difficulty),
      numberOfQuestions: count,
    },
  });

  const questions = sanitizeQuestions(result?.questions);
  if (questions.length === 0) {
    throw new Error("Could not generate assessment questions. Please try again.");
  }
  return questions;
}

export function sanitizeQuestions(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      const options = Array.isArray(item?.options)
        ? item.options.map((opt) => String(opt)).slice(0, 4)
        : [];
      const correctAnswer = Number(item?.correctAnswer);
      if (!item?.question || options.length !== 4) return null;
      if (!Number.isInteger(correctAnswer) || correctAnswer < 0 || correctAnswer > 3) return null;
      return { question: String(item.question), options, correctAnswer };
    })
    .filter(Boolean);
}

// Coerce a worker's answers into 0-based option indices. Accepts numeric
// indices (0-3 or 1-4), letters (A-D / a-d), or the exact option text.
export function coerceAnswerToIndex(answer, options = []) {
  if (answer === undefined || answer === null) return -1;

  if (typeof answer === "number" && Number.isInteger(answer)) {
    if (answer >= 0 && answer <= 3) return answer;
    if (answer >= 1 && answer <= 4) return answer - 1; // 1-based
    return -1;
  }

  const text = String(answer).trim();
  if (/^[0-3]$/.test(text)) return Number(text);
  if (/^[1-4]$/.test(text)) return Number(text) - 1;

  const letter = text.toUpperCase();
  if (/^[A-D]$/.test(letter)) return letter.charCodeAt(0) - 65;

  const matchIndex = options.findIndex(
    (opt) => String(opt).trim().toLowerCase() === text.toLowerCase()
  );
  return matchIndex;
}

// Score answers against the stored questions. Returns score (0-100), counts,
// and per-question correctness.
export function scoreAssessment(questions, answers) {
  const list = Array.isArray(questions) ? questions : [];
  const provided = Array.isArray(answers) ? answers : [];
  let correct = 0;

  const breakdown = list.map((question, index) => {
    const chosen = coerceAnswerToIndex(provided[index], question.options);
    const isCorrect = chosen === question.correctAnswer;
    if (isCorrect) correct += 1;
    return { index, chosen, correctAnswer: question.correctAnswer, isCorrect };
  });

  const total = list.length;
  const score = total > 0 ? Math.round((correct / total) * 100) : 0;
  return { score, correct, total, passed: score >= 80, breakdown };
}
