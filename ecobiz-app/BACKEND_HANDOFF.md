# EcoBiz backend handoff

This document describes the existing frontend contracts. It is not a claim that browser simulation provides authentication, database transactions, RLS, financial compliance or multi-user inventory guarantees. Use section 7 of `../documents/product/ECOBIZ_APP_PLAN.md` for the production schema.

## Current source and state

- `src/lib/demo.ts`: profiles, offers, reservation snapshots, events, settlements, adjustments, clock, formatting, customer booking/cancellation and versioned restore.
- `src/lib/operations.ts`: staff/vendor guards, offer validation, staff transitions, full-fee settlement, signed adjustments, reports and CSV.
- `DemoProvider`: one shared state instance. Mutations run on a cloned draft and commit only on success. This gives local failure rollback, not database atomicity or multi-tab safety.
- `ecobiz-demo-v2` remains the browser key so Part 2 records can be found. The payload is now version 3; valid version 2 snapshots migrate with empty events/settlements/adjustments and no staff session. Invalid/incompatible state resets with a notice. Existing history predating migration has no fabricated audit events.
- A selected image is a temporary object URL. Serialization substitutes a missing-image path; refresh shows the existing image fallback. No image bytes are stored in localStorage. Input permits JPEG/PNG/WebP up to 5 MB, decodable and at most 24 megapixels. Replace this preview with authenticated storage uploads.

## Screen reads and mutations

| Screen | Reads | Mutations / actions |
|---|---|---|
| `/`, `/meals/[id]` | Public offer projection, vendor/location, current availability, own active reservation | Navigate to sign-in/review |
| `/sign-in` | Safe allowlisted return path | Demo session only; replace with real sign-in |
| `/reserve/[mealId]` | Current offer and own profile/active booking | Save profile; book using stable customer-scoped request key; recover by same key |
| `/reservations`, `/reservations/[id]` | Own records with agreed meal/vendor/price/pickup snapshots | Customer cancellation strictly before snapshot cutoff |
| `/account` | Own sample profile | Save profile, sign out |
| `/ops` | Vendor offers, live reservation lookup, events and selected-service-date reconciliation | Complete collected AND paid, reasoned cancellation, evening close, CSV (historical settlement/adjustment records remain readable) |
| `/ops/offers/new`, `/ops/offers/[id]` | Vendor offer, active-reservation count | Save/publish/pause, explicit reasoned withdrawal |
| `/help`, `/privacy`, `/terms` | Draft operational guidance and central support configuration | Navigation only |
| `/auth/callback` | Unconnected-status explanation only in demo | Production: verified OAuth callback and safe session/redirect handoff |

## Fields and rules to preserve

Offer: ID, vendor ID, name, description, portion, image, vendor-supplied dietary notes, whole-number available stock, integer-sen vendor price/fee, service date, UTC booking/cancellation deadlines and pickup start/end, location/instructions, publication status. UI draft maps to `unpublished`, pause to `closed`; `withdrawn` is not republished. New offers use a 50 sen fee; existing-offer editing retains stored fee support. New-offer cutoffs derive from pickup start in saveOffer as a provisional assumption; existing offer and reservation deadlines remain unchanged. Portion and dietary notes may be absent. Price must be positive, fee non-negative, stock whole/non-negative. UI bounds: stock 10,000; individual amount 1,000,000 sen. Deadlines must lie on the service date, cutoffs no later than pickup start, pickup end after start. Backend must validate independently.

Reservation: ID, customer/offer IDs, readable reference, customer-scoped request key, quantity 1, `reserved | completed | cancelled | no_show`, creation/completion/cancellation timestamps, reason, immutable meal and vendor/location snapshots. Snapshot prices and pickup terms are the agreement; reports never price past reservations using current offers.

Event: reservation, actor, UTC time, previous/new status, reason. Completion requires both handover and payment and is one transition. Repeated completion returns the completed record without another event. Customer/staff cancellation restores eligible stock at most once; withdrawn offers remain unavailable. Staff cancellation after pickup ends does not reopen closed stock. Withdrawal cancels outstanding records with a reason without restoring public stock. Close acts only after every relevant pickup window ends and marks only reserved records for the selected vendor/service date as no-show; repeats have no effect. No-show does not reopen stock.

Material edits to an offer with active reservations are rejected. Only unreserved stock and publication status may change. Withdraw/cancel-and-republish is the route to revised meal, price, date, location or pickup terms. Historical agreements are retained.

## Authentication, permissions and persistence

