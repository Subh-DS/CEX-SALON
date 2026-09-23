"""Build Blush Studio 12-slide technical deck (16:9, white minimal)."""
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN

PLUM = RGBColor(0x3B, 0x20, 0x38)
INK = RGBColor(0x21, 0x1D, 0x20)
MUTED = RGBColor(0x75, 0x6C, 0x70)
ROSE = RGBColor(0xB8, 0x6F, 0x78)
BORDER = RGBColor(0xE7, 0xDF, 0xDA)
SOFT = RGBColor(0xFA, 0xF7, 0xF2)
WHITE = RGBColor(0xFF, 0xFF, 0xFF)
GREEN = RGBColor(0x47, 0x7A, 0x63)

prs = Presentation()
prs.slide_width = Inches(13.333)
prs.slide_height = Inches(7.5)
BLANK = prs.slide_layouts[6]


def bg(slide, color=WHITE):
    fill = slide.background.fill
    fill.solid()
    fill.fore_color.rgb = color


def textbox(slide, l, t, w, h):
    return slide.shapes.add_textbox(Inches(l), Inches(t), Inches(w), Inches(h)).text_frame


def para(tf, text, size=16, bold=False, color=INK, font="Calibri", align=None, space_after=Pt(4)):
    p = tf.add_paragraph() if len(tf.paragraphs) > 0 and tf.paragraphs[0].text != "" else tf.paragraphs[0]
    p.text = ""
    run = p.add_run()
    run.text = text
    run.font.size = Pt(size)
    run.font.bold = bold
    run.font.color.rgb = color
    run.font.name = font
    if align is not None:
        p.alignment = align
    p.space_after = space_after
    p.space_before = Pt(0)
    p.level = 0
    return p


def bullets(tf, items, size=14):
    for it in items:
        p = tf.add_paragraph()
        p.text = ""
        run = p.add_run()
        run.text = it
        run.font.size = Pt(size)
        run.font.color.rgb = INK
        run.font.name = "Calibri"
        p.space_after = Pt(5)
        p.space_before = Pt(0)
        p.level = 0


def header(slide, eyebrow, title):
    bg(slide)
    tf = textbox(slide, 0.6, 0.25, 12.1, 0.5)
    para(tf, eyebrow, size=12, bold=True, color=ROSE, font="Calibri")
    tf2 = textbox(slide, 0.6, 0.65, 12.1, 0.9)
    para(tf2, title, size=30, bold=True, color=PLUM, font="Georgia")
    # hairline
    from pptx.util import Emu
    shape = slide.shapes.add_shape(1, Inches(0.6), Inches(1.55), Inches(12.1), Pt(1))
    shape.fill.solid()
    shape.fill.fore_color.rgb = BORDER
    shape.line.fill.background()
    return slide


def body_box(slide, l=0.6, t=1.8, w=12.1, h=5.1):
    return textbox(slide, l, t, w, h)


def add_table(slide, l, t, w, rows, cols, col_widths=None):
    tbl_shape = slide.shapes.add_table(len(rows), len(cols), Inches(l), Inches(t), Inches(w), Inches(2))
    tbl = tbl_shape.table
    if col_widths:
        for i, cw in enumerate(col_widths):
            tbl.columns[i].width = Inches(cw)
    for ri, row in enumerate(rows):
        for ci, val in enumerate(row):
            cell = tbl.cell(ri, ci)
            cell.text = ""
            p = cell.text_frame.paragraphs[0]
            run = p.add_run()
            run.text = str(val)
            run.font.size = Pt(12 if ri else 13)
            run.font.bold = (ri == 0)
            run.font.name = "Calibri"
            run.font.color.rgb = WHITE if ri == 0 else INK
            if ri == 0:
                cell.fill.solid()
                cell.fill.fore_color.rgb = PLUM
            elif ri % 2 == 0:
                cell.fill.solid()
                cell.fill.fore_color.rgb = SOFT
    # auto height
    tbl_shape.height = Inches(0.42 * len(rows))
    return tbl_shape


# ---------------- Slide 1: Cover ----------------
s = prs.slides.add_slide(BLANK)
bg(s)
tf = textbox(s, 0.8, 0.5, 11.7, 0.6)
para(tf, "SALON SERVICE BOOKING  &  LOYALTY PLATFORM  •  ENGINEERING DESIGN REVIEW",
     size=13, bold=True, color=ROSE)
