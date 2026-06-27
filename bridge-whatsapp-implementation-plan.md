# Bridge WhatsApp AI Assistant Implementation Plan

## Codebase Understanding

The cloned repository is a Vue 3/Vite web application backed mostly by Firebase:

- Frontend: Vue 3, Vue Router, Vuex, Firebase web SDK, Ably chat.
- Backend: Express server used mainly for Gemini-powered quiz and spelling endpoints.
- Data: Firestore collections for users, jobs, applications, quizzes, badges, reviews, chat rooms, and messages.
- Auth: Firebase Auth plus Firestore user profiles with `role` values of `jobseeker` and `employer`.
- Deployment intent: Vercel for frontend, Render for backend.

Important existing implementation details:

- Jobs are read/written directly from the frontend Vuex module to Firestore.
- Applications are also written directly from frontend Vuex to Firestore.
- The backend already initializes Firebase Admin and can safely perform server-side Firestore writes.
- Quizzes/assessments already exist, but they use Gemini, not OpenAI.
- There is no WhatsApp webhook, OpenAI orchestration, Exa verification, persistent WhatsApp conversation state, or template-message system yet.

The attached plan assumes a new Supabase/Postgres/pgvector backend. For this repository, the fastest and least risky approach is to keep Firestore and extend the existing Express backend into the WhatsApp orchestration server. Do not introduce Supabase during the hackathon unless the team has a strong reason and time to migrate.

## Recommended Architecture

Use the existing `backend/server.js` as the home for the WhatsApp bot:

```text
WhatsApp Cloud API
  -> Express webhook routes
  -> WhatsApp signature verification and dedupe
  -> Bridge orchestrator
  -> OpenAI Responses/API tool calls
  -> Firestore service functions
  -> Exa employer/job verification
  -> WhatsApp send message helper
```

Add a small backend module structure instead of growing `server.js` indefinitely:

```text
backend/
  server.js
  src/
    whatsapp/
      webhook.js
      client.js
      signature.js
      templates.js
      interactive.js
    bridge-agent/
      orchestrator.js
      systemPrompt.js
      tools.js
      schemas.js
    services/
      firestoreBridge.js
      openai.js
      exa.js
      language.js
      verification.js
    config/
      env.js
      scamRubric.js
```

This keeps the demo build understandable and lets judges see the sponsor-tech integration clearly.

## Data Model Changes

Keep existing collections and add WhatsApp-specific fields/collections.

Update `users` documents:

- `waPhone`
- `language`
- `countryOfOrigin`
- `experienceSummary`
- `profileComplete`
- `source: "web" | "whatsapp"`

Update `jobs` documents:

- `verificationStatus: "unverified" | "pending" | "verified" | "flagged"`
- `verificationNotes`
- `feeRequired`
- `riskLevel`
- `riskReasons`
- `requiredSkills` or reuse existing `skills`

Update `applications` documents:

- `source: "web" | "whatsapp"`
- `referenceCode`
- `answers`
- `submittedViaWaPhone`

Add collections:

- `conversationStates`
- `waMessages`
- `supportTickets`
- `verificationRuns`
- `templateSends`

Note: Firestore Admin writes bypass security rules, so backend routes do not require changing rules for bot internals. If the web frontend needs to read verification fields, the existing public `jobs` read rule already allows it.

## Phase Plan

### Phase 0: Backend Setup And Env Validation

Goal: make the current backend ready for WhatsApp, OpenAI, Exa, and Firestore service code.

Tasks:

- Add backend dependencies: `openai`, `exa-js` or plain `fetch`, and any validation helper such as `zod`.
- Add required env vars:
  - `WHATSAPP_TOKEN`
  - `WHATSAPP_PHONE_NUMBER_ID`
  - `WHATSAPP_VERIFY_TOKEN`
  - `WHATSAPP_APP_SECRET`
  - `OPENAI_API_KEY`
  - `OPENAI_MODEL`
  - `EXA_API_KEY`
- Add a strict startup env validator.
- Keep Gemini quiz endpoints working during the transition.
- Seed or patch demo jobs with verification fields, including one intentionally risky listing.

Definition of Done:

- `backend/server.js` still starts.
- `/health` works.
- Missing env vars fail clearly in production mode.
- Existing quiz endpoints remain intact.

