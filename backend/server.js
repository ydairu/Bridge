// Backend Server for Bridge Application
// Handles OpenAI requests and Firebase Admin operations

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import admin from "firebase-admin";
import OpenAI from "openai";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

import { BridgeFirestoreService } from "./src/services/firestoreBridge.js";
import { registerWhatsAppWebhookRoutes } from "./src/whatsapp/webhook.js";
import { startTelegramPoller } from "./src/telegram/poller.js";
import { getPublicFeatureStatus, hasFeatureEnv, getEnv } from "./src/config/env.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, "..", ".env") });

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(
  express.json({
    // Capture the raw request body so the WhatsApp webhook can verify the
    // X-Hub-Signature-256 header (HMAC must run over the exact bytes Meta sent).
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  })
);

// Initialize Firebase Admin SDK
// Prefer credentials from environment variables to avoid committing service account files
function getServiceAccountFromEnv() {
  const privateKeyRaw = process.env.FIREBASE_PRIVATE_KEY || "";
  const privateKey = privateKeyRaw.replace(/\\n/g, "\n");
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const projectId = process.env.FIREBASE_PROJECT_ID;

  if (privateKey && clientEmail && projectId) {
    return {
      type: "service_account",
      project_id: projectId,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: privateKey,
      client_email: clientEmail,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
      universe_domain: "googleapis.com",
    };
  }

  return null;
}

let serviceAccount = getServiceAccountFromEnv();

if (!serviceAccount) {
  // Fallback: read from file if present (local dev only). File is ignored by git.
  try {
    serviceAccount = JSON.parse(
      readFileSync(join(__dirname, "..", "firebase_private_key.json"), "utf8")
    );
  } catch (err) {
    console.error("Firebase Admin credentials not found in env and file read failed.");
    throw err;
  }
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: serviceAccount.project_id,
});

const db = admin.firestore();

// Bridge WhatsApp AI assistant: Firestore data layer shared by the orchestrator tools.
const bridgeService = new BridgeFirestoreService(db);

const ai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const AI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

async function generateJsonFromPrompt(prompt) {
  const completion = await ai.chat.completions.create({
    model: AI_MODEL,
    messages: [
      { role: "system", content: "You output only valid JSON. No markdown, no commentary." },
      { role: "user", content: prompt },
    ],
    temperature: 0.8,
    response_format: { type: "json_object" },
  });
  return completion.choices[0].message.content;
}

// In-memory history to avoid repeating words across requests while the server runs
const generatedWordHistory = new Set();

async function generateQuizQuestions(numberOfQuestions, difficulty, skill) {
  const prompt = `Generate ${numberOfQuestions} multiple choice questions for a ${difficulty} level quiz about ${skill}.

Format the response as a JSON object with this structure:
{
  "questions": [
    {
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0
    }
  ]
}

Make the questions practical and relevant for migrant workers in Singapore. The correctAnswer should be the index (0-3) of the correct option.`;

  const text = await generateJsonFromPrompt(prompt);

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.error("OpenAI raw response:", text);
    throw new Error("Failed to parse quiz questions from AI response");
  }

  const parsed = JSON.parse(jsonMatch[0]);
  return parsed.questions ?? parsed;
}

