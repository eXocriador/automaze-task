# TODO App (FastAPI + Next.js)

Production-ready TODO manager with FastAPI + SQLAlchemy backend and Next.js (App Router) frontend using Tailwind + shadcn/ui.

## Features
- List, search, filter (all/done/undone), and sort tasks by priority.
- Create, update (toggle done/undone), and delete tasks.
- Priority 1–10 validation enforced at DB and API levels.
- SQLite by default; configurable `DATABASE_URL` for production.
- Next.js API routes proxy to the backend; SWR-powered optimistic UI.

## Tech Stack
- Backend: Python, FastAPI, SQLAlchemy, Pydantic, SQLite.
- Frontend: Next.js (App Router), React, TypeScript, Tailwind CSS, shadcn/ui, SWR.

## Project Structure
```
root/
  backend/
    app/
      main.py, db.py, models.py, schemas.py, crud.py, deps.py
      routers/tasks.py
    requirements.txt
    .env.example
  frontend/
    app/
      layout.tsx, page.tsx, globals.css
      api/tasks/route.ts
      api/tasks/[id]/route.ts
    components/
      task/*, ui/*
    lib/
      api.ts, types.ts, utils.ts
    package.json, tsconfig.json, tailwind.config.js, postcss.config.js
    .env.example
  README.md
```

## Backend Setup
Prereqs: Python 3.11+, pip.
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # adjust as needed
# dev server
./dev.sh
# or
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 --app-dir .
```
Default DB lives at `backend/app/app.db` (SQLite). If you override `DATABASE_URL`, keep it relative to `backend/`, e.g. `sqlite:///./app/app.db`. For Postgres/MySQL set a full URL.

## Frontend Setup
Prereqs: Node 18+ and npm.
```bash
cd frontend
npm install
cp .env.example .env.local  # set NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
# dev server
./dev.sh  # http://localhost:3000
# or
npm run dev  # http://localhost:3000
```

## Environment Variables
- Backend (`backend/.env`):
  - `DATABASE_URL` (default `sqlite:///./backend/app/app.db`)
  - `BACKEND_CORS_ORIGINS` (comma-separated or `*`)
- Frontend (`frontend/.env.local`):
  - `NEXT_PUBLIC_API_BASE_URL` (e.g., `http://localhost:8000`)

## API (Backend)
- `GET /tasks` — list tasks  
  Query params: `search` (str), `status` (`all|done|undone`), `sort` (`priority_asc|priority_desc`).
- `POST /tasks` — create task  
  Body: `{ "title": str, "description?": str, "priority": 1-10, "completed?": bool }`
- `PATCH /tasks/{id}` — update task  
  Body: any subset of `{ title, description, priority, completed }`
- `DELETE /tasks/{id}` — remove task

## Deployment
- Backend (Render/Railway/Docker):  
  - Env: `DATABASE_URL` (use managed DB), `BACKEND_CORS_ORIGINS` (frontend origin).  
  - Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT --app-dir .`
- Frontend (Vercel or similar):  
  - Env: `NEXT_PUBLIC_API_BASE_URL` pointing to deployed backend.  
  - Build: `npm run build`, Start: `npm start` (or platform default).

## Development Notes
- No auto-commits; follow staged workflow.  
- SWR handles optimistic updates for create/toggle/delete; errors roll back cache.  
- DB schema created on startup via `Base.metadata.create_all`; add migrations if schema evolves.
