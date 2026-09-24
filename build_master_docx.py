"""Build the master CX + Technical DOCX case study."""
from docx import Document
from docx.shared import Pt, Inches, RGBColor

PLUM = RGBColor(0x3B, 0x20, 0x38)
INK = RGBColor(0x21, 0x1D, 0x20)
MUTED = RGBColor(0x75, 0x6C, 0x70)

doc = Document()
for section in doc.sections:
    section.left_margin = Inches(0.9)
    section.right_margin = Inches(0.9)
doc.styles["Title"].font.size = Pt(28)
doc.styles["Title"].font.color.rgb = PLUM
doc.styles["Title"].font.name = "Georgia"
for h in ("Heading 1", "Heading 2", "Heading 3"):
    doc.styles[h].font.color.rgb = PLUM
    doc.styles[h].font.name = "Georgia"
doc.styles["Normal"].font.name = "Calibri"
doc.styles["Normal"].font.size = Pt(11)


def h1(t): doc.add_heading(t, level=1)
def h2(t): doc.add_heading(t, level=2)
def h3(t): doc.add_heading(t, level=3)
def p(t, bold=False, italic=False):
    pg = doc.add_paragraph()
    r = pg.add_run(t)
    r.bold = bold
    r.italic = italic
    return pg
def bullets(items):
    for it in items:
        doc.add_paragraph(it, style="List Bullet")
def label(t):
    pg = doc.add_paragraph()
    r = pg.add_run(t)
    r.bold = True
    r.italic = True
    r.font.color.rgb = MUTED
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

# ================= COVER =================
doc.add_heading("SALON — Customer Experience & Rewards Platform", level=0)
p("A User-Centered Digital Salon Experience Combining Service Booking, Payments, Loyalty, and Customer Engagement", bold=True)
p("The Blush Studio · Full-stack product engineering project")
p("Stack: React 18.3 + TypeScript 5.5 + Vite 5 + Tailwind 3 · FastAPI 0.116 + SQLAlchemy 2.0 async · PostgreSQL / SQLite · JWT + bcrypt")
p("Presented by Subhankar Das · B.Tech CSE, Centurion University · September 2026 · v1.0")
doc.add_page_break()

# ================= 3 EXEC SUMMARY =================
h1("1. Executive Summary")
p("The Blush Studio platform digitizes the complete salon customer journey — discovering services, "
  "booking with a chosen expert, paying (UPI / card / cash), and earning Glow Points that convert into "
  "rewards. Traditional salon visits end at payment with no retained relationship; this platform turns each "
  "completed visit into loyalty balance, tier progress, and a reason to rebook.")
p("For customers: live availability, transparent pricing, booking history, and visible reward value. "
  "For the business: a staff console (schedule, blocks, completions, guest notes), an admin console "
  "(catalogue, rewards, customers, reviews, analytics), and a loyalty ledger that drives repeat visits. "
  "Technically: a versioned REST API with a uniform success/error envelope, role-based access, "
  "server-side money math, idempotent loyalty credits, and 47 passing backend API tests.")
p("Unlike a basic booking form, booking, payment, and loyalty share one appointment key in one relational "
  "database, so confirmation, charges, points, and rewards stay consistent.")

# ================= 4 PROBLEM =================
h1("2. Problem Statement")
h2("2.1 Customer problems")
bullets(["Availability uncertainty — no live view of when an expert is free.",
         "Manual/phone booking with no confirmation record.",
         "No centralized appointment history across visits.",
         "Split cash-first payments with no status tracking.",
         "No structured reward tracking after the visit.",
         "Weak post-service engagement — the relationship ends at checkout."])
h2("2.2 Business problems")
bullets(["Manual diary and double-booking conflicts.",
         "No loyalty mechanism to bring customers back.",
         "No customer insights (who visits, what sells, who lapses)."])
h2("2.3 Operational problems")
bullets(["Staff hours and time-off managed informally; completions and guest notes untracked.",
         "Catalogue (services, prices, rewards) has no single editable source."])
h2("2.4 Digital-experience problems")
bullets(["No responsive self-service: customers cannot book, pay, or track rewards online.",
         "Payment and loyalty live in separate, inconsistent mental models."])

# ================= 5 VISION =================
h1("3. Product Vision")
p("Salon Visit → Digital Experience → Reward → Retention → Repeat Visit. The reward mechanism makes the "
  "appointment the start of a continuing relationship: every completed visit increases balance and tier "
  "progress, every reward shows its code and value, and every redemption is one tap from the next booking.")

# ================= 6 TARGET USERS =================
h1("4. Target Users")
h2("4.1 Customer")
bullets(["Goals: book the right expert at a convenient slot; pay easily; see rewards grow.",
         "Needs: live availability, transparent prices, confirmation proof, reward visibility.",
         "Pain: uncertainty, waiting, lost history, invisible loyalty value.",
         "Motivation: self-care plus tangible returns (points, tiers, codes).",
         "Behavior: mobile-first, books evenings/weekends, returns to favourite experts.",
         "Expectation: salon visit handled like modern e-commerce checkout."])
