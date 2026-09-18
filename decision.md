# Decision Log — Salon Booking & Loyalty Platform

> This file records every significant architectural, UX, UI, technical, database, copy, and product decision. Each entry documents the decision, reasoning, alternatives, trade-offs, and status.

---

## Decision: Brand Name — Sundara (सुन्दरा)

### Decision
The platform will be named **Sundara** — meaning "beautiful" in Sanskrit.

### Reason
- Authentic Indian origin (Sanskrit) without being stereotypical
- One word, 3 syllables — memorable and premium
- Phonetically pleasant in English and Indian languages
- Directly relevant to beauty/wellness industry
- Works internationally without cultural friction
- Domain-available variants likely (sundara.in, getsundara.com)
- Future-proof for expansion (skincare, wellness, lifestyle)

### Alternatives
| Name | Meaning | Why Rejected |
|------|---------|-------------|
| Luxya | Luxury + Ya (Hindi suffix) | Less natural, sounds contrived |
| Gaia Beauty | Earth goddess | Not Indian-specific, generic |
| GlowVault | Glow + storage | Sounds like a fintech product |
| Prakriti | Nature | Too philosophical for a booking platform |
| Rangoli | Traditional art | Too decorative, not premium enough |
| Mehandi | Henna | Too narrow — only one service |
| Kaya | Body (Sanskrit) | Existing brand (Kaya Skin Clinic) |
| Alembic | Vessel | Too abstract |

### Feasibility
High — no technical dependencies.

### Trade-offs
- The name doesn't immediately communicate "salon booking" — but that's what the tagline and UI handle
- May need to educate on pronunciation initially — but "Sun-da-ra" is intuitive

### Status
**Accepted** — Primary brand name.

---

## Decision: Tagline

### Decision
Primary tagline: **"Your beauty, your time."**

### Reason
- Communicates two core value props: beauty services + convenience/booking
- Short, clean, human
- Works on mobile, desktop, print
- Avoids AI-slop language ("transform your glow journey✨")

### Alternatives
| Tagline | Why Rejected |
|---------|-------------|
| "Book Your Glow" | Too stylistic, less clear |
| "Premium Beauty, Simplified" | Sounds like a SaaS product |
| "Where Beauty Meets Excellence" | Generic, forgettable |
| "Your Next Appointment Awaits" | Only about booking, misses beauty |

### Status
**Accepted**

---

## Decision: Color System — "Warm Sandstone"

### Decision
Primary palette based on warm, earthy Indian tones:

```
Primary:        #8B5E3C (Warm Sienna — terracotta warmth)
Primary Light:  #C4956A (Sandstone Gold)
Primary Dark:   #5D3A1A (Deep Umber)
Secondary:      #D4A574 (Muted Gold)
Background:     #FDF8F4 (Warm Ivory)
Surface:        #FFFFFF (Clean White)
Surface Warm:   #FAF3ED (Warm Surface)
Text:           #2C1810 (Deep Brown)
Text Muted:     #8B7355 (Muted Brown)
Border:         #E8DDD4 (Warm Border)
Success:        #5B8C5A (Muted Green)
Warning:        #C4842D (Amber)
Error:          #B84444 (Muted Red)
Accent:         #9B2C2C (Deep Maroon — sparingly)
```

### Reason
- Warm ivory base avoids the cold "SaaS white"
- Terracotta/sienna connects to Indian sandstone architecture
- Deep brown text is softer than pure black, more premium
- Gold accents feel luxurious without being gaudy
- Palette avoids the purple-gradient AI slop entirely
- High contrast ratios maintained for accessibility
- Works beautifully with warm-toned photography

### Alternatives
| Palette | Why Rejected |
|---------|-------------|
| Purple/violet gradients | Overused AI look |
| Pure saffron/orange | Stereotypically Indian |
| Black/gold luxury | Too dark for a beauty service app |
| Pink/rose | Too narrow, gendered |
| Cool blue tech | Wrong mood entirely |

### Status
**Accepted** — To be implemented as CSS custom properties + Tailwind config.

---

## Decision: Typography

### Decision
- **Display/Headlines:** "Playfair Display" — elegant serif with Indian-friendly character set
- **Body:** "Inter" — clean, readable, excellent Devanagari support planned
- **Accent/Labels:** "DM Sans" — geometric sans for UI labels and captions

### Reason
- Playfair Display gives editorial luxury feel — works for "Sundara" brand
- Inter is the most readable sans-serif for body text and has excellent international support
- DM Sans for UI labels creates clear hierarchy
- All three are Google Fonts, free, well-maintained
- Support for Hindi/regional characters planned through Inter's extended set

### Alternatives
| Font | Why Rejected |
|------|-------------|
| Poppins | Overused in Indian web projects |
| Lora | Too traditional for a modern platform |
| Outfit | Less character than Playfair |
| Noto Serif/Sans | Functional but lacks personality |
| System fonts | No brand identity |

