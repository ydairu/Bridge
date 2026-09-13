# Bridge

Bridge is a job-matching platform for Singapore employers and migrant workers. It combines searchable jobs, direct applications, skills assessments, trust checks, and employer-worker communication in one product.

## Live services

- **Frontend:** [bridge-platform-sg.vercel.app](https://bridge-platform-sg.vercel.app/)
- **Backend health:** [bridge-production-a28b.up.railway.app/health](https://bridge-production-a28b.up.railway.app/health)

## What the platform does

### Job seekers

- Create a profile with skills, experience, location, and language.
- Browse and filter jobs stored in Firestore.
- Apply to jobs and track application status.
- Take OpenAI-generated skill and construction spelling quizzes.
- Earn badges for quiz scores of 80% or higher.
- Use web chat, WhatsApp, or Telegram to search jobs, apply, check applications, request support, and check suspicious offers.

### Employers

- Create and manage job listings.
- Review applications and discover candidates.
- Chat with job seekers in real time.
- Collect and view company and candidate reviews.

### Trust and safety

The WhatsApp and Telegram assistant can verify employers and analyze pasted job offers. It uses Exa evidence plus a risk rubric and highlights signals such as upfront fees, unusually high salaries, and requests for sensitive documents. Flagged or fee-required jobs are not presented as safe application options.

## Architecture

| Area | Implementation |
| --- | --- |
| Frontend | Vue 3, Vite, Vue Router, Vuex, Axios, Tailwind CSS |
| Authentication | Firebase Authentication with employer and jobseeker roles |
| Data | Cloud Firestore, accessed directly by the frontend Vuex modules for most product data |
| Realtime chat | Ably and `@ably/chat`; the `chatAbly` store module is the active implementation |
| Backend | Node.js and Express on Railway |
| AI | OpenAI for quizzes and the Bridge conversational assistant |
| Trust checks | Exa search evidence and OpenAI analysis |
| Hosting | Vercel frontend, Railway backend |

The Express backend is used for AI quiz generation, the conversational assistant, the Telegram integration, and an example authenticated profile route. Jobs, users, applications, reviews, badges, and chat metadata are generally read and written directly through Firestore. Access control for those collections is defined in `firestore.rules`.

## Repository layout

```text
src/                         Vue frontend, views, components, router, and Vuex modules
backend/                     Express server, AI assistant, channel adapters, and tests
backend/src/bridge-agent/    Channel-agnostic Bridge assistant and tool definitions
backend/src/telegram/        Telegram long-polling adapter
backend/src/services/        Firestore, OpenAI, Exa, assessment, and verification services
public/                      Frontend icons and images
firestore.rules              Firestore access-control rules
render.yaml                  Legacy Render blueprint; current backend deployment is Railway
```

## Requirements

- Node.js 18 or newer
- npm 9 or newer
- A Firebase project with Authentication and Firestore enabled
- Private Firebase, OpenAI, and optional channel/integration credentials configured outside source control

## Installation

```bash
npm install
cd backend
npm install
cd ..
```

## Configuration and secrets

Never commit, paste, or document secret values. Keep the root `.env` file local and gitignored, and configure production secrets in the deployment provider's private environment settings. The repository includes code that reads these variable names, but this README intentionally contains no values:

- Frontend Firebase settings: `VITE_FIREBASE_*`
- Frontend API base URL: `VITE_API_URL`
- Ably client key: `VITE_ABLY_API_KEY`
- Backend AI: `OPENAI_API_KEY`, optional `OPENAI_MODEL`
- Backend Firebase Admin credentials: `FIREBASE_*`
- Employer verification: `EXA_API_KEY`
- Telegram bot: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_MODE`, and webhook settings described below

For local development, set the frontend API base URL to the local backend or the deployed backend URL. Firebase Admin credentials must remain server-side; do not place them in frontend variables or commit service-account JSON files.

## Run locally

Start the frontend:

```bash
npm run dev
```

It runs at `http://localhost:5173` by default.

Start the backend in a second terminal:

```bash
npm run backend:dev
# or: npm run backend
```

It runs at `http://localhost:3000` by default. Check it with:

```bash
curl http://localhost:3000/health
```

## Backend API

Public quiz routes used by the frontend:

```text
POST /api/quizzes/generate
GET  /api/quizzes
GET  /api/quizzes/:id
POST /api/quizzes/results
POST /api/spelling-quiz/generate
GET  /api/spelling-quizzes
GET  /api/spelling-quizzes/:id
POST /api/construction-spelling/generate
GET  /health
```

Integration routes:

```text
GET  /api/user/profile    Firebase ID-token protected example route
POST /api/telegram/webhook Telegram secret-header protected webhook
```

### Telegram webhook deployment

Production should use Telegram webhooks so Railway can sleep between requests:

```text
TELEGRAM_MODE=webhook
TELEGRAM_BOT_TOKEN=<secret>
TELEGRAM_WEBHOOK_SECRET=<32-256 letters, numbers, underscores, or hyphens>
TELEGRAM_WEBHOOK_URL=https://bridge-production-a28b.up.railway.app/api/telegram/webhook
```

Generate the webhook secret with `openssl rand -hex 32`. Configure Firestore TTL
for the `telegramRateLimitEvents.expiresAt` field so retry-deduplication records
are automatically removed after two days.

Optional abuse-control settings default to 10 updates/minute, 100/day per
Telegram user, and 3 concurrent update handlers:

```text
TELEGRAM_RATE_LIMIT_PER_MINUTE=10
TELEGRAM_RATE_LIMIT_PER_DAY=100
TELEGRAM_MAX_CONCURRENT=3
```

After deploying the webhook route, configure and inspect it from `backend/`
with the production variables available locally (or prefix these with
`railway run` in a linked Railway project):

```bash
npm run telegram:webhook:set
npm run telegram:webhook:status
```

Then enable Railway **Settings → Deploy → Serverless** and redeploy. Telegram
will POST private messages to the public webhook, waking a sleeping service.
Ensure no uptime monitor continuously calls `/health`. Polling remains available
only when explicitly configured with `TELEGRAM_MODE=polling`, primarily for local
development. Use `npm run telegram:webhook:delete` before switching back.

## Tests and checks

The backend has a hermetic Node test suite using fake Firestore and mocked external requests:

```bash
cd backend
npm test
```

An optional live assistant check uses the real OpenAI service but keeps Firestore in memory. It requires credentials already configured in the local environment and must never be run with secrets printed to logs:

```bash
node scripts/live-agent-check.js
```
---