h2("4.2 Salon staff")
bullets(["Needs: own schedule at a glance; weekly hours and time-off control; one-tap status transitions; guest notes.",
         "Implemented in: StaffOverview, StaffDashboard (+AvailabilityTab), StaffAppointments(/:id), StaffCustomers(/:id), StaffAnalytics."])
h2("4.3 Administrator")
bullets(["Needs: catalogue, rewards, customers, reviews, analytics in one console.",
         "Implemented in: AdminOverview/Bookings/Customers/Services/Rewards/Reviews."])

# ================= 7 PERSONAS =================
h1("5. User Personas")
label("Design personas created for UX analysis — not real customers; no user-research dataset exists in the repository.")
h2("5.1 Priya, 28 — repeat customer")
bullets(["Marketing executive, books on mobile after work.", "Goals: favourite expert, fast rebook, visible points.",
         "Frustrations: fully-booked Saturdays, lost visit history.", "Expects: confirmation ID, points after each visit."])
h2("5.2 Ananya, 34 — stylist")
bullets(["Manages 6–8 appointments daily.", "Goals: accurate diary, controlled hours, guest context before arrival.",
         "Frustrations: no-shows, schedule changes by phone.", "Expects: one-tap status changes, blockable time off."])
h2("5.3 Salon owner-admin, 40s")
bullets(["Goals: full diary, repeat-visit rate, measurable rewards.", "Frustrations: unknown top services, unmeasured loyalty.",
         "Expects: analytics, editable catalogue and rewards."])

# ================= 8 UCD =================
h1("6. User-Centered Design")
h2("6.1 User research (honest scope)")
p("No documented user-research dataset was found in the repository. The problems below are inferred from the "
  "implemented flows (availability grid, confirmation IDs, ledger, redeem dialog). User research is a proposed "
  "validation activity rather than documented research performed during development.")
h2("6.2 Needs → features")
table(["Need", "Feature", "Where"], [
    ["Know when experts are free", "Live 30-min slot grid", "StepTime / GET /availability"],
    ["Trust the booking", "SND-000123 confirmation + summary", "StepReview, BookingConfirmed"],
    ["Pay my way", "UPI / card / cash + coupon", "StepPayment, POST /payments"],
    ["See rewards grow", "Animated balance, tiers, ledger", "Loyalty page, GET /loyalty/*"],
    ["Redeem simply", "Dialog with cost, after-balance, code", "RewardsSection"],
    ["Manage my visits", "Reschedule, cancel, review, rebook", "CustomerDashboard"],
])
h2("6.3 Goals and feedback")
p("User goals map 1:1 to the six-step wizard and loyalty loop. No in-app feedback channel exists (Proposed: "
  "post-visit rating prompts already partially exist via the 5-star review flow, which is implemented).")

# ================= 9 DESIGN THINKING =================
h1("7. Design Thinking Process")
h2("7.1 Empathize"); p("Pain points inferred from flow coverage: uncertainty, waiting, lost history, invisible rewards.")
h2("7.2 Define"); p("Problem statements: (1) customers cannot self-serve the full visit online; (2) salons retain no visit/points data; (3) payment and loyalty are disconnected.")
h2("7.3 Ideate"); p("One appointment key joining catalogue, schedule, payment, and ledger; three consoles; mock-safe checkout; idempotent loyalty.")
h2("7.4 Prototype"); p("Implemented UI in frontend/src: 30 routes, booking wizard, checkout, loyalty dashboard, staff/admin consoles — this IS the working prototype.")
h2("7.5 Test"); p("Evidence: 47 backend API tests + strict type/build gates + manual journey passes (see § Testing). Recommended next: usability sessions, UI automation, analytics instrumentation.")

# ================= 10 JOURNEY MAP =================
h1("8. Customer Journey Map")
table(["Stage", "Goal", "Action", "Touchpoint", "Emotion*", "Pain", "Product response"], [
    ["Awareness", "Find salon", "Land on site", "Landing", "Curiosity", "Generic choice", "Brand + loyalty teaser"],
    ["Discovery", "Compare options", "Browse menu", "Services catalogue", "Interest", "Too many options", "Categories, pricing"],
    ["Selection", "Pick ritual+expert", "Choose cards", "Service detail", "Confidence", "Unknown expert", "Ratings, specialties"],
    ["Booking", "Reserve slot", "Pick date/time", "Slot grid", "Control", "Slot taken", "Live grid, 409 reselect"],
    ["Confirmation", "Proof", "Review + pay", "Summary/checkout", "Trust→relief", "Pay failure", "States + retry intact"],
    ["Visit", "Get service", "Arrive", "Salon desk", "Assurance", "Waiting", "Status tracking"],
    ["Reward", "See value", "Open loyalty", "Balance/tiers", "Motivation", "Unclear value", "Count-up, progress"],
    ["Redemption", "Save money", "Redeem dialog", "Code screen", "Delight", "Short balance", "Requirement + earn path"],
    ["Repeat", "Return", "One-tap rebook", "Dashboard", "Loyalty", "Friction", "Prefilled flow"],
])
label("* Emotions are design hypotheses, not measured data.")

