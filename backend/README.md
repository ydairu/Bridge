# Bridge Backend Server

This is the backend server for the Bridge application that handles:
- 🤖 OpenAI quiz generation
- 🔥 Firebase Admin SDK operations
- 🔐 Authentication verification
- 📊 Secure API endpoints

## Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Move Firebase Service Account

Move your `firebase_private_key.json` to the project root (one level up from backend folder):

```bash
mv ~/Desktop/firebase_private_key.json ../
```

### 3. Environment Variables

The backend uses the same `.env` file from the parent directory, which includes:
- `OPENAI_API_KEY` - Your OpenAI API key
- `OPENAI_MODEL` - Model to use (optional, default: `gpt-4o-mini`)
- `VITE_FIREBASE_PROJECT_ID` - Firebase project ID

### 4. Start the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will run on `http://localhost:3000`

## API Endpoints

### Health Check
```
GET /health
```

### Quiz Generation (OpenAI)
```
POST /api/quizzes/generate
Content-Type: application/json

{
  "skill": "Construction",
  "difficulty": "beginner",
  "numberOfQuestions": 10
}
```

### Get All Quizzes
```
GET /api/quizzes
```

### Get Quiz by ID
```
GET /api/quizzes/:id
```

### Submit Quiz Result
```
POST /api/quizzes/results
Content-Type: application/json

{
  "userId": "user123",
  "quizId": "quiz456",
  "score": 85,
  "answers": [0, 1, 2, 0, 3]
}
```

### Protected Route Example
```
GET /api/user/profile
Authorization: Bearer <firebase-id-token>
```

## Security

- ✅ Firebase Admin SDK credentials are stored server-side only
- ✅ OpenAI API key is never exposed to the frontend
- ✅ CORS configured for frontend access
- ✅ Token verification for protected routes

## Testing

1. Start the backend server
2. Test the health endpoint:
```bash
curl http://localhost:3000/health
```

3. Generate a quiz:
```bash
curl -X POST http://localhost:3000/api/quizzes/generate \
  -H "Content-Type: application/json" \
  -d '{"skill": "Construction", "difficulty": "beginner", "numberOfQuestions": 5}'
```

## WhatsApp AI Assistant (Bridge orchestrator)

The backend also hosts the WhatsApp job assistant for migrant workers. It layers
OpenAI (worker-facing reasoning/orchestration) and Exa (employer/offer trust
verification) on top of the existing Firestore job platform — see
`bridge-whatsapp-implementation-plan.md` at the repo root.

### Module layout (`backend/src/`)
- `whatsapp/` — `webhook.js` (routes), `client.js` (send + parse + interactive
  messages), `signature.js` (HMAC `X-Hub-Signature-256` check), `templates.js`.
- `bridge-agent/` — `orchestrator.js`, `schemas.js` (tool definitions),
  `systemPrompt.js`, `tools.js` (tool executor).
- `services/` — `firestoreBridge.js` (data layer), `openai.js`, `exa.js`,
  `verification.js`.
- `config/` — `env.js` (feature env validation), `scamRubric.js`.

### Endpoints
```
GET  /webhooks/whatsapp   # Meta verification challenge (uses WHATSAPP_VERIFY_TOKEN)
POST /webhooks/whatsapp   # Inbound messages (signature-verified, deduped, async)
GET  /health              # now also reports feature config status
```

### Environment
See `.env.example` at the repo root. WhatsApp needs `WHATSAPP_TOKEN`,
`WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_VERIFY_TOKEN`, `WHATSAPP_APP_SECRET`;
the orchestrator needs `OPENAI_API_KEY` (+ optional `OPENAI_MODEL`); trust
verification needs `EXA_API_KEY`. Missing groups are logged at boot and the
webhook rejects requests rather than crashing the existing OpenAI quiz endpoints.

### Smoke test (no deps, no network)
```bash
npm run smoke:whatsapp
```
Validates signature verification, inbound message parsing, and interactive
payload shaping.

## Integration with Frontend

The frontend is already configured to call these endpoints through `src/services/api.js`.

Make sure the backend is running before using quiz generation features in the frontend!

