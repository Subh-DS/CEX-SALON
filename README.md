# Sundara — Salon Booking & Loyalty Platform

> **"Your beauty, your time."** — Contemporary Indian premium beauty, booking to loyalty.

## Overview
Full-stack salon/service booking + loyalty tracking platform. Customer books services with staff of choice, pays (mock in MVP), earns Glow-Level loyalty points, redeems rewards, rebooks effortlessly. Staff manage schedules; admins run operations and analytics.

## Stack
- **Frontend:** React 18 + TypeScript + Vite + Tailwind v3 + shadcn/ui + Framer Motion + React Router v6 + TanStack Query + React Hook Form + Zod + Lucide
- **Backend:** Python 3.11 + FastAPI + Pydantic v2 + SQLAlchemy 2.0 (async) + Alembic + PostgreSQL 15 + JWT + bcrypt
- **Testing:** pytest + httpx (backend), Vitest + RTL (frontend), Playwright (E2E critical flows)

## Repo Layout
```
C:\DEV\SALON\
├── frontend/  # React SPA (Stages 1-2)
├── backend/   # FastAPI API (Stage 3+)
├── database/seeds/
├── tests/e2e/
├── docs/
├── flow.md        # product + system flows (maintained)
├── decision.md    # decision log (maintained)
├── .env.example
└── README.md
```

## Setup (once code lands)
```bash
# Backend
cd backend && python -m venv .venv && .venv/Scripts/activate
pip install -r requirements.txt
cp ../.env.example .env
alembic upgrade head
uvicorn app.main:app --reload

# Frontend
cd frontend && npm install && npm run dev
```

## Env Vars
See `.env.example`. Never commit real secrets.

## Stages
- Stage 0 Discovery ✅ (this commit: flow.md + decision.md + roadmap)
- Stage 1 Design Foundation → next
- MVP = Stages 1–5 + Staff/Admin basics; Loyalty/Reviews/Referrals = Phase 2

## Docs
- `flow.md` — all user/system/API/DB flows
- `decision.md` — every significant decision with alternatives + trade-offs
