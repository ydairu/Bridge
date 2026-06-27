# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project
**Bridge** — a job-matching web app connecting Singapore employers with migrant workers. Features:
job listings, Firebase auth, AI-generated skill quizzes (Gemini), real-time chat (Ably), reviews,
and badges. Frontend → Vercel, backend → Render.

## Commands
- `npm run dev` — start Vite frontend (http://localhost:5173)
- `npm run build` — production build
- `npm run preview` — preview the build
- `cd backend && npm start` — start Express API (http://localhost:3000); `npm run dev` for nodemon
- No tests or linter are configured.

## Tech stack
Vue 3 (Composition + Options), Vite, Vue Router 4, Vuex 4, Axios, Firebase web SDK (Auth/Firestore/
Storage), Ably (`ably` + `@ably/chat`) for chat, GSAP/ScrollReveal/lucide for UI. Backend: Node +
Express + firebase-admin + `@google/genai` (Gemini `gemini-2.5-flash`).

## Architecture (important)
- **Split data access.** The frontend reads/writes **Firestore directly** through the Firebase web
  SDK inside Vuex modules for most data (jobs, users, applications, badges, reviews, chat metadata).
  The Express backend is used **only** for Gemini AI quiz/spelling-word generation plus one example
  protected route. Access control is enforced by `firestore.rules`, not a REST layer.
- **`src/services/api.js`:** only `quizApi` endpoints are backed by real backend routes. `jobApi` and
  `userApi` reference endpoints that do NOT exist in `backend/server.js` — do not assume they work;
  job/user data goes directly to Firestore in the store modules.
- **Chat = Ably.** `src/services/ably.js` + `src/store/modules/chatAbly.js` is the live chat
  implementation. `src/store/modules/chat.js` (Firestore-based) is legacy.
- **Auth roles** are stored both on the Firestore `users` doc (`role`) and as a Firebase custom
  claim; the router guard (`src/router/index.js`) reads `getIdTokenResult().claims.role`. Roles:
  `employer`, `jobseeker`.
- **Profile/company images** are stored as base64 strings in Firestore, not Firebase Storage.

## Layout
- `src/main.js` — app bootstrap; dispatches `auth/initAuthListener` before mount.
- `src/router/index.js` — routes + `beforeEach` auth/role guard (`meta.requiresAuth`, `meta.role`).
- `src/store/` — Vuex root + `modules/` (auth, jobs, applications, badges, reviews, quizzes, chat,
  chatAbly, theme). All modules are namespaced.
- `src/firebase/config.js` — Firebase web SDK init (exports `auth`, `db`, `storage`).
- `src/services/api.js` — Axios client for the backend (quiz endpoints only).
- `src/services/ably.js` — Ably realtime/chat client lifecycle.
- `src/views/` — page components (routed). `src/components/` — reusable UI.
- `backend/server.js` — Express server: `/api/quizzes/*`, `/api/spelling-quiz/*`,
  `/api/construction-spelling/*`, `/health`. Initializes firebase-admin + Gemini.
- `firestore.rules` — security rules (source of truth for collection access).
- `scripts/seed-data-with-auth.cjs`, `scripts/cleanup-seed-data.cjs` — Firestore seeding/cleanup
  scripts (run from project root, e.g. `node scripts/seed-data-with-auth.cjs`; they read
  `firebase_private_key.json` from the project root).

## Firestore collections
`users`, `jobs`, `applications`, `quizzes`, `spellingQuizzes`, `quizResults`, `badges`,
`earnedBadges`, `reviews`, `candidateReviews`, `chatRooms`, `messages`, `userStats`.

## Conventions
- Vuex modules: namespaced, `SET_*` mutations, async actions that `commit` loading/error, getters for
  derived state. Follow this shape when adding store logic.
- Quiz badges awarded server-side when score >= 80% (`backend/server.js`).
- Env vars: client vars are `VITE_*` (Firebase, `VITE_ABLY_API_KEY`, `VITE_API_URL`); server vars are
  `GEMINI_API_KEY` and `FIREBASE_*` admin credentials. Secrets live in `.env` (gitignored) — never
  commit keys.

## Gotchas
- The frontend depends on a running backend only for quiz generation; everything else works against
  Firestore directly.
- Changing data shapes usually means updating both the store module AND `firestore.rules`.
- `chatAbly.js` is large and stateful — read it fully before modifying chat behavior.