### Status
**Accepted** — To be loaded via Google Fonts.

---

## Decision: Frontend Stack

### Decision
- React 18+ with TypeScript
- Vite as build tool
- Tailwind CSS v3
- shadcn/ui for base components
- Framer Motion for animations
- React Router v6 for routing
- TanStack Query for server state
- React Hook Form + Zod for forms/validation
- Lucide icons

### Reason
- React + TypeScript: Industry standard, strong ecosystem, team familiarity
- Vite: Fast HMR, simple config, better DX than CRA
- Tailwind: Rapid styling, consistent design system, pairs well with shadcn
- shadcn/ui: Copy-paste components, fully customizable, accessible, Tailwind-native
- Framer Motion: Best React animation library, good UX-enhancing capabilities
- React Router: Standard routing, no Next.js overhead needed
- TanStack Query: Best-in-class server state management, caching, optimistic updates
- React Hook Form + Zod: Performant forms with type-safe validation
- Lucide: Consistent, lightweight icon set

### Alternatives
| Technology | Why Rejected |
|-----------|-------------|
| Next.js | No SSR/SSG requirement yet, extra complexity |
| Vue/Nuxt | Smaller ecosystem, less TypeScript maturity |
| Redux | Overkill with TanStack Query + React context |
| MUI/Chakra | Less customizable, heavier, generic look |
| CSS Modules | Slower than Tailwind for rapid development |
| Zustand | Not needed — server state via TanStack, minimal client state |

### Feasibility
High — all tools are mature and well-documented.

### Trade-offs
- shadcn/ui requires manual component copying (but gives full control)
- Tailwind can lead to verbose markup (mitigated by component abstraction)
- No SSR means initial load is slightly slower (acceptable for SPA booking app)

### Status
**Accepted**

---

## Decision: Backend Stack

### Decision
- Python 3.11+
- FastAPI
- Pydantic v2
- SQLAlchemy 2.0 (async)
- Alembic for migrations
- PostgreSQL 15+
- JWT authentication (access + refresh tokens)
- bcrypt for password hashing

### Reason
- FastAPI: Fast, async-native, auto-generates OpenAPI docs, type-safe
- Pydantic v2: Best-in-class validation, native FastAPI integration
- SQLAlchemy 2.0: Mature ORM, async support, flexible query building
- PostgreSQL: Robust, supports JSON, full-text search, great for relational data
- JWT: Stateless auth, works well with SPA architecture

### Alternatives
| Technology | Why Rejected |
|-----------|-------------|
| Django | Heavier, more opinionated, less async-native |
| Flask | Too minimal, would need many extensions |
| Node.js/Express | Python better for data-heavy operations, team preference |
| MongoDB | Relational data is a better fit (bookings, loyalty, users) |
| REST via gRPC | Overkill for frontend-consumed APIs |

### Status
**Accepted**

---

## Decision: Database Architecture — Core Entities

### Decision
Final entity list (not盲目 creating every table listed in requirements):

```
Core Authentication:
- users (id, email, phone, password_hash, role, status, created_at, updated_at)

Profiles:
- customer_profiles (user_id FK, name, avatar_url, date_of_birth, gender, preferences JSON)
- staff_profiles (user_id FK, name, avatar_url, bio, specialties, experience_years, rating)

Salon:
- salons (id, name, address, city, phone, email, logo_url, description, status)
- branches (id, salon_id FK, name, address, city, phone, is_active)

Services:
- service_categories (id, name, description, icon, display_order)
- services (id, category_id FK, name, description, duration_minutes, price, image_url, is_active)
- staff_services (staff_id FK, service_id FK, custom_price nullable, is_offered)

Availability:
- staff_availability (id, staff_id FK, day_of_week, start_time, end_time, is_active)
- staff_blocks (id, staff_id FK, start_datetime, end_datetime, reason)

Bookings:
- bookings (id, customer_id FK, branch_id FK, booking_number, status, total_amount, notes, created_at)
- booking_items (id, booking_id FK, service_id FK, staff_id FK, start_time, end_time, price, status)
- booking_status_history (id, booking_id FK, status, changed_by, reason, created_at)

Payments:
- payments (id, booking_id FK, amount, method, status, transaction_id, paid_at)

Loyalty:
- loyalty_accounts (user_id FK, points_balance, total_earned, total_redeemed, tier, created_at)
- loyalty_transactions (id, user_id FK, points, type, description, reference_type, reference_id, created_at)
- loyalty_tiers (id, name, min_points, benefits JSON, icon, display_order)

Rewards:
- rewards (id, name, description, points_cost, type, value, image_url, is_active, stock)
- reward_redemptions (id, user_id FK, reward_id FK, points_spent, status, redeemed_at)

Reviews:
- reviews (id, booking_id FK, customer_id FK, rating, comment, categories JSON, created_at)

Referrals:
- referrals (id, referrer_id FK, code, referred_email, status, completed_at)

Notifications:
- notifications (id, user_id FK, title, message, type, is_read, data JSON, created_at)

Offers:
- offers (id, title, description, discount_type, discount_value, min_booking_amount, 
          valid_from, valid_until, target_tiers JSON, is_active)
```

