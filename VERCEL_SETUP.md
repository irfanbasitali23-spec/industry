# How to add Neon database on Vercel

## Security

Never put real passwords in GitHub or chat.  
If you shared your password, reset it in [Neon Console](https://console.neon.tech) → **Reset password**.

---

## Method 1 — Automatic (recommended)

1. Open [vercel.com](https://vercel.com) → your project  
2. Go to **Storage** tab  
3. Click **Create Database** → choose **Neon**  
4. Click **Connect to Project**  
5. Vercel adds all variables automatically (`POSTGRES_URL`, `PGUSER`, etc.)  
6. Go to **Deployments** → **Redeploy**

You do **not** need to type `PGUSER` or `PGPASSWORD` manually.

---

## Method 2 — Add variables manually on Vercel

1. Vercel → your project → **Settings** → **Environment Variables**  
2. Add each variable below (get values from [Neon Console](https://console.neon.tech) → Connection Details)  
3. For each variable, check: **Production**, **Preview**, **Development**  
4. Click **Save**  
5. **Deployments** → **Redeploy**

### Easiest: one variable only

| Name | Value |
|------|--------|
| `POSTGRES_URL_NON_POOLING` | Full URL from Neon (Unpooled connection string) |

Example format (use YOUR values from Neon):
```
postgresql://neondb_owner:YOUR_PASSWORD@ep-xxxx.neon.tech/neondb?sslmode=require
```

### Or: separate variables (what you asked about)

| Name | Value (from Neon) |
|------|-------------------|
| `PGUSER` | `neondb_owner` |
| `PGPASSWORD` | your Neon password |
| `PGHOST_UNPOOLED` | `ep-xxxx.neon.tech` (host without `-pooler`) |
| `PGDATABASE` | `neondb` |

Also add these app variables:

| Name | Value |
|------|--------|
| `SECRET_KEY` | any long random string e.g. `my-super-secret-key-12345` |
| `ADMIN_PASSWORD` | password for admin login |

### Vercel uses same names with POSTGRES_ prefix (also works)

| Name | Value |
|------|--------|
| `POSTGRES_USER` | same as `PGUSER` |
| `POSTGRES_PASSWORD` | same as `PGPASSWORD` |
| `POSTGRES_HOST` | your Neon host |
| `POSTGRES_DATABASE` | `neondb` |

---

## Method 3 — Local `.env` file (on your PC)

```powershell
cd d:\screen_work
copy .env.example .env
```

Edit `.env` and add your Neon values (use Option A or C from `.env.example`).

Run locally:
```powershell
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

---

## Vercel project settings checklist

| Setting | Value |
|---------|--------|
| Root Directory | `.` (project root) |
| `POSTGRES_URL_NON_POOLING` or `PGUSER`+`PGPASSWORD`+host | set |
| `SECRET_KEY` | set |
| `ADMIN_PASSWORD` | set |
| `VITE_API_URL` | **leave empty** (uses `/api` on same domain) |

---

## After adding variables

1. **Redeploy** (required — old deploy does not see new env vars)  
2. Open `https://your-app.vercel.app`  
3. Login: `admin` / your `ADMIN_PASSWORD`

---

## Test API

Open in browser:
```
https://your-app.vercel.app/api/health
```
Should show: `{"status":"ok"}`

If error → check Vercel **Deployments** → **Functions** → **Logs**
