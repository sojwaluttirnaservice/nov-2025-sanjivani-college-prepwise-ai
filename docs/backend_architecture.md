# 🖥️ Backend System Design — College PrepWise AI

> **Stack:** Node.js + Express.js + MongoDB (Mongoose) + JWT Auth + OpenAI / Gemini LLM

---

## 1. Entry Point & Middleware Pipeline

**File:** `api/app.js`

The app is a standard Express application bootstrapped by `bin/www`. It does NOT call `connectDB()` itself—that happens in `bin/www` to ensure the DB is connected _before_ the server starts listening. This avoids the race condition where requests arrive before Mongoose is ready.

```
HTTP Request
    → CORS (allow-all for dev, can be tightened for prod via config.allowedOrigin)
    → Morgan logger (dev mode)
    → express.json() body parser
    → express.urlencoded() body parser
    → Cookie parser
    → Static files (public/)
    → apiRouter (mounted at "/")
    → 404 handler
    → Global error handler
```

**Why this order matters:**

- CORS must come first so preflight `OPTIONS` requests are handled before auth checks.
- Body parsers must precede route handlers to populate `req.body`.
- The global error handler is last because Express error middleware is identified by its 4-argument signature `(err, req, res, next)`.

**Schema registration (`require('./schemas')` in `app.js`):**
All Mongoose models are registered at startup. This ensures Mongoose doesn't throw "Schema not registered" errors if a model is referenced via `.populate()` before the file that defines it is explicitly `require`d in a given code path.

---

## 2. Versioned Routing

```
/ (apiRouter)
└── /api/v1 (v1Router)
    ├── /users        → usersRouter
    ├── /resources    → resourcesRouter
    ├── /assessments  → assessments.routes.js
    ├── /admin        → adminRouter
    └── /analytics    → analyticsRouter (inline, authenticated)
         ├── GET  /dashboard   → analytics.getDashboardStats
         ├── GET  /performance → analytics.getPerformanceTrends
         ├── GET  /topics      → analytics.getTopicMastery
         ├── GET  /notes       → notes.getNotesHistory
         └── POST /notes/generate → notes.generateNotes
```

**Why version prefixing (`/api/v1`)?**

- Non-breaking changes: A future v2 router can be introduced without touching v1 clients.
- Clear contract: Every client knows exactly which API version it is talking to.
- The root `/` endpoint returns a health-check JSON, useful for uptime monitors.

A custom `getRouter()` utility wraps `express.Router()` with `{ mergeParams: true }` to ensure nested routes correctly inherit URL params from parent routers.

---

## 3. Authentication & Authorization Middleware

**File:** `api/middlewares/auth.js`

Three guards are exported:

| Middleware        | Role Check                   | Used For                              |
| ----------------- | ---------------------------- | ------------------------------------- |
| `isAuthenticated` | Any valid token              | Student analytics, notes, assessments |
| `isAdmin`         | Token + `role === 'ADMIN'`   | Admin CRUD routes                     |
| `isStudent`       | Token + `role === 'STUDENT'` | (Available, not widely applied yet)   |

**Flow inside each guard:**

1. `extractToken(req)` — reads the `Authorization: Bearer <token>` header.
2. `verifyToken(token)` — validates the JWT using the secret from `config`, returns the decoded payload (contains `userId`, `role`) or `null` if expired/invalid.
3. On success → attaches `decoded` to `req.user` and calls `next()`.
4. On failure → calls `sendError(res, STATUS.UNAUTHORIZED, ...)` to short-circuit the request immediately.

**Why `asyncHandler`?**
All middleware and controller functions are wrapped in `asyncHandler`, a higher-order function that wraps the async function in a `try/catch` and calls `next(error)` on failure. This ensures every unhandled promise rejection is forwarded to the global Express error handler instead of causing an unhandled rejection crash.

**Why stateless JWT instead of sessions?**

- No server-side session storage needed, scales horizontally.
- JWT claims (`userId`, `role`) are self-contained: no DB lookup needed on every request just to authenticate.

---

## 4. MongoDB Schemas — Data Model

**File:** `api/schemas/`

### 4.1 Academic Hierarchy (Read-heavy, mostly static)

