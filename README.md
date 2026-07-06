# Machine Inspection System

Full-stack machine inspection platform — React frontend, FastAPI backend, PostgreSQL.

## Local (Docker)

```bash
docker compose up --build
```

| Service  | URL                   |
|----------|-----------------------|
| Frontend | http://localhost:3000 |
| API      | http://localhost:8000 |

**Demo:** `admin` / `admin123` · `user` / `user123`

---

## Cloud deployment (free tier)

Vercel **cannot** run PostgreSQL or Docker. Use this split:

| Part       | Platform | Free tier |
|------------|----------|-----------|
| Frontend   | **Vercel** | Yes       |
| API        | **Render** | Yes       |
| Database   | **Neon**   | Yes       |

### Step 1 — Database (Neon)

1. Create account at [neon.tech](https://neon.tech)
2. Create a project → copy the **connection string**
3. It looks like: `postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require`

### Step 2 — Backend (Render)

1. Push this repo to GitHub
2. Go to [render.com](https://render.com) → **New → Blueprint**
3. Connect repo — Render reads `render.yaml`
4. Set environment variables:
   - `DATABASE_URL` = your Neon connection string
   - `CORS_ORIGINS` = `https://YOUR-APP.vercel.app` (set after Step 3)
   - `ADMIN_PASSWORD` = your secure admin password
5. Deploy → note API URL, e.g. `https://inspectpro-api.onrender.com`

### Step 3 — Frontend (Vercel)

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import GitHub repo
3. Set **Root Directory** = `frontend`
4. Framework: **Vite** (auto-detected)
5. Environment variable:
   ```
   VITE_API_URL=https://inspectpro-api.onrender.com/api
   ```
   (use your real Render API URL + `/api`)
6. Deploy

### Step 4 — Update CORS

Back on Render, set `CORS_ORIGINS` to your Vercel URL:
```
https://your-project.vercel.app
```

Redeploy the API if needed.

---

## Why the error happened

```
connection to server at "localhost" port 5432 failed
```

On Vercel/Render there is **no local PostgreSQL**. You must set `DATABASE_URL` to a **cloud** database (Neon, Supabase, etc.).

---

## Local development (no Docker)

**Database:** `docker compose up db -d`

**Backend:**
```bash
pip install -r requirements.txt
# set DATABASE_URL in .env
uvicorn app.main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

---

## Architecture

```
frontend/          → Vercel (React + Vite)
app/               → Render (FastAPI)
PostgreSQL         → Neon (cloud)
docker-compose.yml → local development only
```