# ================= 11 TOUCHPOINTS =================
h1("9. Customer Touchpoint Analysis")
table(["Touchpoint", "Objective / interaction", "Emotion", "UX risk → opportunity"], [
    ["Landing", "Orient; hero + menu + experts", "Curiosity", "Overload → curated sections"],
    ["Services / detail", "Compare price, duration, expert", "Confidence", "Jargon → plain descriptions"],
    ["Staff select", "Choose trusted expert", "Trust", "No availability hint → per-expert slots (Proposed)"],
    ["Date/time grid", "Reserve exact slot", "Control", "Taken slots → live states + reselect"],
    ["Review summary", "Verify before commit", "Assurance", "Surprise fees → coupon-transparent totals"],
    ["Checkout", "Pay UPI/card/cash", "Trust", "Failure fear → explicit states, intact booking"],
    ["Confirmation", "Keep proof", "Relief", "Lost proof → SND ID + dashboard row"],
    ["Dashboard", "Manage visits", "Control", "Dead ends → reschedule/cancel/review/rebook on every row"],
    ["Loyalty page", "Watch value grow", "Motivation", "Stale feel → animated balance, fresh ledger highlight"],
    ["Redeem dialog", "Claim reward", "Delight", "Accidental spend → cost + after-balance + confirm"],
    ["Login/signup", "Access + identity", "Security", "Session loss → refresh rotation, selections kept"],
    ["Notifications", "Reminders, offers", "—", "ABSENT → Proposed: reminders + offers"],
])

# ================= 12 KANO =================
h1("10. Kano Model Analysis")
label("Design-analysis-based classification — no Kano survey was conducted.")
table(["Feature", "Category", "Reason", "Impact"], [
    ["Auth, browse, schedule, confirm, history", "Must-be", "Expected basics", "Absence causes churn"],
    ["Live slots, inline validation, sticky summary", "One-dimensional", "Better = more satisfaction", "Fewer failed bookings"],
    ["Points, tiers, GLOW codes, animations", "Attractive", "Unexpected delight", "Repeat visits"],
    ["Recommendations, offers, reminders", "Attractive (Proposed)", "Not yet built", "Future uplift"],
    ["Branch picker, multi-salon", "Indifferent (scoped out)", "Single-salon product", "No effect now"],
    ["Forced re-login on token expiry", "Reverse (avoided)", "Refresh rotation implemented", "Satisfaction preserved"],
])

# ================= 13 CX STRATEGY =================
h1("11. Customer Experience Strategy")
h2("Functional value"); p("Self-serve booking with live truth; one checkout for three rails; full visit history.")
h2("Emotional value"); p("Count-up balance, tier progress, unlock particles, confirmation IDs — confidence made visible.")
h2("Economic value"); p("1 pt/₹10 + 20%-or-₹100 coupons + redeemable rewards = perceived money; codes work at the salon desk.")
h2("Relationship value"); p("Service → Transaction → Reward → Recognition (tier) → Retention: the ledger remembers every visit.")
# ================= 14 LOYALTY =================
h1("12. Loyalty & Reward System (Core Mechanism)")
p("Why it matters for salons: completed visits already happened — converting them into balance costs nothing "
  "upfront and buys the next visit. Exact implemented formula: floor(amount / 10) points per completed booking, "
  "+50 per review (idempotent per review), tiers from lifetime earnings: Seed 0 / Bloom 500 / Flourish 1500 / "
  "Radiance 4000. Redemption checks balance + stock, deducts, issues a unique GLOW-XXX code, decrements stock; "
  "short balances get INSUFFICIENT_POINTS with the exact shortfall. Displayed on: membership card, hero balance, "
  "tier progress, next-reward spotlight, rewards grid, date-grouped ledger with new-row highlight. Behavior effect: "
  "visible progress + near-goal glow pulls customers toward the next threshold. Future (Proposed, not built): tiered "
  "multipliers, referral rewards (constant defined, unwired), birthday rewards, streaks, personalized offers.")

# ================= 15 BUSINESS MODEL =================
h1("13. Business Model (Separated: Current vs Proposed)")
h2("Value proposition"); p("One self-serve visit with visible rewards (current).")
h2("Segments"); p("Customers, stylists, owner-admin (current). Multi-branch chains (proposed).")
h2("Revenue opportunities (ALL PROPOSED — no pricing exists)")
bullets(["Service booking commission", "Salon SaaS subscription", "Premium membership tiers",
         "Partner promotions / offers", "Loyalty-driven repeat purchases"])