tf = textbox(s, 0.8, 1.15, 7.5, 2.2)
para(tf, "The Blush Studio", size=54, bold=True, color=PLUM, font="Georgia", space_after=Pt(2))
para(tf, "One platform. One seamless salon journey.", size=20, color=MUTED, font="Georgia")
tf = textbox(s, 0.8, 3.6, 7.5, 1.0)
para(tf, "Discover  →  Book  →  Pay  →  Experience  →  Earn  →  Redeem",
     size=15, bold=True, color=INK)
tf = textbox(s, 0.8, 4.8, 7.5, 1.6)
para(tf, "Presented by Subhankar Das", size=16, bold=True, color=INK)
para(tf, "B.Tech – Computer Science & Engineering, Centurion University", size=14, color=MUTED)
para(tf, "Full-stack product engineering project  •  React + FastAPI + PostgreSQL", size=13, color=MUTED)
# right strip
box = s.shapes.add_shape(1, Inches(8.9), Inches(0.5), Inches(3.6), Inches(6.5))
box.fill.solid(); box.fill.fore_color.rgb = PLUM
box.line.fill.background()
tf = box.text_frame
tf.word_wrap = True
para(tf, "STACK", size=13, bold=True, color=ROSE)
for line in ["React 18.3 + TypeScript 5.5", "Vite 5 + Tailwind 3", "FastAPI 0.116 + SQLAlchemy 2.0",
             "PostgreSQL / SQLite + Alembic", "JWT + bcrypt", "47 backend tests passing"]:
    para(tf, "•  " + line, size=14, color=WHITE)

# ---------------- Slide 2: Overview ----------------
s = header(prs.slides.add_slide(BLANK), "02  •  PROJECT OVERVIEW", "One Journey, Three Consoles")
tf = body_box(s)
bullets(tf, [
    "Full-stack platform for the salon visit: discover → book → pay → experience → earn → redeem.",
    "Six-step booking wizard: service → expert → date → time → review → payment, with live availability.",
    "Customer app: visits, Glow Points, rewards, reviews, history.  Staff console: schedule, availability, blocks, completions, guest notes.  Admin console: catalogue, rewards, customers, reviews, analytics.",
    "Loyalty engine: 1 pt/₹10, +50 per review; tiers Seed 0 / Bloom 500 / Flourish 1500 / Radiance 4000; GLOW-XXX redeem codes.",
    "Simulated checkout (UPI, Luhn-validated card, cash): safe demo — nothing stored, no real money.",
])

# ---------------- Slide 3: Problem ----------------
s = header(prs.slides.add_slide(BLANK), "03  •  PROBLEM & REQUIREMENTS", "Fragmentation on Both Sides of the Chair")
tf = body_box(s)
bullets(tf, [
    "Customers: availability uncertainty, manual/phone booking, no appointment history, split cash-first payments, no reward tracking.",
    "Salon: manual diary, double-booking conflicts, customer data scattered across conversations, money tracked by hand, loyalty run from memory.",
    "Consequence: lost rebookings, unmeasured demand, zero retention signal for owners.",
    "Approach: one connected lifecycle — Customer → Booking → Payment → Visit → Loyalty → Retention.",
    "Leads to FR-01…FR-11 plus six non-functional requirements (slide 8). Only domain-observed pains; nothing speculative.",
])

# ---------------- Slide 4: Stakeholders ----------------
s = header(prs.slides.add_slide(BLANK), "04  •  STAKEHOLDERS & USER JOURNEY", "Who Acts, How They Move")
tf = body_box(s)
bullets(tf, [
    "CUSTOMER: discover services, pick professionals, book, pay, cancel/reschedule, earn points, redeem rewards, submit reviews.",
    "STAFF: weekly availability, time-off blocks, own appointments, status transitions, guest notes, personal analytics.",
    "ADMIN: service catalogue, rewards, customers, bookings monitor, review feedback, operational analytics.",
    "Guards: RequireAuth + RequireRole(customer, staff, admin); uniform 401/403 JSON envelope on every API.",
    "Journey: Discover → Select → Schedule → Review → Pay → Visit → Earn → Redeem → Return.",
    "System actors: FastAPI backend, relational DB, mock payment service, JWT auth. Notifications / chatbot / multi-branch: absent (stated).",
])

# ---------------- Slide 5: Loyalty ----------------
s = header(prs.slides.add_slide(BLANK), "05  •  LOYALTY & REWARD SYSTEM", "The Retention Engine, Honestly Labelled")
add_table(s, 0.6, 1.9, 5.4,
          [["Tier", "Lifetime earnings"], ["Seed", "0"], ["Bloom", "500"], ["Flourish", "1,500"], ["Radiance", "4,000"]],
          ["a", "b"], col_widths=[2.4, 3.0])
