# Sundara Product Flow Map (actual, verified 16 Sept 2026)

```
LANDING (/)
├── Explore services → /services (real API, filter) → /services/:uuid (real + filtered experts)
│       └── Book This Service / Choose expert → /book?service_id=&staff_id= (preselected)
├── Book now / Book an appointment → /book (clean; logged out → /login → return WITH context)
├── Expert cards → /book?staff_id= (expert kept, service chosen at step 1)
├── Glow teaser → /loyalty · Final CTA → /book
└── Footer → routes only (no dead links)

BOOKING (/book — auth required, 6 steps)
START → SERVICE → EXPERT (filtered per service) → DATE (Sun closed, past blocked)
  → TIME (live /availability, revalidated on parent change) → REVIEW (per-row Edit)
  → PAY (mock, no card storage) → CONFIRMED (SND-number, authoritative)
  failure branches: SLOT_TAKEN → back to TIME + "just taken" · 401 → login, selections kept

MY VISITS (/dashboard)
├── Next-visit hero: Reschedule (live pane) · Cancel (dialog + policy)
├── Every active upcoming row: same Reschedule/Cancel (status+future gated)
├── Completed rows: inline rating → +50 pts ledger entry · earned-points from ledger only
├── Cancelled/past rows: Book again → /book?service_id=&staff_id= (no stale date/time)
└── Mutations invalidate ["bookings"] → UI reflects backend immediately

LOYALTY (/loyalty → /rewards)
completed visit → ledger (+1/₹10) → tier check (0/500/1500/4000) → review +50 → rewards
  → redeem (single DB transaction: balance check → debit → ledger → code) → balance+activity update
  insufficient → exact-gap states, no affordance

AUTH: logged-out protected → /login → return to origin (incl. booking params).
LOGOUT: session cleared, no private data on Back. 404 branded.
```

## Flow audit (A–T)

| Flow | Result | Evidence |
|------|--------|----------|
| A new-customer booking | PASS | SND-000006 full 6-step live |
| B returning booking | PASS | dashboard → rebook paths |
| C book from Services | PASS | preselect verified (was BUG-001) |
| D book from Landing | PASS | clean start + preselect |
| E login interruption | PASS | /book?service_id= survives login |
| F change service mid-flow | PASS | expert list refilters; Continue gated |
| G unavailable slot | PASS | disabled slots; conflict message |
| H successful booking | PASS | SND-000006 + persistence |
| I failed booking | PASS | conflict/401 branches |
| J reschedule | PASS | hero + row-level (was BUG-002) |
| K cancel | PASS | Keep/Confirm both paths |
| L book again | PASS | params preserved, no stale time |
| M glow viewing | PASS | real 20 pts / Bloom / ledger |
| N redemption | PASS | backend tests + prior live redeem + gap states |
| O failed redemption | PASS | exact-gap, no deduction |
| P logout | PASS | state cleared, guards hold |
| Q session expiry | PASS | 401 message, selections kept |
| R backend down | PASS | "Failed to fetch" diagnosed; honest error states in UI |
| S mobile journey | PASS | 390px hero/menu/composition, 44px targets |
| T back/forward/refresh | PASS | guards + preserved step state |

State machines: booking START→…→CONFIRMED with RETRY branches; appointment pending/confirmed→(reschedule/cancel)/completed→(review/rebook)/cancelled→(rebook); loyalty EARNED→AVAILABLE→REDEEMED. No impossible states reachable from UI. No dead ends: every error/empty state carries Try-again or a next action.