h1("14. Business Model Canvas")
table(["Block", "Current implementation", "Proposed"], [
    ["Key partners", "— (single demo salon)", "Payment gateway, SMS/push vendors"],
    ["Key activities", "Booking, checkout, loyalty ops", "Marketing, multi-branch ops"],
    ["Key resources", "Codebase, seed catalogue, test suite", "Salon network, brand"],
    ["Value props", "Self-serve + visible rewards", "Personalization, reminders"],
    ["Relationships", "Ledger + tiers + codes", "Segments, campaigns"],
    ["Segments", "Customers, staff, admin", "Chains, partners"],
    ["Channels", "Responsive web app", "Mobile app, notifications"],
    ["Costs", "Dev time; mock payments = zero fees", "Hosting, gateway fees, support"],
    ["Revenue", "None implemented", "Commission, subscription, premium"],
])
h1("15. Value Proposition Canvas")
table(["Customer jobs", "Pains", "Gains"], [
    ["Book the right expert fast", "Uncertainty, phone tag", "Confirmation ID + history"],
    ["Pay conveniently", "Cash-only habits", "UPI/card/cash + status"],
    ["Feel rewarded", "Invisible loyalty", "Balance, tiers, GLOW codes"],
])
table(["Products", "Pain relievers", "Gain creators"], [
    ["Wizard + live grid", "Reselect flow, 409 guidance", "Sticky summary, rebook"],
    ["Checkout + coupons", "Intact booking on failure", "Server-validated savings"],
    ["Loyalty engine", "Requirement shown on shortfall", "Progress, glow, particles"],
])

# ================= 16 UI/UX ANALYSIS =================
h1("16. UI/UX Design Analysis (need → decision → effect)")
table(["User need", "Design decision (observed)", "Expected effect"], [
    ["Orientation", "Plum/rose/ivory system, Playfair + Inter, 12px cards", "Premium calm, readable hierarchy"],
    ["Wayfinding", "Navbar + role consoles + stepper + breadcrumbs of progress", "Never lost in 6 steps"],
    ["Effort", "Sticky summary, sticky mobile pay, prefilled rebook", "Fewer abandons"],
    ["Trust", "Explicit processing/success/failure cards, SND + GLOW codes", "Confidence at money moments"],
    ["Feedback", "Skeletons, busy labels, toasts, role=alert errors, empty CTAs", "No silent states"],
    ["Delight", "Count-ups, progress animation, shine sweep, unlock particles", "Reward feels rewarding"],
    ["Access", "Labelled inputs, focus rings, aria-live regions, reduced-motion support", "Wider usability"],
])

# ================= 17 IA =================
h1("17. Information Architecture")
p("Home → Services → Service detail → Book (service/expert/date/time/review/pay) → Dashboard (visits) → "
  "Loyalty (balance/tiers/rewards/ledger) → Rewards shelf. Staff: Overview → Schedule → Appointments → "
  "Customers → Services → Loyalty → Analytics. Admin: Overview → Bookings → Customers → Services → Rewards → "
  "Reviews. Guards (RequireAuth/RequireRole) make auth state part of navigation: deep links survive login via "
  "post-login redirect; wrong roles land home.")

# ================= 18 FLOWS =================
h1("18. User Flows")
h2("Flow 1 — New customer"); p("Landing → Services → detail → /book → 6 steps → pay → confirmation → dashboard row.")
h2("Flow 2 — Returning"); p("Login → dashboard → rebook (prefilled) or loyalty → redeem → book with code at desk.")
h2("Flow 3 — Reward journey"); p("Complete → points → ledger highlight → spotlight progress → dialog → GLOW code → desk.")
h2("Flow 4 — Payment"); p("Summary → method tab → validate → processing → success (booking ID, txn, calendar) / failure (retry intact).")

# ================= 19 ARCHITECTURE =================
h1("19. System Architecture")
p("Browser (React 18.3 SPA, TanStack Query cache) → HTTPS JSON → FastAPI routers (/api/v1 per domain) → "
  "service modules (booking, payments mock, loyalty, reviews, transitions, availability, admin, ops) → "
  "SQLAlchemy 2.0 async → PostgreSQL (asyncpg) / SQLite (aiosqlite) → 19→24 tables. Cross-cutting: JWT auth, "
  "Pydantic v2 validation, uniform envelope, single-flight refresh, Alembic migrations. No cache layer, queue, "
  "or realtime channel (stated).")

# ================= 20 TECH STACK =================
h1("20. Technology Stack (Verified Only)")
table(["Layer", "Technology", "Purpose"], [
    ["Frontend", "React 18.3 + TS 5.5 strict + Vite 5", "Typed SPA + wizard"],
    ["Styling/motion", "Tailwind 3, Framer Motion, lucide-react", "Design system + animation + icons"],
    ["Routing/state", "Router v6, TanStack Query v5", "Guards + server cache"],
    ["Backend", "FastAPI 0.116 + Pydantic v2", "Versioned REST + validation"],
    ["ORM/migrations", "SQLAlchemy 2.0 async + Alembic", "Models + versioned schema"],
    ["Database", "PostgreSQL / SQLite", "Prod / local dev"],
    ["Auth", "PyJWT + bcrypt", "15-min access, rotating 7-day refresh"],
    ["Run", "uvicorn; run-all.ps1; Docker + render.yaml", "Dev launcher + deploy artifacts"],
    ["Docs/design", "Canva decks, SVG diagrams, design-system-board", "Presentation assets"],
])
p("NOT used despite being nearby: react-hook-form/zod (installed, unused), MongoDB/Firebase/Express/Node "
  "backend (absent), WebSocket/push (absent), Docker-in-use/CI/hosting (absent).")

