"""Build full technical Word doc for the Blush Studio platform."""
from docx import Document
from docx.shared import Pt, Inches, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH

PLUM = RGBColor(0x3B, 0x20, 0x38)
INK = RGBColor(0x21, 0x1D, 0x20)

doc = Document()
for section in doc.sections:
    section.left_margin = Inches(0.9)
    section.right_margin = Inches(0.9)

style = doc.styles["Title"]
style.font.size = Pt(30)
style.font.color.rgb = PLUM
style.font.name = "Georgia"
for h in ("Heading 1", "Heading 2"):
    st = doc.styles[h]
    st.font.color.rgb = PLUM
    st.font.name = "Georgia"
doc.styles["Normal"].font.name = "Calibri"
doc.styles["Normal"].font.size = Pt(11)


def h1(t):
    doc.add_heading(t, level=1)


def h2(t):
    doc.add_heading(t, level=2)


def bullets(items):
    for it in items:
        doc.add_paragraph(it, style="List Bullet")


def table(headers, rows):
    t = doc.add_table(rows=1 + len(rows), cols=len(headers))
    t.style = "Table Grid"
    for i, htxt in enumerate(headers):
        c = t.rows[0].cells[i]
        c.text = ""
        r = c.paragraphs[0].add_run()
        r.text = htxt
        r.bold = True
    for ri, row in enumerate(rows, start=1):
        for ci, val in enumerate(row):
            t.rows[ri].cells[ci].text = str(val)
    doc.add_paragraph("")


def note(t):
    p = doc.add_paragraph()
    r = p.add_run(t)
    r.italic = True
    r.font.color.rgb = RGBColor(0x75, 0x6C, 0x70)


# ---------- Cover ----------
doc.add_heading("The Blush Studio", level=0)
doc.add_paragraph("Salon Service Booking & Loyalty Platform — Complete Technical Documentation")
doc.add_paragraph("Presented by Subhankar Das · B.Tech CSE, Centurion University")
doc.add_paragraph("Source of truth: the repository. Hypotheses labelled. Nothing invented.")
doc.add_page_break()

# ---------- Contents ----------
h1("Contents")
for i, t in enumerate([
    "1. Product Definition", "2. Actors & Access Control", "3. Frontend Inventory",
    "4. Backend Endpoint Catalog", "5. Business Rules (Exact Values)", "6. Auth & Security",
    "7. Data Model & State Management", "8. End-to-End Process Flows", "9. Error Catalog",
    "10. Testing & Validation", "11. Deployment & Configuration", "12. Honest Gaps & Future Work",
    "13. Appendix: Repo Map & Demo Accounts",
], start=1):
    doc.add_paragraph(t)

# ---------- 1 ----------
h1("1. Product Definition")
bullets([
    "Full-stack platform for the salon visit: discover → book → pay → experience → earn → redeem.",
    "Three domains: Customer app, Staff console, Admin console — one FastAPI backend, one relational database.",
    "Frontend: React 18.3 + TypeScript 5.5 (strict) + Vite 5 + Tailwind 3 + React Router v6 + TanStack Query v5 + Framer Motion + lucide-react. (react-hook-form and zod are installed but UNUSED.)",
    "Backend: FastAPI 0.116 + Pydantic v2 + SQLAlchemy 2.0 (async) + Alembic + PyJWT + bcrypt.",
    "Database: PostgreSQL (asyncpg, production-ready); SQLite via aiosqlite (local dev). Migrations 0001 + 0003 (coupons) + 0004 (tier seed).",
    "Quality gates: tsc --noEmit + vite build; 47 backend pytest tests passing.",
    "Run locally: .\\run-all.ps1 (backend :8000 + frontend :5173); .\\run-all.ps1 -SkipInstall for restarts.",
    "Payments are a SIMULATED demo checkout (UPI ID/apps/QR, Luhn-validated card, cash). Mock provider; nothing stored; no real money.",
])

# ---------- 2 ----------
h1("2. Actors & Access Control")
table(["Actor", "Does", "Consoles / routes", "Guard"], [
    ["Customer", "books, pays, earns, redeems, reviews", "/book /dashboard /loyalty /rewards", "RequireAuth, customer role"],
    ["Staff", "schedule, availability, blocks, completions, notes", "/staff/* (9 pages)", "staff or admin role"],
    ["Admin", "catalogue, rewards, customers, reviews, analytics", "/admin/* (6 pages)", "admin role only"],
    ["Backend / DB / mock payments / JWT auth", "system actors", "/api/v1/*", "get_current_user / require_role"],
])
doc.add_paragraph("API envelope (every response): success → {success:true, data, meta}; "
                  "failure → {success:false, error:{code, message, details}}. "
                  "401/403 use HTTP_401/HTTP_403; bad bodies → VALIDATION_ERROR (422).")

