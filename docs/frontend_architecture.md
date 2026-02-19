# 🎨 Frontend System Design — College PrepWise AI

> **Stack:** React (Vite) + Redux Toolkit + TanStack Query v5 + Axios + Tailwind CSS + Lucide React

---

## 1. Project Bootstrap & Configuration

**Tool:** Vite (not CRA).
**Why Vite?**

- Lightning-fast HMR (Hot Module Replacement) using native ES Modules — no bundling needed during development.
- Much faster cold starts than webpack/CRA, especially as the project grows.
- Production builds use Rollup under the hood for optimized output.

**Entry Point:** `main.jsx`

```jsx
<BrowserRouter>
  <Provider store={store}>
    {" "}
    // Redux global state
    <QueryClientProvider client={queryClient}>
      {" "}
      // TanStack Query cache
      <App />
    </QueryClientProvider>
  </Provider>
</BrowserRouter>
```

**Order of providers matters:**

- `BrowserRouter` wraps everything because `ProtectedRoute` uses `useNavigate` (a React Router hook).
- `Provider` (Redux) wraps the app so all components can access global state (auth, resources, etc.).
- `QueryClientProvider` wraps at the root level so the query cache is shared across all pages and persists between route navigations.

---

## 2. Routing Architecture

**File:** `client/src/App.jsx`

The routing is organized into distinct segments based on access level:

```
/                   → Public (MainLayout)
/about, /contact    → Public (MainLayout)
/auth/login         → PublicRoute guard → AuthLayout
/auth/register      → PublicRoute guard → AuthLayout
/admin/login        → Standalone (no layout wrapper — avoids sidebar flash)

/student/*          → ProtectedRoute [STUDENT] → StudentLayout
  /student/stats    → StudentDashboard
  /student/profile  → StudentProfilePage
  /syllabus/subjects → SubjectSelectionPage
  /syllabus/subjects/:subjectId → UnitSelectionPage
  /assessment/attempt → AssessmentAttemptPage
  /assessment/results → AssessmentResultsPage (history list)
  /assessment/results/:attemptId → AssessmentResultDetailPage

/admin/*            → ProtectedRoute [ADMIN] → AdminLayout
  /admin            → AdminDashboard
  /admin/students   → StudentListView
  /admin/students/:id → StudentDetailView
  /admin/academics  → AcademicManagementView
  /admin/academics/subjects/:subjectId → SubjectCurriculumView
```

### 2.1 Route Guards

**`ProtectedRoute`:** Reads `isAuthenticated` and `role` from the Redux `authSlice`. If not authenticated, redirects to `/auth/login`. If authenticated but wrong role (e.g., a student accessing `/admin`), redirects to a safe page.

**`PublicRoute`:** If user IS authenticated and tries to visit `/auth/login`, they are redirected to their appropriate dashboard (student or admin). Prevents logged-in users from seeing the login page.

**Why this approach?**

- Role-based routing is enforced on the client side as a UX improvement (instant redirect, no flash).
- The real authorization is enforced on the backend via the `isAdmin` / `isAuthenticated` middleware. The frontend guard is defense-in-depth for UX, not security.

### 2.2 Layout System

Each Layout is an Outlet-based wrapper that provides the shell (sidebar, navbar) around the page content.

| Layout          | Contains                          | Used For          |
| --------------- | --------------------------------- | ----------------- |
| `MainLayout`    | Basic header/footer               | Public pages      |
| `AuthLayout`    | Centered card                     | Login/Register    |
| `StudentLayout` | Sidebar + Student Navbar          | All student pages |
| `AdminLayout`   | Sidebar (fixed) + DashboardNavbar | All admin pages   |

**`AdminLayout` and the z-index stacking context:**
The main content area in AdminLayout has `z-10 relative` and `md:ml-64` to sit beside the sidebar. The `z-10 + relative` combination creates a CSS stacking context. Any absolutely or fixed positioned elements rendered _inside_ this area would be capped at `z-10`, which is below the sidebar's `z-50`.

**Solution — React Portals:**
The "View as Student" modal in `StudentDetailView.jsx` (an admin module) renders a full-screen overlay. To escape this stacking context, it uses `createPortal(..., document.body)`. This teleports the modal's DOM node to `document.body`, bypassing all parent stacking contexts and letting the `z-[100]` class take full effect.

---

## 3. HTTP Client — Axios Instance

**File:** `client/src/utils/instance.js`

A single, pre-configured Axios instance is created and exported:

```js
const instance = axios.create({
  baseURL: clientConfig.API_URL, // From env (e.g., http://localhost:3000/api/v1)
  timeout: 10000, // 10s default
  headers: { "Content-Type": "application/json" },
});
```

### Request Interceptor — Token Injection

Every outgoing request automatically reads the JWT from `localStorage` and attaches it as `Authorization: Bearer <token>`. No service file or component needs to manually add the token. This is centralized, DRY, and impossible to forget.

### Response Interceptor — Unwrapping & Error Handling

**On success:** Returns `response.data` directly. Since the backend wraps all responses in `{ success, message, data }`, the interceptor unwraps this so service functions only deal with the `data` object.

**On error:**

1. Reads the error response from the server.
2. Shows a toast notification (via `messageUtil.error()`).
3. If `statusCode === 401` (Unauthorized/token expired): clears `localStorage` and redirects to `/login`. This handles token expiry automatically across the entire app.
4. Rejects the promise so individual callers can still handle errors with `.catch()` or TanStack Query's `onError`.

**Why a single instance?**

- All API calls are made through this one instance, meaning every request benefits from the interceptors.
- No need to pass the token to every function. No risk of some components forgetting to attach auth headers.

**LLM endpoint special case:**
For `startAssessment`, the timeout is overridden to `60000` (60 seconds) at the call site, because LLM question generation can take up to 30-40 seconds. The default 10s would cause timeouts.

---

## 4. State Management — Redux Toolkit

**File:** `client/src/redux/store.js`

### Redux is used for truly GLOBAL state:

| Slice           | State                                               | Why Redux?                                             |
| --------------- | --------------------------------------------------- | ------------------------------------------------------ |
| `authSlice`     | `user`, `token`, `role`, `isAuthenticated`          | Needed by route guards, navbar, API client, everywhere |
| `resourceSlice` | Curriculum data (branches, subjects, units, topics) | Shared between admin views and student views           |
| `appSlice`      | Minimal UI state                                    | Simple global flags                                    |

### auth Slice Design

The initial state is hydrated from `localStorage` at startup:

```js
const initialState = {
  user: JSON.parse(localStorage.getItem("user")) || null,
  token: localStorage.getItem("token") || null,
  isAuthenticated: !!localStorage.getItem("token"),
  role: JSON.parse(localStorage.getItem("user"))?.role || null,
};
```

**Why hydrate from localStorage?**

- If the user refreshes the page, React re-mounts and Redux state resets to initial.
- Without localStorage hydration, every refresh would log the user out.
- `localStorage` is the persistent store; Redux is just the reactive in-memory mirror.

**Actions:**

- `setCredentials({ user, token })` — Called after login. Saves to state AND `localStorage`.
- `updateCurrentUser(user)` — For profile updates without re-logging in.
- `logout()` — Clears state, `localStorage`, AND `sessionStorage` (which stores assessment state).

**Why NOT put server data in Redux?**
Server data (assessment results, student lists, analytics) is managed by TanStack Query, not Redux. Redux is only for auth state and small global UI flags. Putting server data in Redux would require manual cache invalidation, loading state management, and error state — all of which TanStack Query handles automatically.

---

## 5. Data Fetching — TanStack Query v5

TanStack Query is used for all async server data. Here is why it is better than plain `useEffect + fetch`:

| Feature                    | useEffect + fetch    | TanStack Query                     |
| -------------------------- | -------------------- | ---------------------------------- |
| Caching                    | ❌ No                | ✅ In-memory cache by key          |
| Refetching on window focus | ❌ Manual            | ✅ Automatic                       |
| Loading / error state      | ❌ Manual `useState` | ✅ Built-in `isPending`, `isError` |
| Deduplication              | ❌ No                | ✅ Same key = same request         |
| Retries                    | ❌ Manual            | ✅ Automatic with backoff          |
| Mutations                  | ❌ Manual            | ✅ `useMutation` with callbacks    |

### Query Key Convention

Query keys are arrays that describe the data. Examples:

- `['analytics', 'dashboard']` — Student dashboard stats
- `['analytics', 'performance', range]` — Performance trends (parameterized by time range)
- `['analytics', 'topics']` — Topic mastery list
- `['assessment', attemptId, 'result']` — Specific attempt result

When data changes (e.g., a new assessment is submitted), `queryClient.invalidateQueries({ queryKey: ['analytics'] })` is called. This marks all queries with 'analytics' in their key as stale, triggering automatic refetch on next render.

### staleTime & cacheTime

- Relatively static data (like subject curriculum) is given a longer `staleTime` to avoid unnecessary refetches on every navigation.
- Dynamic data (assessments, analytics) uses the default staleTime of 0 so it refetches on focus.