```
Branch (e.g., Computer Engineering)
  └── Subject (e.g., Data Structures)
        └── Unit (e.g., Unit 1: Arrays)
              └── Topic (e.g., "Sorting Algorithms")
```

- **Branch.js**: `name`, `code`. Simple.
- **Subject.js**: `name`, `branchId` (ref). Subject belongs to a Branch.
- **Unit.js**: `name`, `unitNumber`, `subjectId` (ref). Unit belongs to a Subject.
- **Topic.js**: `name`, `weight` (int), `unitId` (ref). Weight is used by the LLM to determine how many questions to generate per topic (more weight = more questions).

**Design decision:** The hierarchy is separate from the attempt/progress tracking layer. Academic data is managed by Admins, Progress data is owned by students. This separation of concerns prevents schema bloat.

### 4.2 User

```js
{
  name, email, password (bcrypt hashed, select:false),
  role: ENUM['STUDENT', 'ADMIN'],
  // Student-only fields:
  branchId (ref: Branch), year (1-4), semester (1-8)
}
```

**Key design decisions:**

- `select: false` on `password`: The password hash is NEVER returned in a query unless explicitly `.select('+password')` is called. This prevents accidental exposure.
- `pre('save')` hook for bcrypt hashing: Password is hashed automatically on every save where `isModified('password')` is true. The `isModified` check prevents re-hashing an already-hashed password.
- `pre('validate')` hook: Ensures that if `role === STUDENT`, then `branchId`, `year`, and `semester` are all present. Business logic enforcement at the schema level.

### 4.3 Question (AI-Generated MCQs)

```js
{
  unitId (ref: Unit), topicId (ref: Topic),
  questionText, options: [{key: 'A'|'B'|'C'|'D', text}],
  correctOption: 'A'|'B'|'C'|'D',
  difficulty: EASY|MEDIUM|HARD,
  source: AI|MANUAL,
  generatedFor: DIAGNOSTIC|ADAPTIVE,
  isActive: Boolean
}
```

**Indexes:**

- `{ unitId: 1, topicId: 1 }` — Compound index for fetching questions by unit AND topic. Used heavily by the Question Pool.
- `{ difficulty: 1 }` — For potential future difficulty-based filtering.

### 4.4 QuizAttempt (The Core Progress Document)

This is the most write-heavy document in the system.

```js
{
  userId (ref: User, indexed),
  unitAttemptId (ref: UnitAttempt, indexed),
  quizId (ref: Quiz),
  quizType: DIAGNOSTIC|ADAPTIVE,
  status: IN_PROGRESS|SUBMITTED|COMPLETED,
  answers: [{questionId, selectedOption, isCorrect}],
  score, totalQuestions, percentage,
  startedAt, completedAt, timeSpent (seconds),
  aiAnalysis (String, nullable),
  analysisAttempts (Number, default 0, max 2),
  analysisLog: [{date, version, analysisText}]
}
```

**Indexes:**

- `{ userId: 1, quizId: 1 }` — To quickly check if a student already has an attempt for a given quiz (prevents duplicates).
- Individual indexes on `userId` and `unitAttemptId` — For fast lookup by user and by parent unit attempt.

**Design decision — `analysisLog` as an array:**
Instead of storing only the latest analysis, we keep an append-only log of every analysis version. This lets students compare feedback over time and allows us to roll back to a previous analysis if needed.

### 4.5 UnitAttempt (Learning State Machine)

One document per (user, unit) pair.

```js
{
  userId (ref: User), unitId (ref: Unit),
  state: NOT_STARTED | DIAGNOSTIC_COMPLETED | IN_PROGRESS | MASTERED,
  diagnosticQuizId, diagnosticScore,
  topicAnalysis: { weak: [TopicId], moderate: [TopicId], strong: [TopicId] },
  adaptiveQuizCount, masteryAchieved, masteredAt
}
// Unique index: { userId: 1, unitId: 1 }
```

**The state machine:**

```
NOT_STARTED
    ↓ (First quiz started)
[DIAGNOSTIC quiz taken]
    ↓ (Diagnostic submitted)
DIAGNOSTIC_COMPLETED
    ↓ (Any subsequent quiz started)
IN_PROGRESS
    ↓ (Score ≥ mastery threshold)
MASTERED
```

