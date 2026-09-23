# Full Audit — 23 Sept 2026 (whole codebase)

Scope: `frontend/src` (React 18 + TS + Vite + Tailwind), `backend/app` (FastAPI + SQLAlchemy async),
seeds, tests, git hygiene. Read-only audit — no code changed.
Evidence: `npm run build` ✅ (tsc + vite), backend `pytest` ✅ **38 passed**,
live API checks ✅ (`/loyalty/*`, `/health`), every finding below verified with file:line.

Conventions: **DEFECT** = broken/wrong behavior · **SMELL** = risk/fragility · **OK** = verified good.
Suggested priority: P1 (fix soon) / P2 (fix when touching the area) / P3 (note).

---

## DEFECTS

### AUD-001 — P1: Coupon discount is client-only; backend charges full price
- `frontend/src/components/payment/utils.ts:15-18` (`COUPONS`), `components/booking/StepPayment.tsx:50`
  (`calcPrice(service?.price ?? 0, 0, coupon)`), success screen shows the discounted total —
  but `usePayBooking` posts only `{booking_id}` (`api/bookings.ts:77`) and the server charges
  `booking.total_amount` (`backend/app/api/v1/payments.py:48`).
- The total the user just approved (e.g. ₹898 after BLUSH100) can disagree with
  `BookingConfirmed.tsx:44` (server value). Decide: send coupon to backend and validate
  there, or remove client-side discounting.

### AUD-002 — P1: "Back to review" from Pay duplicates the booking
- `frontend/src/pages/customer/Booking.tsx:199-211` does `setStep(4); setBooking(null)`.
- The server-side reservation already exists, so continuing again creates a **second booking**
  with no cancel of the first. Fix: keep `booking` and skip re-create when one exists,
  or cancel the reservation on back-out.

### AUD-003 — P1: Validation/auth errors break the API envelope
- `backend/app/core/errors.py:21` only handles `ApiError`. `RequestValidationError`
  (bad bodies: missing `items`, bad email, `rating > 5`) falls through to FastAPI's default
  422 `{"detail": …}`, and `core/deps.py:19,23,25,28,35` raise bare `HTTPException`
  (`{"detail": …}`) for every 401/403.
- `frontend/src/api/client.ts:20-25` reads `body?.error?.code`, so these surface as generic
  `HTTP_401/422`. Tests assert status only, so this is undetected. Fix: add handlers for
  `RequestValidationError` + `HTTPException` mapping into `fail()`.

### AUD-004 — P1: Alembic migrations are broken / bypassed
- `backend/alembic/versions/0002_customer_notes.py:11` re-adds `customer_profiles.notes`,
  which `0001_initial.py:16` (`Base.metadata.create_all`) already created →
  `alembic upgrade head` fails on the dev DB: `duplicate column name: notes` (reproduced).
- `0001` is `create_all`-based (no explicit columns); `seeds/seed_dev.py:19` and
  `tests/conftest.py:27` also use `create_all`, so **tests never exercise migrations**.
  Fix: rewrite `0001` as explicit `create_table`s (or squash), delete/repair `0002`.

### AUD-005 — P2: Deleted service/staff turns booking reads into 500s
- `backend/app/api/v1/bookings.py:23-24` (`scalar_one()` on Service/StaffProfile) and
  `transitions.py:130` throw `NoResultFound` → 500 instead of 404 when a referenced
  service/staff row is gone. Use `scalar_one_or_none` + `ApiError("NOT_FOUND", …, 404)`.

### AUD-006 — P2: Staff/admin can file reviews on anyone's booking
- `backend/app/api/v1/reviews.py:25` uses `get_current_user` only; the ownership check
  at `:36` applies to customers, so staff/admin can post reviews attributed to themselves
  (`:54`) on any completed booking. Restrict to `require_role("customer")` or check
  staff assignment.

### AUD-007 — P2: Dead `EmptyState` + wrong link type if revived
- `frontend/src/components/common/EmptyState.tsx:3` is never imported. If reused,
  `:15` uses `<a href>` (full reload) instead of `Link`.

### AUD-008 — P2: Admin service/reward inputs have no label association
- `components/admin/AdminUI.tsx:276-278` `FieldLabel` renders a `<span>`; inputs in
  `pages/admin/AdminServices.tsx:134-156` and `AdminRewards.tsx:125-137` have no
  `id`/`htmlFor` — screen readers get unlabelled fields. (Introduced in the admin overhaul.)

### AUD-009 — P3: Tests hit a non-existent signup route (passing by accident)
- `backend/tests/test_stage8.py:5`, `test_staff_portal.py:17` POST `/api/v1/auth/signup`;
  the real route is `/auth/register` → 404 ignored, login passes only via seed data.
  Fix the tests to use `/auth/register`.