async function generateConstructionSpellingWord(difficulty, excludeWords = []) {
  // Define word length based on difficulty
  let wordLengthRange;
  if (difficulty === 'beginner' || difficulty === 'Beginner') {
    wordLengthRange = "4-5 letters";
  } else if (difficulty === 'intermediate' || difficulty === 'Intermediate') {
    wordLengthRange = "6-8 letters";
  } else {
    wordLengthRange = "9 letters and above";
  }

  // Build exclusion text from passed excludeWords array
  let excludeText = '';
  if (Array.isArray(excludeWords) && excludeWords.length > 0) {
    const safeList = excludeWords
      .filter(Boolean)
      .map(w => String(w).trim())
      .filter(Boolean)
      .slice(0, 50); // guard length
    if (safeList.length > 0) {
      excludeText = `\nDo NOT use any of the following words (case-insensitive): ${safeList.join(", ")}.`;
    }
  }

  const prompt = `Generate ONE construction-themed spelling word for a ${difficulty} level spelling quiz. The word must be exactly ${wordLengthRange} long.

Format the response as a JSON object with this EXACT structure:
{
  "word": "WORD",
  "hint": "A helpful hint describing what this construction term means",
  "letters": ["W", "O", "R", "D"],
  "distractors": ["X"]
}

Requirements:
- THE WORD MUST NOT BE REPEATED FROM PREVIOUS REQUESTS
- The word must be a construction-related term (e.g., tools, materials, techniques, safety equipment, building parts)
- The word length must match ${wordLengthRange}
- The letters array must contain ALL letters of the word as separate uppercase strings
- The distractors array must contain exactly 1 different uppercase letter that is NOT in the word
- The hint should be practical and helpful for someone learning construction terminology
- Make it suitable for construction workers in Singapore
${excludeText}

Respond with ONLY valid JSON, no additional text.`;

  const text = await generateJsonFromPrompt(prompt);

  // Try to extract JSON from the response
  let jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.error("OpenAI raw response:", text);
    throw new Error("Failed to parse construction spelling word from AI response");
  }

  const parsed = JSON.parse(jsonMatch[0]);

  // defensive normalization: uppercase letters array and distractors
  if (Array.isArray(parsed.letters)) {
    parsed.letters = parsed.letters.map(l => String(l).toUpperCase());
  }
  if (Array.isArray(parsed.distractors)) {
    parsed.distractors = parsed.distractors.map(l => String(l).toUpperCase());
  }

  return parsed;
}

// -- new helper: validate single spelling word object
function isValidSpellingWord(obj) {
  return (
    obj &&
    typeof obj.word === 'string' &&
    Array.isArray(obj.letters) &&
    obj.letters.length === obj.word.length &&
    Array.isArray(obj.distractors)
  );
}

// -- new helper: generate multiple unique, validated spelling words
async function generateSpellingWords(count, difficulty) {
  const results = [];
  const seen = new Set();
  for (let i = 0; i < count; i++) {
    let attempts = 0;
    let wordObj = null;
    while (attempts < 6) {
      attempts++;
      try {
        // pass global history + local seen as exclusions so AI is forced to produce new words
        const exclude = [...generatedWordHistory, ...Array.from(seen)];
        wordObj = await generateConstructionSpellingWord(difficulty, exclude);
      } catch (e) {
        console.warn('[spelling] AI call failed, retrying', { attempt: attempts, err: e?.message });
        continue;
      }
      if (!isValidSpellingWord(wordObj)) {
        console.warn('[spelling] invalid word from AI, retrying', wordObj);
        continue;
      }
      const key = (wordObj.word || '').toLowerCase();
      if (seen.has(key) || generatedWordHistory.has(key)) {
        console.warn('[spelling] duplicate word from AI, retrying', key);
        continue;
      }
      seen.add(key);
      generatedWordHistory.add(key); // persist into global history to avoid repeats across requests
      results.push(wordObj);
      break;
    }
    if (!results[i]) {
      throw new Error(`Failed to generate a valid unique spelling word after ${attempts} attempts`);
    }
  }
  return results;
}

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Backend server is running",
    features: getPublicFeatureStatus(),
  });
});

// Bridge WhatsApp AI assistant webhook (Meta verification + inbound messages).
registerWhatsAppWebhookRoutes({ app, bridgeService });

// Generate Quiz using OpenAI
app.post("/api/quizzes/generate", async (req, res) => {
  try {
    const { skill, difficulty, numberOfQuestions = 10 } = req.body;

    if (!skill || !difficulty) {
      return res.status(400).json({ error: "Skill and difficulty are required" });
    }

    const questions = await generateQuizQuestions(numberOfQuestions, difficulty, skill);

    // Save quiz to Firestore
    const quizRef = await db.collection("quizzes").add({
      skill,
      difficulty,
      questions,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      numberOfQuestions: questions.length,
    });

    res.json({
      success: true,
      quizId: quizRef.id,
      quiz: { id: quizRef.id, skill, difficulty, questions },
    });
  } catch (error) {
    console.error("Error generating quiz:", error);
    res.status(500).json({
      error: "Failed to generate quiz",
      message: error.message,
    });
  }
});