tf = textbox(s, 6.4, 1.9, 6.3, 5.1)
bullets(tf, [
    "Earn floor(Amount / ₹10) per completed visit, credited idempotently per booking reference.",
    "Review bonus +50, idempotent per review; completed visits only.",
    "Referral +200 exists as a code constant but no flow uses it — parked, not claimed.",
    "Flow: balance → tier progress → reward discovery → redeem dialog → GLOW-XXX code.",
    "Short balance: requirement shown with earn path; nothing deducted (422 INSUFFICIENT_POINTS).",
    "Redeem checks balance + stock, decrements atomically, flips card to Redeemed.",
], size=13)

# ---------------- Slide 6: Booking & Payment ----------------
s = header(prs.slides.add_slide(BLANK), "06  •  BOOKING & PAYMENT EXPERIENCE", "Six Steps In, Confirmed Booking Out")
tf = body_box(s)
bullets(tf, [
    "Wizard 01 Service → 02 Expert (filtered by service) → 03 Date → 04 live 30-minute Time slots → 05 Review (sticky summary) → 06 Payment.",
    "UPI: ID regex + Verify → verified chip → Pay; Scan & Pay demo QR; GPay/PhonePe/Paytm/BHIM text buttons (no logos).",
    "Card: live brand preview (Visa/MC/Amex/RuPay), 4-digit grouping, Luhn + expiry + CVV validation, show/hide CVV; submit blocked until valid.",
    "Cash: amount-due panel, no card/UPI fields; success shows real reservation number and “Total due at salon”.",
    "Coupons BLUSH100 (flat ₹100) / WELCOME20 (20%) validated server-side; only {booking_id, coupon_code} is posted — card/UPI data never leaves the page.",
    "States: processing overlay (~2 s) → success card (amount, booking ID, txn, Add-to-calendar) → failure card (Try again keeps data, Change method).",
], size=13)

# ---------------- Slide 7: FRs ----------------
s = header(prs.slides.add_slide(BLANK), "07  •  FUNCTIONAL REQUIREMENTS", "Eleven Requirements, All Implemented")
add_table(s, 0.6, 1.9, 12.1,
          [["ID", "Requirement", "Implementation"],
           ["FR-01", "Authentication", "JWT 15-min access + rotating 7-day refresh, bcrypt"],
           ["FR-02", "Service discovery", "Catalogue + categories + professionals API"],
           ["FR-03", "Availability", "30-min grid from hours, bookings, blocks"],
           ["FR-04", "Appointment booking", "Validated create, SND-000123 numbering"],
           ["FR-05", "Payment", "UPI / card / cash UI, mock provider, ALREADY_PAID 409"],
           ["FR-06", "Cancel / reschedule", "Eligibility gates per status"],
           ["FR-07", "Lifecycle", "Pending → Confirmed → In Progress → Completed"],
           ["FR-08", "Loyalty", "1 pt/₹10, +50 review, idempotent ledger"],
           ["FR-09", "Redemption", "Balance + stock checks, GLOW-XXX codes"],
           ["FR-10", "Reviews", "Completed visits only, one per booking"],
           ["FR-11", "Staff & admin ops", "Dedicated consoles + analytics"]],
          ["a", "b", "c"], col_widths=[1.3, 3.6, 7.2])

# ---------------- Slide 8: Process flow ----------------
s = header(prs.slides.add_slide(BLANK), "08  •  END-TO-END PROCESS FLOW", "The System on One Slide")
tf = body_box(s)
bullets(tf, [
    "Login (JWT) → browse → service → expert → date → time → availability over 30-min grid (busy items, blocks, working hours; past slots marked taken).",
    "◆ Gate: conflict → 409 BOOKING_CONFLICT → reselect; outside hours → 422; blocked staff → 409.",
    "Create SND-000123 appointment (pending items + history row) → booking summary with coupon preview.",
    "Checkout (UPI/card/cash) → server-side coupon math → net charge → pending flips to Confirmed; failure retries with booking intact.",
    "Staff chain Confirmed → In Progress → Completed → idempotent loyalty credit → tier update.",
    "◆ Gate: eligible → redeem GLOW code; else hold balance → rebook loop closes the journey.",
], size=13)

