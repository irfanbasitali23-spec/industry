# Machine Inspection System

## Docker deployment (containers)

Run everything locally or on any server with Docker:

```bash
docker compose up -d --build
```

| Service    | URL                        |
|------------|----------------------------|
| **App UI** | http://localhost:3000      |
| **API**    | http://localhost:8000      |
| **Health** | http://localhost:8000/api/health |

### Login

| Role  | Username | Password   |
|-------|----------|------------|
| Admin | `admin`  | `admin123`   |
| User  | `user`   | `user123`    |

### Useful commands

```bash
# Start in background
docker compose up -d --build

# View logs
docker compose logs -f

# Stop
docker compose down

# Stop and delete database data
docker compose down -v

# Restart after code changes
docker compose up -d --build
```

### Optional: custom `.env`

```bash
copy .env.example .env
```

Edit `.env` for Docker (local database only — do **not** add Neon `POSTGRES_URL` here):

```env
POSTGRES_USER=inspection_user
POSTGRES_PASSWORD=inspection_pass
POSTGRES_DB=machine_inspection
SECRET_KEY=your-secret-key
ADMIN_PASSWORD=your-admin-password
```

Then run:

```bash
docker compose up -d --build
```

Docker uses the **local PostgreSQL container** — Neon credentials are **not** needed for Docker.

---

## Vercel + Neon (cloud)

See [VERCEL_SETUP.md](VERCEL_SETUP.md) for cloud deployment.

---

## Requirements

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- Ports **3000**, **8000**, **5432** available