**Why a state machine?** The type of quiz shown to a student (DIAGNOSTIC vs ADAPTIVE) is determined by the current state. The state is a single source of truth for the learning progression. This avoids complex conditional logic scattered across the codebase.

### 4.6 AnalysisCache (LLM Cost Optimization)

```js
{
  attemptId (ref: QuizAttempt, indexed),
  analysisVersion (1 or 2),
  unitId (ref: Unit),
  analysisText (String),
  generatedAt (Date),
  expiresAt (Date, TTL = 30 days)
}
// Unique compound index: { attemptId: 1, analysisVersion: 1 }
// TTL index: { expiresAt: 1 }
```

**Design decisions:**

- **Append-only / immutable:** Once a (attemptId, version) pair is cached, it is never overwritten. This is enforced by the unique compound index.
- **TTL auto-delete:** MongoDB's TTL index automatically deletes expired documents without any cron job. The `expiresAt` field is set 30 days in the future at creation time.
- **Per-version isolation:** Version 1 and Version 2 of the analysis are stored as separate documents. Fetching v2 does not destroy the v1 cache.

### 4.7 StudyNote

```js
{
  userId (ref: User), attemptId (ref: QuizAttempt),
  quizId, unitId, subjectId,
  topics: [String],
  summary: String, keyPoints: [String], detailedContent: String,
  version: Number (1 or 2)
}
```

Note generation is capped at **2 per attempt** (checked via `countDocuments({ userId, attemptId })`).

---

## 5. Controllers

### 5.1 Assessments Controller (`assessmentsController.js`)

This is the most complex controller. It manages the full lifecycle of an assessment.

#### `startAssessment` (POST `/assessments/:unitId/start`)

```
1. Find or create UnitAttempt for (userId, unitId)
2. Determine quiz type: DIAGNOSTIC (first time) or ADAPTIVE (subsequent)
3. Check for active incomplete attempt → RESUME if found (avoid duplicate quizzes)
4. Fetch unit + topics context
5. Get questions from Question Pool (LLM-backed cache)
6. Create Quiz document (maps questions to this quiz session)
7. Create QuizAttempt document (tracks student's answers)
8. Update UnitAttempt state
9. Return sanitized questions (no correctOption exposed)
```

**Critical security detail:** The `correctOption` field is STRIPPED from the response in step 9. Students only receive `questionText` and `options`. The correct answer is only exposed at result time.

**Resume logic:** If a `findActiveAttempt()` (status = IN_PROGRESS) exists for this student+unit, the existing questions are served back. The `resumed: true` flag tells the frontend to restore timer state from `timeSpent`. This prevents a student from gaining a fresh attempt by refreshing the page.

#### `submitAssessment` (POST `/assessments/:attemptId/submit`)

```
1. Validate attempt ownership and status (must be IN_PROGRESS)
2. evaluateAndSubmit() → compare each answer to correctOption in DB
3. Compute score, percentage
4. handleQuizCompletion() → update UnitAttempt state, check mastery
5. Return result including weakTopics
```

#### `reanalyzeAssessment` (POST `/assessments/:attemptId/analyze`)

The most intricate endpoint due to the need for **race-safe limit enforcement**.

```
1. ATOMIC check + increment via findOneAndUpdate with { analysisAttempts: { $lt: 2 } }
   → Only one concurrent request can pass this check
   → Returns the document BEFORE increment (new: false)
2. If atomic check fails → 429 (limit reached)
3. Fetch full attempt with populated questions + topics
4. Reconstruct weakTopics list
5. Check AnalysisCache for (attemptId, nextVersion)
   → CACHE HIT: serve from cache (0 LLM calls)
   → CACHE MISS: call LLM → store in cache → serve result
6. Append new analysis to analysisLog
7. On any error → ROLLBACK: $inc: { analysisAttempts: -1 }
```

**Why atomic findOneAndUpdate for the limit check?**
Without this, two concurrent requests could both read `analysisAttempts = 1`, both pass the `< 2` check, and both increment to 2 — resulting in 2 extra LLM calls and data inconsistency. The atomic operation makes the check-and-increment indivisible at the database level.

