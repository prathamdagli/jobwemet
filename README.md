# JobWeMet

**AI-powered Career Intelligence Platform**

JobWeMet helps job-seekers understand their resume, discover the best-fit
careers, find the skills they're missing, and follow a personalized learning
roadmap with recommended courses. Users upload a resume; the platform runs an
AI-assisted analysis pipeline (skills → career matches → skill gap → roadmap →
courses) and presents everything in a clean dashboard.

This repo is **feature-complete and production-ready**: it contains both the
frontend (React + Vite) and the backend (FastAPI talking directly to Firebase).

---

## Table of contents

- [Architecture](#architecture)
- [Project structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Local setup](#local-setup)
  - [1. Firebase](#1-firebase)
  - [2. Backend](#2-backend)
  - [3. Frontend](#3-frontend)
- [Environment variables](#environment-variables)
- [API contract](#api-contract)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

---

## Architecture

```
┌──────────────────┐         HTTPS / REST         ┌──────────────────────────┐
│   Frontend       │  ──────────────────────────▶  │   Backend (FastAPI)       │
│   React + Vite   │   Authorization: Bearer JWT    │   - verifies Firebase ID  │
│   (Vercel /      │  ◀──────────────────────────   │     tokens (firebase-admin)│
│    Firebase Host)│   { success, data } envelope   │   - uid-scoped Firestore   │
└──────────────────┘                                │   - Cloud Storage resume    │
                                                    │     blobs                  │
                                                    └───────────┬──────────────┘
                                                                │  Admin SDK
                                                    ┌───────────┴──────────────┐
                                                    │   Firebase (one project)  │
                                                    │  Auth · Firestore · Storage│
                                                    └────────────────────────────┘
```

Key design choices (kept deliberately simple — no Cloud Functions, no extra
services):

- The **backend is a single FastAPI app** that talks directly to Firebase via
  the Admin SDK. Ownership is enforced server-side by always scoping queries to
  the authenticated user's `uid`.
- The **AI pipeline is provider-abstracted** (`ai.py`): a deterministic
  `stub` provider runs when no key is set, and `openrouter` plugs in via an env
  flag. Adding another provider later is a single provider class.
- **All responses** share one shape — see [API contract](#api-contract).

---

## Project structure

```
.
├── backend/                 FastAPI backend (Python)
│   ├── main.py              App bootstrap, CORS, middleware, exception handlers
│   ├── api.py              All REST endpoints (single router)
│   ├── config.py           Env config + startup validation
│   ├── models.py           Pydantic models (camelCase, 1:1 with Firestore docs)
│   ├── firebase.py         Admin SDK init + auth/firestore/storage clients
│   ├── database.py         Firestore read/write helpers (uid-scoped)
│   ├── ai.py               AI provider abstraction (stub | openrouter)
│   ├── resume.py           Upload, validation, PDF/DOCX text extraction
│   ├── career.py           Skill analysis, career matching, skill gap, dashboard
│   ├── roadmap.py          Roadmap generation / regeneration
│   ├── courses.py          Course recommendation
│   ├── utils.py            id / time / filename helpers
│   ├── requirements.txt
│   └── .env.example
├── frontend/               React 19 + Vite + TypeScript frontend
│   ├── src/
│   │   ├── api/            Single typed API client (retry, abort, envelope unwrap)
│   │   ├── contexts/      Auth + AppState providers
│   │   ├── firebase/      Frontend Firebase init
│   │   └── pages/         App routes
│   ├── vite.config.ts
│   └── .env.example
├── firestore.rules         Locked-down security rules (owner-only + backend-only)
├── storage.rules           Resume upload rules (owner, size + type limits)
├── firebase.json           Firebase hosting + emulator config
├── render.yaml             Backend deploy (Render)
└── README.md
```

---

## Prerequisites

- **Node.js** ≥ 18 and **Python** ≥ 3.11
- A **Firebase project** with Authentication, Firestore, and Storage enabled
- (Optional) the Firebase Emulator Suite for fully local dev

---

## Local setup

### 1. Firebase

1. Create a Firebase project at <https://console.firebase.google.com>.
2. Enable **Email/Password** and **Google** sign-in methods under
   *Authentication → Sign-in method*.
3. Create a **Cloud Firestore** database (start in production mode; the rules
   in `firestore.rules` are applied on deploy).
4. Enable **Cloud Storage** (a default bucket is created for you).
5. Create a **Web App** under *Project settings → Your apps* and copy the
   config values into `frontend/.env` (see
   [Environment variables](#environment-variables)).
6. For backend access, generate a **Service Account** key
   (*Project settings → Service accounts → Generate new private key*) and point
   `GOOGLE_APPLICATION_CREDENTIALS` at it, or use the emulator.

To run everything against emulators instead of the cloud:

```bash
firebase emulators:start
# then set in backend/.env: GOOGLE_APPLICATION_CREDENTIALS= (leave blank) and
# rely on FIRESTORE_EMULATOR_HOST / STORAGE_EMULATOR_HOST picked up from firebase.json
```

### 2. Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\Activate.ps1
pip install -r requirements.txt
cp .env.example .env             # fill in credentials / keys
uvicorn backend.main:app --reload --port 8000
```

Open <http://127.0.0.1:8000/docs> for the Swagger UI.

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env             # set VITE_FIREBASE_* and VITE_API_BASE_URL
npm run dev                      # http://localhost:5173
```

---

## Environment variables

### Backend (`backend/.env`)

See `backend/.env.example` for the full list. Highlights:

| Variable                        | Purpose                                                     |
|---------------------------------|-------------------------------------------------------------|
| `GOOGLE_APPLICATION_CREDENTIALS`| Path to a service-account JSON (or blank to use ADC/emulator) |
| `FIREBASE_PROJECT_ID`           | Firebase project id                                         |
| `FIREBASE_STORAGE_BUCKET`       | Cloud Storage bucket, e.g. `myapp.firebasestorage.app`      |
| `ALLOWED_ORIGINS`               | Comma-separated CORS origins. **No `*` when auth is on.**  |
| `REQUIRE_AUTH`                  | `true` in production; `false` (demo user) for local dev     |
| `DEMO_UID`                      | Fallback uid used when auth is disabled                     |
| `AI_PROVIDER`                   | `stub` (default) or `openrouter`                            |
| `OPENROUTER_API_KEY`            | Required when `AI_PROVIDER=openrouter`                      |
| `OPENROUTER_MODEL` / `OPENROUTER_BASE_URL` | OpenRouter model + base URL (configurable from env)     |
| `OPENROUTER_REASONING`            | Optional reasoning effort (low/medium/high/...); ignored if the model doesn't support it |

> The backend **validates its configuration at startup** (`config.validate_env`)
> and fails fast with a helpful message if anything is misconfigured — e.g. a
> wildcard CORS origin combined with `REQUIRE_AUTH=true`.

### Frontend (`frontend/.env`)

| Variable                        | Purpose                                          |
|---------------------------------|--------------------------------------------------|
| `VITE_FIREBASE_API_KEY`         | Firebase web app config (from step 1.5)          |
| `VITE_FIREBASE_AUTH_DOMAIN`     | `<projectId>.firebaseapp.com`                    |
| `VITE_FIREBASE_PROJECT_ID`      | Firebase project id                              |
| `VITE_FIREBASE_STORAGE_BUCKET`  | Cloud Storage bucket                             |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Messaging sender id                         |
| `VITE_FIREBASE_APP_ID`          | Firebase web app id                              |
| `VITE_FIREBASE_MEASUREMENT_ID`  | (Optional) Analytics measurement id              |
| `VITE_API_BASE_URL`             | Backend base URL, e.g. `http://127.0.0.1:8000`   |

> Never commit `.env` files — they are git-ignored. Commit the `.env.example`
> files instead.

---

## API contract

Every successful response is wrapped:

```json
{ "success": true, "data": { ... } }
```

Every error response is wrapped:

```json
{ "success": false, "error": { "code": "not_found", "message": "...", "details": null } }
```

- All endpoints except `GET /` require `Authorization: Bearer <Firebase ID token>`
  (in production). The token is the frontend's Firebase ID token.
- Each response carries a `X-Request-ID` header for log correlation.
- Errors use stable machine-readable `code`s (`bad_request`, `unauthorized`,
  `forbidden`, `not_found`, `validation_error`, `internal_error`, …).

A full path list is in `backend/README.md`. Interactive docs live at
`/docs` (Swagger) and `/redoc`.

---

## Deployment

### Backend — Render (recommended)

`render.yaml` defines a Python web service:

- **Build command:** `pip install -r requirements.txt`
- **Start command:** `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
- **Environment:** set every value from `backend/.env.example`, with
  `REQUIRE_AUTH=true`, `ALLOWED_ORIGINS=https://<your-frontend-domain>`, and a
  real `GOOGLE_APPLICATION_CREDENTIALS` service account.

Deploy: connect the repo in Render and select the `render.yaml` blueprint, or
create a new Web Service pointing at `backend.main:app`.

### Frontend — Vercel (recommended) or Firebase Hosting

**Vercel:** import the `frontend/` folder. Build command `npm run build`,
output `dist`. Set the `VITE_*` env vars and `VITE_API_BASE_URL` to the deployed
backend URL. `vercel.json` rewrites all routes to `index.html` for SPA routing.

**Firebase Hosting:** set `dist` as the public directory in `firebase.json`
hosting config and deploy with `firebase deploy --only hosting`.

### Firebase rules

```bash
firebase deploy --only firestore:rules,storage
```

---

## Troubleshooting

| Symptom                                   | Likely cause / fix                                              |
|-------------------------------------------|-----------------------------------------------------------------|
| Backend won't start ("Invalid backend configuration") | A startup validation error (see message). E.g. `*` origin with `REQUIRE_AUTH=true`. |
| `401 Unauthorized` from the frontend      | Expired token — the client auto-refreshes once. Otherwise re-login. |
| `403` on a Firestore write                | Security rules deny it — derived collections are backend-only; client must go through the REST API. |
| `CORS` errors in the browser console      | `ALLOWED_ORIGINS` doesn't include the frontend origin.          |
| DB calls hang / time out locally          | No credentials and no emulator running. Use the emulator or set `GOOGLE_APPLICATION_CREDENTIALS`. |
| Upload rejected (`400`)                   | File too large (>10 MB) or wrong type (only PDF/DOCX allowed).  |

### Environment limitations for automated tests

This project has no live Firestore credentials in CI by default, so
integration tests that touch the database return `500` unless ADC/emulator is
available. Endpoint contracts, middleware, error envelopes, and request-id
handling are verified with the FastAPI `TestClient` and monkeypatched data
access, which do not require a real database.