// Generate Spelling Quiz using OpenAI (can generate or accept pre-generated words)
app.post("/api/spelling-quiz/generate", async (req, res) => {
  try {
    const { skill, difficulty, numberOfWords = 5, words } = req.body;

    if (!skill || !difficulty) {
      return res.status(400).json({ error: "Skill and difficulty are required" });
    }

    console.log('[spelling-quiz] generate request:', { skill, difficulty, numberOfWords, hasWords: !!words });

    let quizWords = words;

    // If words are not provided, generate them using AI (multiple words)
    if (!quizWords || !Array.isArray(quizWords) || quizWords.length === 0) {
      quizWords = await generateSpellingWords(numberOfWords, difficulty);
      console.log('[spelling-quiz] generated words count:', quizWords.length);
    } else {
      console.log('[spelling-quiz] using provided words:', quizWords.length);
    }

    // Save spelling quiz to Firestore
    const quizRef = await db.collection("spellingQuizzes").add({
      skill,
      difficulty,
      words: quizWords,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      numberOfWords: quizWords.length,
    });

    console.log('[spelling-quiz] saved quiz id:', quizRef.id);

    res.json({
      success: true,
      quizId: quizRef.id,
      quiz: { id: quizRef.id, skill, difficulty, words: quizWords },
    });
  } catch (error) {
    console.error("Error generating spelling quiz:", error);
    res.status(500).json({
      error: "Failed to generate spelling quiz",
      message: error.message,
    });
  }
});

// Generate Construction Spelling Word (one word at a time)
app.post("/api/construction-spelling/generate", async (req, res) => {
  try {
    const { difficulty = 'Beginner' } = req.body;

    console.log('[construction-spelling] generate request:', { difficulty });

    // pass global history so single-word endpoint also avoids repeats
    const word = await generateConstructionSpellingWord(difficulty, Array.from(generatedWordHistory));

    // DEBUG: ensure we got a valid word object
    if (!word || !word.word || !word.letters) {
      console.error('[construction-spelling] generated word is invalid:', word);
      return res.status(500).json({ error: 'AI returned unexpected format for spelling word' });
    }

    // record in-memory history
    try {
      generatedWordHistory.add(String(word.word).toLowerCase());
    } catch (e) {}

    console.log('[construction-spelling] generated word:', word);

    res.json({
      success: true,
      word: word
    });
  } catch (error) {
    console.error("Error generating construction spelling word:", error);
    res.status(500).json({
      error: "Failed to generate construction spelling word",
      message: error.message,
    });
  }
});

// Get all spelling quizzes
app.get("/api/spelling-quizzes", async (req, res) => {
  try {
    const snapshot = await db.collection("spellingQuizzes").get();
    const quizzes = [];
    snapshot.forEach((doc) => quizzes.push({ id: doc.id, ...doc.data() }));
    res.json({ success: true, quizzes });
  } catch (error) {
    console.error("Error fetching spelling quizzes:", error);
    res.status(500).json({ error: "Failed to fetch spelling quizzes" });
  }
});

// Get spelling quiz by ID
app.get("/api/spelling-quizzes/:id", async (req, res) => {
  try {
    const doc = await db.collection("spellingQuizzes").doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ error: "Spelling quiz not found" });
    res.json({ success: true, quiz: { id: doc.id, ...doc.data() } });
  } catch (error) {
    console.error("Error fetching spelling quiz:", error);
    res.status(500).json({ error: "Failed to fetch spelling quiz" });
  }
});

// Get all quizzes
app.get("/api/quizzes", async (req, res) => {
  try {
    const snapshot = await db.collection("quizzes").get();
    const quizzes = [];
    snapshot.forEach((doc) => quizzes.push({ id: doc.id, ...doc.data() }));
    res.json({ success: true, quizzes });
  } catch (error) {
    console.error("Error fetching quizzes:", error);
    res.status(500).json({ error: "Failed to fetch quizzes" });
  }
});