Replace `session`, `staff`, localStorage, role controls and the frozen clock with real authenticated users, provisioned staff memberships, backend records and server time. Demo role switching is not authorisation. Every mutation and read must derive identity from the server session, validate ownership/vendor membership and use RLS/restricted grants. Customers cannot assign themselves a staff role, read another customer's reservation, access vendor financial records, or complete/no-show a reservation.

Real OAuth needs provider setup, validated callback/code exchange, secure cookie/session refresh and allowlisted internal redirects. Preserve the selected meal across sign-in; absent/unsafe return paths go to `/`. Do not permit external, protocol-relative, encoded traversal or arbitrary staff return destinations. `/auth/callback` must not fabricate success when unconnected. Never put privileged tokens in client bundles or logs.

Use transactional stock allocation and state transitions, row locking/guarded updates, non-negative inventory, unique pickup references, customer-scoped idempotency keys and a uniqueness rule for one active reservation. Retrying a key must return the original reservation; reusing it for another meal must fail. Lost-response recovery queries that same key before allowing retry. Add trusted concurrency tests for competing last-unit reservations and competing cancellations/completions.

Provision staff membership administratively for an assigned vendor. Restrict uploads to staff/vendor ownership, verify decoded image content and size server-side, strip unnecessary metadata and store stable asset references. Establish backups, migrations, retention and audited corrections.

## Settlement, adjustment and report contract

The explicit demo pilot rule is **full original EcoBiz fee coverage once per completed reservation**, one vendor/service date per settlement; no partial coverage. The amount must equal the sum of the selected completed reservations' snapshot fees. Covered records cannot be selected again, even with another request key. Zero-fee meals need no settlement. A settlement records covered references/IDs, amount in sen, received-at UTC time (not later than demo clock), recording timestamp/actor, evidence/reference and stable request key. Retrying identical input returns the same settlement; different input with that key fails.

Adjustment: reference either a completed reservation or a settlement; signed integer vendor/fee values, required reason, actor, UTC time and stable request key. It appends evidence without editing/deleting the original or toggling a terminal status. Reservation corrections adjust vendor proceeds/fees owed. Settlement corrections adjust fees actually received; vendor delta must be zero. Changing a submitted correction uses another reasoned adjustment, not editing the original. Keys prevent repeats of one attempt; distinguish new intentional corrections operationally.

For a selected vendor and the original **service date**:

- Completed units = count of completed reservations (quantity is 1).
- Vendor proceeds = sum of completed snapshot vendor prices + reservation vendor adjustments.
- Fees owed = sum of completed snapshot fees + reservation fee adjustments.
- Fees settled = sum of settlements + settlement fee adjustments.
- Outstanding = fees owed − fees settled. Negative balance is shown as a credit/discrepancy requiring reconciliation.
- Reserved/unpaid, cancelled and no-show amounts contribute no sales/fees. Cancellation/no-show/unresolved counts remain visible separately.
- Adjustments are attributed to the original service date, with their own actual timestamps preserved. Full original fee coverage stays unchanged; corrections explain residual credits/debits rather than silently reopening coverage.

CSV uses these same calculations, consistent columns, explicit service date/timezone and UTC event times, integer-sen and MYR amounts. All rows say SAMPLE DEMO. It includes original records, settlement coverage/evidence, separate adjustments and totals, without unnecessary profile contact data. Strings are quoted, embedded quotes doubled, commas/newlines preserved; dangerous formula prefixes after whitespace/control characters are neutralised. Negative numeric amounts remain numeric values.

## Error responses and recovery

The demo presents readable messages; production should return stable error codes plus safe user-facing text for unauthenticated/forbidden, not-found/foreign record, invalid input, out-of-stock/closed, active-reservation conflict, request-key mismatch, invalid state transition, active-offer edit conflict, deadline not reached/passed, already-covered settlement, validation and unavailable service. Preserve entered values on failure and keep the same attempt key on retry. For unknown booking outcomes return a recoverable request lookup state; never invite another confirmation until absence is established. Backend mutations must commit all stock/status/event/money changes together or none.

## Live-release requirements still open

Confirm vendor participation, food suitability/handling, prices/packaging, payment method, pickup rules, student eligibility, named operator/backup, cancellation/dispute/correction policy, support contact/owner, privacy purposes/access/retention/removal, hosting terms/costs, credentials and recovery. The central `supportContact` slot is unset; no support number or retention period has been invented.

Complete section 12's release checklist: isolate demo/live data; test concurrency, identities, permissions, money and the full loop against the backend; verify real phones/Safari and OAuth from messaging browsers; rehearse staff close and historical balance reconciliation; reconcile exports; document logging, backups, rollback and a manual outage procedure. No deployment, purchases, real OAuth, online payment or Supabase configuration was performed in this frontend partition.
