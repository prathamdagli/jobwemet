# JobWeMet Backend (FastAPI)

A small, **flat** FastAPI backend for JobWeMet. It replaces the previous
Node.js Cloud Functions backend and talks **directly** to Firebase:

- **Authentication** — verifies the frontend's Firebase ID tokens
  (`firebase_admin.auth.verify_id_token`).
- **Firestore** — application data (users, resumes, analysis, …).
- **Cloud Storage** — resume blobs.

No Cloud Functions, no Node.js, no TypeScript backend.

## Production readiness

This backend is hardened for deployment (no functional changes to the API):

- **Standardized responses.** Successful responses are wrapped by
  `EnvelopeJSONResponse` (the default response class) as
  `{ success: true, data: <body> }`. The `GET /` health check is left plain.
- **Consistent errors.** Central exception handlers return
  `{ success: false, error: { code, message, details } }` for
  `RequestValidationError`, `HTTPException`, Firebase errors, and unhandled
  exceptions (including DB / storage failures and timeouts).
- **Central logging.** Every request is logged (method, path, status,
  elapsed ms, caller uid, request id) via `logging` — no `print()`.
- **Request IDs.** Each request gets an id (`X-Request-ID` header, also echoed
  in logs) for correlation.
- **Startup validation.** `config.validate_env()` fails fast with a helpful
  message on misconfiguration (bad AI provider, groq without a key, wildcard
  CORS with auth enabled).
- **Input validation.** Resume upload, profile/settings updates, and
  roadmap/analysis regeneration are validated via Pydantic models.

## Run it

```bash
python -m venv .venv
.venv\Scripts\python -m pip install -r backend/requirements.txt
cp backend/.env.example backend/.env   # fill in credentials / keys
.venv\Scripts\python -m uvicorn backend.main:app --reload
# or simply double-click start.bat (launches backend + frontend)
```

Then open <http://127.0.0.1:8000/docs> for the Swagger UI.

## Configuration

All settings come from a **`backend/.env`** file (see `backend/.env.example`).
`config.py` loads this file explicitly — by path, not by walking up from the
current directory — so configuration works whether you launch from the
project root (e.g. `start.bat`) or from inside `backend/`. Shell environment
variables (deployment platforms, the Firebase CLI) still override `.env`
values. **`backend/.env` is git-ignored — never commit it.**

Key values:

- `GOOGLE_APPLICATION_CREDENTIALS` — path to the service-account JSON
  (defaults to `backend/service-account.json`, which is also git-ignored).
- `FIREBASE_PROJECT_ID`, `FIREBASE_STORAGE_BUCKET`
- `ALLOWED_ORIGINS` — CORS allow-list, comma-separated (e.g.
  `http://localhost:5173`). Use `*` only for local dev.
- `REQUIRE_AUTH` / `DEMO_UID` — when auth is off, requests fall back to a demo
  user so Swagger and quick tests work without a token. Set `REQUIRE_AUTH=true`
  in production.
- `AI_PROVIDER`, `GROQ_API_KEY`, `GROQ_MODEL`

### Switching the AI provider

- **Stub (default, no key, no billing):** `AI_PROVIDER=stub`. The four
  generative stages return deterministic placeholder data so the whole
  pipeline runs end-to-end for development and demos.
- **Real Groq:** `AI_PROVIDER=groq` **and**
  `GROQ_API_KEY=<your key>`. The stub is then only used as an
  internal fallback if the key is missing. There is **no separate
  `build_course_list`** anymore — course recommendations are catalog-driven
  (see `courses.py`) and the dashboard summary is deterministic aggregation,
  by design.

### Replacing / rotating the Groq key

Edit `backend/.env` and change `GROQ_API_KEY=...`, then restart the
server. The key must be valid and have enough credits on Groq —
otherwise every call returns HTTP 429 (`ai_quota`). On a bad key the API
returns `401 ai_auth`; on a network/timeout failure `502/504`. These all map
to the standard `{ success:false, error:{code,message} }` envelope via the
`AIError` handler in `main.py`, so the backend never 500s on an AI failure.
The default model is `meta-llama/llama-4-scout-17b-16e-instruct`; set `GROQ_MODEL` if you need
a different one.

## Layout