# ---------- 3 ----------
h1("3. Frontend Inventory")
h2("3.1 Routes (30 total)")
table(["Path", "Page", "Access"], [
    ["/", "Landing (hero, services, experts, loyalty teaser)", "public"],
    ["/services, /services/:id", "Catalogue + detail", "public"],
    ["/login, /signup", "Auth with brand panel", "public"],
    ["/book", "6-step booking wizard", "login"],
    ["/dashboard", "My visits (reschedule, cancel, review)", "login"],
    ["/loyalty", "Glow Points (balance, tiers, rewards, ledger)", "login"],
    ["/rewards", "Rewards shelf", "login"],
    ["/staff/login … /staff/analytics", "9 staff pages (overview→analytics)", "staff+admin"],
    ["/admin … /admin/reviews", "6 admin pages (overview→reviews)", "admin"],
])
h2("3.2 Booking wizard")
doc.add_paragraph("0 Service → 1 Expert (filtered by service) → 2 Date → 3 Time (live GET /availability, "
                  "30-min grid) → 4 Review (sticky summary) → 5 Pay (UPI/card/cash + coupon + processing + "
                  "success/failed). Reserve-then-pay: booking created at step 4→5. Back-navigation reuses the "
                  "reservation (no duplicates); changed selections invalidate it.")
h2("3.3 Payment UI")
bullets([
    "Method radio-cards (UPI default); only the active form renders.",
    "UPI: ID regex + Verify → verified chip → Pay; Scan & Pay demo QR; GPay/PhonePe/Paytm/BHIM text buttons (no logos).",
    "Card: live brand preview (Visa/MC/Amex/RuPay), 4-digit grouping, Luhn + expiry + CVV, show/hide CVV; submit blocked until valid.",
    "Cash: amount-due panel, no card/UPI fields; success shows the real reservation number.",
    "Summary: salon, service, professional, date, time, duration, breakdown (service + add-ons − coupon + tax 0), promo field, trust row.",
    "Only {booking_id, coupon_code} is posted — card/UPI details never leave the page.",
])
h2("3.4 Loyalty UI")
bullets([
    "Animated count-up balance; membership card (tier, balance, member id, hover shine).",
    "Tier progress bar, tier journey table, upgrade banner (only on real change), next-reward spotlight.",
    "Reward states: Redeem / “X away” / Locked / Redeemed; redeem dialog with cost, after-balance and GLOW-XXX code + particles.",
    "Earn cards (visit, review, referral-note); date-grouped ledger with new-entry highlight; aria-live toasts.",
    "Reduced-motion respected throughout.",
])
h2("3.5 Forms, loading, responsive")
doc.add_paragraph("Native inputs + manual validators (login, signup, review stars, notes, service/reward editors, "
                  "UPI/card/coupon). Skeletons per area, per-query pending text, busy button labels, empty states "
                  "with CTAs, role=alert errors with retry. Mobile: bottom action bar, hamburger navs, sticky pay "
                  "buttons, responsive grids; desktop stepper + sticky rails.")

# ---------- 4 ----------
h1("4. Backend Endpoint Catalog (all under /api/v1, plus GET /health)")
table(["Endpoint", "Role", "Purpose"], [
    ["POST /auth/register, /login, /refresh; GET /auth/me", "public/any", "Customer auth + rotating token pair"],
    ["GET /services, /services/categories, /staff", "public", "Catalogue (optional filters)"],
    ["GET /availability", "public", "Slot grid (?staff_id&date&service_id)"],
    ["GET/PUT /staff/availability; GET/POST/DELETE /staff/blocks", "staff (+admin via ?staff_id=)", "Hours + time-off"],
    ["POST /bookings; GET /bookings; GET /bookings/{id}; POST …/cancel", "scoped", "Validated create; ownership-scoped reads/cancel"],
    ["POST /bookings/{id}/status; …/reschedule", "staff/admin; scoped", "State machine; ownership-checked reschedule"],
    ["GET /loyalty/account, /transactions", "customer", "Balance/tier + 50-row ledger"],
    ["GET /loyalty/rewards, /tiers", "public", "Catalog + tier definitions"],
    ["POST /loyalty/rewards/{id}/redeem", "customer", "Balance/stock check → deduct → GLOW code"],
    ["POST /payments {booking_id, coupon_code?}", "owner-only", "Server coupon math → net charge → confirm"],
    ["POST /reviews (customer-only); GET /reviews/me", "scoped", "Completed-only, one per booking, +50"],
    ["GET /admin/* (overview, analytics, customers, rewards, reviews, activity)", "admin (+staff reads)", "Batched ops reads"],
    ["PUT /admin/customers/{id}/notes; POST/PUT services|rewards; POST /admin/staff", "admin/staff; admin", "Notes, catalog, staff provisioning"],
])