### Reason
- Normalized to 3NF where appropriate
- JSON columns used only for truly flexible schema (preferences, benefits)
- Booking items separated from bookings for multi-service support
- Status history table for audit trail
- Loyalty uses a ledger approach (transaction table) not point overwrites
- Timestamps on all tables for audit and analytics

### Key Relationships
```
users 1:1 customer_profiles
users 1:1 staff_profiles
users 1:1 loyalty_accounts
users 1:N bookings (as customer)
staff 1:N bookings (as service provider, via booking_items)
services N:M staff (via staff_services)
bookings 1:N booking_items
bookings 1:1 payments
bookings 1:N reviews
bookings 1:N booking_status_history
loyalty_accounts 1:N loyalty_transactions
users 1:N referrals
```

### Indexes (Planned)
- `bookings.customer_id` — customer lookup
- `bookings.branch_id` — branch queries
- `booking_items.staff_id + start_time` — availability check (critical)
- `booking_items.service_id` — service analytics
- `loyalty_transactions.user_id` — loyalty history
- `notifications.user_id + is_read` — notification queries
- `staff_availability.staff_id + day_of_week` — availability lookup

### Status
**Accepted** — To be refined during Stage 3.

---

## Decision: Authentication & Authorization

### Decision
- JWT access tokens (15 min expiry) + refresh tokens (7 days)
- Three roles: `customer`, `staff`, `admin`
- Role-based middleware on backend routes
- Frontend route guards based on role
- Phone + OTP login planned for Phase 2 (MVP uses email + password)

### Reason
- JWT is stateless and works well with SPAs
- Access/refresh pattern balances security with UX
- Role-based access is sufficient for three user types
- Email+password is faster to implement for MVP

### Alternatives
| Approach | Why Rejected |
|---------|-------------|
| Session-based auth | More server state, harder to scale |
| OAuth (Google/Facebook) | Good for Phase 2, not MVP |
| Phone + OTP | SMS costs, carrier dependencies — Phase 2 |
| Role hierarchy (more roles) | Three roles cover all use cases |

### Status
**Accepted**

---

## Decision: Loyalty System Design

### Decision
**Tier System: "Glow Levels"**

| Tier | Points Required | Discount | Perks |
|------|----------------|----------|-------|
| Seed (बीज) | 0 | 0% | Base member, earn points |
| Bloom (कली) | 500 | 5% | Priority booking, birthday reward |
| Flourish (फूल) | 1500 | 10% | Free add-on service, exclusive offers |
| Radiance (तेज) | 4000 | 15% | Personal stylist, free upgrades, VIP events |

### Points Earning Rules
| Action | Points |
|--------|--------|
| Service completed | 1 point per ₹10 spent |
| Review submitted | 50 points (once per booking) |
| Referral completed | 200 points |
| Birthday month | 2x points on all services |
| Campaign/Special offer | Variable |

### Points Redemption
| Reward | Points |
|--------|--------|
| ₹50 off coupon | 400 points |
| Free add-on (e.g., scalp massage) | 300 points |
| Free service upgrade | 600 points |
| Free blow-dry | 500 points |
| Free haircut | 1200 points |

### Reason
- "Glow Levels" naming fits beauty context better than generic Bronze/Silver/Gold
- Hindi translations add subtle Indian touch
- Points per ₹10 is easy to calculate and explain
- Redemption rates keep ~80% cost ratio (healthy for business)
- Transaction-based ledger ensures auditability and prevents fraud

### Alternatives
| Approach | Why Rejected |
|---------|-------------|
| Bronze/Silver/Gold | Generic, not brand-aligned |
| Cashback model | More complex, payment integration needed |
| Visit-based tiers | Doesn't account for service value differences |
| Points expiration | Poor UX, creates anxiety |

### Status
**Accepted** — To be refined with business stakeholders.

---

## Decision: Booking Flow Architecture

### Decision
6-step linear flow with clear progress indicator:

```
Step 1: Select Service(s)
  → Category → Service → Duration + Price confirmed

Step 2: Select Staff
  → Available staff for selected service(s) → Profile preview

Step 3: Select Date
  → Calendar view → Availability-aware (grey out unavailable)

Step 4: Select Time
  → Available slots for staff + date + service combo

Step 5: Review Summary
  → Service, staff, date, time, price breakdown, loyalty preview

Step 6: Payment (Mock)
  → Payment method → Process → Confirmation

Step 7: Confirmation
  → Success screen → Loyalty points earned → Next appointment suggestion
```