```
backend/
  main.py      FastAPI app: metadata, CORS, Firebase init, router, Swagger auth
  api.py       ALL endpoints (single file, Swagger-documented)
  firebase.py  Admin SDK init + auth/firestore/storage clients
  database.py  Firestore read/write helpers (uid-scoped)
  models.py    Pydantic models (camelCase, 1:1 with Firestore docs)
  ai.py        AI provider abstraction (stub | groq)
  resume.py    Upload, validation, PDF/DOCX text extraction
  career.py    Skill analysis, career matching, skill gap, dashboard
  roadmap.py   Roadmap generation / regeneration
  courses.py   Course recommendation + provider abstraction
  config.py    Env config
  utils.py     id / time / filename helpers
  requirements.txt
  .env.example
  README.md
```

## API surface

All routes require a `Authorization: Bearer <Firebase ID token>` header
(except in local dev where auth is disabled). The Firebase Storage upload
trigger that used to live in Cloud Functions is now the `POST /upload-resume`
endpoint.

| Method | Path                  | Purpose                                  |
|--------|-----------------------|------------------------------------------|
| POST   | /upload-resume        | Upload + register a resume (multipart)   |
| POST   | /process-resume       | Extract text from an uploaded resume      |
| POST   | /analyze-resume       | Skills / matches / gap / dashboard        |
| POST   | /generate-roadmap     | Build the learning roadmap                |
| POST   | /recommend-courses    | Recommend courses for the gap             |
| POST   | /update-profile        | Update the user profile                   |
| POST   | /regenerate-analysis  | Re-run the resume analysis                |
| POST   | /regenerate-roadmap   | Re-generate the roadmap                  |
| GET    | /profile              | User profile                             |
| GET    | /dashboard            | Dashboard summary                         |
| GET    | /skills               | Skill analysis                           |
| GET    | /careers              | Career matches                           |
| GET    | /skill-gap            | Skill gap                                |
| GET    | /roadmap              | Roadmap                                  |
| GET    | /courses              | Course recommendations                    |
| GET    | /resumes              | List the user's resumes                  |
| GET    | /settings             | Account settings                         |
| PUT    | /settings             | Update settings                          |
| DELETE | /resume/{resumeId}   | Soft-delete a resume                     |

## Firestore collections (unchanged contract)

`users`, `resumes`, `resumeProcessing`, `skillAnalysis`, `careerMatches`,
`skillGap`, `roadmaps`, `courseRecommendations`, `dashboardSummary`.

Resumes are stored at `users/{uid}/resumes/{resumeId}.{ext}`.

## AI provider abstraction

No endpoint calls a model directly. Every request goes through `services.py`
(specifically the AIProvider), which exposes a provider interface (`AIProvider`) with a `stub` and a
`groq` implementation selected by `AI_PROVIDER`. Adding another
provider later means adding another provider class — nothing else changes.

When `AI_PROVIDER=groq`, the **four generative stages** of the
resume pipeline call the Groq API and parse the JSON
it returns:
`analyze_resume_text` (skill/experience/education extraction),
`build_career_matches`, `build_skill_gap`, and `build_roadmap`. Outputs are
normalized so a slightly-off model response can never crash a Pydantic model
(enum values are coerced to the allowed set; types are sanitized). Any
provider failure raises `AIError` (with an HTTP status + stable `code`) that
the global handler in `main.py` turns into a clean error envelope.

Course recommendations (`courses.py`) and the dashboard summary are **not**
AI-generated — they are catalog-driven and deterministic aggregations
respectively, by design.

## Firestore composite indexes

Only **one** composite index is required: `resumes` where `userId ==` and
ordered by `uploadedAt` descending (`list_resumes`). It is declared in
`firestore.indexes.json`. All other queries are single-field and
auto-indexed.

> ⚠️ **Deploy to the real project.** `.firebaserc` sets the default project to
> `demo-jobwemet-bedd8` (for the emulators). A plain
> `firebase deploy --only firestore:indexes` would therefore apply the index
> to the **demo** project, not the live `jobwemet-bedd8` the backend
> connects to — the API would then get `FailedPrecondition: query requires an
> index`. Deploy explicitly to the real project:
>
> ```bash
> firebase deploy --only firestore:indexes --project jobwemet-bedd8
> ```
>
> Index build takes a minute or two; the `GET /resumes` and `GET /dashboard`
> endpoints fail until it is active.
