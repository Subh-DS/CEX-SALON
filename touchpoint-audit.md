# Sundara Touchpoint Audit — 16 Sept 2026 (live browser + API evidence)

Frontend `http://localhost:5173/` · Backend `http://localhost:8000` (`/health` up) · SQLite dev DB.
Backend suite: **23/23 pytest pass**. Frontend `vite build` clean. Console errors during audit: **0**.
 statuses: PASS · FAIL · PARTIAL · NOT IMPLEMENTED · BLOCKED. A PASS means UI → API → persistence → UI verified.

## Landing (/)

| ID | Element | Expected → Actual | Status |
|----|---------|-------------------|--------|
| TP-001 | Header logo | → `/`, renders | PASS |
| TP-002 | Home / Services / My Visits / Glow Points nav | Correct routes; auth-aware header (Priya + Log out when in) | PASS |
| TP-003 | Book now (header) | → `/book` (logged out → `/login`, returns after) | PASS |
| TP-004 | Hero Book an appointment | → booking step 1 | PASS |
| TP-005 | Hero Explore services | → `/services` | PASS |
| TP-006 | Trust line ★4.9 / Mon–Sat | Rendered; ratings backed by seeded `/staff` review data (see OBS-1) | PASS |
| TP-007 | Experience 01/02/03 | Editorial numbered list, no dead CTA | PASS |
| TP-008 | Services featured + rows | Real `/services` data (names, durations, prices match API) | PASS |
| TP-009 | Book this service | → `/book?service_id=<uuid>`, preselected (FIXED, was `/book` bare) | PASS |
| TP-010 | Service row → detail | → `/services/<uuid>`, real data + filtered experts | PASS |
| TP-011 | View all services → | → `/services` (single consistent label) | PASS |
| TP-012 | Space / interior image | Editorial photo, correct aspect, lazy | PASS |
| TP-013 | Booking strip CTA | → `/book` clean start, no stale state | PASS |
| TP-014 | Expert cards | Real `/staff` data; → `/book?staff_id=` preserved | PASS |
| TP-015 | Loyalty teaser (50 review / 200 referral) | Visible section, → `/loyalty`; matches backend constants | PASS |
| TP-016 | Final CTA Book an appointment → | → `/book`, one consistent phrase site-wide | PASS |
| TP-017 | Footer Services/Account/Visit links | All route correctly; dead social/legal spans REMOVED (FIXED) | PASS |
| TP-018 | Mobile hamburger (44×44) | Opens drawer: Home/Services/My Visits/Glow Points/Log in/Book now | PASS |
| TP-019 | Mobile hero composition | Location → headline → copy → CTA → trust → image, no overflow | PASS |
| TP-020 | Section rhythm / blank areas | 8 sections, sane heights, no 100vh gaps; reported PDF blank = capture artifact | PASS |

## Auth

| ID | Element | Expected → Actual | Status |
|----|---------|-------------------|--------|
| TP-021 | Demo login | → `/dashboard` as Priya, header updates | PASS |
| TP-022 | Invalid / empty credentials | Inline validation, button loading state, no crash | PASS |
| TP-023 | Protected `/dashboard` logged out | → `/login` | PASS |
| TP-024 | `/book?service_id=` logged out | → `/login` → back to `/book` WITH service kept | PASS |
| TP-025 | Logout | Session cleared, header → Log in, back-button shows no private data | PASS |
| TP-026 | 404 `/does-not-exist` | Branded page + Go Home | PASS |

## Services + detail

| ID | Element | Expected → Actual | Status |
|----|---------|-------------------|--------|
| TP-027 | Category filter | All/Hair/Skin/Nails filter real list; empty + error states | PASS |
| TP-028 | Service cards | Real price/duration/description, `data-testid="service-card"` | PASS |
| TP-029 | Detail Book This Service | → `/book?service_id=` (FIXED, was bare `/book`) | PASS |
| TP-030 | Detail expert Choose | → `/book?service_id=&staff_id=` (FIXED) | PASS |
| TP-031 | Detail expert list | Filtered to performers (Hair Coloring → Ananya only) | PASS |
| TP-032 | Unknown service id | Friendly not-found + recovery links | PASS |

## Booking (/book, 6 steps)

| ID | Element | Expected → Actual | Status |
|----|---------|-------------------|--------|
| TP-033 | Step 1 service select | Continue disabled → enabled; summary panel updates | PASS |
| TP-034 | Step 2 experts | Filtered ("Everyone below performs…"), select → Continue | PASS |
| TP-035 | Step 3 dates | Real month strip, Sundays CLOSED unselectable, past blocked | PASS |
| TP-036 | Step 4 slots | Live `GET /availability` per expert+date+service; booked disabled | PASS |
| TP-037 | Switching expert/date | Slots revalidate (no stale availability) | PASS |
| TP-038 | Step 5 review | Service/expert/date/time/price + Edit per row | PASS |
| TP-039 | Reserve → double-click | Single booking; conflict → "That time was just taken" + back to slots | PASS |
| TP-040 | Step 6 mock pay | Demo checkout, no card storage; Pay → authoritative confirmation | PASS |
| TP-041 | Confirmation SND-000006 | Number/service/expert/when/paid shown; View my visit + Home work | PASS |
| TP-042 | Back navigation | Selections preserved across steps | PASS |