---

## SMELLS (no breakage today, fix when in the area)

- **AUD-S01** `frontend/dist/` is committed to git (build output). Untrack it (`.gitignore`) —
  every build now shows as modified/deleted noise in `git status`.
- **AUD-S02** `backend/sundara_dev.db` + `backend/test_sundara.db` are committed and keep
  changing. Untrack; document seed/dev-DB setup instead.
- **AUD-S03** No `.env` anywhere (good — no leaked secrets), so the backend runs on
  `config.py` defaults including `jwt_secret = "change-me-in-production-min-32-chars"`.
  Fine for local dev; must be real before any shared environment.
- **AUD-S04** `src/Pic/*.jpg.png` (8 files) unreferenced; live code uses `/images/*.jpg`
  via `data/images.ts`. Delete or wire up.
- **AUD-S05** `SERVICE_IMAGES`/`STAFF_IMAGES` keyed `s1..`/`st1..` never hit (API ids are
  UUIDs) — `Booking.tsx:111` always falls back to `HERO_IMAGE`. Only the by-name helpers work.
- **AUD-S06** No token refresh: `POST /auth/refresh` has zero frontend callers; `AuthContext`
  drops the session on 401, so access-token expiry forces re-login.
- **AUD-S07** `GET /admin/overview` unused (Overview page uses `/admin/analytics`);
  `GET /services/categories` unused. Keep or remove.
- **AUD-S08** Staff-only deep links (`/book?staff_id=` without service) land on step 0 and the
  pre-selected expert is silently cleared on service change (`Booking.tsx:143`).
  Unauthenticated staff links go to customer `/login`, not `/staff/login` (`guards.tsx:16`).
- **AUD-S09** Payment processing timer resets on parent re-render (`PaymentStates.tsx:20-23`
  deps include an inline `onDone` closure). Harmless today (no re-render mid-processing),
  fragile tomorrow — stabilise with `useCallback`/`useRef`.
- **AUD-S10** Cash success falls back to a fabricated `BLUSH-…` ref when `bookingNumber`
  is null (`StepPayment.tsx:145-154`). Unreachable in the normal flow (booking exists at
  step 5) but the fake path shouldn't exist — use the real reservation number or error.
- **AUD-S11** `BookingConfirmed.tsx:8` `booking.items[0]` unguarded — empty `items` crashes.
- **AUD-S12** Staff section tabs are `<button onClick={nav}>` (`StaffLayout.tsx:35-43`),
  not `Link`s — no href semantics (AdminLayout does this correctly).
- **AUD-S13** `Th` omits `scope="col"` (`AdminUI.tsx:198-200`).
- **AUD-S14** Refresh tokens never rotate and have no revocation (`auth.py:54`); any staff
  can read/write any customer's notes/activity (ops-intended, no branch scoping,
  `admin.py:170,208`); `PUT /staff/availability` + blocks reject admins while GET allows
  them (`availability.py:79,108,137,155,174`); public catalog/availability/loyalty-catalog
  endpoints allow unauthenticated enumeration (storefront-intended).
- **AUD-S15** `POST /payments` accepts payment on completed/in-progress/no-show bookings
  (only cancelled is blocked, `:34`); retry overwrites deterministic `MOCK-{number}` txn id;
  no idempotency key (acknowledged mock, `:43`).
- **AUD-S16** N+1 reads: `_serialize` per-item + per-booking queries (`bookings.py:17-72`),
  per-customer counts (`admin.py:150`), per-redemption/per-review lookups
  (`admin.py:231,267,270`). Fine at current volume.
- **AUD-S17** `test_auth.py:6` creates a `User` without `CustomerProfile`/`LoyaltyAccount`,
  diverging from the register invariant (`auth.py:24`).
- **AUD-S18** `LoyaltyCard.tsx:6-11` member number is a hash of the email presented as an ID;
  referral earn card has no CTA (`EarnPoints.tsx:24-25`); personal-name placeholder in
  `CardPayment.tsx:116`; placeholder phone/address rendered as real (`Footer.tsx:36-40`,
  `Login.tsx:106`).
- **AUD-S19** Whole API layer trusts the envelope (`api/client.ts:27` `body.data as T`);
  a few non-null assertions (`StaffCustomerDetail.tsx:28`, `StaffAppointmentDetail.tsx:154`,
  `ActivityLedger.tsx:60`). Low risk, no `any` in new code.

## VERIFIED OK

