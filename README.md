# Machine Inspection System

A full-stack machine inspection checklist platform with a **React** frontend, **FastAPI** backend, and **PostgreSQL** database — all in Docker.

## Features

- **React UI** — Modern design with Tailwind CSS, Framer Motion animations, responsive layout
- **User Dashboard** — Fill 26-point inspection forms with digital signatures
- **Admin Dashboard** — View submissions, customize form style, manage questions & users
- **PostgreSQL** — Persistent storage for all data
- **Docker** — One command to run everything

## Quick Start (Docker)

```bash
docker compose up --build
```

| Service  | URL                        |
|----------|----------------------------|
| Frontend | http://localhost:3000      |
| API      | http://localhost:8000      |

### Demo Accounts

| Role  | Username | Password  |
|-------|----------|-----------|
| Admin | admin    | admin123  |
| User  | user     | user123   |

## Local Development

**Backend:**
```bash
docker compose up db -d
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 (Vite proxies `/api` to backend)

## Architecture

```
├── app/                  # FastAPI backend (API only)
│   ├── main.py
│   ├── models.py
│   ├── routers/          # auth, forms, admin APIs
│   └── seed.py           # 26 checklist items
├── frontend/             # React + Vite + Tailwind
│   ├── src/
│   │   ├── pages/        # Login, Dashboard, Admin pages
│   │   ├── components/   # Layout, SignaturePad, etc.
│   │   └── api/          # API client
│   └── Dockerfile        # nginx production build
└── docker-compose.yml    # db + api + frontend
```

## Tech Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Frontend | React 18, Vite, Tailwind, Framer Motion |
| Backend  | FastAPI, SQLAlchemy, JWT            |
| Database | PostgreSQL 16                       |
| Deploy   | Docker Compose, nginx                 |

## Stop

```bash
docker compose down
```

Remove data: `docker compose down -v`