### Validation Rules
1. Cannot proceed without selecting at least one service
2. Staff must offer the selected service (validated via `staff_services`)
3. Date must be today or future (no past bookings)
4. Time must fall within staff's availability (`staff_availability`)
5. Time must not overlap with staff's existing bookings (`booking_items`)
6. Time must not fall within staff's blocked periods (`staff_blocks`)
7. Full booking validated on backend before payment
8. Payment must be verified by backend before confirmation

### Race Condition Prevention
- Use database-level constraints on `booking_items` (staff_id + start_time unique within booking status = confirmed/pending)
- Backend validates availability at booking creation time with row-level locking
- Optimistic concurrency with version field on bookings if needed

### Status
**Accepted** — To be implemented in Stage 5.

---

## Decision: Recommendation Engine (Rule-Based)

### Decision
Simple rule-based recommendation system for MVP:

**Rule 1 — Repeat Service**
If customer has booked same service 3+ times:
```
"Since you love [Service], try [Related Service]"
```
Mapping: Haircut → Hair Spa, Facial → Cleanup, Manicure → Pedicure

**Rule 2 — Time-Based Rebook**
If last booking was 25+ days ago:
```
"Book Again: [Last Service] with [Last Staff]"
```

**Rule 3 — Tier-Based Offer**
If customer is within 100 points of next tier:
```
"You're [X] points from [Next Tier]. Book [Service] to level up!"
```

**Rule 4 — Complementary Service**
After Hair Coloring booked:
```
"Add a Hair Spa to protect your color — ₹200 off"
```

### Reason
- Transparent and explainable
- Easy to implement and debug
- No ML infrastructure needed
- Can evolve to collaborative filtering later
- Builds trust ("we recommend this because...")

### Alternatives
| Approach | Why Rejected |
|---------|-------------|
| Collaborative filtering | Needs significant data, ML infra |
| Content-based ML | Overkill for MVP |
| Random suggestions | No value, erodes trust |
| Staff picks | Manual curation, doesn't scale |

### Status
**Accepted** — Phase 1 rules. ML-based recommendations planned for future.

---

## Decision: API Architecture

### Decision
RESTful API with versioned endpoints:

```
/api/v1/auth/register
/api/v1/auth/login
/api/v1/auth/refresh

/api/v1/salons
/api/v1/salons/:id
/api/v1/salons/:id/services

/api/v1/services
/api/v1/services/:id
/api/v1/services/categories

/api/v1/staff
/api/v1/staff/:id
/api/v1/staff/:id/availability

/api/v1/bookings
/api/v1/bookings/:id
/api/v1/bookings/:id/cancel
/api/v1/bookings/:id/reschedule
/api/v1/bookings/:id/complete

/api/v1/availability?staff_id=&date=&service_id=

/api/v1/payments
/api/v1/payments/:id/verify

/api/v1/loyalty/account
/api/v1/loyalty/transactions
/api/v1/loyalty/tiers

/api/v1/rewards
/api/v1/rewards/:id/redeem
/api/v1/rewards/redemptions

/api/v1/reviews
/api/v1/reviews/booking/:id

/api/v1/referrals
/api/v1/referrals/:code/apply

/api/v1/notifications
/api/v1/notifications/:id/read

/api/v1/admin/dashboard
/api/v1/admin/bookings
/api/v1/admin/customers
/api/v1/admin/staff
/api/v1/admin/services
/api/v1/admin/loyalty
/api/v1/admin/analytics

/api/v1/staff/dashboard
/api/v1/staff/schedule
/api/v1/staff/bookings/:id/status
```