# ================= 21 FRONTEND IMPL =================
h1("21. Frontend Implementation")
bullets([
    "Component architecture: pages → feature components (booking/payment/loyalty/visits) → ui primitives (Button/Card/Input/Badge) → decor/common.",
    "Routing: BrowserRouter + RequireAuth/RequireRole guards + three layouts (customer/staff/admin).",
    "State: TanStack Query (retry 1, 60 s stale, invalidation on mutations) + local useState + AuthContext; single-flight 401→refresh→retry in apiFetch.",
    "API integration: apiFetch envelope client (throws {code,message}); per-domain hooks (bookings, loyalty, admin).",
    "Forms: native inputs + manual validators (UPI regex, Luhn/expiry/CVV, coupon lookup); tried-flag error display.",
    "Responsive: breakpoints, mobile bottom bar, hamburger/pill navs, sticky pay buttons; reduced-motion support.",
    "Animations: Framer Motion variants (fadeUp/popIn), count-ups, progress tweens, shine/particles (motion-safe only).",
])

# ================= 22 BACKEND IMPL + API TABLE =================
h1("22. Backend Implementation & API Reference")
table(["Method", "Endpoint", "Purpose → output"], [
    ["POST", "/auth/register|/login|/refresh; GET /auth/me", "Customer auth + rotating pair → tokens/user"],
    ["GET", "/services, /services/categories, /staff", "Catalogue → lists"],
    ["GET", "/availability", "Slot grid → {date, slots[]}"],
    ["GET/PUT", "/staff/availability (+?staff_id= admin)", "Hours CRUD"],
    ["GET/POST/DELETE", "/staff/blocks(+/{id})", "Time-off CRUD"],
    ["POST/GET", "/bookings, /bookings/{id}, …/cancel", "Create (validated) / scoped reads / cancel"],
    ["POST", "/bookings/{id}/status|/reschedule", "State machine / re-validation"],
    ["GET", "/loyalty/account|/transactions|/rewards|/tiers", "Balance, ledger, catalog, tiers"],
    ["POST", "/loyalty/rewards/{id}/redeem", "Deduct → GLOW code"],
    ["POST", "/payments", "Server coupon math → net charge → confirm"],
    ["POST/GET", "/reviews, /reviews/me", "Customer-only review +50 → refs"],
    ["GET/PUT/POST", "/admin/* (11 routes)", "Ops reads, notes, catalog, staff provisioning"],
])
p("Controllers are thin routers; logic lives in services (booking, loyalty, coupons, ops); repositories hold slot/availability queries; "
  "schemas validate every body (422 VALIDATION_ERROR); errors use ApiError + envelope handlers.")

# ================= 23 DATA MODEL =================
h1("23. Database / Data Model (24 tables)")
p("Identity: users, customer_profiles, staff_profiles. Salon: salons, branches, service_categories, services, "
  "staff_services, staff_availability, staff_blocks. Bookings: bookings (+coupon_code, +discount_amount), "
  "booking_items, booking_status_history, payments, booking_number_seq. Loyalty: loyalty_accounts, loyalty_tiers, "
  "loyalty_transactions, rewards, reward_redemptions, reviews. Declared but unused: referrals, notifications, offers. "
  "Relations are FK columns without ORM relationships; integrity via unique constraints (slot, payment, review, codes), "
  "the SND sequence row, and idempotent ledger references.")

# ================= 24 DATA FLOW =================
h1("24. Data Flow")
p("Customer → React form → apiFetch (+JWT) → Pydantic validation → guard/ownership → service math → batched SQLAlchemy "
  "writes → commit → envelope {data} → Query cache update → UI rerender + toast. Reward flow: completion event → "
  "idempotent credit → balance/tier update → ledger row → spotlight progress → redeem dialog → code.")

# ================= 25 SECURITY =================
h1("25. Security (Implemented vs Recommended)")
h2("Implemented")
bullets(["bcrypt hashing; JWT HS256 with 15-min access + rotating 7-day refresh; active-user checks.",
         "Per-route roles + ownership checks (customer-own, staff-own, admin); cross-user pay/review blocked.",
         "Pydantic validation on every body; envelope errors leak no internals; secrets in untracked .env; "
         "prod guard refuses default JWT secret; exact-origin CORS."])
h2("Recommended (not implemented)")
bullets(["Refresh revocation list; rate limiting; audit log table; Pagerduty-style alerting (no observability); "
         "per-branch RBAC; PII minimization review; dependency scanning in CI."])

# ================= 26 PAYMENTS =================
h1("26. Payment Experience (UX + Technical)")
bullets([
    "UX: three method tabs; UPI verify-then-pay + QR + app buttons; card preview with live validation; cash panel with no sensitive fields; summary with coupon preview; processing → success (IDs + calendar) / failure (retry intact); trust row stating demo-only.",
    "Technical: POST /payments {booking_id, coupon_code?}; server derives amount, validates coupon, stores discount, blocks cancelled/completed/no-show + double-pay (409), reuses payment row keeping first txn id; promotes pending→confirmed + items + history.",
    "EXPLICIT: mock provider — no Razorpay/Stripe/PhonePe integration, no real money, nothing stored.",
])