---

## 6. Student-Side Feature Flows

### 6.1 Assessment Attempt Flow

The most complex user flow in the app.

**Page:** `AssessmentAttemptPage.jsx`

```
[SUnitSelectionPage] → user clicks "Start/Resume Assessment"
    → POST /assessments/:unitId/start (60s timeout)
    → Response: { attemptId, quizType, questions, totalQuestions, timeSpent, resumed }
    → State stored in sessionStorage (attemptId, questions) to survive page refresh

[AssessmentAttemptPage renders]
    → Timer starts from timeSpent (resume) or 0 (new)
    → User navigates through questions, selects options (local state)
    → Every 30s: PATCH /assessments/:attemptId/time (auto-save timer)
    → On beforeunload: PATCH /assessments/:attemptId/time (save on close)

[User submits]
    → POST /assessments/:attemptId/submit { answers, timeSpent }
    → Response: { score, percentage, masteryAchieved, weakTopics, state }
    → Navigate to /assessment/results with result in location.state
```

**Why `sessionStorage` for assessment state?**

- Survives page refresh within a tab but is cleared when the tab closes.
- Prevents the in-progress attempt ID from being lost on accidental refresh.
- `logout()` explicitly calls `sessionStorage.clear()` to clean up.

**Why `useBeforeUnload` for the timer?**

- The timer auto-saves every 30s but could miss the last few seconds.
- `beforeunload` fires synchronously when the user closes the tab or navigates away.
- We synchronously call the PATCH endpoint here to maximize data saved.

### 6.2 Student Dashboard Analytics

**Page:** `StudentDashboardView.jsx`

Three separate `useQuery` calls, each fetching one analytics endpoint:

1. `getDashboardStats()` → Stats cards (streak, hours, avg score, total assessments) + Heatmap
2. `getPerformanceTrends(range)` → Line chart (score over time). `range` is local state ('7d'/'30d'/'90d'), changes trigger automatic refetch.
3. `getTopicMastery()` → Bar chart (weak → strong topics)

**Why separate queries and not one big endpoint?**

- Independent loading states: The streak card loads instantly from the cheap aggregation while the topic mastery computation (multi-collection join) loads separately.
- Independent caching: Each can be stale/fresh independently.
- Independent refetching: When the user changes the time range, only the performance trend query refetches; the streak stat does not.

### 6.3 AI Study Notes — "Boost Vault"

**Page:** `StudentDashboardView.jsx` (notes section)

```
[User is on Assessment Result page, sees weak topics]
→ Clicks "Generate Boost Notes"
→ POST /analytics/notes/generate { attemptId }
→ Backend: analyze wrong answers → identify weak topics → call LLM with context
→ Returns: { summary, keyPoints, detailedContent }
→ Frontend: stores in React state, renders in a styled modal

[Viewing previous notes]
→ GET /analytics/notes (fetches all past notes)
→ Renders as a history list ("Boost Vault")
```

**Limit UI:** The "Generate Notes" button is disabled if `existingNotesForAttempt >= 2`. The count is checked client-side from the fetched notes history, with the server enforcing the real limit.

**Markdown parsing:**
The `detailedContent` field from the LLM comes back as markdown-formatted text. A custom parser splits the content by section headers (`##`) and renders each section as a separate card with `<h2>`, `<p>`, and `<ul>` elements. The parser is robust to handle slight variations in LLM output formatting (e.g., extra newlines, inconsistent heading levels).

---

## 7. Admin Panel Architecture

### 7.1 Admin Dashboard (`AdminDashboardView.jsx`)

Displays platform-wide stats (total students, subjects, assessments, average scores) and a recent activity feed. Uses TanStack Query to fetch from the admin controller endpoints.

### 7.2 Student List (`StudentListView.jsx`)

**Optimizations:**

- **Server-side pagination:** Does not fetch all students at once. Uses `?page=N&limit=10` query params.
- **Server-side search & filter:** Search by name/email, filter by branch and year.
- **Debounced search:** The search `<input>` uses a `useDebounce(value, 300)` custom hook. The search term only triggers an API call 300ms after the user stops typing. Without this, every keystroke (e.g., "sojwal" = 6 keystrokes = 6 API calls) would fire a new request.
- **Consolidated filter state:** All filters (`search`, `branch`, `year`) live in a single `useState` object. A single state update triggers a single re-render and one API call.

```js
const [filters, setFilters] = useState({ search: "", branchId: "", year: "" });
```

