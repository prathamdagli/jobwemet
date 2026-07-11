@echo off
REM ===========================================================================
REM JobWeMet - start the whole project (backend + frontend).
REM Double-click this file (or run it from a terminal). It opens two windows:
REM   * "JobWeMet Backend"  - FastAPI on http://127.0.0.1:8000  (Swagger: /docs)
REM   * "JobWeMet Frontend" - Vite dev server on http://localhost:5173
REM Both windows stay open so you can watch logs and Ctrl+C to stop them.
REM ===========================================================================
cd /d %~dp0

echo Starting JobWeMet...
echo.

REM --- Backend -------------------------------------------------------------
REM Create a virtualenv on first run, install deps, then launch uvicorn.
if not exist backend\.venv python -m venv backend\.venv
start "JobWeMet Backend" cmd /k "cd /d %~dp0 && call backend\.venv\Scripts\activate && pip install -q -r backend\requirements.txt && python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload"

REM --- Frontend ------------------------------------------------------------
REM Install node_modules on first run, then launch the Vite dev server.
start "JobWeMet Frontend" cmd /k "cd /d %~dp0frontend && if not exist node_modules npm install && npm run dev"

echo ============================================================
echo  Backend  : http://127.0.0.1:8000   (API docs: /docs)
echo  Frontend : http://localhost:5173
echo ============================================================
echo.
pause