# ================= 27 A11Y =================
h1("27. Accessibility (Observed vs Recommended)")
h2("Observed")
bullets(["Labelled inputs with aria-invalid/describedby; radiogroup/tablist/dialog semantics; aria-live toasts/ledger; focus rings; focus management in dialogs (focus + Esc); reduced-motion disables particles/shine/tilt; 44px+ touch targets."])
h2("Recommended")
bullets(["Full keyboard walkthrough audit; screen-reader pass on wizard; contrast-ratio measurements; skip-link; announced step changes."])

# ================= 28 RESPONSIVE =================
h1("28. Responsive Design")
p("Observed: Tailwind breakpoints (sm/md/lg/xl grids); mobile bottom action bar with safe-area; hamburger (staff) and "
  "pill navs (admin); sticky mobile pay buttons; single-column stacking of wizard + summary; desktop stepper + sticky "
  "rails. Verified by layout code and manual passes; no device-lab measurements claimed.")

# ================= 29 PERFORMANCE =================
h1("29. Performance (No Benchmarks — Analysis + Plan)")
bullets([
    "Observed efficiencies: batched list serialization (no N+1); Query cache (60 s stale, no window-focus refetch); Vite code-split vendor warning acknowledged (single ~590 KB gzip ~165 KB bundle).",
    "No measured timings claimed. Recommended measurements: Lighthouse (FCP/LCP/TTI), API p50/p95 per route, DB slow-query log, bundle budget in CI, image sizing audit (11 local JPGs, largest ~200 KB).",
])

# ================= 30 TESTING =================
h1("30. Testing & Validation (Evidence-Based)")
table(["Test ID (file)", "Feature", "Scenario → expected", "Status"], [
    ["test_api", "Health/auth/catalog", "200s + 401 gating", "Passed"],
    ["test_auth", "Identity/roles", "me, role isolation, overview", "Passed"],
    ["test_bookings", "Booking", "Create, double-book 409, invalid 422", "Passed"],
    ["test_loyalty", "Math (unit)", "floor/10, tier thresholds", "Passed"],
    ["test_redemption", "Redeem", "Short 422, 300→20 + code, 404", "Passed"],
    ["test_reviews", "Reviews", "Bonus +50, pending rejected", "Passed"],
    ["test_transitions", "Lifecycle", "Pay-confirms, chain, conflict", "Passed"],
    ["test_saas_guards", "Envelope/guards", "Shapes, coupons, 403s, idempotency", "Passed"],
    ["test_staff_portal", "Ops", "Points, isolation, activity, roles", "Passed"],
    ["test_stage8", "Admin", "Analytics, notes, CRUD, roundtrips", "Passed"],
    ["test_deploy_ops", "Deploy ops", "Staff provision, bootstrap", "Passed"],
    ["UI automation", "Frontend", "—", "NOT AUTOMATED (manual passes)"],
    ["tests/e2e", "E2E", "Empty directory", "ABSENT"],
])
p("Suite result at generation time: 47 backend tests passing (includes UI-less API coverage). Frontend: tsc + build gates only.")

# ================= 31 EDGE CASES =================
h1("31. Edge Cases & Handling Map")
bullets([
    "Slot taken → 409 + reselect; past slots marked unavailable; outside hours/blocked → 422/409 guidance.",
    "Payment failure → booking intact → retry/switch; double-pay → ALREADY_PAID success path; completed/no-show → 422.",
    "Cancel/reschedule gated by status + ownership; back-navigation reuses reservation (no duplicates).",
    "Loyalty replay → reference guard; double review → 409; short balance/coupon → 422 with requirement; stock-out → 409.",
    "Expired session → silent refresh → re-login with selections kept; network drop → preserved state + idempotent retry.",
    "Deleted service/staff on old bookings → honest 404 (never 500); empty states + skeletons for zero-data screens.",
])

# ================= 32 FEASIBILITY =================
h1("32. Feasibility Analysis (Qualitative — No Market Data Invented)")
h2("Technical"); p("Proven: versioned stack, local end-to-end runs, Postgres-ready driver, re-runnable migrations. Missing: hosting, CI, observability.")
h2("Operational"); p("Customer wizard, staff diary/blocks/notes, admin catalog/analytics all working; guest/staff onboarding needs the new provision endpoints (built).")
h2("Economic"); p("Dev cost ~zero (mock payments, SQLite); prod needs hosting + Postgres + gateway fees when real payments land. No prices projected.")
h2("Market"); p("Positioned against fragmented phone/cash salons and booking-only apps; integration (book+pay+loyalty) is the differentiator. No demand statistics claimed.")
h2("Scalability"); p("Supports growth via stateless API + relational store; needs workers, caching, read replicas, and multi-branch modeling before scale. Current single worker suffices for launch.")

# ================= 33 SWOT =================
h1("33. SWOT (Strengths/Weaknesses Observed; Opportunities/Threats = Analysis)")
table(["", "Helpful", "Harmful"], [
    ["Internal", "S: working full loop; server-owned money math; idempotency; 47 tests; strict gates", "W: mock payments; no notifications; single worker; no UI automation; parked referral"],
    ["External", "O (analysis): gateway integration; reminders; mobile app; multi-branch SaaS", "T (analysis): incumbents; salon tech resistance; gateway compliance burden"],
])

