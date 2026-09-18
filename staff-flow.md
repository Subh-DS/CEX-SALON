# Sundara Staff Flow (actual, verified 16 Sept 2026)

## Entry
Footer `Staff Portal →` → `/staff/login` (role-aware: staff → `/staff`, admin → `/admin`,
customer → customer login hint). Logged-out `/staff/*` → login; customer → `/`.

## Shell
Plum sidebar (Dashboard, Schedule, Appointments, Customers, Services, Loyalty, Analytics)
+ mobile drawer + header with name + Sign out → `/`, session cleared.

## Core chain (verified live, SND-000008)
```
Customer books (pending)
  ↓ BACKEND Booking + items
Staff Dashboard "Needs attention" / Appointments list (search, date, status filters)
  ↓ open /staff/appointments/:id (guest, phone, price, history, notes)
Staff Confirm → BACKEND status=confirmed + history row
  ↓ Customer My Visits shows Confirmed
Staff Start → in_progress → Complete → BACKEND completed + earn ledger (1pt/₹10, idempotent)
  ↓ toast "guest earned N Glow Points"
Customer Glow Points +ledger row; balance updated
Customer reviews → +50 bonus (idempotent per review) → "★ Reviewed +50" inline
```

## Other flows
- Reschedule (staff detail or customer visits): live availability pane → BACKEND checks
  hours/blocks/conflicts → history reason "rescheduled" → both sides update.
- Cancel (staff detail w/ dialog, customer visits w/ dialog): → cancelled → both sides update.
- Invalid transitions (e.g. complete a cancelled) → 422 + friendly message; double-clicks locked
  by pending states.
- Staff reads/writes own jobs only (403 otherwise); admin reads/writes all; customers isolated.
- Availability/notes: Schedule tab → PUT hours / blocks (feed customer slots); notes on jobs or
  customer pages (staff/admin only, never to customers).

## Failure recovery
Loading / empty / error states on every section; Try-again refetches; 401 → login with
selections kept where safe; no fake data anywhere (empty reviews/analytics say so).

## Deferred (documented, not faked)
Settings: no backend model for salon policies → no settings page. Referrals earn path:
constants exist, mechanism arrives in Stage 9 with the referral feature.
