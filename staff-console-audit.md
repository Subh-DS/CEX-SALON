# Staff Console Audit — 16 Sept 2026 (before completion work)

## Existing routes
- `/staff` → StaffLayout → StaffDashboard (RequireRole staff+admin). No `/staff/login`; staff use customer `/login`.
- `/admin/*` → AdminLayout + 6 pages (Overview, Bookings, Customers, Services, Rewards, Reviews). Admin-only.
- Footer "Staff Portal →" → `/staff` (guard bounces logged-out → `/login`, customer → `/`).

## Existing components
- StaffDashboard: schedule list + AvailabilityTab (weekly hours, time-off blocks) + customer identity + notes editor + Start/Complete.
- visits/: ReschedulePane, CancelVisitDialog (reused), VisitStatus.
- api/: bookings.ts (useMyBookings role-aware, useSetStatus, useReschedule, useCancelBooking), admin.ts (analytics, customers, notes, services/rewards CRUD, availability, blocks).

## Existing backend
- GET /bookings role-filtered (staff sees own jobs; serialize adds customer identity for staff/admin).
- POST /bookings/{id}/status (staff/admin, VALID_TRANSITIONS, writes BookingStatusHistory).
- POST /bookings/{id}/reschedule (availability-checked), POST /bookings/{id}/cancel.
- GET/PUT /staff/availability, CRUD /staff/blocks — same source customer booking uses.
- /admin/*: analytics, customers+notes, services/rewards CRUD, reviews.
- Loyalty ledger models + redeem; tiers; review submit (completed-only, idempotent).

## Gaps found (this brief's work)
1. **P0 — completion awards no points.** Nothing creates earn transactions: `set_status→completed` writes no ledger row, reviews write no +50 bonus — yet customer UI advertises both ("+50 for a review", "1 pt per ₹10"). Core chain broken.
2. **P1 — staff can mutate anyone's bookings.** set_status/reschedule/cancel lack own-job checks for staff (reads already have them).
3. **P1 — staff cannot confirm/cancel/reschedule from console.** Dashboard only offers Start/Complete; no appointments management surface.
4. **P1 — no staff login route** (`/staff/login` missing); footer flow expects one.
5. **P2 — no staff Appointments/Customers/Loyalty/Analytics pages**; no sidebar shell; no dashboard overview.
6. **P2 — no per-customer ledger view for staff**; no status history in payloads.
7. **Deferred — settings.** No backend model for salon policies; will NOT ship fake toggles (documented).

## Reusable (do not rebuild)
ReschedulePane, CancelVisitDialog, VisitStatus, admin.ts hooks, availability endpoints, VALID_TRANSITIONS, BookingStatusHistory.