### Response Format
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 100
  }
}
```

### Error Format
```json
{
  "success": false,
  "error": {
    "code": "BOOKING_CONFLICT",
    "message": "That time slot is no longer available.",
    "details": { ... }
  }
}
```

### Status
**Accepted** — To be refined during Stage 3.

---

## Decision: Project Structure

### Decision
```
C:\DEV\SALON\
├── frontend/               # React + Vite + TypeScript
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── ui/          # shadcn components
│   │   │   ├── common/      # Shared components
│   │   │   ├── booking/     # Booking flow components
│   │   │   ├── loyalty/     # Loyalty UI components
│   │   │   ├── services/    # Service-related components
│   │   │   ├── staff/       # Staff-related components
│   │   │   ├── dashboard/   # Dashboard components
│   │   │   └── admin/       # Admin-specific components
│   │   ├── pages/
│   │   │   ├── customer/
│   │   │   ├── staff/
│   │   │   └── admin/
│   │   ├── layouts/
│   │   ├── routes/
│   │   ├── hooks/
│   │   ├── services/        # API service functions
│   │   ├── api/             # API client setup
│   │   ├── types/
│   │   ├── schemas/         # Zod schemas
│   │   ├── utils/
│   │   ├── constants/
│   │   ├── context/
│   │   ├── lib/
│   │   └── styles/
│   └── ...
│
├── backend/                # FastAPI + Python
│   ├── app/
│   │   ├── api/            # Route handlers
│   │   ├── core/           # Config, security, deps
│   │   ├── models/         # SQLAlchemy models
│   │   ├── schemas/        # Pydantic schemas
│   │   ├── services/       # Business logic
│   │   ├── repositories/   # Data access layer
│   │   └── utils/
│   ├── alembic/            # Database migrations
│   ├── tests/
│   └── ...
│
├── database/
│   └── seeds/              # Seed data scripts
│
├── tests/
│   └── e2e/                # End-to-end tests
│
├── docs/
│   ├── flow.md
│   ├── decision.md
│   └── api/                # API documentation
│
├── .env.example
└── README.md
```

### Reason
- Clear separation of concerns
- Backend layers (routes → services → repositories) prevent business logic in API handlers
- Frontend organized by feature domain (booking, loyalty, admin) not just by file type
- `ui/` for shadcn base components, `common/` for custom shared components
- Consistent with production codebase patterns

### Status
**Accepted**

---

## Decision: MVP Scope (Stage 1-6)

### Decision
MVP includes:

**Customer Side:**
- Landing page
- Service browsing
- Service details
- Staff browsing
- Full booking flow (6 steps)
- Email/password authentication
- Customer dashboard
- Upcoming appointments
- Appointment history
- Mock payment
- Booking confirmation

**Staff Side:**
- Staff login
- Daily schedule view
- Appointment status management

**Admin Side:**
- Admin dashboard
- Booking management
- Staff management
- Service management

**NOT in MVP (Phase 2):**
- Loyalty system (detailed in Stage 6 but basic version in MVP)
- Reviews
- Referrals
- Recommendations
- Notifications (in-app)
- Phone/OTP login
- Real payment integration
- Multi-branch support
- Rescheduling
- Cancellation with policy

### Reason
- Booking flow is the critical path — get this right first
- Loyalty is complex — needs booking flow working first
- Reviews/referrals need completed bookings to generate data
- Payment mock enables full flow without external dependencies

### Status
**Accepted**

---

## Decision: Image Strategy

### Decision
- Use Unsplash API for development/staging imagery
- Download curated set of Indian beauty/salon images for production
- Use placeholder colored divs for components during early stages
- Store final images in CDN (Cloudflare R2 / AWS S3) for production
- All images must include Indian models and salon environments

### Reason
- Unsplash is free and has good Indian beauty content
- Avoids copyright issues during development
- CDN for production ensures performance
- Placeholder approach speeds up early development

### Status
**Accepted**

---

## Decision: Payment Architecture

### Decision
Mock payment system for MVP:

```
1. Customer reviews booking summary
2. Clicks "Pay ₹XXX"
3. Backend creates payment record (status: pending)
4. Frontend shows mock payment form
5. Customer "submits" payment
6. Backend sets payment status to completed
7. Booking status updated to confirmed
8. Loyalty points calculated
```

Real payment integration (Razorpay) planned for Phase 3.

### Reason
- Allows full flow testing without external API keys
- No sensitive data handling in MVP
- Can switch to Razorpay later with minimal changes
- Payment record structure supports real integration

### Status
**Accepted**

---

## Decision: Responsive Design Strategy

### Decision
Mobile-first approach with breakpoints:

```
Mobile:    0-639px    (primary booking experience)
Tablet:    640-1023px (condensed two-column where useful)
Desktop:   1024-1439px (full layout)
Large:     1440px+    (max-width container, not stretched)
```

Booking flow specifically designed for mobile:
- Full-width cards
- Bottom navigation for steps
- Swipeable time slots
- Large touch targets (48px minimum)
- Sticky summary bar

### Reason
- 70%+ of salon bookings happen on mobile
- Mobile-first ensures core experience is excellent
- Desktop gets enhanced layout but doesn't compromise mobile

### Status
**Accepted**

---

## Decision: Copy Tone

### Decision
**Tone:** Warm, premium, human, direct.

**Guidelines:**
- Use "you/your" not "the user"
- Be specific, not generic
- Avoid superlatives unless earned
- Short sentences for UI copy
- Professional but friendly
- No emoji in production copy (rare, intentional exceptions only)

**Examples:**
| Context | Copy | Why |
|---------|------|-----|
| CTA | "Book Now" | Direct, clear action |
| Empty state | "No upcoming appointments" | Factual, not apologetic |
| Success | "You're booked!" | Warm confirmation |
| Loyalty | "You earned 120 points" | Specific, factual |
| Error | "That time was just taken" | Human, actionable |

### Status
**Accepted**

---

## Decision: Error Handling Strategy

### Decision
Backend errors return structured JSON with:
- Error code (machine-readable)
- Human message (user-facing)
- Details (debug info, not exposed in production)

Frontend handles errors at two levels:
1. **API level:** TanStack Query error callbacks → toast notifications
2. **Page level:** Error boundaries for component failures
3. **Form level:** Field-level validation messages

### Status
**Accepted**

---

## Decision: Testing Strategy

### Decision
- **Backend:** pytest + httpx for API tests
- **Frontend:** Vitest + React Testing Library for unit tests
- **E2E:** Playwright for critical flows (booking, auth)
- **Priority:** Test booking flow and loyalty calculations thoroughly
- **Seed data:** Database seeds for consistent test environments

### Status
**Accepted**

---

## Decision: Deployment Architecture (Future)

### Decision
- Frontend: Vercel or Cloudflare Pages (static)
- Backend: Railway or Fly.io (Python app)
- Database: Supabase or Railway PostgreSQL
- Images: Cloudflare R2 or AWS S3

Not implementing now — documented for future reference.

### Status
**Planned** — Not active.

---

## Decision: Local Dev Database — SQLite File, Postgres in Production

### Decision
Local development and tests run on a SQLite file (`sundara_dev.db` / `test_sundara.db` via aiosqlite). Production uses PostgreSQL (asyncpg). Same SQLAlchemy 2.0 async code paths; only `DATABASE_URL` changes.

### Reason
- No PostgreSQL server is installed on the dev machine; SQLite needs zero setup
- SQLAlchemy models use a portable `GUID` type (native UUID on Postgres, CHAR(36) on SQLite)
- All queries are ORM-based, no Postgres-specific SQL, so behavior is identical for MVP scope
- Tests run in ~2s against file SQLite with real seed data

### Alternatives
| Approach | Why Rejected |
|---------|-------------|
| Install Postgres locally | Heavy Windows setup, slows Stage 3 momentum |
| Postgres-only via Docker | Docker availability unverified on this machine |
| Mock the DB layer | Wouldn't test real booking-conflict behavior |

### Feasibility
High — implemented and passing (9/9 tests).

### Trade-offs
- SQLite lacks true row-level locking; the double-booking guard relies on the unique constraint + service check, which is correct on both but race-tested properly only on Postgres later
- `DateTime(timezone=True)` returns naive datetimes on SQLite — service layer normalizes to UTC on read (see `build_slots._aware`)
- Full-text search / JSON operators (Phase 2) will need Postgres-gated code paths

### Status
**Accepted** — Revisit before production deploy.

---

## Decision: Sarvam-Inspired Indian Expression (User-Directed)

### Decision
Evolve the visual identity toward Sarvam AI's language: warm cream canvas, near-black umber ink, refined marigold accent (#D8711C), bilingual Latin + Devanagari display type (Tiro Devanagari Sans), and a parametric single-stroke mandala ornament used at low opacity as backdrop only.

### Reason
- User explicitly requested visible Indian touches (mandala) with Sarvam as reference
- Sarvam proves restraint + bilingual type reads premium-modern, not stereotypical
- Mandala is generated geometrically in SVG (no clip-art), never a content element

### Alternatives
| Approach | Why Rejected |
|---------|-------------|
| Keep Stage-1 restraint (no mandala) | Overruled by direct user request |
| Stock mandala PNGs / heavy paisley | Clip-art look, brand damage |
| Full saffron re-skin | Loses sandstone sophistication, narrows mood |

### Rules to prevent kitsch
- Mandala only as low-opacity backdrop (hero, glow band, footer); never beside body copy as illustration
- Devanagari only for brand/section accents (सुन्दरा, सेवाएँ, विधि, चमक, पधारिए), never paragraphs
- Marigold for eyebrows, ornaments, small accents — primary actions stay deep umber
- No testimonials/metrics invented to fill the richer layout (ritual steps, seed-derived ratings only)

### Status
**Accepted** — Implemented in Landing, Services, Navbar, Footer. Evolved per user feedback: heavy umber-brown removed; CTAs and selections now warm ink + vivid marigold, Glow band and footer lightened to peach/cream, image fallbacks are soft peach.

---

## Decision: Editorial Landing Redesign (User-Directed Brief)

### Decision
Rebuilt the landing page as an art-directed editorial experience: tonal rhythm (ivory → bone → espresso → clay → ink), full-bleed sections, asymmetric compositions, hairline borders instead of shadows, rectangular CTAs, and all large mandala decoration removed. Hero copy chosen: "Beauty, on your time."

### Reason
- Previous page read as AI-generated SaaS: card grids, floating glassmorphism, stat rows, mandala wallpapers, mechanical bilingual labels
- New structure follows the brief's section order: hero → experience → services menu → interior → booking strip → experts → loyalty → voices → welcome-back → final CTA

### Alternatives
| Copy | Why Rejected |
|------|-------------|
| "Your beauty, your time" (old) | Generic, kept as footer tagline only |
| "Good hair days, made easy" | Catchier but narrows to hair; brand covers skin/nails/men |
| "Take a little time for yourself" | Warm but vague, weak CTA pairing |

### Rules enforced
- Mandala: only SmartImage load-fallback, nowhere as decoration (Ornament.tsx deleted)
- Devanagari: wordmark + final CTA "पधारिए" only
- Landing marketing content stays on curated mock data + real photos; booking flow stays on live API (image map keys are mock IDs — do not point landing at API without remapping)
- Voices are sample data in `src/data/voices.ts`, clearly marked for replacement
- No invented metrics; rating/hours lines are seed-derived

### Status
**Accepted** — Implemented across `components/landing/*`, Navbar, Footer. Verified desktop + mobile screenshots, 18/18 backend tests green.

---

## Decision: Plum / Rose / Coral Brand Palette (User-Directed)

### Decision
Retired the brown/sandstone identity. New system: Deep Plum #3B2038 (primary: CTAs, eyebrows, selections, footer, loyalty, final CTA), Muted Rose #B86F78 (secondary, wordmark accent), Soft Coral #D96B4A (micro-accents only), Soft Ivory #FAF7F2 canvas, Charcoal #211D20 text, Grey-Rose #756C70 secondary text, Botanical Green #477A63 success.

### Reason
- Brown read dated and template-like; plum gives distinctive contemporary Indian luxury
- 70–80% of the page stays ivory/white/photography — plum used strategically, never as wash
- Indian identity now carried by photography, Devanagari restraint, coral accents — not brown/gold shorthand

### Rules
- No brown CTA buttons, no orange gradients, no gold/saffron, no mandalas/paisley/temple motifs
- Dark plum moments limited to: loyalty section, final CTA, footer (+ interior stays light to control purple count)
- Quality gates per brief: not brown, not purple-washed, not generic-beauty, not SaaS-template

### Status
**Accepted** — Tokens redefined (old `primary`/`marigold` class names now resolve to plum/coral, converting ~70 usages automatically), landing dark sections rewritten, verified via screenshots + clean build.

---

## Decision: Login Page Redesign (User-Directed Brief)

### Decision
Two-column desktop login (editorial interior photo left, open quiet form right), compact auth footer, plum CTA, password visibility toggle, honest forgot-password notice, demo repositioned as "Continue as demo".

### Alternatives
| Option | Why Rejected |
|--------|-------------|
| Centered card (status quo) | Generic auth template, giant whitespace |
| Full-bleed photo background | Hurts form legibility, promotional not calm |
| Social login buttons | Backend has no OAuth — fake options rejected |
| Abrupt post-login transition | Kept immediate redirect; no animation delaying the user |

### Copy
| Current | New | Reason |
|---------|-----|--------|
| "Log in to manage visits and Glow points." | "Sign in to manage your appointments and Glow Points." | "Appointments" is clearer; proper noun casing |
| "Email" / "Password" | "Email address" / "Password" | Explicit, professional |
| "Skip login — continue as demo customer" | "Continue as demo" + "Preview the customer experience without signing in." | Doesn't read as a dev shortcut |
| Raw "Invalid email or password." | "That email or password doesn't look right. Please try again." | Human, actionable |

### Other calls
- Forgot-password: honest inline notice (no reset endpoint exists; phone fallback given)
- localStorage tokens: accepted trade-off for salon MVP (short-lived JWT, backend validates everything); revisit httpOnly cookies before production scale
- Navbar kept global on auth pages (consistency over brief's optional compact header)
- Signup untouched except compact footer; full signup redesign deferred

### Status
**Accepted** — Implemented, desktop + mobile verified, demo + failed-login + role redirects tested.

---

## Decision: Booking Experience Redesign (User-Directed Brief)

### Decision
Full-width two-column booking (sticky brand/summary panel + flow), image-rich service grid, photo expert cards, 14-day date strip (Sundays honestly disabled — staff work Mon-Sat), 12-hour time labels, sticky live summary, review with per-section edits, enriched confirmation, skeleton states, mobile step-bar + sticky action bar, compact footer on /book.

### Alternatives
| Option | Why Rejected |
|--------|-------------|
| Narrow centered column (status quo) | Form-template feel, wastes desktop, hides photography |
| Per-day availability prefetch for date strip | 14 API calls per render; Sundays-off rule covers honest unavailability |
| Tax line in price breakdown | Backend charges no tax — invented numbers rejected; total = sum of prices |
| Glow Points preview at booking | Backend awards points only on completion (Stage 6); showing numbers now would fabricate |
| Sticky mobile bar skipped | Brief allows it and it genuinely helps; built with safe-area + content offset |

### Copy
| Current | New | Reason |
|---------|-----|--------|
| "Book an appointment" (small, centered) | "Book an appointment" + "Let's find the right time for you." | Human subhead, kept title for continuity ("Your next visit" tested as alternative — less clear as a page title) |
| "Choose a service" etc. | Kept, numbered "Step N — ..." | Already plain human language |
| "Pay ₹X" | "Pay ₹X securely" + demo-checkout honesty line | Trust without false claims |
| 24h "15:00" slots | "3:00 PM" labels (value unchanged) | Customer-readable |

### Status
**Accepted** — Implemented across `components/booking/*` + Booking page. Full 18-step functional test + screenshots below.

---

## Decision: Glow Points Page Redesign (User-Directed Brief)

### Decision
Editorial loyalty page on ivory: serif balance hero → thin plum progress → one contextual CTA → real rewards with confirm-dialog redemption → tier journey rows → date-grouped ledger → how-it-works. Compact footer. No dark cards, no gamification.

### API calls (all real, verified)
- New: `GET /loyalty/tiers` (thresholds + seeded benefits), `POST /loyalty/rewards/:id/redeem` (single-transaction debit + ledger + code; 404/409/422 paths tested)
- Wired: account, transactions (+`reference_id` added for per-visit matching), rewards catalog
- Honest gaps: no completion hook yet — points land via seed/Stage-6 engine, so per-visit "+X" shows only when a matching ledger row exists; earning copy states the documented 1pt/₹10 rule with "completed visits" qualifier; concurrent double-submit race noted (button disables while pending; row-locking is a Postgres-stage concern)

### Copy
| Current | New | Reason |
|---------|-----|--------|
| "Glow points" | "Priya's glow" + "A little more back with every visit." | Personal, mechanic-honest; runner-up "Your glow" used when name unknown |
| "No upcoming appointments yet." (dead mock list) | Live balance/tier/progress/ledger/empty states | Everything from API, skeletons while loading, never a fake 0 |

### Status
**Accepted** — 23/23 backend tests, live redeem verified (code issued, balance + ledger updated), desktop + mobile screenshots.

---

## Decision: Full Audit Fixes — Real Catalog Data + Row-Level Visit Actions (16 Sept 2026)

### Decision
Landing/services/detail/experts read `GET /services` + `GET /staff` (no mock); all booking CTAs pass real UUID params; every active upcoming row gets Reschedule/Cancel via extracted `ReschedulePane`; footer dead spans removed.

### Reason
Live audit found P1 context loss (service choice dropped entering booking), P1 dead end (only hero visit manageable), P2 imitation footer links.

### Alternatives
- Keep mock with ID map → rejected: permanent drift source, already caused UUID mismatch.
- Row actions linking to a separate manage page → rejected: inline panes already existed and tested; extraction was smaller and safer.

### Feasibility
High — hooks/utilities existed; changes were wiring + one extraction. Verified: build clean, 23/23 pytest, full browser regression.

### Trade-offs
Landing sections now show skeletons on slow API (honest loading vs instant mock). "Most loved" tags API-first service (see OBS-2).

### Status
Accepted

## Decision: Stage 8 Consoles — Admin Management + Staff Availability/Notes (16 Sept 2026)

### Decision
Admin: real analytics + bookings/customers/services/rewards/reviews management (new `/admin/*` endpoints, 6 sub-pages, fabricated dashboard removed). Staff: schedule shows customer identity, weekly-hours editor + time-off blocks (`/staff/availability`, `/staff/blocks`), internal customer notes (`customer_profiles.notes`, migration 0002). Staff single-booking reads restricted to own jobs.

### Reason
Stage 8 gaps: admin was fabricated numbers; staff couldn't see who appointments were for, manage hours, or record guest notes.

### Alternatives
- Separate manage-booking page for staff → rejected: inline rows reuse tested panes.
- Notes on bookings instead of profile → rejected: notes belong to the guest relationship, visible across visits.

### Feasibility
High — models (StaffAvailability/Block) already existed; only notes needed a column.

### Trade-offs
Admin analytics in UTC day boundaries; fine for single-branch ops.

### Status
Accepted — 32/32 pytest, build clean, browser-verified (admin overview/bookings/customers, staff schedule/availability/notes round-trip).

## Decision: Complete Staff Portal (16 Sept 2026)

### Decision
Full portal shell (sidebar + mobile drawer) with Dashboard, Schedule, Appointments (+detail
with status-driven actions, history, toasts), Customers (+detail with ledger), Services
(read-only, manage links to Admin), Loyalty lookup, Analytics; `/staff/login` role-aware entry;
footer points to `/staff/login`. Earn engine: completion credits 1pt/₹10 and reviews +50,
both idempotent ledger writes in the same commit. Staff mutations restricted to own jobs.

### Reason
Audit found the earn chain entirely missing (UI advertised points nothing awarded) and staff
able to mutate anyone's bookings; console lacked management surfaces.

### Alternatives
- Manual point adjustments by staff → rejected: backend-authoritative ledger only.
- Settings page with fake toggles → rejected: no backend model; deferred honestly.
- Separate availability rules → rejected: same endpoints customer booking uses.

### Feasibility
High — reused ReschedulePane/CancelVisitDialog/admin hooks/history model.

### Trade-offs
Staff customer history scoped to own jobs ("Visits with you"); admin sees all.

### Status
Accepted — 38/38 pytest, build clean, full chain verified live (book→confirm→complete→+149→review→+50).

*This document is maintained alongside implementation. Update when decisions change.*