# ---------- 5 ----------
h1("5. Business Rules (Exact Values)")
bullets([
    "Slots: 30-minute grid; emitted while start + duration ≤ work end; busy = active items (pending/confirmed/in_progress) + blocks; past-today slots unavailable. Seed hours Mon–Sat 09:00–19:00.",
    "Booking numbers SND-000123 via booking_number_seq; initial status pending + history row.",
    "Statuses: pending→{confirmed,cancelled}; confirmed→{in_progress,cancelled,no_show}; in_progress→{completed,no_show}; terminals locked. Reschedule: pending/confirmed only.",
    "Loyalty: floor(amount/10) per completed visit; review +50 (idempotent per review); tiers Seed 0 / Bloom 500 / Flourish 1500 / Radiance 4000 (lifetime earnings).",
    "Coupons (server-side): BLUSH100 flat ₹100 (capped); WELCOME20 20% (rounded, capped); unknown → INVALID_COUPON 422; stored as coupon_code + discount_amount.",
    "Payments: mock always succeeds; net = total − discount; one row per booking (MOCK-{number}, first txn id kept); pending→confirmed promotion. Blocked: cancelled/completed/no-show (422), paid (409 ALREADY_PAID), чужой booking (403).",
    "Reviews: completed only (422), one per booking (409 REVIEW_EXISTS).",
    "Idempotency: ledger unique (reference_type, reference_id); unique (staff_id, start_time); payment-row reuse; unique redemption codes; stock decrement when set.",
    "Price math: subtotal = service + add-ons; discount = coupon; tax = 0; total = subtotal − discount.",
])

# ---------- 6 ----------
h1("6. Auth & Security")
bullets([
    "bcrypt hashing; JWT HS256; access {sub, role, type:access} 15 min; refresh {sub, type:refresh} 7 days, rotated each use (no revocation list — stated limit).",
    "get_current_user enforces access-type + active user; require_role(*roles) → 403; register hardcodes customer; all identity from tokens.",
    "Frontend: single-flight 401→refresh→retry with pair re-store; envelope guard on data.",
    "Prod guard: non-development boot refuses the shipped default JWT secret. Secrets in untracked .env only.",
])

# ---------- 7 ----------
h1("7. Data Model & State Management (24 tables)")
bullets([
    "Identity: users, customer_profiles (internal notes), staff_profiles.",
    "Salon: salons, branches, service_categories, services, staff_services, staff_availability, staff_blocks.",
    "Bookings: bookings (+coupon_code, +discount_amount), booking_items, booking_status_history, payments, booking_number_seq.",
    "Loyalty: loyalty_accounts, loyalty_tiers, loyalty_transactions, rewards, reward_redemptions, reviews; referrals/notifications/offers tables exist but are UNUSED (stated).",
    "Honest ORM note: relations are FK columns; no ORM relationships declared; list reads are batched (no N+1).",
    "Integrity: SND sequence; unique (staff_id,start_time); one payment and one review per booking; unique GLOW codes.",
    "States (server-enforced): appointment Pending→Confirmed→Completed | Cancelled (no-show terminal); payment Pending→Successful|Failed; loyalty Earned→Updated→Eligible→Redeemed.",
])

# ---------- 8 ----------
h1("8. End-to-End Process Flows")
h2("8.1 Book → pay")
doc.add_paragraph("Login → browse → service → expert (filtered) → date → live slot grid → conflict/blocks/hours gate "
                  "(409 BOOKING_CONFLICT → reselect) → create SND-000123 → summary (+coupon preview) → checkout → "
                  "server coupon math → net charge → Confirmed → staff transitions → Completed → loyalty (§8.3). "
                  "Payment failure → booking intact → retry/switch method.")
h2("8.2 Cash flow")
doc.add_paragraph("To summary → cash panel (no card/UPI fields) → Confirm → success card with real reservation number "
                  "and amount due → View booking (“Total due at salon”).")
h2("8.3 Loyalty earn + redeem")
doc.add_paragraph("Completion → idempotent floor(total/10) credit → balance/tier update → nearest-goal spotlight → "
                  "redeem dialog (cost, after-balance) → deduct → GLOW-XXX code → card Redeemed → toast → highlighted "
                  "ledger row. Short balance → requirement shown, nothing deducted.")
h2("8.4 Review / cancel / reschedule")
doc.add_paragraph("Review: completed visit → stars → duplicate 409 → +50 bonus. Cancel: ownership-checked, blocked when "
                  "completed/cancelled. Reschedule: pending/confirmed only, future slot re-validated.")