### Phase 1: WhatsApp Pipe

Goal: prove that a WhatsApp message reaches the server and a reply is sent back.

Tasks:

- Add `GET /webhooks/whatsapp` for Meta verification.
- Add `POST /webhooks/whatsapp` for inbound messages.
- Validate `X-Hub-Signature-256` using `WHATSAPP_APP_SECRET`.
- Parse inbound text messages.
- Persist inbound and outbound messages in `waMessages`.
- Dedupe by WhatsApp message ID.
- Reply with a fixed scoped Bridge message.

Definition of Done:

- Texting the WhatsApp test number returns a response.
- Duplicate webhook retries are ignored.
- Inbound/outbound traffic is logged.

### Phase 2: OpenAI Orchestrator And Task Scope

Goal: make OpenAI the core runtime, not a bolt-on.

Tasks:

- Add OpenAI client and model read from `OPENAI_MODEL`.
- Build `orchestrator.js`:
  - load or create user by `waPhone`
  - load `conversationStates`
  - load recent `waMessages`
  - call OpenAI with strict Bridge-only system prompt
  - execute approved tool calls
  - send final localized reply
- Add initial tools:
  - `get_profile`
  - `create_or_update_profile`
  - `search_jobs`
  - `get_job`
  - `request_support`
- Persist detected user language.
- Refuse off-topic messages and redirect to Bridge job support.

Definition of Done:

- Bot responds in at least English plus one target migrant-worker language.
- Bot can update a worker profile from natural language.
- Off-topic prompts are redirected.
- Tool calls are logged for demo/debugging.

### Phase 3: Job Search, Detail, And Direct Application

Goal: complete the core Future of Work flow through WhatsApp.

Tasks:

- Implement `search_jobs` against existing Firestore `jobs`.
- Rank verified jobs first, then by simple skill overlap.
- For hackathon speed, avoid pgvector; Firestore plus deterministic skill scoring is enough.
- Add WhatsApp list messages for job results.
- Implement `get_job` with:
  - title
  - company
  - salary
  - location
  - skills
  - verification status
  - fee warning
- Implement application flow:
  - `start_application`
  - collect missing profile fields or answers
  - `submit_application`
  - generate reference code
  - save to existing `applications`
- Implement `list_applications` and `get_application_status`.

Definition of Done:

- Worker can complete profile, search jobs, view a verified job, apply, and check status entirely in WhatsApp.

### Phase 4: Skills Assessment Reuse

Goal: reuse existing quiz/assessment concept without overbuilding.

Tasks:

- Expose WhatsApp-friendly `start_assessment(skill)`.
- Prefer reusing existing quiz generation logic initially.
- If sponsor-tech scoring is important, add OpenAI-generated assessment questions for WhatsApp while keeping the existing web quiz screens untouched.
- Store results in `quizResults` and/or `earnedBadges`.
- Include earned badge/score in application summaries.

Definition of Done:

- Worker completes a short assessment in chat.
- Score is stored.
- Application or profile output references the badge/score.

### Phase 5: Exa Verification And Scam Detection

Goal: make trust the visible product differentiator.

Tasks:

- Add Exa service for employer/job evidence retrieval.
- Add `verify_employer` tool:
  - search company name, website, UEN/registration if available, scam/complaint terms
  - pass results to OpenAI using a strict risk rubric
  - store `verificationStatus` and `verificationNotes`
- Add passive inbound offer screening:
  - if a worker pastes a suspicious job message, extract company/pay/fee/contact signals
  - run Exa search when enough employer data exists
  - return simple risk verdict and reasons
- Update WhatsApp job list/detail output to always display verification status.
- Optionally update web job cards/details to display verification badges.

Definition of Done:

- Verified jobs show verified status.
- Seeded scam listing is flagged or hidden.
- Pasting a fake external offer returns a risk verdict with reasons.

### Phase 6: Proactive Notifications And Demo Polish

Goal: isolate paid/template WhatsApp messages and harden the demo.

Tasks:

- Add `sendTemplate()` as the only proactive outbound path.
- Add `templateSends` logging and simple rate limits.
- Add status-change notification hook for application updates.
- Add graceful fallbacks for OpenAI, Exa, Firestore, and WhatsApp API failures.
- Add a `DEMO_MODE` with known seeded data and scripted messages.
- Add a one-page admin/dev endpoint or console logs for showing tool calls during judging.