#### `updateTimeSpent` (PATCH `/assessments/:attemptId/time`)

A lightweight endpoint called by the frontend **every 30 seconds** and on `beforeunload`. It only updates the `timeSpent` field. No scoring logic runs here. It only succeeds if status = `IN_PROGRESS`.

### 5.2 Analytics Controller (`student.analytics.controller.js`)

Uses MongoDB **aggregation pipelines** for all three stats endpoints, avoiding in-memory JS computation of large datasets.

#### `getDashboardStats`

- **Single aggregation:** Groups all `SUBMITTED` attempts by date, computing `count`, `avgScore`, and `totalTime` per day.
- **Streak calculation:** Done in JS after the aggregation (because it's sequential date logic). Checks if the most recent activity was today or yesterday, then walks backwards through sorted dates.
- Returns: `currentStreak`, `totalHoursStudy`, `averageScore`, `totalAssessments`, `activityHeatmap` (object keyed by date string).

#### `getPerformanceTrends`

- **Multi-collection aggregation:** `$lookup` on `quizzes`, then `$lookup` on `units` to get the unit name for each attempt.
- Filtered by `completedAt $gte dateLimit` (7d / 30d / 90d configurable via `?range` query param).

#### `getTopicMastery`

- The most complex aggregation: `$unwind` on the `answers` array, then two `$lookup` stages (questions → topics), then `$group` to get `totalQuestions` and `correctAnswers` per topic, then `$project` to compute `mastery` percentage.
- Results are sorted by mastery ascending (weakest topics first) and limited to 10.
- This entire multi-collection join happens in MongoDB — no data is pulled across the wire just to compute it in Node.

### 5.3 Notes Controller (`student.notes.controller.js`)

- **Limit enforcement:** `countDocuments({ userId, attemptId })` before generation. Simple and effective.
- **Context enrichment:** The attempt is deeply populated (answers → questions → topics, quizId → unitId → subjectId) to build a rich LLM context.
- **Mistake extraction:** Each incorrect answer is formatted as `{question, userAnswer, topic}` and sent to the LLM as context. This makes the generated notes hyper-relevant to the student's actual mistakes, not just generic topic summaries.
- **Topic limiting:** Maximum 5 topics and 5 mistakes are sent to the LLM to avoid exceeding token limits and to keep responses focused.

---

## 6. LLM Service Layer

### 6.1 LLMFactory (Singleton + Factory Pattern)

**File:** `api/services/llm/LLMFactory.js`

```js
class LLMFactory {
  getProvider() {
    if (this.provider) return this.provider; // Singleton: reuse instance
    // Read config.llm.provider ('CHATGPT' | 'GEMINI')
    // Instantiate the correct provider class
    return this.provider;
  }
}
module.exports = new LLMFactory(); // Exported as singleton
```

**Why Singleton?**

- Provider classes hold client instances (OpenAI SDK, Google Generative AI SDK) which are expensive to initialize.
- A new instance per request would mean re-reading config, re-initializing SDK clients, and potentially re-establishing connections on every API call.
- The factory is instantiated once when the module is first `require`d and reused for the lifetime of the process.

**Why a Factory pattern?**

- Decouples the calling code from the specific LLM implementation.
- Switching between GPT-4 and Gemini requires only a single `.env` change (`LLM_PROVIDER=GEMINI`), with zero code changes to any controller.

### 6.2 LLMProvider (Abstract Base Class)

**File:** `api/services/llm/LLMProvider.js`

Defines the interface (contract) that all providers must implement:

- `generateQuestions(input)` — MCQ generation
- `analyzeQuizAttempt(input)` — Performance analysis
- `generateStudyNotes(input)` — Targeted study notes

The constructor throws if instantiated directly (`new.target === LLMProvider`), enforcing the abstract class pattern in JavaScript.

Also defines `validateQuestions()` — a schema validator for LLM output that ensures every generated question has the required fields, correct structure, and valid `topicId`. This guards against malformed LLM responses that might corrupt the database.

### 6.3 Providers

- **ChatGPTProvider** (`providers/ChatGPTProvider.js`): Implements the base class using the OpenAI API.
- **GeminiProvider** (`providers/GeminiProvider.js`): Implements the base class using Google Generative AI API.

Both providers implement the same interface methods, making them interchangeable.

---

## 7. Optimization Strategies

### 7.1 Question Pool (Strategy #1 — Reduce LLM Calls 60-80%)

**File:** `api/models/questionPool.model.js`

**Problem:** Without this, every new assessment for every student on every unit would call the LLM to generate 10 fresh questions. 20 students taking the same unit = 20 LLM calls.

**Solution:**

```
[questionPoolModel.getOrGenerate({ unitId, quizType, count: 10 })]
    → Check DB: Are there ≥ 10 active questions for this unit + quizType?
    → YES (Pool HIT): Return random subset from DB. 0 LLM calls.
    → NO (Pool MISS): Call LLM to generate questions → save to Question collection → return them.
```

The Question documents persist in the DB indefinitely. Once questions are generated for a unit, subsequent students reuse them. The `isActive` flag allows questions to be soft-deleted without breaking referential integrity.

### 7.2 Analysis Cache (Strategy #2 — Reduce Repeat Analysis LLM Calls)

**File:** `api/schemas/AnalysisCache.js`

**Problem:** A student might view their assessment result multiple times. Without caching, each "Analyze" button click would trigger an expensive LLM call.

**Solution:**

- Before calling the LLM to analyze, check the `AnalysisCache` collection for `{ attemptId, analysisVersion, expiresAt: { $gte: now } }`.
- **Cache HIT:** Return `cached.analysisText`. 0 LLM calls.
- **Cache MISS:** Generate via LLM → store in AnalysisCache → return result.
- TTL: 30 days (auto-deleted by MongoDB TTL index).

### 7.3 Race-Safe Limit Enforcement (Atomic $inc)

**Problem:** Without atomic operations, two simultaneous POST `/analyze` requests could both read `analysisAttempts = 1`, both pass the `< 2` check, and both increment — resulting in 3 analyses when the limit is 2.

**Solution:** A single `findOneAndUpdate` with the condition AND the increment in one atomic database operation:

```js
db.quizAttempts.findOneAndUpdate(
  { _id: attemptId, userId, analysisAttempts: { $lt: 2 } },
  { $inc: { analysisAttempts: 1 } },
  { new: false },
);
```

If `analysisAttempts` is already 2, the query's filter won't match any document and returns `null`, failing gracefully.

### 7.4 Timer Auto-Save (Durability)

**Problem:** Users close tabs, navigate away, or lose internet during assessments. Timer progress is lost, creating a bad resume experience.

**Solution:** The frontend calls `PATCH /assessments/:attemptId/time` every **30 seconds** and also on `window.beforeunload`. The backend updates only the `timeSpent` field. On resume, this value is returned in `startAssessment` and the frontend re-initializes its local timer from it.

### 7.5 MongoDB Aggregation over Application-Layer Processing

All analytics computations (streak, topic mastery, performance trends) are done via Mongoose aggregation pipelines running inside MongoDB. The alternative — fetching all documents and computing in Node.js JS — would be orders of magnitude slower for large datasets and waste memory.

### 7.6 Debounced Search (Admin Student List)

The admin student search uses server-side pagination + filtering. The frontend debounces the search input (300ms) so the API is not called on every keystroke, reducing unnecessary DB queries.

---

## 8. Config & Environment

**File:** `api/config/config.js`

Centralizes all config (DB URI, JWT secret, LLM provider, LLM API keys) from `process.env`. Provides sensible defaults. All controllers and services read config from this single source — no scattered `process.env` reads in business logic.

**File:** `api/config/generalConfig.js`

Contains non-secret application constants (e.g., mastery thresholds: `MASTERY_THRESHOLD = 80`).

---

## 9. Error Handling Architecture

Every controller is wrapped in `asyncHandler`. Errors are thrown as `AppError` instances:

```js
throw new AppError("Unit not found", STATUS.NOT_FOUND);
```

`AppError` is a custom class extending `Error` that bundles a `statusCode`. The global error handler in `app.js` catches these and sends a consistent response:

```json
{ "status": false, "error": { "message": "...", "status": 404 } }
```

This ensures every error, whether from business logic or an unhandled DB operation failure, is handled uniformly without crashing the server.