# ================= 34 KPIs =================
h1("34. Product Metrics / KPIs (Defined, NOT Measured)")
label("No analytics pipeline exists; these are definitions for future instrumentation.")
bullets(["Customer: booking conversion, repeat-booking rate, retention, redemption rate, lifetime value, average booking value.",
         "UX: task completion, abandonment, time-to-book, error rate, satisfaction (needs survey).",
         "Business: revenue per customer, visit frequency, loyalty engagement. None measured — admin/analytics endpoints exist as the future source."])

# ================= 35 SUCCESS CRITERIA =================
h1("35. Design Success Criteria")
bullets(["A first-time customer completes booking + payment without help.",
         "Balance, tier, and next reward are understood within seconds of opening Loyalty.",
         "Payment outcome (success/failure/due) is never ambiguous.",
         "Reward code redeems at the desk without staff confusion.",
         "Staff complete daily ops without phone/paper fallbacks."])

# ================= 36 ROADMAP =================
h1("36. Implementation Roadmap (Implemented vs Future)")
table(["Phase", "Scope", "Status"], [
    ["1 Core product", "Booking, checkout, loyalty, consoles", "IMPLEMENTED"],
    ["2 UX enhancement", "Toasts, skeletons, animations, empty states", "IMPLEMENTED"],
    ["3 Loyalty enhancement", "Tiers, spotlight, upgrade banner, ledger", "IMPLEMENTED"],
    ["4 Analytics", "Admin/staff analytics endpoints + pages", "IMPLEMENTED (basic)"],
    ["5 Personalization", "Recommendations, offers, segments", "PROPOSED"],
    ["6 Scalability", "Multi-branch, realtime, CI, observability, mobile", "PROPOSED"],
])

# ================= 37 FUTURE =================
h1("37. Future Enhancements (All Proposed)")
bullets(["AI service recommendations; personalized offers; loyalty tier multipliers; referral system (wiring the constant); push + reminders; segmentation; predictive retention; advanced analytics; multi-salon + per-branch RBAC; membership plans; automated marketing; review/recommendation engine; mobile app."])

# ================= 38 ENG DECISIONS =================
h1("38. Engineering Decisions")
for title, reason, alt, trade, result in [
    ("React 18 + TS strict", "Typed component wizard with guard rails", "Vue/Svelte", "Heavier toolchain", "Fewer runtime bugs; tsc gate"),
    ("FastAPI + SQLAlchemy async", "Python speed of dev; async DB", "Express/Django", "Python hosting maturity", "47 tested endpoints fast"),
    ("PostgreSQL (+SQLite dev)", "Relational integrity for money/points", "MongoDB/Firebase", "Schema rigidity", "Constraints prevent bad states"),
    ("Mock payments", "Safe demo, zero gateway", "Razorpay now", "No real revenue path yet", "Honest, shippable demo"),
    ("REST + envelope", "Uniform client handling", "tRPC/GraphQL", "More boilerplate", "One error path everywhere"),
    ("Server-owned loyalty math", "Client can't forge points", "Client calc", "Extra endpoint work", "Audit-safe ledger"),
    ("Alembic conditional migrations", "Re-runnable fresh/dev/prod", "Auto-generate only", "Hand-written care", "Verified 0001→0004"),
]:
    h2(title)
    bullets([f"Reason: {reason}", f"Alternative: {alt}", f"Trade-off: {trade}", f"Result: {result}"])

# ================= 39 DESIGN DECISIONS =================
h1("39. Design Decisions (Problem → Solution → Impact → Trade-off)")
for title, prob, sol, imp, trade in [
    ("Six-step wizard", "Long form overwhelms", "One decision per screen + stepper", "Completion confidence", "More clicks, less load"),
    ("Sticky summary + pay", "Price anxiety mid-flow", "Always-visible totals + coupon", "Fewer abandons", "Screen space cost"),
    ("Explicit pay states", "Failure fear", "Processing/success/failure cards", "Trust at money moments", "Extra screens"),
    ("Animated loyalty", "Invisible value", "Count-ups, progress, particles", "Motivation to return", "Motion cost (reduced-motion respected)"),
    ("Redeem dialog math", "Accidental spend fear", "Cost + after-balance + confirm", "Safe redemption", "One more tap"),
    ("Role consoles", "One UI fits none", "Customer/staff/admin layouts", "Each role is fast", "Triple UI surface"),
]:
    h2(title)
    bullets([f"Problem: {prob}", f"Solution: {sol}", f"Impact: {imp}", f"Trade-off: {trade}"])

# ================= 40 CX→TECH MAPPING =================
h1("40. Customer Experience → Technical Implementation Mapping")
table(["Requirement", "UX solution", "Feature", "Technical implementation"], [
    ["Book easily", "6-step wizard + live grid", "Booking module", "GET /availability, POST /bookings, slot builder"],
    ["Trust the result", "Summary + SND confirmation", "Review + confirm", "Sequence row, history row, envelope"],
    ["Pay confidently", "Explicit states + retry", "Checkout", "POST /payments, ALREADY_PAID path"],
    ["See recognition", "Card, tiers, spotlight", "Loyalty dashboard", "GET /loyalty/*, count-up UI"],
    ["Return often", "Points + codes + glow", "Rewards + ledger", "Redeem endpoint, GLOW codes, toasts"],
])