## My Visits (/dashboard)

| ID | Element | Expected → Actual | Status |
|----|---------|-------------------|--------|
| TP-043 | Next-visit hero | Date block, details, booking no., payment, branch | PASS |
| TP-044 | Hero Reschedule | Live slots, booked disabled, confirm → immediate update (9:00→10:00AM verified) | PASS |
| TP-045 | Hero Cancel | Dialog + policy → Keep dismisses unchanged; Confirm cancels, history updates | PASS |
| TP-046 | Row Reschedule (every upcoming) | Same pane per row (FIXED — only hero had it) | PASS |
| TP-047 | Row Cancel (every upcoming) | Same dialog per row; SND-000006 → Cancelled (FIXED) | PASS |
| TP-048 | Completed rows | Inline star rating + Submit (pending state, error text) | PASS |
| TP-049 | Earned-points line | Only from real ledger rows, never predicted | PASS |
| TP-050 | Usual / Book again | Rebook preselects service+staff, never stale date/time | PASS |
| TP-051 | Persistence | New booking visible after navigation; survives logout/login | PASS |

## Loyalty + rewards

| ID | Element | Expected → Actual | Status |
|----|---------|-------------------|--------|
| TP-052 | /loyalty balance/tier/progress | Real: 20 pts, Bloom, 720/1500 lifetime, benefits | PASS |
| TP-053 | Tier journey + activity ledger | Real tiers/transactions, date-grouped | PASS |
| TP-054 | /rewards gap states | "You have 20 · 280 more needed" — no fake affordances | PASS |
| TP-055 | Redemption success path | Backend-tested (insufficient/double-spend/unknown) + verified live previously (320→20 with code + ledger) | PASS |
| TP-056 | Points never deducted client-side | Backend transactional redeem only | PASS |

## Totals

Total: 56 · Pass: 56 · Fail: 0 (after fixes) · Partial: 0 · Not implemented: 0 · Blocked: 0
Pre-fix failures: 3 (BUG-001, BUG-002, BUG-003) — all fixed and re-verified above.

## Stage 8 addendum (16 Sept 2026) — all PASS, live-verified

| ID | Element | Expected → Actual |
|----|---------|-------------------|
| TP-057 | Admin overview | Real analytics: today's appointments/revenue, cancel rate, popular services, 7d revenue bars, loyalty totals |
| TP-058 | Admin bookings | All bookings + customer names, status filter |
| TP-059 | Admin customers + notes | Visit counts, Glow balances, internal notes save/edit |
| TP-060 | Admin services | Create/edit (price, duration, category, visibility) |
| TP-061 | Admin rewards | Create/edit (cost, visibility), hidden rewards listed |
| TP-062 | Admin reviews | Real review list with guests |
| TP-063 | Admin guards | Customer → 403/bounce; staff → bounce; logout works |
| TP-064 | Staff schedule | Customer name + phone + paid state per job |
| TP-065 | Staff notes | Save as staff → visible to staff + admin |
| TP-066 | Staff availability | Weekly hours save (09:00 default, Sun off); invalid range → 422 |
| TP-067 | Staff time-off blocks | Add/remove; blocks feed real availability |

New totals: 67 · Pass: 67 · Fail: 0.

## Staff portal addendum (16 Sept 2026) — all PASS, live-verified

| ID | Element | Expected → Actual |
|----|---------|-------------------|
| TP-068 | /staff/login | Role-aware: staff→/staff, admin→/admin, customer→hint; wrong creds→error |
| TP-069 | Portal shell | Sidebar + mobile drawer, active states, sign out clears session |
| TP-070 | Dashboard | Greeting, today/pending/done/takings from real rows, needs-attention |
| TP-071 | Appointments | Search + date + status filters; detail opens |
| TP-072 | Confirm → customer sees | SND-000008 pending→confirmed; history + toast |
| TP-073 | Complete → loyalty | +149 ledger row; 20→169 pts; toast states award |
| TP-074 | Review → bonus | +50 ledger row; inline "+50 Glow Points" |
| TP-075 | Invalid/double actions | 422 friendly; buttons lock while pending |
| TP-076 | Own-job enforcement | Kabir touching Ananya's job → 403 (status/reschedule/cancel/read) |
| TP-077 | Customer pages | Search, detail, notes, scoped history, ledger |
| TP-078 | Services/Loyalty/Analytics | Real menu/team, ledger lookup, my+solo metrics |
| TP-079 | Footer → /staff/login | Logged-out→login, staff→console, customer→/ |

New totals: 79 · Pass: 79 · Fail: 0.