### 7.3 Student Detail View (`StudentDetailView.jsx`)

Shows a student's profile, academic info, and assessment history. Contains the **"View as Student"** button that opens a full-screen modal rendering `StudentDashboardView` with the student's data context.

**Modal implementation — React Portal:**

```jsx
{
  isViewAsStudentOpen &&
    createPortal(
      <div className="fixed inset-0 z-[100] bg-slate-50 flex flex-col">
        {/* Full StudentDashboardView embedded here */}
      </div>,
      document.body, // Teleports to document root
    );
}
```

**Why Portal?** The admin layout's content area has `z-10 relative`, which creates a CSS stacking context. Any fixed/absolute element inside it can't exceed `z-10`. By rendering into `document.body`, the portal bypasses all parent stacking contexts and the `z-[100]` class works as expected, covering the sidebar.

**Note on scroll lock:** When the modal is open, `document.body.style.overflow = 'hidden'` is set in a `useEffect` to prevent the background page from scrolling. It's cleaned up in the effect's return function when the modal closes.

### 7.4 Academic Management (`AcademicManagementView.jsx`)

Admin CRUD for Branches, Subjects, and their nested Units/Topics.

- Create / Edit / Delete operations use `useMutation` with `onSuccess` callbacks that call `queryClient.invalidateQueries(...)` to refresh the list immediately after a mutation.
- Optimistic updates are not used here (server is source of truth for IDs after creation).

---

## 8. Frontend Optimization Summary

| Optimization                        | Where                 | Why                                                        |
| ----------------------------------- | --------------------- | ---------------------------------------------------------- |
| TanStack Query caching              | All data fetching     | Prevents redundant API calls on re-navigation              |
| Debounced search                    | StudentListView       | Reduces API calls on every keystroke to one per 300ms idle |
| Consolidated filter state           | StudentListView       | Single re-render / API call per filter change              |
| React Portal for modals             | StudentDetailView     | Escapes CSS stacking context to fix z-index issues         |
| sessionStorage for assessment       | AssessmentAttemptPage | Survives page refresh without losing in-progress attempt   |
| 60s Axios timeout override          | assessmentService     | Prevents premature LLM timeout on question generation      |
| Independent analytics queries       | StudentDashboardView  | Independent loading/caching per stat section               |
| `isAuthenticated` from localStorage | authSlice             | User stays logged in after page refresh                    |
| Query param time range              | Performance trends    | Only the affected chart refetches on range change          |
| Scroll lock on modal                | StudentDetailView     | Prevents background scroll during full-screen modal        |
| `ScrollToTop` component             | App.jsx               | Resets scroll position on every route change               |

---

## 9. Service Layer

**Files:** `client/src/services/`

Each service file corresponds to a backend feature domain:

| Service                | Methods                                                                                                            |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `authService.js`       | `login()`, `register()`, `getProfile()`                                                                            |
| `assessmentService.js` | `startAssessment()`, `submitAssessment()`, `getHistory()`, `updateTimeSpent()`, `getResult()`, `reanalyzeResult()` |
| `studentService.js`    | `getDashboardStats()`, `getPerformanceTrends()`, `getTopicMastery()`, `getNotes()`, `generateNotes()`              |
| `adminService.js`      | `getStudents()`, `getStudentDetail()`, `getAdminStats()`, CRUD for academic data                                   |
| `resourceService.js`   | `getSubjects()`, `getUnits()`, `getTopics()`                                                                       |

All service methods use the `instance` Axios client. They are thin wrappers — no business logic, just API calls and response unwrapping. This keeps components clean and makes services easy to mock in tests.

---

## 10. Component Hierarchy Overview

```
App.jsx (routing)
├── MainLayout → HomePage / AboutPage / ContactPage
├── AuthLayout → LoginPage / SignupPage
├── StudentLayout
│   ├── StudentDashboard (stats, charts, notes)
│   ├── SubjectSelectionPage (useQuery for subjects)
│   ├── UnitSelectionPage (useQuery for units + unit state)
│   ├── AssessmentAttemptPage (useMutation for start/submit, timer)
│   ├── AssessmentResultsPage (useQuery for history)
│   └── AssessmentResultDetailPage (useQuery for result + useMutation for analyze)
└── AdminLayout
    ├── AdminDashboard (useQuery for admin stats)
    ├── StudentListView (useQuery with pagination/filter params)
    ├── StudentDetailView (useQuery for student detail, Portal for modal)
    ├── AcademicManagementView (useMutation for CRUD)
    └── SubjectCurriculumView (units + topics CRUD)
```