# ================= 41 TRACEABILITY =================
h1("41. Requirements Traceability Matrix")
table(["Req", "Need", "Feature", "UI", "Backend", "DB", "Status"], [
    ["FR-01", "Secure access", "Auth", "Login/signup", "/auth/*, JWT+bcrypt", "users", "Tested"],
    ["FR-02/03", "Find + pick", "Catalog + availability", "Services, wizard 0–3", "/services, /availability", "services, availability", "Tested"],
    ["FR-04", "Reserve", "Booking", "Review step", "POST /bookings", "bookings+items", "Tested"],
    ["FR-05", "Pay", "Checkout", "StepPayment", "POST /payments", "payments", "Tested"],
    ["FR-06", "Change plans", "Manage visits", "Dashboard", "cancel/reschedule", "status_history", "Tested"],
    ["FR-07", "Track visit", "Lifecycle", "Status displays", "transitions", "status_history", "Tested"],
    ["FR-08/09", "Earn + redeem", "Loyalty", "Loyalty/Rewards", "loyalty service/endpoints", "ledger/redemptions", "Tested"],
    ["FR-10", "Be heard", "Reviews", "Stars form", "POST /reviews +50", "reviews", "Tested"],
    ["FR-11", "Operate", "Consoles", "Staff/admin pages", "/admin/*, availability mgmt", "All tables", "Tested"],
])

# ================= 42 LIFECYCLE =================
h1("42. Product Life Cycle (Where We Are)")
p("Research (inferred, proposed formal) → Problem definition (done) → Requirements FR-01…FR-11 (done) → "
  "UX design (implemented) → Architecture (implemented) → Implementation (working app) → Testing (47 API tests, "
  "manual UI) → Deployment (artifacts ready: Dockerfile, render.yaml, DEPLOY.md; not yet hosted) → "
  "Feedback (proposed instrumentation) → Iteration (roadmap §36). Current position: late implementation, "
  "pre-deployment, pre-feedback.")

# ================= 43 CONCLUSION =================
h1("43. Conclusion")
p("The platform is a customer-experience-oriented system, not a booking form: service interaction, payment, and "
  "loyalty share one appointment key, one envelope, and one ledger. Design decisions are traceable to needs, "
  "engineering decisions to trade-offs, and every claim above to code or an explicit label. The honest gaps — "
  "notifications, real payments, multi-branch, UI automation — are the roadmap, not hidden debt.")

# ================= 44 APPENDICES =================
h1("Appendix A — Project Structure")
p("frontend/src: api/, components/{admin,auth,booking,common,decor,landing,loyalty,payment,staff,ui,visits}/, "
  "context/, data/, layouts/, pages/{admin,customer,staff}/, routes/, styles/, types/. backend/app: api/v1/*, "
  "core/*, db/*, models/*, repositories/*, schemas/*, services/*. backend/tests/* (11 files). backend/alembic/ "
  "(0001, 0003, 0004). Root: run-all.ps1, render.yaml, docs/DEPLOY.md, full-audit.md, sppt.md, ppt-content.md.")
h1("Appendix B — API Reference")
p("See §22 table: 30+ routes across auth, catalog, availability, bookings, transitions, loyalty, payments, "
  "reviews, admin. Envelope: {success, data, meta} / {success:false, error:{code,message,details}}.")
h1("Appendix C — Database Entities")
p("See §23: 24 tables in four clusters; FK-column relations; key constraints listed.")
h1("Appendix D — User Flows")
p("See §18: new-customer, returning, reward-journey, and payment flows with screens and states.")
h1("Appendix E — Design Analysis")
p("System: plum/rose/ivory tokens; Playfair + Inter; 12px cards; soft shadows. Motion: fadeUp/popIn variants, "
  "count-ups, progress tweens (reduced-motion safe). States: skeletons, toasts, role=alert errors, empty CTAs. "
  "Images: 11 local JPGs (hero, interior, 6 services, 3 staff). Icons: lucide-react.")
h1("Appendix F — Glossary")
table(["Term", "Meaning"], [
    ["CX / UX / UCD", "Customer / User experience / User-centered design"],
    ["Kano model", "Feature classification: must-be, performance, attractive, indifferent, reverse"],
    ["Touchpoint", "Any customer–system contact emitting data"],
    ["Loyalty ledger", "Append-only points transaction history"],
    ["Idempotent", "Safe to retry without double effects"],
    ["Envelope", "Uniform API response shape"],
    ["RBAC", "Role-based access control"],
    ["KPI / MVP", "Key metric / Minimum viable product"],
    ["Alembic", "SQLAlchemy migration tool"],
    ["ASGI / JWT", "Async server interface / signed token auth"],
])

doc.save(r"C:\DEV\SALON\Salon_Customer_Experience_and_Technical_Documentation.docx")
print("saved OK")