// Get quiz by ID
app.get("/api/quizzes/:id", async (req, res) => {
  try {
    const doc = await db.collection("quizzes").doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ error: "Quiz not found" });
    res.json({ success: true, quiz: { id: doc.id, ...doc.data() } });
  } catch (error) {
    console.error("Error fetching quiz:", error);
    res.status(500).json({ error: "Failed to fetch quiz" });
  }
});

// Submit quiz result
app.post("/api/quizzes/results", async (req, res) => {
  try {
    const { userId, quizId, score, answers } = req.body;

    if (!userId || !quizId || score === undefined) {
      return res.status(400).json({ error: "userId, quizId, and score are required" });
    }

    const resultRef = await db.collection("quizResults").add({
      userId,
      quizId,
      score,
      answers,
      completedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Award badge if score >= 80%
    if (score >= 80) {
      const quizDoc = await db.collection("quizzes").doc(quizId).get();
      const quiz = quizDoc.data();

      await db.collection("badges").add({
        userId,
        skill: quiz.skill,
        level: quiz.difficulty,
        earnedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      res.json({
        success: true,
        resultId: resultRef.id,
        badgeEarned: true,
        badge: { skill: quiz.skill, level: quiz.difficulty },
      });
    } else {
      res.json({ success: true, resultId: resultRef.id, badgeEarned: false });
    }
  } catch (error) {
    console.error("Error submitting quiz result:", error);
    res.status(500).json({ error: "Failed to submit quiz result" });
  }
});

// Verify Firebase ID Token middleware
const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split("Bearer ")[1];
    if (!token) return res.status(401).json({ error: "No token provided" });

    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error("Error verifying token:", error);
    res.status(401).json({ error: "Invalid token" });
  }
};

// Example protected route
app.get("/api/user/profile", verifyToken, async (req, res) => {
  try {
    const userDoc = await db.collection("users").doc(req.user.uid).get();
    if (!userDoc.exists) return res.status(404).json({ error: "User not found" });
    res.json({ success: true, profile: userDoc.data() });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// Surface WhatsApp/OpenAI/Exa configuration status at boot. These are logged
// (not fatal) so the existing OpenAI quiz endpoints keep working during the
// WhatsApp rollout; the webhook itself rejects requests when its env is missing.
function reportBridgeFeatureStatus() {
  const features = {
    "WhatsApp webhook": hasFeatureEnv("whatsapp"),
    "Telegram bot": hasFeatureEnv("telegram"),
    "OpenAI orchestrator": hasFeatureEnv("openai"),
    "Exa verification": hasFeatureEnv("exa"),
  };
  for (const [label, ok] of Object.entries(features)) {
    console.log(`${ok ? "✅" : "⚠️ "} ${label}: ${ok ? "configured" : "missing env vars"}`);
  }
  if (process.env.NODE_ENV === "production" && !hasFeatureEnv("whatsapp")) {
    console.warn(
      "⚠️  Running in production without WhatsApp env vars — inbound webhooks will be rejected."
    );
  }
}

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
  console.log(`📊 Firebase Project: ${process.env.VITE_FIREBASE_PROJECT_ID}`);
  console.log(`🤖 OpenAI: Integrated successfully (model: ${AI_MODEL})`);
  console.log("🌉 Bridge WhatsApp assistant:");
  reportBridgeFeatureStatus();
  maybeStartTelegramBot();
});

// Start the Telegram bot (long-polling, no public URL needed) when a token is set.
// Reuses the same orchestrator + Firestore service as the WhatsApp channel.
function maybeStartTelegramBot() {
  if (!hasFeatureEnv("telegram")) return;
  startTelegramPoller({
    bridgeService,
    token: getEnv("TELEGRAM_BOT_TOKEN"),
    openAIConfig: { apiKey: getEnv("OPENAI_API_KEY"), model: AI_MODEL },
    exaApiKey: getEnv("EXA_API_KEY"),
  })
    .then(() => console.log("🤝 Telegram bot: polling for messages"))
    .catch((error) => console.error("Telegram bot failed to start:", error.message));
}
