# Migration Plan: Gemini → OpenAI for Quiz Generation

> Goal: replace the Gemini (`@google/genai`) AI provider used by the quiz endpoints with
> OpenAI, with **no changes to the frontend or the API contract**.

## 1. Current state — how the quiz function works today

All AI generation lives in **one file**: [backend/server.js](../backend/server.js). The frontend
never calls Gemini directly — it hits the Express backend through `quizApi` in
[src/services/api.js](../src/services/api.js), and the backend calls Gemini.

```
Frontend (quizApi)  ──HTTP──▶  Express backend  ──SDK──▶  Gemini → (replace with) OpenAI
                                     │
                                     └──▶ Firestore (saves quizzes, unchanged)
```

### AI touch points (the only things that change)

| Location | What it does |
| --- | --- |
| [backend/server.js:8](../backend/server.js#L8) | `import { GoogleGenAI } from "@google/genai"` |
| [backend/server.js:74-76](../backend/server.js#L74-L76) | Client init: `new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })` |
| [backend/server.js:95-101](../backend/server.js#L95-L101) | `generateQuizQuestions` — MCQ quiz, returns a JSON **array** |
| [backend/server.js:158-163](../backend/server.js#L158-L163) | `generateConstructionSpellingWord` — returns a JSON **object** |
| `backend/package.json` | dependency `@google/genai` + description/keywords |
| `.env` + Render env | `GEMINI_API_KEY` |

All three call sites share one pattern:
`ai.models.generateContent({ model, contents: prompt })` → read `.text` → regex-extract JSON → parse.

### Endpoints (the contract — must stay the same)
- `POST /api/quizzes/generate`
- `POST /api/spelling-quiz/generate`
- `POST /api/construction-spelling/generate`
- plus read/result routes that **don't** call AI (no change)

Everything downstream (Firestore writes, badge awarding, response shapes) is provider-agnostic and
stays untouched.

---

## 2. Target state

Swap the Gemini SDK for the official `openai` Node SDK and route the same prompts through OpenAI's
Chat Completions API, keeping the "build prompt → get text → extract JSON → parse" flow intact.

Recommended model: **`gpt-4o-mini`** (fast + cheap, good enough for quiz JSON). Use `gpt-4o` for
higher quality. The model is exposed as an env var so it's swappable without code changes.

---

## 3. Implementation steps

### Step 1 — Dependencies
```bash
cd backend
npm uninstall @google/genai
npm install openai
```

### Step 2 — Environment & API key handling (security requirement)
The OpenAI API key **must live only in `.env`** (gitignored) throughout the whole process — never
hardcoded in [backend/server.js](../backend/server.js), never committed, never echoed into logs or
into this report. Code references it strictly via `process.env.OPENAI_API_KEY`.

In `.env` add (and mirror in the **Render** backend env vars — the deployed backend won't work
otherwise):
```
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini      # optional, lets you swap models without code changes
```
After cutover is verified, remove the now-unused `GEMINI_API_KEY` line from `.env` and Render.

### Step 3 — Client init ([backend/server.js:8](../backend/server.js#L8), [74-76](../backend/server.js#L74-L76))
```js
// remove: import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";

// remove the GoogleGenAI client block, replace with:
const ai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const AI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
```

### Step 4 — Add one shared helper (reused by both call sites)
```js
async function generateJsonFromPrompt(prompt) {
  const completion = await ai.chat.completions.create({
    model: AI_MODEL,
    messages: [
      { role: "system", content: "You output only valid JSON. No markdown, no commentary." },
      { role: "user", content: prompt },
    ],
    temperature: 0.8,                          // keep variety for spelling-word uniqueness
    response_format: { type: "json_object" },
  });
  return completion.choices[0].message.content;
}
```

> **Gotcha:** `response_format: { type: "json_object" }` forces valid JSON but the top level must be
> an **object**, while `generateQuizQuestions` currently expects a top-level **array**. Recommended
> fix: change that prompt to ask for `{ "questions": [ ... ] }` and read `parsed.questions`. Keep
> the existing regex extraction (`/\[[\s\S]*\]/`, `/\{[\s\S]*\}/`) as a safety-net fallback.

### Step 5 — `generateQuizQuestions` ([backend/server.js:95-109](../backend/server.js#L95-L109))
Replace the Gemini call with `generateJsonFromPrompt(prompt)`, then:
```js
const parsed = JSON.parse(text);
return parsed.questions ?? parsed;   // tolerate either shape
```

### Step 6 — `generateConstructionSpellingWord` ([backend/server.js:158-182](../backend/server.js#L158-L182))
Replace the Gemini call with `generateJsonFromPrompt(prompt)`. Keep the `/\{[\s\S]*\}/` regex
fallback and the existing letters/distractors uppercase normalization. The retry/uniqueness logic in
`generateSpellingWords` ([backend/server.js:197-232](../backend/server.js#L197-L232)) needs **no
change** — it's provider-independent.

### Step 7 — Lockfiles, docs & labels
- **Lockfiles:** step 1 auto-updates `backend/package-lock.json` and `backend/package.json`. Commit
  the updated lockfile so deploys are reproducible. The **root** `package-lock.json` is unaffected
  (OpenAI is a backend-only dependency).
- **README.txt:** update the Gemini references — features line ([:13](../README.txt#L13)), tech-stack
  table ([:43](../README.txt#L43)), structure comment ([:54](../README.txt#L54)), the "Gemini API
  key" prerequisite ([:68](../README.txt#L68)), and the env-vars section
  ([:79-87](../README.txt#L79-L87)) — swap `GEMINI_API_KEY=` for `OPENAI_API_KEY=` / `OPENAI_MODEL=`.
- **CLAUDE.md:** update the Gemini references in the tech-stack and gotchas sections.
- **Code labels:** startup log [backend/server.js:479](../backend/server.js#L479), error logs
  [:105](../backend/server.js#L105) and [:168](../backend/server.js#L168),
  `backend/package.json` description/keywords.

---

## 4. What does NOT change
- ✅ Frontend — [src/services/api.js](../src/services/api.js), all quiz views/store modules.
- ✅ API routes, request bodies, and JSON response shapes.
- ✅ Firestore writes, badge logic (`score >= 80`), read endpoints.
- ✅ Firebase Admin init and auth.

---

## 5. Audit — verify the changes were applied correctly

A checklist to confirm the migration is complete and nothing Gemini-related was missed.

### Static checks
1. `grep -ri "gemini\|GoogleGenAI\|@google/genai" backend/ src/ CLAUDE.md README.txt` → **no** code/dependency hits.
2. `grep -n "openai\|OpenAI\|OPENAI_" backend/server.js backend/package.json` → confirms the new client, model constant, and SDK are present.
3. `cat backend/package.json` → `@google/genai` removed, `openai` listed under dependencies.
4. `grep -n "openai\|@google/genai" backend/package-lock.json` → lockfile updated (openai present, gemini absent).
5. **Key safety:** `grep -rn "sk-" backend/ src/ README.txt CLAUDE.md docs/` → **no** hardcoded key anywhere; the key resolves only via `process.env.OPENAI_API_KEY`. Confirm `.env` is still gitignored and not staged (`git status`).
6. `grep -n "OPENAI_API_KEY" .env` and confirm the Render dashboard has `OPENAI_API_KEY` set.
7. Confirm `node_modules/@google/genai` is gone and `node_modules/openai` exists after `npm install`.

### Behavioral checks (server running: `cd backend && npm start`)
8. Server boots with no missing-key error; startup log no longer says "Gemini".
9. `POST /api/quizzes/generate` `{"skill":"plumbing","difficulty":"beginner","numberOfQuestions":3}` → `quizId` + 3 questions, each `options.length === 4`, `correctAnswer` in 0–3.
10. `POST /api/construction-spelling/generate` `{"difficulty":"Beginner"}` → valid `{ word, hint, letters, distractors }` with `letters.length === word.length`.
11. `POST /api/spelling-quiz/generate` `{"skill":"construction","difficulty":"intermediate","numberOfWords":5}` → 5 **unique** words (confirms retry/uniqueness still works).
12. Firestore: new docs appear in the `quizzes` / `spellingQuizzes` collections.
13. Frontend (`npm run dev`): complete a quiz end-to-end; badge awarded at ≥80%.

**Sign-off:** all static checks pass + endpoints 9–11 return well-formed JSON + the frontend quiz/badge flow works.

---

## 6. Effort estimate
~30–45 min. One source file, one dependency swap, one env var, plus lockfile/README/doc/log updates.