- Build: `tsc --noEmit` + `vite build` clean. Backend: **38/38 pytest pass**.
- No `console.log`/`debugger`/`TODO` in `frontend/src`. No user-facing `Sundara`/`सुन्दरा`
  (only internal storage keys + seed/test emails, both intentional).
- Every frontend `apiFetch` path has a backend handler; every router `Link`/`navigate`
  target resolves to a defined route; guards match layouts.
- AuthZ core sound: customer-own / staff-own / admin scoping in bookings + transitions;
  role hardcoded on register; all identity from tokens; loyalty math consistent across
  service ↔ seed ↔ endpoint (`Seed 0 / Bloom 500 / Flourish 1500 / Radiance 4000`).
- Payments: amount server-derived, cross-user 403, double-pay 409 — no tampering vector.
- New payment/loyalty/admin code: labelled inputs, `aria-invalid`/`describedby`,
  radiogroup/tablist/dialog semantics, toasts aria-live, reduced-motion respected,
  no card/UPI data sent to the backend.
- `StepPayment` ↔ `Booking.tsx` contract matches on all paths including
  `ALREADY_PAID` and cash fallbacks.

## Suggested order

1. AUD-004 (migrations) + AUD-S02 (untrack DBs) — foundation before it bites.
2. AUD-003 (error envelope) — every future API error depends on it.
3. AUD-001 (coupon) + AUD-002 (duplicate booking) — user-facing money/booking integrity.
4. AUD-005, AUD-006, AUD-009 — correctness + test honesty.
5. AUD-S01 (untrack dist), AUD-007/008 + admin a11y, then the rest opportunistically.

## Fix log — 23 Sept 2026 (all items above resolved, verified live)

- **AUD-001**: coupons are server-side now (`services/coupons.py`: BLUSH100/WELCOME20).
  `POST /payments` accepts `coupon_code`, validates, stores `coupon_code`/`discount_amount`
  on the booking (migration `0003`), charges the net amount. Frontend sends the code and
  renders the server's discount/amount. Live: 1499 → 1399, persisted on the booking.
- **AUD-002**: going back from Pay keeps the reservation; continuing reuses it instead of
  re-creating. Changing service/expert/date/slot invalidates the stale reservation via
  snapshot comparison. Deep-linked experts are preserved when they offer the new service,
  cleared with a notice otherwise.
- **AUD-003**: `RequestValidationError` → `VALIDATION_ERROR` (422) and `HTTPException` →
  `HTTP_401/403`, both in the `{success:false,error:{…}}` envelope. Live-verified.
- **AUD-004**: broken `0002` deleted; real `0003_booking_coupons` added (conditional,
  re-runnable). Fresh DB → head clean; existing dev DB 0001 → head clean; roundtrip OK.
- **AUD-005**: `scalar_one()` → `scalar_one_or_none()` + 404 in bookings serialize and
  reschedule; booking list serialization batched (services/staff/branches/payments in bulk).
- **AUD-006**: `POST /reviews` is customer-only (`require_role("customer")`); staff attempt
  live-verified 403.
- **AUD-007**: dead `EmptyState.tsx` deleted; unreferenced 21 MB `src/Pic/` deleted.
- **AUD-008**: `FieldLabel` is a real `<label htmlFor>`; all service/reward inputs have ids.
- **AUD-009**: tests use `/auth/register` with valid bodies; `_ensure_admin` mirrors the
  register invariant (profile + loyalty rows).
- **Smells**: `.gitignore` added; `frontend/dist/`, `*.db`, `__pycache__` untracked;
  `backend/.env` created locally with a generated secret (gitignored); non-dev boot with
  the default JWT secret now raises. Token refresh retry with single-flight rotation in
  `api/client.ts` (+ envelope guard); refresh endpoint rotates the pair. Admin can manage
  availability/blocks via `?staff_id=` (staff still self-only). Pay blocked on
  completed/no-show; retry keeps the first txn id. Admin customers/activity/reviews
  endpoints batched. Staff nav uses `Link`s; `Th` has `scope="col"`; processing timer is
  re-render safe; cash flow requires the real reservation number (fake-ref path removed);
  `BookingConfirmed` guards empty items + shows the discount row; loyalty member id
  derives from the real user id; referral tile explains via toast; 9 new regression tests
  (`test_saas_guards.py`). Package renamed to `blush-studio-frontend`.
- **Verified**: `pytest` **47/47 pass**, `tsc + vite build` clean, live probes for envelope,
  rotation, coupons, status gates, role gates, admin availability.
- **Accepted (documented, not changed)**: `@sundara.in` seed/test identities, `sundara_*`
  localStorage keys (renaming logs everyone out), public catalog/availability enumeration
  (storefront needs it), staff access to customer notes/activity (ops-intended).
