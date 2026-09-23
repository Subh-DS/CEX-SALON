# Deploy Runbook — Blush Studio

Topology: **static frontend** (Vite build) + **FastAPI API** (Docker) + **managed Postgres**.
`render.yaml` encodes this for Render; the same env table works on Railway/VPS.

## 1. Backend (Docker, from `backend/`)

```bash
docker build -t blush-api ./backend
docker run -p 8000:8000 -e ENV=production \
  -e DATABASE_URL='postgresql+asyncpg://USER:PASS@HOST:5432/DB' \
  -e JWT_SECRET='<generate: openssl rand -hex 32>' \
  -e CORS_ORIGINS='https://<frontend-url>' \
  -e ADMIN_EMAIL='owner@example.com' \
  blush-api
```

Boot runs `alembic upgrade head` (0001 → 0004: schema, coupons, tier seed), then uvicorn.
Health: `GET /health`. `ADMIN_EMAIL` promotes that login to admin on first boot.

## 2. Frontend (any static host)

```bash
cd frontend
VITE_API_BASE_URL=https://<api-url>/api/v1 npm run build   # outputs dist/
```

Serve `dist/` statically. Client defaults to `http://localhost:8000/api/v1` when unset (dev only).

## 3. Env table (all required in production)

| Var | Example | Notes |
|---|---|---|
| `ENV` | `production` | Refuses default JWT secret when not `development` |
| `DATABASE_URL` | `postgresql+asyncpg://…` | `postgres://` auto-normalized; SQLite default is dev-only |
| `JWT_SECRET` | 32+ random bytes | Generate, never commit |
| `CORS_ORIGINS` | `https://<frontend>` | Exact frontend origin(s), comma-separated |
| `ADMIN_EMAIL` | `owner@example.com` | First-admin bootstrap on boot |
| `VITE_API_BASE_URL` | `https://<api>/api/v1` | Baked in at frontend **build** time |

## 4. Post-deploy checklist

1. Register the owner account in the app → restart API once with `ADMIN_EMAIL` (or set before first boot).
2. As admin: `POST /admin/staff` to provision stylists (register only makes customers).
3. As admin: create services + rewards in the Admin console (tiers auto-seed; rewards start empty).
4. Staff sign in → set weekly hours + blocks → test book → pay → complete → loyalty.
5. Do NOT run `seed_dev.py` on prod (demo data). Do NOT commit `.env` (gitignored).

## 5. Notes

- Refresh tokens rotate per use (no server revocation list — acceptable at this scale).
- Payments are a **mock provider**; real Razorpay verification is a future stage.
- Single uvicorn worker is fine for launch; add `--workers 4` (or gunicorn) past that.
- Rollback: redeploy previous image; migrations 0003/0004 are re-runnable and additive.
