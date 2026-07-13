# JobWeMet Frontend

React 19 + Vite + TypeScript single-page app for JobWeMet. Talks to the FastAPI
backend over a single typed API client (see `src/services/api/client.ts`).

## Scripts

```bash
npm install
npm run dev        # Vite dev server (http://localhost:5173)
npm run build      # type-check (tsc -b) + production bundle into dist/
npm run preview    # preview the production build
npm run lint       # eslint
```

## Configuration

Copy `.env.example` to `.env` and set the Firebase web-app config
(`VITE_FIREBASE_*`) plus `VITE_API_BASE_URL` (the backend URL). See the
root `README.md` for the full list.

## How the API client works

`src/services/api/client.ts` is the only place that touches the network:

- Attaches the current Firebase ID token as a `Bearer` header.
- Unwraps the backend's `{ success, data }` envelope and surfaces
  `{ success: false, error }` as a typed `ApiError`.
- Retries transient network failures **once**, and on a `401` forces a token
  refresh and retries once.
- Supports an `AbortSignal` on every call so stale requests can be cancelled
  (used by the app-state provider when the user changes).
- Uploads use `XMLHttpRequest` to report real upload progress.

## Deploy

Build with `npm run build` (output `dist/`). Host statically:

- **Vercel:** import this folder; `vercel.json` rewrites all paths to
  `index.html` for client-side routing.
- **Firebase Hosting:** set `dist` as the public directory and
  `firebase deploy --only hosting`.
