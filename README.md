# 🎓 College PrepWise AI

> **An AI-powered college exam preparation and placement readiness platform for engineering students.**

College PrepWise AI helps students systematically prepare for university exams and campus placements through adaptive assessments, AI-generated performance analysis, and personalized study notes. Admins get a comprehensive panel to manage students, academic structure, and monitor progress.

---

## ✨ Features

### 👩‍🎓 Student Side

- **Adaptive Assessment Engine** — Starts with a _Diagnostic_ quiz to gauge baseline knowledge, then switches to _Adaptive_ quizzes to target weak areas.
- **Resume Mid-Exam** — Unfinished assessments are automatically resumed from where you left off, with the timer preserved.
- **Performance Analytics Dashboard** — Live stats: streak, study hours, average score, and an activity heatmap. Trend charts with 7d / 30d / 90d filters.
- **Topic Mastery Breakdown** — Aggregated analysis of strong vs. weak topics across all attempts.
- **AI Performance Analysis** — Request AI-generated feedback on any assessment (max 2 retries per attempt, quota-safe).
- **Boost Vault (AI Study Notes)** — Generate targeted study notes based on your specific wrong answers. The AI receives context about your mistakes and writes focused, relevant notes (max 2 per attempt).

### 🛡️ Admin Side

- **Student Management** — Searchable, paginated student list with per-student detail view including their full assessment history.
- **"View as Student" Mode** — Preview any student's dashboard exactly as they see it, in a full-screen overlay.
- **Academic Management** — Full CRUD for Branches → Subjects → Units → Topics, the entire curriculum hierarchy.
- **Subject Curriculum View** — Manage units and topics within a specific subject.
- **Admin Dashboard** — Platform-wide stats and recent activity.

---

## 🛠️ Tech Stack

| Layer              | Technology                                                                    |
| ------------------ | ----------------------------------------------------------------------------- |
| **Frontend**       | React 18 + Vite, Redux Toolkit, TanStack Query v5, Tailwind CSS, Lucide Icons |
| **Backend**        | Node.js + Express.js                                                          |
| **Database**       | MongoDB + Mongoose                                                            |
| **Authentication** | JWT (JSON Web Tokens), bcrypt                                                 |
| **AI / LLM**       | OpenAI GPT-4 / Google Gemini (switchable via `.env`)                          |

---

## 🗂️ Project Structure

```
college-prepwise-ai/
├── api/                        # Node.js + Express Backend
│   ├── config/                 # DB connection, env config, general constants
│   ├── controllers/v1/         # Route handlers (users, admin, assessments, analytics, notes)
│   ├── middlewares/            # JWT auth guards (isAdmin, isAuthenticated, isStudent)
│   ├── models/                 # Mongoose model wrappers (with business logic methods)
│   ├── routes/                 # Versioned API routes (/api/v1/...)
│   ├── schemas/                # Mongoose schema definitions
│   ├── services/llm/           # LLM abstraction layer (Factory + Provider pattern)
│   ├── utils/                  # asyncHandler, AppError, token utils, response helpers
│   ├── seeds/                  # DB seed scripts
│   └── app.js                  # Express app setup
│
├── client/                     # React + Vite Frontend
│   ├── src/
│   │   ├── components/         # Reusable UI components (Sidebar, Navbar, guards)
│   │   ├── layouts/            # Page shell layouts (Admin, Student, Auth, Main)
│   │   ├── modules/admin/      # Admin-specific views (StudentDetail, AcademicMgmt, etc.)
│   │   ├── pages/              # Route-level pages (student, admin, auth, outer)
│   │   ├── redux/              # Redux store + slices (auth, resources, app)
│   │   ├── services/           # Axios service layer (one file per feature domain)
│   │   └── utils/              # Axios instance (interceptors), helpers
│   └── index.html
│
├── docs/                       # 📖 System Design Documentation
│   ├── backend_architecture.md
│   └── frontend_architecture.md
│
└── scripts/                    # Utility/test scripts
```

---

## ⚙️ Getting Started

### Prerequisites

- Node.js >= 18
- MongoDB (local or Atlas)
- OpenAI API Key **OR** Google Gemini API Key

### 1. Clone

```bash
git clone <repo-url>
cd college-prepwise-ai
```

### 2. Backend Setup

```bash
cd api
cp .env.example .env   # Fill in your values
npm install
npm run dev            # Starts at http://localhost:3000
```

**Required `.env` variables:**

```
MONGODB_URI=mongodb://...
JWT_SECRET=your_jwt_secret
LLM_PROVIDER=CHATGPT          # or GEMINI
OPENAI_API_KEY=sk-...         # if using ChatGPT
GEMINI_API_KEY=...            # if using Gemini
```

### 3. Frontend Setup

```bash
cd client
npm install
npm run dev            # Starts at http://localhost:5173
```

### 4. Seed the Database (optional)

```bash
cd api
node seeds/seedAll.js  # Seeds branches, subjects, units, topics
```

---

## 🧠 System Design

For a detailed explanation of the architecture, data flow, design decisions, and optimizations, see the docs folder:

| Document                                                       | Contents                                                                                                                                                                                                                                                                                 |
| -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [📄 backend_architecture.md](./docs/backend_architecture.md)   | Express middleware pipeline, versioned routing, JWT auth, all MongoDB schemas, assessment lifecycle, LLM service layer (factory pattern, dual provider), all optimization strategies (question pool cache, analysis cache, atomic operations, timer auto-save, aggregation pipelines)    |
| [📄 frontend_architecture.md](./docs/frontend_architecture.md) | Vite bootstrap, role-based routing with guards, Axios interceptors, Redux store design, TanStack Query caching strategy, assessment attempt flow (resume, timer, sessionStorage), analytics dashboard, AI Boost Vault, admin panel, React Portals for modals, all frontend optimizations |

---

## 🏗️ Key Design Decisions

### Backend

- **Stateless JWT Auth** — No server session storage. Each `Authorization: Bearer` token is self-contained (userId + role). Horizontal scaling is trivial.
- **LLM Factory Pattern** — Swap between OpenAI and Gemini by changing a single `.env` variable. Zero code changes in controllers.
- **Question Pool Cache** — AI-generated questions are cached in MongoDB. 20 students on the same unit = 1 LLM call, not 20. ~60-80% cost reduction.
- **Atomic Race-Safe Limit Enforcement** — `findOneAndUpdate` with `$lt: 2` filter ensures the re-analysis limit can never be bypassed by concurrent requests.
- **MongoDB Aggregation Pipelines** — All analytics (topic mastery, performance trends, streak) run as single multi-collection aggregations inside MongoDB — not in Node.js memory.

### Frontend

- **TanStack Query over Redux for server data** — Auto caching, background refetching, deduplication, and loading states with no boilerplate.
- **React Portal for Admin Modal** — The "View as Student" full-screen overlay uses `createPortal(…, document.body)` to escape the AdminLayout's CSS stacking context (`z-10 relative`), ensuring the modal renders above the sidebar.
- **Debounced Search** — Admin Student List uses a 300ms `useDebounce` hook, reducing API calls from one-per-keystroke to one-per-pause.
- **Session Storage for Assessment Continuity** — In-progress assessment ID and state survive page refresh within a tab, enabling seamless resume.

---

## 📝 License

This project is developed as part of a college preparation initiative. All rights reserved.