# ---------- 9 ----------
h1("9. Error Catalog (Real Codes)")
table(["Code", "HTTP", "When → UX"], [
    ["HTTP_401 / INVALID_TOKEN", "401", "Missing/expired token → silent refresh, else re-login (selections kept)"],
    ["HTTP_403 / FORBIDDEN", "403", "Wrong role or чужой booking → message + back option"],
    ["VALIDATION_ERROR", "422", "Bad body → field details surfaced"],
    ["EMAIL_TAKEN", "409", "Duplicate register → inline error"],
    ["BOOKING_CONFLICT", "409", "Slot taken → reselect prompt"],
    ["OUTSIDE_WORKING_HOURS / STAFF_UNAVAILABLE / INVALID_SERVICE_STAFF", "422/409", "Bad slot combo → guided correction"],
    ["INVALID_STATUS (+TRANSITION)", "422", "Illegal transition or pay → reason shown"],
    ["ALREADY_PAID", "409", "Double pay → treated as success"],
    ["INVALID_COUPON", "422", "Unknown code → inline coupon error"],
    ["INSUFFICIENT_POINTS", "422", "Short balance (needed shown) → earn path"],
    ["REVIEW_EXISTS", "409", "Second review → ledger unchanged"],
    ["OUT_OF_STOCK", "409", "Exhausted reward"],
    ["NOT_FOUND", "404", "Missing row (incl. deleted service/staff) — never a 500"],
])

# ---------- 10 ----------
h1("10. Testing & Validation (Measured Only)")
bullets([
    "47 pytest tests over ASGI httpx — ALL PASSING: test_api, test_auth, test_bookings, test_loyalty (unit math+tiers), test_redemption, test_reviews, test_transitions, test_saas_guards (envelope, coupons, role/status gates, idempotency), test_staff_portal (points, bonus idempotency, isolation, activity, analytics roles), test_stage8 (analytics, notes, CRUD, roundtrips), test_deploy_ops (staff provisioning, admin bootstrap).",
    "Gates: tsc --noEmit + vite build (frontend); pytest (backend).",
    "Manual: full customer/staff journeys, responsive layouts, error copy. No UI automation — stated.",
    "Findings: server owns money math; idempotency prevents replays; one envelope unifies errors; parked referral and absent notifications documented.",
])

# ---------- 11 ----------
h1("11. Deployment & Configuration")
bullets([
    "Topology: static frontend (Vite dist) + FastAPI Docker + managed Postgres. render.yaml encodes it; docs/DEPLOY.md is the runbook.",
    "Backend boot runs alembic upgrade head (0001→0004: schema, coupons, tier seed), then uvicorn; /health probe.",
    "Env: ENV, DATABASE_URL (postgres:// auto-normalized to +asyncpg; SQLite dev default), JWT_SECRET (generated, gitignored), CORS_ORIGINS (exact frontend origin), ADMIN_EMAIL (first-admin bootstrap), VITE_API_BASE_URL (baked at frontend build).",
    "Post-deploy: register owner → promote via ADMIN_EMAIL → POST /admin/staff for stylists → create services/rewards in Admin console (rewards start empty; tiers auto-seed). Never run seed_dev on prod; never commit .env.",
    "Rollback: redeploy previous image; migrations are additive and re-runnable. Single uvicorn worker suffices for launch.",
])

# ---------- 12 ----------
h1("12. Honest Gaps & Future Work")
bullets([
    "Absent (stated, not hidden): hosting/CI/Docker-in-use, notifications/reminders, chatbot, multi-branch, per-branch RBAC, UI automation, realtime channel, refresh revocation list.",
    "Parked: referral +200 constant (unwired); referrals/notifications/offers tables (unused); react-hook-form + zod installed but unused.",
    "Proposed / Future (never as done): reminders, advanced scheduling, realtime notifications, analytics depth, recommendations/offers, multi-branch, per-branch RBAC, observability/logging, CI pipeline, mobile app.",
])

# ---------- 13 ----------
h1("13. Appendix: Repo Map & Demo Accounts")
bullets([
    "frontend/src: api/, components/{admin,auth,booking,common,decor,landing,loyalty,payment,staff,ui,visits}, context/, data/, layouts/, pages/{admin,customer,staff}/, routes/, styles/, types/.",
    "backend/app: api/v1/*, core/*, db/*, models/*, repositories/*, schemas/*, services/*. backend/tests/*. backend/alembic/versions/0001,0003,0004.",
    "Key files: run-all.ps1 (launcher), render.yaml + backend/Dockerfile (deploy), docs/DEPLOY.md (runbook), full-audit.md (audit + fix log), sppt.md + ppt-content.md (slide sources).",
    "Demo (dev database only — never publish): customer priya@example.com / customer123; staff ananya@sundara.in / staff1234; admin admin@sundara.in / admin1234. Coupons to try: BLUSH100, WELCOME20.",
])

doc.save(r"C:\DEV\SALON\Blush-Studio-Full-Documentation.docx")
print("saved OK")