# ---------------- Slide 9: Architecture ----------------
s = header(prs.slides.add_slide(BLANK), "09  •  SYSTEM ARCHITECTURE", "Versions, Guards, Honest Limits")
tf = body_box(s)
bullets(tf, [
    "Client: React 18.3, TS strict, Vite 5, Tailwind 3, Router v6, TanStack Query v5 (server cache + invalidation on mutations).",
    "API: /api/v1 routers per domain (auth, catalog, availability, bookings, loyalty, payments, reviews, transitions, admin); Pydantic v2 validation; uniform success/error envelope; 401/403 guards.",
    "Services: booking (slot builder + SND sequencing), payments mock (server math), loyalty (idempotent credits), reviews (+50 bonus), transitions (state machine).",
    "Data: PostgreSQL via asyncpg; SQLite via aiosqlite for local dev; Alembic 0001 + conditional 0003 (coupons); batched reads, no N+1.",
    "Auth edge: single-flight token refresh on 401 with pair rotation; non-dev boot refuses default JWT secret.",
    "Externals: payment simulated; notifications/chatbot absent; local Vite + uvicorn run — no hosting or CI (stated).",
], size=13)

# ---------------- Slide 10: DB + Security ----------------
s = header(prs.slides.add_slide(BLANK), "10  •  DATABASE & SECURITY", "Integrity by Constraint, Security by Gate")
tf = body_box(s)
bullets(tf, [
    "24 tables: identity (users, customer/staff profiles) · salon (salons, branches, categories, services, staff_services, availability, blocks) · bookings (bookings +coupon, items, status_history, payments, number_seq) · loyalty (accounts, tiers, transactions, rewards, redemptions, reviews; referrals/notifications/offers unused — stated).",
    "Relations are FK columns; no ORM relationships declared. Integrity: SND sequence row; unique (staff_id, start_time); one payment and one review per booking; unique GLOW codes; idempotent ledger references.",
    "States enforced server-side: appointment Pending→Confirmed→Completed | Cancelled (no-show terminal); payment Pending→Successful|Failed; loyalty Earned→Updated→Eligible→Redeemed.",
    "Validation: inputs, slots, staff-service fit, payments, coupons, balances, reviews. Envelope on every endpoint: 401 auth · 403 authorization · 404 missing · 409 conflict (BOOKING_CONFLICT, ALREADY_PAID, REVIEW_EXISTS) · 422 validation (incl. INVALID_COUPON, INSUFFICIENT_POINTS).",
], size=12)

# ---------------- Slide 11: Testing ----------------
s = header(prs.slides.add_slide(BLANK), "11  •  TESTING & VALIDATION", "Measured Proof, Not Claims")
tf = body_box(s)
bullets(tf, [
    "47 pytest tests over ASGI httpx — ALL PASSING: envelope shapes (401/403/422), coupon math/apply/reject, role gates (incl. staff-cannot-review), status gates (pay-completed blocked, cross-user 403), idempotency (points retry, review bonus), loyalty accrual + tiers, redemption (short-balance 422, code issued), reviews, transitions, staff isolation, analytics, availability/blocks roundtrips, serialization.",
    "Unit: loyalty math and tier thresholds in isolation (test_loyalty.py).",
    "Gates on every change: tsc --noEmit + vite build (frontend) · pytest (backend).",
    "Manual: full customer/staff journeys, responsive layouts, error copy. No UI automation — stated plainly.",
    "Findings: server owns money math; idempotency prevents replays; one envelope unifies all errors; parked referral and absent notifications documented, not hidden.",
], size=13)

# ---------------- Slide 12: Outcome ----------------
s = header(prs.slides.add_slide(BLANK), "12  •  OUTCOME & ROADMAP", "Done, Proven, What's Next")
tf = body_box(s)
bullets(tf, [
    "SHIPPED: 6-step booking wizard · simulated UPI/card/cash checkout with server coupons · loyalty engine (points, tiers, codes, ledger) · staff + admin consoles · 47 green tests · strict gates.",
    "PROPOSED (never as done): reminders, advanced scheduling, realtime notifications, analytics depth, recommendations/offers, multi-branch, per-branch RBAC, observability + logging, CI pipeline, mobile app.",
    "The Blush Studio — One platform. One seamless salon journey.",
    "Discover → Book → Pay → Experience → Earn → Redeem.",
    "Presented by Subhankar Das.",
])

prs.save(r"C:\DEV\SALON\Blush-Studio-Technical-Deck.pptx")
print("saved OK")