Definition of Done:

- Application status change can trigger a template message.
- Demo script runs reliably.
- Failures do not leave the worker stuck.

## Execution Issues And Risks

### 1. Supabase/Postgres mismatch

The attached plan specifies Supabase/Postgres/pgvector, but the repo is already deeply Firebase/Firestore-based. Migrating data stores during a hackathon would be high risk. Use Firestore and simple skill-overlap ranking for the demo.

### 2. Existing backend uses Gemini

The current backend uses `@google/genai` and hardcoded `gemini-2.5-flash` for quiz generation. Adding OpenAI is straightforward, but replacing all Gemini quiz behavior could break existing web features. Keep Gemini endpoints initially; add OpenAI for the WhatsApp orchestrator and verification explanations.

### 3. Firestore schema inconsistency

Existing jobs use fields like `company`, `salary`, `skills`, `category`, `type`, and `status: active`. The plan uses `salary_range`, `required_skills`, `status: open|closed`, and `fee_required`. Implement mapping helpers so WhatsApp tools do not require a disruptive schema rewrite.

### 4. WhatsApp policy scope

The bot must be task-specific. The system prompt and orchestrator should refuse general AI questions and redirect to job search, applications, assessments, scam checks, or support.

### 5. WhatsApp interactive message complexity

Text replies are easy; list/button messages require exact Cloud API payload shapes. Build a text-only fallback for every interactive response so demo does not break if list messages fail.

### 6. Signature verification and idempotency

Meta retries webhooks. Without signature verification and dedupe, the bot can double-apply to jobs or double-send messages. Phase 1 must solve this before LLM logic.

### 7. Firebase Auth vs WhatsApp identity

Current web users are Firebase Auth users keyed by UID. WhatsApp users are phone-number-first and may not have Firebase Auth accounts. Use `users` docs with deterministic IDs like `wa_<normalized_phone>` or store a `waPhone` lookup collection. Avoid trying to create Firebase Auth accounts for every WhatsApp user during the demo.

### 8. Employer verification evidence quality

Seeded employer websites may be fake or not publicly searchable. For demo reliability, seed at least one employer with realistic verification notes and one flagged listing. Use live Exa for the pasted-offer scam moment, but have deterministic fallback evidence if API/search fails.

### 9. OpenAI cost and latency

WhatsApp should feel fast. Keep context short, summarize state in Firestore, cap recent turns, and avoid multiple LLM calls unless a tool call is needed.

### 10. No tests/linter currently configured

There are no tests or lint scripts in the repo. Add targeted backend tests only if time permits; otherwise use manual smoke scripts for webhook signature, message parsing, tool calls, and Firestore writes.

## Recommended Hackathon Cut

If time is tight, ship this subset:

1. WhatsApp webhook and fixed reply.
2. OpenAI orchestrator with profile, job search, job detail, application, and support tools.
3. Firestore conversation state and message logs.
4. Exa + OpenAI scam screening for pasted job offers.
5. Seeded verification status on job listings.
6. A clean scripted demo in one non-English language.

Defer:

- pgvector.
- Full Supabase migration.
- Complex template notification workflows.
- Full web UI redesign.
- Deep multilingual assessment generation.

## Suggested Demo Script

1. Worker sends: "Ami construction kaj chai, 3 bochor experience."
2. Bridge detects Bengali, creates profile, and asks one clarifying question.
3. Worker searches for construction jobs.
4. Bot returns verified jobs first.
5. Worker selects a job and sees salary, location, verification, and no-fee warning.
6. Worker applies directly and gets a reference code.
7. Worker pastes a suspicious offer asking for an upfront fee.
8. Bot flags it as risky and explains why in simple language.
9. Employer dashboard/web app shows the application in the existing platform.

## Bottom Line

Do not rebuild Bridge. Extend it.

The strongest implementation is a WhatsApp/OpenAI/Exa layer on top of the existing Firebase job platform. That gives the judges a real shipped product, preserves existing web functionality, and makes sponsor tech central: OpenAI is the worker-facing reasoning/orchestration engine, and Exa is the trust-verification engine.
