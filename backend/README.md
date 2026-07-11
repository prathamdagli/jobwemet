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
  message on misconfiguration (bad AI provider, gemini without a key, wildcard
  CORS with auth enabled).
- **Input validation.** Resume upload, profile/settings updates, and
  roadmap/analysis regeneration are validated via Pydantic models.

## Run it

```bash
python -m venv .venv
.venv\Scripts\python -m pip install -r backend/requirements.txt
cp .env.example .env            # fill in credentials / keys
.venv\Scripts\python -m uvicorn backend.main:app --reload
```

Then open <http://127.0.0.1:8000/docs> for the Swagger UI.

## Configuration

All settings come from environment variables (loaded via `python-dotenv`).
See `.env.example`. Key values:

- `GOOGLE_APPLICATION_CREDENTIALS` — service-account JSON (or use ADC / emulator).
- `FIREBASE_PROJECT_ID`, `FIREBASE_STORAGE_BUCKET`
- `ALLOWED_ORIGINS` — CORS allow-list.
- `REQUIRE_AUTH` / `DEMO_UID` — when auth is off, requests fall back to a demo user.
- `AI_PROVIDER`, `GEMINI_API_KEY`, `GEMINI_MODEL`, `OPENAI_API_KEY`

## Layout

```
backend/
  main.py      FastAPI app: metadata, CORS, Firebase init, router, Swagger auth
  api.py       ALL endpoints (single file, Swagger-documented)
  firebase.py  Admin SDK init + auth/firestore/storage clients
  database.py  Firestore read/write helpers (uid-scoped)
  models.py    Pydantic models (camelCase, 1:1 with Firestore docs)
  ai.py        AI provider abstraction (stub | gemini; openai/claude later)
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

No endpoint calls a model directly. Every request goes through `ai.py`,
which exposes a provider interface (`AIProvider`) with a `stub` and a
`gemini` implementation selected by `AI_PROVIDER`. Adding OpenAI or Claude
later means adding another provider class — nothing else changes.
