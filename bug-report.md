# Sundara Bug Report — 16 Sept 2026 audit

## BUG-001 — P1 (FIXED): Service context lost entering booking

- Page: Landing (`ServicesMenu`), Services, ServiceDetail
- Steps: Click "Book this service" / "Book This Service" / expert "Choose" → `/book` bare
- Expected: chosen service (and expert) preselected — `Booking.tsx` already supports `?service_id=&staff_id=`
- Actual: clean step 1, user re-selects; mock IDs (`s1`) couldn't map to backend UUIDs anyway
- Root cause: landing/services/detail rendered `data/mock.ts`; links never passed params
- Fix: sections now read `GET /services` + `GET /staff`; all CTAs pass real UUID params; `mock.ts` deleted
- Regression: TP-009/010/014/029/030/031 PASS (preselect + filtered experts verified live)

## BUG-002 — P1 (FIXED): Only the single next visit could be rescheduled/cancelled

- Page: My Visits (`VisitHistoryItem`)
- Steps: any upcoming appointment except the hero card → no actions, only "Book again →"
- Expected: every active upcoming booking manageable (§19: View/Reschedule/Cancel by status)
- Actual: dead end for 2nd+ upcoming bookings
- Root cause: `ReschedulePane` + cancel dialog lived only inside `NextVisit`
- Fix: extracted `ReschedulePane.tsx`; rows with status pending/confirmed + future start show Reschedule/Cancel reusing the same panes/dialogs; completed/cancelled keep "Book again →" + rating
- Regression: TP-046/047 PASS (row-cancel SND-000006 → Cancelled verified live)

## BUG-003 — P2 (FIXED): Footer imitation links

- Page: footer bottom row — Instagram / Facebook / Privacy / Terms rendered as spans
- Expected: every footer item routes or is absent (§24)
- Actual: link-styled dead text; no business socials or legal pages exist
- Fix: removed the row; kept brand tagline. Re-add only with real URLs/pages.

## Observations (not bugs, no change)

- OBS-1 (P3): hero "★ 4.9 from local guests" rests on seeded staff ratings/review_counts, not a reviews aggregate. Acceptable for dev seed; revisit when the reviews table has volume.
- OBS-2 (P3): landing "Most loved" tags the first API-ordered service, not a measured top service. Marketing label, no fabricated numbers; revisit with a popularity signal.
- OBS-3 (P3): cancelled future bookings list under "Past visits" (section = inactive, not strictly past). State correct, heading approximate.
- NOT REPRODUCED: the reported PDF blank section ("Plus: 50 points…" floating). All 8 landing sections render with measured heights (384–1073px); loyalty teaser is a composed section. Treated as a PDF-capture artifact.
