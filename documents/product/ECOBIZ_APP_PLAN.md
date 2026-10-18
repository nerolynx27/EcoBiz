> Current frontend revision: the compact meal-card editor, Closed availability, removed settlement/correction controls, icon-above-label staff navigation and expandable staff FAQ supersede conflicting frontend requirements below. New-offer booking/cancellation cutoffs at pickup start are provisional. Staff navigation is Operations (hand), Offers (shopping bag), Help (FAQ); Evening close is last on Operations and the settlement/correction evidence section is removed. Existing agreements and financial history remain intact. See the [application guide](../../ecobiz-app/README.md) for current workflows and the [verification record](../../docs/VERIFICATION.md) for dated checks. This document retains the original product/backend plan; it is not a list of implemented production capabilities.

# EcoBiz customer-first MVP project plan

Date: 28 September 2026  
Status: Original product and proposed backend plan; a local frontend demo is now implemented.  
Business source: [EcoBiz Business Model Canvas](../business/ECOBIZ_BUSINESS_MODEL_CANVAS.md).  
Brand source: the locally retained Deck Guideline (not published). The [project README](../../README.md) presents the published identity and current demo.

## 1. Product objective and scope

Build a mobile-friendly application that lets a UNITEN student discover available surplus meals, reserve one, collect it from the vendor, and pay at collection. Give the EcoBiz team enough operational control to publish real availability and record paid collections reliably.

The first release serves one campus and one participating vendor. It must demonstrate a complete transaction loop, not only attractive browsing screens. The vendor agreement remains an external dependency; development can proceed with explicitly labelled sample data.

### Existing business decisions

- Customers reserve without advance payment and collect directly from the vendor.
- The intended pickup window is 9:40–9:55 pm, Malaysia time, subject to vendor agreement.
- The proposed EcoBiz fee is RM0.50 per completed meal sale, added to the vendor price.
- Reservations alone do not produce revenue. Collection and successful payment must both be confirmed.
- Telegram and WhatsApp promote offers; the app becomes the reservation record when launched.
- Fertilizer remains experimental and is not offered for sale in this MVP.
- Approximately RM100 is shared across the whole business project, not an established software budget.

### Proposed implementation defaults

These are recommendations, not claims that the founder or vendor has already agreed:

- Responsive web app, English interface, MYR prices, Asia/Kuala_Lumpur display timezone.
- Browse without signing in; Google sign-in through Supabase when reserving.
- Campus-focused access, without mandatory university-email verification initially. Google accounts do not establish student status. Confirm actual student access before making Google the only launch login method.
- One meal unit per reservation and one active reservation per customer. This avoids carts and quantity-policy complexity for the first pilot.
- Ask for display name and phone number at first reservation, with a short purpose notice. The number is contact information, not a verified identity or SMS-login credential.
- Initial booking and customer cancellation cutoff: 9:40 pm, when pickup begins. Store these deadlines per offer so vendor-approved changes do not require a code change.
- Staff-assisted vendor operation: an EcoBiz operator publishes meals and records vendor-confirmed payment and collection. No self-service vendor portal yet.
- No automatic monetary penalties, ratings, bans, or no-show charges.

## 2. Language, framework, and platform

| Layer | Recommendation | Reason |
|---|---|---|
| Application language | TypeScript | One language for browser UI and server-side application logic; typed data contracts. |
| Web framework | Next.js with React and App Router | Customer pages, protected staff pages, and server mutations in one application. |
| Styling | CSS Modules and CSS custom properties | Native CSS handles the MVP; shared colours, spacing, and controls without a UI framework dependency. |
| Database | Supabase PostgreSQL | Relational reservations, inventory, transaction locks, constraints, and reporting. |
| Authentication | Supabase Auth with Google OAuth | Managed sessions without building password handling or paying for SMS authentication. |
| Meal images | Supabase Storage | Public meal images with staff-only upload permissions. |
| Validation | Server-side schemas, using Zod if needed across forms | Validate all untrusted inputs; database constraints remain the final guard. |
| Tests | Node test runner for isolated rules; database integration checks; Playwright for core journeys | Concentrate on inventory, permissions, prices, and the customer loop. |
| Hosting | Managed Node-compatible hosting; Vercel Pro is a candidate if budget permits | Easy Next.js deployment; hosting purchase and account setup are separate decisions. |
| Source control / checks | Git and a public repository; local package checks | Public release is the owner's selected direction. CI, migrations, and backend rollback remain future work. |

Use stable, supported versions at implementation time and commit the dependency lockfile. No separate Express server, ORM, microservices, payment gateway, native app, or custom authentication service is needed for this scope.

Deployment is a budget decision: Vercel Hobby restricts use to personal, non-commercial projects, so do not assume it can host the revenue-generating pilot. Before live deployment, record actual app-hosting, database, storage, and optional-domain costs and verify provider terms and limits. Do not purchase services as part of approving this plan. A local demonstration can precede paid hosting, but a live pilot requires a reachable deployed service.

### Alternatives considered

1. **Recommended: Next.js + Supabase.** One deployable app with managed data and authentication. Some provider setup, but a direct path from demo to operational pilot.
2. **React SPA + Supabase.** Also viable; transactional database functions would still be necessary. Prefer this only if the team already has a strong SPA codebase, which this workspace does not contain.
3. **Flutter or React Native.** Appropriate later if native capabilities become necessary. App distribution and separate platform testing do not improve the initial link-to-reservation journey.

Technical references checked for this plan: [Next.js App Router](https://nextjs.org/docs/app), [Next.js route handlers](https://nextjs.org/docs/app/getting-started/route-handlers), [Supabase Next.js setup](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs), [Supabase row-level security](https://supabase.com/docs/guides/database/postgres/row-level-security), and [Vercel Hobby restrictions](https://vercel.com/docs/plans/hobby).

## 3. MVP features and acceptance criteria

| Feature | First-release behaviour | Acceptance criterion |
|---|---|---|
| Meal discovery | Today's published offers with photo, name, vendor, total price, remaining stock, and pickup window. | Guests can browse; expired and sold-out meals cannot be reserved. |
| Meal details | Description, portion information, vendor-supplied ingredient/allergen notes, location, pickup instructions, and price breakdown. | Customer can understand exactly what, where, when, and how much before reserving. Missing dietary information is labelled, never inferred. |
| Authentication | Sign in at reservation time, preserve selected meal, return after authentication. | Successful login resumes the selected journey; cancellation or failure preserves a retry route. |
| First-reservation profile | Name and contact number with a purpose notice. | Required fields validated; contact is never exposed in public offer data. |
| Reservation review | Meal, quantity of one, vendor price, fee, total, deadlines, and pay-at-pickup instruction. | Total comes from the server, not a client-supplied amount. |
| Reservation creation | Atomic stock allocation and persistent reservation. | Two people competing for the last meal cannot both succeed. |
| Pickup pass | Readable pickup reference, status, meal, amount, location, and time. | Refreshing or signing back in restores the reservation. |
| Cancellation | Customer cancels before displayed cutoff; contact staff afterward. | Cancellation returns stock once, and only once; no fee is earned. |
| Reservation history | Active reservation followed by completed, cancelled, and missed reservations. | Customers see only their own records. |
| Support | A configured support contact and clear collection/no-show guidance. | Failed bookings and vendor cancellations provide a useful next action. |
| Minimal operations | Staff publish offers, manage availability, find reservations, record collected-and-paid meals, and close the evening. | Customer cannot grant staff access or mark their own reservation completed. |
| Pilot records | Daily completed units, vendor proceeds, fees, cancellations, no-shows, corrections, and CSV export. | Totals reconcile to transaction records and exclude sample data and unpaid reservations. |

### Deferred from the MVP

- Native Android/iOS releases, app-store distribution, and offline reservations.
- Delivery, maps SDKs, GPS tracking, and campus-wide vendor onboarding.
- Carts, multiple quantities, group orders, substitutions, and partial fulfilment.
- Online payments, wallets, automated payouts, coupons, subscriptions, and loyalty points.
- Reviews, chat, push/SMS reminders, referral programmes, AI recommendations, and complex search.
- Fertilizer checkout, waste collection scheduling, and environmental calculators.
- Separate impact dashboards; purchase history may show completed meal count, without claiming verified waste or carbon savings.

The first vendor's short daily offer list needs neither categories nor a full search engine. Add discovery filters when offer volume makes browsing difficult.

## 4. Pages and navigation

Mobile primary navigation: **Meals · My reservations · Account**. Help and policies are accessible from the account and reservation screens. A vendor section lives on meal details; a separate vendor profile page is unnecessary for one vendor.

| Route | Page | Contents and main action |
|---|---|---|
| `/` | Today's meals | Short EcoBiz introduction, current offers, open/closed status, useful empty state. Open a meal. |
| `/meals/[id]` | Meal details | Image, description, total and price breakdown, remaining quantity, pickup time/location, vendor information. Reserve. |
| `/sign-in` | Sign in | Google login, reason an account is needed, error/retry state. Resume intended page. |
| `/auth/callback` | Authentication callback | Technical route; handles session and safe return location. No separate content page. |
| `/reserve/[mealId]` | Review reservation | Profile completion if needed, one-unit order summary, pickup terms. Confirm reservation. |
| `/reservations` | My reservations | Active pickup card and dated history. Open details. |
| `/reservations/[id]` | Pickup pass / reservation detail | Reference, current status, full instructions, amount payable, cancellation and support. This is also the confirmation page. |
| `/account` | Account | Display name, phone, sign out, privacy and account-removal contact. |
| `/help` | How it works and support | Reserve/collect/pay explanation, deadlines, cancellation guidance, support contact. |
| `/privacy` | Privacy notice | Collected data, purposes, access, retention policy, and contact. Final wording depends on agreed operations. |
| `/terms` | Pilot terms | Pickup/payment rules, cancellations, no-shows, and dispute contact; approved operational policy must match the UI. |
| `/ops` | Staff operations | Today's offers, reservation lookup, completion action, evening close, daily totals and export. |
| `/ops/offers/new` | Create offer | Photo, meal details, quantity, price, date, cutoffs and pickup instructions. Publish. |
| `/ops/offers/[id]` | Edit / withdraw offer | Update unreserved stock, pause new bookings, or cancel outstanding reservations with a reason. |

Also implement loading, empty, sold-out, closed, permission-denied, not-found, network-failure, and server-error states. These are states of existing pages, not additional features.

## 5. End-to-end customer loop

1. **Discover:** Student opens an EcoBiz link from Telegram or WhatsApp. They see actual available meals without creating an account.
2. **Evaluate:** They open a meal and check the photo, description, price including fee, vendor location, and pickup window.
3. **Identify:** They select Reserve. If needed, they sign in and add name/contact details. The app returns them to the selected meal.
4. **Review:** They see the complete commitment: one meal, total payable, pickup window, cancellation cutoff, and payment at collection. Viewing this screen does not hold stock.
5. **Reserve:** The server rechecks time, offer status, customer eligibility, and stock inside a database transaction. Success creates the reservation and opens the pickup pass.
6. **Prepare:** They can reopen My reservations to see the pass. Before the cutoff, they can cancel and release the meal.
7. **Collect and pay:** They visit the vendor, show the reference, and pay the displayed total using the vendor's agreed payment method. The customer cannot self-confirm payment.
8. **Verify:** The authorised operator obtains vendor confirmation that the meal was handed over and paid for, then marks it completed in one operation.
9. **Return:** The purchase appears in history. The customer returns to Today's meals on another day. This repeat purchasing loop is the MVP's retention mechanism.

Example only: RM7.00 vendor price + RM0.50 EcoBiz fee = RM7.50 paid at collection. The RM0.50 becomes owed to EcoBiz only after completion; it is not proof that the vendor has settled it.

### Failure and recovery paths

- Last meal taken during login/review: show sold out; do not create a reservation or charge anything.
- Repeat taps or a response lost after success: reuse a request key and recover the existing reservation instead of creating another.
- Connectivity failure with unknown outcome: show “Checking reservation” and query persisted state before inviting a new attempt.
- Customer misses pickup: operator closes the evening and marks unresolved reservations as no-shows after checking handovers. No automatic charge.
- Vendor cannot fulfil: staff cancel with a reason; no fee is earned. Customer sees the reason in the app; operations directly contacts affected customers using the agreed contact process.
- Vendor withdraws an unsafe/unavailable offer: stop reservations immediately; never restore its cancelled stock to public availability.
- Customer reaches a stale pass: staff check server state before handing over food. A screenshot or reference alone does not establish an active reservation.
- App outage: stop accepting app reservations; use the agreed manual support procedure and record later reconciliation without duplicating existing reservations.

## 6. Architecture and boundaries

```text
Customer / staff browser
          |
          v
Next.js application
  - public meal pages
  - customer account and reservations
  - protected operations screens
  - validated server actions
          |
          v
Supabase
  - Auth: identity and sessions
  - PostgreSQL: offers, reservations, transactional functions, access policies
  - Storage: meal photos
```

One repository, one application, one database. Use Next.js server actions for form mutations; route handlers only where an HTTP endpoint is necessary, such as the auth callback and CSV download. Do not implement duplicate APIs for the same operation.

Browser checks improve usability; trusted database functions enforce reservation rules. Use row-level security and restricted grants on customer records. Critical mutations must go through validated transactional functions, not unrestricted table writes. Each function must derive caller identity from the authenticated session, check role/ownership, and use a fixed search path if elevated privileges are required.

No realtime subscriptions are necessary initially. Fetch availability on page load, refresh when returning to the tab, and revalidate on reservation. Show a last-updated cue where useful; the transaction is authoritative.

### Proposed source structure

```text
src/app/                  pages, layouts, actions, callback and export routes
src/components/           reused controls, meal card, pickup pass, navigation
src/lib/supabase/          browser/server session clients
src/lib/                  money/time formatting and input validation as needed
supabase/migrations/      schema, constraints, access policies, transaction functions
tests/                    reservation database checks and browser journeys
public/                   original logo and static assets
```

Keep logic near its owning feature until actual reuse warrants extraction. Do not introduce generic repository/service layers or build all future vendor features in advance.

## 7. Data model and transaction rules

| Record | Essential fields / purpose |
|---|---|
| Auth user | Managed by Supabase; immutable user ID and sign-in identity. |
| Profile | User ID, display name, phone, timestamps. No customer-editable role field. |
| Staff membership | User ID and authorised vendor ID; provisioned by a trusted administrator, never public signup. |
| Vendor | Name, campus location, pickup directions, active status. Do not expose private vendor contacts in public projections. |
| Offer | Vendor ID, name, description, image, dietary notes, vendor price in sen, fee in sen, optional verified ordinary price, stock, service date, booking/cancellation deadlines, pickup start/end, publication status. |
| Reservation | Customer and offer IDs, status, immutable price/meal/pickup snapshots, pickup reference, unique request key, creation/completion/cancellation timestamps, cancellation reason. |
| Reservation event | Reservation ID, actor, time, previous/new status, reason. Records staff actions and corrections. |
| Settlement | Vendor, covered completed reservations, amount, time, recording staff member, evidence/reference. Tracks money actually received separately from fees owed. |
| Adjustment | Original reservation/settlement reference, signed vendor/fee amounts, reason, staff actor, timestamp. Used for corrections without erasing original evidence. |

All amounts use integer sen, never floating-point calculations. Store timestamps in UTC; display Malaysia time and make service dates explicit. Price and pickup changes affect new bookings only; existing reservations retain agreed snapshots. For the pilot, disallow material edits to an offer with active reservations: withdraw/cancel and contact affected customers instead.

### Reservation state machine

```text
reserved -> completed    (staff: paid AND collected)
reserved -> cancelled    (customer before cutoff, or authorised staff with reason)
reserved -> no_show      (staff after pickup end and handover reconciliation)
```

Completion, cancellation and no-show are terminal for normal UI actions. Corrections use an audited staff workflow and corresponding adjustments; no silent deletion or repeated state toggles. Completed does not mean fee settled.

### Inventory and integrity

- Create a reservation and decrement available stock within one transaction, locking the offer row or using an equivalent guarded atomic update.
- Enforce non-negative stock, positive vendor price, non-negative fee, valid deadline ordering, and unique pickup references with database constraints.
- Enforce one active reservation per customer with a database uniqueness rule, including concurrent requests against different offers.
- Scope idempotency keys to the authenticated customer; a retry must return the same reservation. Reusing a key for different input returns an error.
- Cancellation changes state and restores inventory in one transaction. A cancelled or withdrawn offer remains unavailable even if its count increases.
- Lock and check reservation state when completing, cancelling, or closing it; simultaneous staff/customer actions must resolve to one valid transition.
- Booking is allowed only before booking cutoff, using server/database time. Pickup window and service date must be current.
- No-shows do not reopen expired inventory. A new day requires a new offer; food is never automatically carried forward.
- No automated reminder or expiry scheduler is required initially. The server blocks expired bookings immediately; the operator explicitly closes unresolved reservations each evening. Closing is idempotent and part of the launch runbook.
- The daily close clears no-shows so old unresolved records do not block tomorrow's one-active-reservation rule. The operator must reconcile overdue records before the next sale opens.

## 8. User experience and accessibility

- Design for a phone first, then adapt the same pages for desktop. No forced app installation.
- Extend the existing EcoBiz identity: forest #102C23, ivory #F7F8EF, green #159447, lime #9CCB20 and restrained yellow #F4D900. Keep actual logo proportions.
- Use restrained organic artwork around content; reserve clear surfaces for prices, forms and pickup instructions.
- Main action changes meaningfully: Reserve, Sold out, Reservations closed, or View reservation.
- Show “Pay at pickup” beside the amount; never imply online payment occurred.
- Use semantic HTML, visible focus, labelled controls, meaningful alt text, text error messages, adequate contrast and approximately 44px tap targets.
- Do not use green/red colour alone for status. Test keyboard navigation and screen-reader announcement of reservation success/failure.
- Compress meal images, reserve image dimensions, and avoid heavy animation. Target a usable meals page within 3 seconds on a representative mobile connection; measure rather than promise.

## 9. Security, privacy and operational reliability

- Public access is limited to published offers and public vendor information.
- Customers can read their own reservation/profile data and perform only permitted actions.
- Staff access is limited to their assigned vendor and required operational records. Do not return bulk customer contacts to public or customer routes.
- Keep administrative keys on the server; never put them in browser bundles. Prefer caller-scoped sessions and narrow database functions.
- Validate IDs, text lengths, phone input, deadlines and amounts at trust boundaries. Rate-limit reservation attempts and reference lookup; return safe errors.
- Restrict OAuth return paths to internal approved paths. Verify sessions server-side before mutations.
- Staff-only photo upload with type/size restrictions; proposed limit 5 MB, JPEG/PNG/WebP. Do not accept arbitrary active content.
- Redact phone numbers, tokens and private records from logs and exported demonstration material. CSV exports require staff authorisation and safe handling of spreadsheet formula prefixes in text fields.
- Before collecting live contact data, assign the contact owner and approve access, retention and removal processes. Proposed default: operational contact access only; remove contact details when no longer required under the agreed retention policy. Numeric retention and transaction-record requirements must be resolved before launch, not invented in code.
- Separate development/demo and live databases. Clearly label demo screens; never count seeded meals or simulated purchases as actual impact.
- Use versioned migrations, deploy compatible database changes before dependent code, and maintain a tested backup/export and restore procedure appropriate to the selected plan.
- Maintain rollback instructions, an operator contact, and a manual outage/reconciliation procedure. Never log a reservation as successful until persistence is confirmed.

## 10. Delivery plan

Planning estimate: 12–16 focused developer days for one developer familiar with this stack, plus vendor decisions, deployment setup and pilot feedback. This is an estimate, not a deadline guarantee. The business document's 18 October readiness target leaves limited margin; dates below are proposed sequencing from 28 September.

| Phase | Target window | Deliverable | Exit condition |
|---|---|---|---|
| 1. Confirm scope and policies | 28–29 Sep | Review this plan; finalise login, quantity, cutoffs, staff owner and hosting direction; wireframe core screens. | Customer journey and proposed rules agreed; unresolved operational dependencies assigned owners. |
| 2. First vertical slice | 30 Sep–2 Oct | App setup, schema/migrations, seeded demo data, public list and meal details; deployed preview when host available. | A phone can open an offer with accurate price, time and location from persisted data. |
| 3. Reservation loop | 3–6 Oct | Auth, profile capture, reservation review, atomic booking, pickup pass and history. | Two-user last-item check, duplicate retry, ownership checks and refresh recovery pass. |
| 4. Operational completion | 7–9 Oct | Staff offers, payment/collection confirmation, cancellation, evening close, daily report, settlement/adjustment recording. | One offer completes its full publish/reserve/collect/pay/reconcile lifecycle. |
| 5. Hardening and pilot | 10–14 Oct | Mobile/accessibility checks, failure handling, security tests, approved policies, real vendor walkthrough. | Launch checklist passes; small supervised pilot if business dependencies are ready. |
| 6. Stabilise and demonstrate | 15–18 Oct | Fix pilot issues, reconcile evidence, rehearse demo, prepare separate demo fallback and operational handover. | Complete live demonstration with truthful separation of sample data and real transactions. |

Build each phase as a working slice. Do not complete every visual page before proving reservation correctness. If time tightens, remove optional visual polish and account conveniences before reducing inventory, authorisation, reconciliation or accessibility safeguards.

### Suggested responsibilities

- Muaz: application implementation, technical decisions, deployment and release readiness.
- Iskandar: vendor rules, pilot operations, transaction reconciliation and feedback; operational ownership requires explicit agreement.
- Haziq: meal photography, branding, interface assets and readable customer copy.
- Faiz: factual wording for the recovery experiment; no fertilizer-sales development dependency.

## 11. Verification plan

Use a small set of high-value automated checks, plus real-device walkthroughs. Avoid snapshot tests for every visual component.

| Check | Required result |
|---|---|
| Two customers reserve the last unit simultaneously | Exactly one reservation succeeds; stock becomes zero, never negative. |
| One customer submits twice / retries after timeout | One persisted reservation and one stock decrement. |
| One customer reserves different meals concurrently | At most one active reservation. |
| Customer modifies submitted price or customer ID | Trusted price and authenticated identity are used; unauthorised input rejected. |
| Customer reads another reservation or calls a staff mutation | Denied at the database/mutation boundary, not only hidden in the UI. |
| Cancellation repeated, or raced with completion | One valid terminal state; stock restored at most once; fee only for completion. |
| Booking exactly at cutoff, after expiry, or against withdrawn offer | Rejected using server time regardless of device clock or stale page. |
| Offer edited after reservation | Existing agreed terms preserved; disallowed changes require withdrawal workflow. |
| Evening close and report rerun | No duplicate no-shows, fees, settlements or adjustments. |
| Completed purchase followed by correction | Original evidence remains, adjustment is traceable, totals reconcile. |
| Customer refreshes pickup pass / signs back in | Persisted reservation and status return correctly. |
| Full browser journey | Browse -> login -> reserve -> staff completion -> customer history succeeds. |

CI runs type checking, lint, production build, rule/database tests, and the critical browser flow against isolated test data. Manually check a real Android browser, iPhone Safari where available, narrow-screen layout, keyboard interaction, slow connectivity, and OAuth returning from a messaging app's embedded browser. Provide “Open in browser” guidance if the provider blocks embedded sign-in.

## 12. Release checklist and success measures

- [ ] Vendor participation, meal suitability/handling, prices, packaging and pickup process agreed.
- [ ] Quantity, booking/cancellation cutoffs, no-show follow-up and dispute/correction policy agreed.
- [ ] Named operator available for payment/collection confirmation and evening close.
- [ ] Contact-data purpose, access, retention and support owner approved before collection.
- [ ] Hosting terms, costs, usage limits, credentials and recovery arrangements confirmed.
- [ ] Demo data isolated; live stock and pickup directions verified.
- [ ] Concurrency, identity, permissions, money and complete-customer-loop checks pass.
- [ ] Phone walkthrough and staff rehearsal completed.
- [ ] End-of-day CSV and fee/settlement totals reconciled to known transactions.
- [ ] Error logs, rollback instructions and manual outage procedure available.

Technical success: no oversold meals in concurrency tests; no unauthorised reservation access; no duplicate reservations from retries; correct fee records; an independently repeatable customer-to-operator flow.

Pilot measures: genuine completed meal units, cancellations, no-shows, repeat customers, vendor proceeds, fees owed, fees settled and discrepancies. Derive these from records; do not install a separate analytics platform initially. Reservation-to-completion rate is completed reservations divided by all reservations for closed service dates, with cancellations/no-shows reported separately. Set business targets after observing baseline supply and demand.

Do not translate these measures into kilograms of waste, CO2 avoided, donations or fertilizer outcomes without supporting evidence. Savings require a verified comparable ordinary price and include the service fee.

## 13. Decisions and dependencies to resolve

| Decision | Proposed default / required input | Timing |
|---|---|---|
| Platform | Mobile web first | Before implementation |
| Login | Google through Supabase; verify student access and OAuth setup | Before reservation-flow signoff |
| Quantity | One unit and one active reservation per customer | Before schema is finalised |
| Time policy | Book/cancel before 9:40 pm; collect 9:40–9:55 pm | Vendor approval before live publishing |
| Fee | 50 sen per completed meal, itemised in total | Vendor/founder approval before sales |
| Contact details | Name and phone at first reservation | Purpose, owner and retention agreed before live capture |
| Staff operation | EcoBiz team acts on vendor confirmation | Named operator and backup before pilot |
| Hosting | Commercial-permitted host and actual cost within separately agreed allocation | Before live deployment; no purchases in this planning task |
| Scope of user eligibility | Campus-focused, no student verification initially | Confirm whether restricted access is actually required |

Development can use the proposed defaults and sample data once the plan is approved. Live operation depends on the relevant business decisions being resolved.

## 14. After the first MVP

1. **Improve a proven pilot:** act on observed login friction, cancellations, pickup confusion and operator workload; add reminders or quantity selection only if the evidence warrants them.
2. **Vendor self-service:** introduce vendor accounts, listing management and settlements when a second participating vendor makes staff mediation burdensome.
3. **Broader campus use:** improve discovery, moderation and support after the single-vendor flow is reliable.
4. **Payments or native app:** evaluate only when payment or web-platform limitations are demonstrated and the business can support the added obligations and cost.
5. **Organic recovery and fertilizer:** define a separate product scope after process suitability, operating permissions, product readiness, costs and buyer demand are established.

The next implementation deliverable is the first working slice: branded mobile meal browsing backed by the real schema, followed immediately by a reliable reservation transaction.

## 15. Front end partition

**Added:** 1 October 2026.  
**Design decision:** The founder selected dashboard variation **A — Organic welcome** as the app's visual direction.  
**Goal:** Complete the MVP frontend in exactly three sequential parts, with working navigation, forms, and simulated customer/staff interactions by the end of Part 3.

This partition is the frontend-first sequence requested by the founder. It takes precedence over the database-first implementation ordering for this stage; sections 6–7 and 9–12 still govern subsequent backend integration and live release. A complete frontend means all MVP screens and interactions work with demo data. Real authentication, database inventory guarantees, staff authorisation, and production operations require backend integration before live use.

### Selected design reference and rules

- Selected original attachment: retained locally, not published. Current demo captures appear in the [project README](../../README.md).
- Durable generation reference: [Selected dashboard A](https://d8j0ntlcm91z4.cloudfront.net/user_3EbIKJiq93OP4D7Jnqcrk4yIGeR/hf_20260928_064806_7e388221-31d4-458b-bf7a-20b1e9b738ef.png); Higgsfield job `7e388221-31d4-458b-bf7a-20b1e9b738ef`.
- Original prompt and metadata: entry A of the locally retained dashboard concept records (not published). Generated using `gpt_image_2_5`, `resolution: "2k"`, `quality: "high"`; returned dimensions 1520 × 2688.
- Supporting identity: the locally retained Deck Guideline, especially sections 1–2. The selected dashboard is the primary application composition reference; deck typography sizes, slide ratios, footers, and page numbers do not apply to web screens.

Preserve these features across the frontend:

| Element | Implementation direction |
|---|---|
| Canvas | Deep forest `#102C23`; ivory `#F7F8EF` text; pale sage `#DCE8D5` supporting details. |
| Accents | Green `#159447`, lime `#9CCB20`, restrained yellow `#F4D900`. Dark forest text on lime actions; check contrast on actual shades. |
| Hero | Signed-in greeting and large left-aligned heading; leaf ribbons, fine contour lines, and a small flat meal illustration concentrated at the upper-right. |
| Meal cards | Warm ivory surface, rounded corners, prominent food photo, dark forest title/price, stock badge, fee note, and wide lime action. |
| Reservation summary | Forest panel with lime outline, simple line icon, and clear empty/active status text. |
| Navigation | Forest bottom bar with Meals, My reservations, Account; lime active icon/indicator and visible labels. |
| Typography | Manrope headings and Inter body where available; sensible sans-serif fallbacks. Match weight and hierarchy rather than baking lettering into images. |
| Logo | Reuse [Logo.jpeg](../../assets/brand/Logo.jpeg) intact in a small light area. The UNITEN label identifies the campus; do not imply institutional endorsement. |
| Artwork | Reuse suitable local assets or create lightweight SVG/CSS decoration during implementation. Treat decorative art as non-interactive and hidden from assistive technology. |

Rebuild the reference as real HTML/CSS components; do not use the entire screenshot as the page background. Keep prices, meal content, headings, and controls editable and accessible. Muaz, meal names, prices, stock, and pickup times are demo values or data fields, not hardcoded permanent UI content.

On narrow phones, keep two meal columns only when titles, prices, and actions remain readable; otherwise stack cards. Reduce/crop hero artwork to protect text. At tablet/desktop widths, use a centred wider content area and expand the meal grid. Pages scroll naturally; fixed navigation must respect safe-area insets and never cover the last control or keyboard-focused input. Detail/form/staff pages use quieter artwork while retaining the same palette and controls.

### Part 1 — Visual foundation and meal discovery

**Outcome:** A running Next.js frontend whose signed-in home recognisably matches the selected image, with usable meal browsing and detail pages.

**Build:**

- [ ] Set up TypeScript, Next.js App Router, CSS Modules, shared CSS variables, and local run/build commands. Keep the app code in one application directory without moving the existing project documents.
- [ ] Prepare the original logo, decorative hero art, and clearly illustrative meal photos with sensible dimensions and file sizes.
- [ ] Build only the shared pieces already needed: app shell, header/avatar, bottom navigation, button/form styles, meal card, status panel, and price/time formatting.
- [ ] Implement `/` in guest and signed-in states. After demo login, return here when no reservation destination is pending. Display the greeting, Tonight's good food heading, pickup line, vendor, meal cards, and no-active-reservation panel from the reference.
- [ ] Implement `/meals/[id]`: description, portion information, vendor-supplied dietary notes, price breakdown, location, pickup window, and Reserve action. Missing dietary information remains explicitly unknown.
- [ ] Create a small typed demo dataset using the offer/profile/reservation fields from section 7. Include available, sold-out, closed, and empty-list scenarios. Keep demo data and any later server integration separate from presentational components without adding a generic service framework.
- [ ] Implement discovery loading, image fallback, unknown meal/not-found, and retryable load-error states. Use an explicit development scenario/reset control so states are easy to review.
- [ ] Build responsive behaviour and keyboard/focus basics alongside each screen.

**Completion check:** `/` and meal details run locally, links open the correct meal, unavailable meals cannot begin a booking, and total prices include the displayed 50-sen fee. Compare rendered screenshots against dashboard A at a representative phone width; also check 320px and desktop widths for clipping, contrast, tap targets, and artwork overlap. Bottom navigation must reach each destination; until Parts 2–3 complete them, unfinished destinations show an honest temporary state rather than a dead link.

### Part 2 — Complete customer reservation journey

**Outcome:** A customer can browse, enter a demo session, reserve, reopen the pickup pass, cancel, and see history through one connected frontend.

**Build:**

- [ ] Implement `/sign-in` with the planned Google-sign-in presentation, pending/error/cancelled states, and safe return to the selected meal/review page. Provide a separately labelled demo sign-in action; do not pretend it authenticates with Google.
- [ ] Implement `/reserve/[mealId]` with first-reservation name/phone capture, purpose notice, inline validation, quantity of one, vendor price/fee/total, pickup terms, cutoff, and confirmation action.
- [ ] Implement `/reservations/[id]` as the confirmation page and reusable pickup pass: reference, current status, meal, amount payable, vendor location, date/window, cancellation, and support.
- [ ] Implement `/reservations` with active reservation and completed/cancelled/no-show history, plus empty state.
- [ ] Implement `/account`: editable demo name/phone, save feedback, sign out, and links to help/privacy/terms. Use sample contact information; do not ask testers to enter real personal data in the prototype.
- [ ] Connect these pages through one small demo state module. Persist non-sensitive sample state in browser storage so refresh/reopening restores the demo session and pass; include reset/version handling. Document that real session credentials and customer records must come from the backend later.
- [ ] Simulate the proposed rules: one active reservation, one stock decrement, cancellation before cutoff, stock restoration once, terminal statuses, and no self-confirmation of payment. Keep values in integer sen and display times in Malaysia time.
- [ ] Add controlled scenarios for sold out during review, duplicate tap, failed submission, unknown booking outcome, closed booking, cancellation failure, and stale/withdrawn reservation. Retry preserves form values; an unknown outcome checks existing state before offering another confirmation attempt.
- [ ] Make the home reservation panel reflect the shared active reservation and link directly to its pickup pass.

**Completion check:** Run guest browse -> meal -> demo sign-in -> review -> reserve -> pickup pass -> refresh -> My reservations -> cancel. A second active reservation is blocked, repeat taps do not create duplicate demo records, and cancellation updates both history and availability once. Check form errors and success announcements with keyboard navigation. Leave one runnable browser journey covering this flow; simulated checks do not establish production concurrency or access security.

### Part 3 — Staff frontend, support pages, and MVP finish

**Outcome:** Every screen in section 4 is implemented, the staff/customer demonstration completes end to end, and the frontend is ready for backend integration.

**Build:**

- [ ] Implement `/help`, `/privacy`, and `/terms` with the guidance from this plan. Mark unresolved operational policy copy as draft in the demo; include an obvious support contact slot without inventing a real number. These pages must be accessible from account, forms, and pickup details where relevant.
- [ ] Implement `/ops`, `/ops/offers/new`, and `/ops/offers/[id]` using a separately labelled staff demo session. Include offer fields, image selection/preview, stock controls, publication/withdrawal actions, field validation, and reservation lookup. Keep staff navigation separate from the customer's three tabs.
- [ ] Implement confirmation that a meal is both collected and paid, cancellation/withdrawal with a reason, and idempotent evening close. Require confirmation for consequential staff actions and show clear pending, success, and failure feedback.
- [ ] Implement daily completed units, vendor proceeds, fees owed, cancellation/no-show counts, and reconciliation UI. Retain historical settlement and adjustment evidence in totals and CSV; their frontend input controls are removed by the 1 October update. Protect CSV text against spreadsheet formula interpretation.
- [ ] Connect staff edits and completion actions to the same demo dataset so the customer dashboard/pass/history update when revisited in the demo. No customer control may mark a purchase paid or completed. Demo role switching is a review aid, not an authorisation mechanism.
- [ ] Finish loading, empty, sold-out, expired, permission-denied, not-found, network-failure, and server-error presentation across customer and staff screens. Verify refresh and direct URL entry for every implemented page.
- [ ] Define the later OAuth callback/redirect handoff from section 4. `/auth/callback` remains a technical integration route, not a fabricated frontend login-success page; actual OAuth handling belongs to backend/auth integration.
- [ ] Complete responsive, accessibility, image-performance, and visual consistency review. Check the selected design at phone size and the whole flow on desktop; ensure long meal names, validation text, and histories remain usable.
- [ ] Run type checking, lint, production build, and the core browser journey; extend that journey through staff paid/collected confirmation and customer completed history. Add focused checks for cancellation, invalid offer data, and report reconciliation where logic requires them.
- [ ] Write a short local run/demo/reset guide and backend handoff list: reads/mutations used by each screen, expected data/statuses, error responses, and the demo-only substitutions to replace. Use the existing schema and transaction rules rather than designing a second API model.

**Final completion check:** A reviewer can publish a sample offer, discover it as a customer, demo-sign-in, reserve, show the pickup pass, complete it in staff mode, and see the completed purchase and correct fee totals. Cancellation/no-show/withdrawal scenarios also have clear outcomes. All customer/staff navigation, account editing, support/policy links, forms, export actions, and recovery states work; no unfinished placeholder destinations remain. The frontend builds successfully and has a reproducible local demonstration. Live-release checks from section 12 remain required after backend integration.

### Reusable prompts to preserve the selected direction

Use the following blocks at the beginning of each part's implementation brief. Supply the selected image as a visual reference when the tool supports it. These are reusable instructions; they do not request new image generations or spend Higgsfield credits.

**Brand excerpt — verbatim from the original Higgsfield dashboard prompt:**

```text
Use reference image 1 as the main brand style: Organic Flow, deep forest #102C23, warm ivory #F7F8EF, green #159447, lime #9CCB20, small yellow #F4D900 accents, expressive flat leaf ribbons and fine organic contour lines. Preserve reference 2 EcoBiz logo intact in a small clean light area. Strong geometric sans headings, readable humanist sans UI text, generous spacing, refined restrained curves. Crisp, usable, realistic interface. Leaf decoration at edges only, never behind important text.
```

**Selected layout excerpt — verbatim from variation A:**

```text
Forest background throughout. A generous but restrained greeting hero at top, heading aligned left, flat illustrated leaves sweeping from upper-right around a small plate motif. Under hero place pickup line, then two equally sized ivory meal cards side by side with large food photos, dark forest text and lime actions. Compact outlined reservation status band above forest bottom navigation. Rich brand expression but clear product hierarchy.
```

**Supporting rule — verbatim from DECK_GUIDELINE.md:**

```text
Reduce decoration on detailed pages. A pale content panel may sit within the forest canvas when necessary for readability; this is not a switch to Option B.
```

**Frontend implementation adaptation — include with each part:**

```text
Implement the selected EcoBiz dashboard A direction in Next.js, TypeScript, CSS Modules, and native semantic HTML. Use the selected image as the composition reference and the deck guideline for brand consistency. Build live text, reusable controls, and responsive layouts; keep decoration separate from interactive content. Match the forest canvas, ivory surfaces, leaf illustration style, strong headings, lime actions, and clear bottom navigation. Scale or stack the layout for real phones instead of forcing the screenshot's dimensions. Detail, form, account, and staff screens should extend the same design with quieter artwork. Preserve visible focus, readable contrast, labelled forms, and safe-area spacing. Use clearly labelled sample data and simulate only the behaviours required by this frontend partition. Reuse components already created in earlier parts. Complete and verify the named part's exit criteria before moving to the next part.
```

**Part-specific prompt endings:**

- **Part 1:** “Build the app shell, selected signed-in Meals dashboard, guest variant, meal details, and discovery states. Use dashboard A for visual comparison. Finish Part 1's completion checks.”
- **Part 2:** “Reuse Part 1's visual system. Connect demo sign-in, review, pickup pass, reservation history, cancellation, account editing, and the active-reservation panel. Finish Part 2's completion checks.”
- **Part 3:** “Reuse the same system to complete staff operations, support/policies, reports, all remaining states, and the full customer/staff demo. Finish Part 3's final completion check and document backend integration requirements.”

## 16. Backend partition

**Added:** 1 October 2026.  
**Basis:** Full review of [ECOBIZ_BUSINESS_MODEL_CANVAS.md](../business/ECOBIZ_BUSINESS_MODEL_CANVAS.md) and this app plan, including the frontend partition.  
**Goal:** Complete the MVP backend in exactly five sequential parts, replacing the frontend's simulated data and actions with authenticated, persistent, tested operations.

The backend supports the single-vendor surplus-meal pilot: publish offers -> reserve stock -> collect and pay at the vendor -> confirm completion -> reconcile fees -> record vendor settlement. It uses TypeScript/Next.js server operations, Supabase Auth, PostgreSQL, and Supabase Storage as already specified. Keep one application and one database; use database transactions for shared inventory and financial writes. The three-part frontend remains the screen and interaction specification.

### Business rules carried into every part

| Documentation requirement | Backend responsibility |
|---|---|
| Reservation without advance payment | Create a reservation without a payment gateway, deposit, or customer debit. |
| Proposed fee of RM0.50 per completed meal | Store 50 sen as the approved launch default only after vendor/founder agreement; snapshot the fee and vendor price at reservation. |
| Payment and collection both confirmed | Only vendor-assigned staff can complete a reservation; record who confirmed it and when. |
| Vendor later settles EcoBiz's fees | Track fees owed and money received separately; reconcile daily initially, then use the agreed settlement cadence. |
| Proposed 9:40–9:55 pm pickup | Store each offer's date and deadlines; enforce booking/cancellation cutoffs using database time and display Malaysia time. |
| One unit and one active reservation proposed in the app plan | Enforce with trusted transaction logic and database constraints, including simultaneous requests. |
| Contact details for collection follow-up | Limit collection and access to agreed purposes; implement approved retention/removal procedures before live capture. |
| No approved no-show penalty | Record no-show status without creating a fee, debit, fine, or automatic ban. |
| Honest pilot evidence | Keep demonstration records isolated; report completed purchases and actual settlements without inventing impact measurements. |

Proposed defaults in sections 1 and 13 remain proposals until agreed. Development/test data may use them; live offers and policy text must use the final agreed values. Organic-waste collection, fertilizer sales, donation automation, delivery, online payments, notifications, and vendor self-service remain outside this backend scope. The purchased-input fertilizer experiment stays in the team's existing documentation.

### Backend-to-frontend handoff

Use these operation names as the initial contract, adapted to the actual frontend files when implementation begins. Reads return only fields needed by the screen; mutations return either a persisted result or a stable error code. Identity comes from the verified session, never a submitted customer/staff ID. UUIDs identify records; money is integer sen; timestamps use ISO UTC strings with Malaysia-time display.

| Screens | Required operations | Owner |
|---|---|---|
| Sign-in, callback, account | `getSession`, `getProfile`, `updateProfile`, `signOut`; safe OAuth callback | Part 1 |
| Meals and meal details | `listOffers`, `getOffer` | Part 2 |
| Staff offer forms | `createOffer`, `updateOffer`, `publishOffer`, photo upload | Part 2 |
| Review, pickup pass, history, home status | `reserveMeal`, `getReservation`, `listMyReservations`, `findReservationByRequestKey`, `cancelReservation` | Part 3 |
| Staff lookup and evening close | `findVendorReservation`, `completeReservation`, `staffCancelReservation`, `withdrawOffer`, `closeServiceDay` | Part 4 |
| Staff totals, settlements, adjustments | `getDailyReport`, `recordSettlement`, `recordAdjustment`, authorised CSV export | Part 4 |
| Help/privacy/terms | Final agreed copy and support contact; static pages need no CMS or dedicated database | Part 5 verification |

Use caller-scoped server reads and Next.js server actions for forms; use route handlers where required for OAuth and CSV download. Critical mutations call restricted PostgreSQL functions that validate caller permissions and commit all related changes together. Do not implement the same business rules in separate action and REST API implementations.

Suggested error codes: `UNAUTHENTICATED`, `FORBIDDEN`, `VALIDATION_ERROR`, `NOT_FOUND`, `SOLD_OUT`, `BOOKING_CLOSED`, `OFFER_UNAVAILABLE`, `ACTIVE_RESERVATION_EXISTS`, `CANCELLATION_CLOSED`, `INVALID_TRANSITION`, `IDEMPOTENCY_CONFLICT`, `RATE_LIMITED`, and `TEMPORARY_FAILURE`. Map these to the existing frontend recovery states without exposing SQL, secrets, or another user's data. A timeout can leave the outcome unknown: look up the same request key before treating the booking as failed.

### Part 1 — Database foundation, authentication, and permissions

**Outcome:** Reproducible database setup and real sign-in/profile handling, with access boundaries in place before private data is connected.

**Build:**

- [ ] Inspect the completed frontend's data/state handoff and reuse its feature boundaries. Add Supabase browser/server clients and environment configuration within the existing app; keep secrets out of source control and browser bundles.
- [ ] Create versioned migrations for the records in section 7: profiles, vendor-assigned staff memberships, vendors, offers, reservations, reservation events, settlements, and adjustments. Add settlement-to-reservation links needed for reconciliation. Use foreign keys, integer-sen fields, status constraints, positive prices, non-negative stock/fees, valid deadline ordering, and indexes for the actual queries.
- [ ] Add uniqueness constraints for pickup references, customer/request-key pairs, and one active reservation per customer. Prevent reservation/financial evidence from disappearing through accidental cascading deletion.
- [ ] Enable row-level security and explicit grants for every exposed table. Deny direct critical writes to offers, reservations, events, settlements, and adjustments until their authorised functions are implemented in later parts. Public access exposes only published offer/public-vendor fields; profiles and reservation records stay private.
- [ ] Provision staff memberships through a trusted administrator procedure. Customer profile edits and sign-up must never grant vendor access or staff privileges.
- [ ] Implement Google OAuth through Supabase, the real `/auth/callback`, safe internal return paths, server-verified sessions, session refresh, sign-out, and login cancellation/error handling.
- [ ] Implement own-profile read/update, validated name/phone fields, and first-reservation profile readiness. Restrict private contact visibility to the owner and assigned staff with an operational need. Finalise the contact purpose/retention decisions before enabling live capture.
- [ ] Seed synthetic users/offers only into development/test environments; keep live data in a separate environment. Document migration, seed, and test commands without storing credentials.

**Completion check:** Apply migrations to an empty test database, sign in as two customers and one staff member, and reconnect the account screen. Verify customer A cannot read/update customer B, a customer cannot self-assign staff access, and unassigned staff cannot access another vendor. Check the same permissions through direct database requests as well as app actions. Signing out removes access; unsafe callback destinations are rejected. Private pages must not share cached responses between users.

### Part 2 — Vendor offers, availability reads, and meal images

**Outcome:** Staff can create and publish real offers; the customer's discovery/detail screens load current persisted data.

**Build:**

- [ ] Implement the public `listOffers` and `getOffer` projections, filtering by vendor status, publication state, service date, and relevant time/availability. Expose sold-out/closed status deliberately for the UI; never expose drafts, customer contacts, or private vendor fields.
- [ ] Implement staff-scoped create/update/publish operations with server and database validation for vendor assignment, descriptions, dietary notes, price, quantity, service date, and deadline ordering. Use the configured agreed fee, not a price/fee submitted by a customer.
- [ ] Require future/current valid booking windows to publish. Preserve the original per-offer deadlines and use UTC timestamps derived from Asia/Kuala_Lumpur service dates.
- [ ] Establish the published-stock update rule: staff set remaining unreserved units through a transaction that locks the same offer record used for booking. A stale form must receive a conflict instead of overwriting intervening reservations; material edits with active reservations are rejected as specified in section 7.
- [ ] Configure public meal-photo reads with staff-only, vendor-scoped uploads; validate actual file type and the proposed 5 MB JPEG/PNG/WebP limit. Store a stable object path, use unique upload names, and restrict delete/replace to permitted objects. Meal-photo storage must not contain private settlement evidence or contacts.
- [ ] Connect `/`, `/meals/[id]`, and staff offer forms to these operations. Revalidate public availability after updates and on page return; do not cache a stale price as booking authority.
- [ ] Handle unavailable vendors, unknown offers, storage/upload failure, and empty service days with the frontend states already built. Image upload failure must not silently publish a broken offer.

**Completion check:** Assigned staff publish an offer/photo and a guest sees the correct description, total, location, date and stock. Invalid amounts/deadlines/uploads and unauthorised writes fail at the trusted boundary. Drafts are inaccessible by guessing IDs. Check material-edit and stale-stock protections using database test fixtures, then repeat against actual bookings after Part 3.

### Part 3 — Atomic reservations, pickup passes, and customer cancellation

**Outcome:** Customers can reserve and cancel against real shared stock, with reliable retry recovery and persistent history.

**Build:**

- [ ] Implement `reserveMeal(offerId, requestKey)` as one PostgreSQL transaction. Derive the customer from the session, require profile readiness, and check vendor/offer state, service date, booking cutoff, one-active-reservation eligibility, and available stock. Lock/update stock, insert the reservation and snapshots, generate a unique pickup reference, and append its event atomically.
- [ ] Enforce request-key uniqueness and compare request payloads. If the original request already succeeded, return that persisted reservation before applying current cutoff/stock eligibility checks; a retry after cutoff must still recover earlier success. Reusing a key for a different offer fails. Resolve concurrent identical requests without a second stock decrement.
- [ ] Snapshot agreed meal/price/pickup information from trusted records. The browser cannot override customer identity, vendor price, fee, quantity, reservation status, or completion time.
- [ ] Implement own-reservation read/list and request-key recovery reads. Keep the pickup reference a display/lookup aid; it is not an authentication credential. Return current status with the agreed snapshots.
- [ ] Implement customer cancellation with ownership, database-time cutoff, and state checks. Change status, restore stock once, and append an event in one transaction. A withdrawn/closed offer never becomes publicly bookable through cancellation.
- [ ] Define a consistent lock order for offer/reservation mutations; use it again in Part 4 to prevent races/deadlocks across booking, stock edits, cancellation, withdrawal, and completion.
- [ ] Replace demo booking, pickup-pass/history reads, cancellation, and the home reservation summary with persisted operations. Unknown outcomes recover by request key; known business failures show the corresponding frontend message.
- [ ] Add a bounded shared rate limit on booking attempts using available platform facilities or a small database-backed counter; limits must survive multiple server instances. Keep idempotent outcome recovery available. Avoid an in-memory-only security guard.

**Completion check:** With independent database sessions, two customers compete for the last unit and exactly one succeeds. Test one customer's concurrent requests across two offers, duplicate requests/retries, client price tampering, cutoff boundaries, cancelled/withdrawn offers, and ownership. Stock never goes negative; failed transactions leave no partial changes. Refresh/login restores the pass, and repeated cancellation restores stock only once. Repeat Part 2's edit/stock checks against concurrent real reservations.

### Part 4 — Staff fulfilment, evening close, and financial reconciliation

**Outcome:** Real reservations become auditable completed purchases, no-shows or cancellations; fees and settlement records reconcile correctly.

**Build:**

- [ ] Implement rate-limited vendor-scoped reservation lookup. Only assigned staff can access collection-related customer details; no public pickup-reference search endpoint.
- [ ] Implement `completeReservation` after staff affirm both collection and payment. Lock/check current state, record the responsible staff/time and event, and commit once. Customer requests cannot complete themselves; repeated requests return the already-completed result without double-counting.
- [ ] Implement staff cancellation and offer withdrawal with mandatory reason and vendor checks. Withdrawal stops booking and cancels outstanding reservations in a consistent transaction; completed purchases remain evidence. Revalidate affected customer pages and provide affected-reservation details to the authorised operator for direct follow-up.
- [ ] Implement `closeServiceDay` after pickup ends and handovers are reconciled. Mark only unresolved reserved records as no-shows, with events, without creating fees or reopening expired stock. Repeating close is harmless. Provide the operator a list of overdue unresolved records to resolve before the next service opens.
- [ ] Implement an audited correction operation separate from ordinary terminal-state transitions. Preserve original events/prices, record the correction and actor, and update the effective outcome only with a reason. Financial corrections link to adjustments in the same transaction; do not silently delete/rewrite evidence or reopen old stock.
- [ ] Derive daily completed units, vendor proceeds, EcoBiz fees owed, cancellations, no-shows, and applicable corrections from persisted records. A reservation, completion, settlement, and profit are different measures.
- [ ] Implement `recordSettlement` for actual vendor payments received, with amount, date, evidence/reference, actor, and covered reservations. Lock relevant records, use idempotency keys for financial writes, and prevent the same fee being covered twice. Proposed MVP simplification: each settlement covers a selected set of whole outstanding per-reservation fee balances; defer partial allocation unless the vendor needs it.
- [ ] Implement signed adjustments linked to original transactions/settlements, requiring reason and actor. Retain the original settlement even if a subsequent correction changes the balance; display additional amount owed or vendor credit explicitly. Recording an app adjustment does not itself refund cash to the customer.
- [ ] Implement staff-only daily CSV export with Malaysia service-date boundaries, safe spreadsheet text, and appropriate private-data minimisation. Connect staff operations/report/settlement/adjustment forms to the backend.

**Completion check:** Complete two illustrative RM7.50 purchases: vendor proceeds are RM14.00 and EcoBiz fees owed RM1.00. A cancelled and a no-show reservation add no fee. Record a RM1.00 settlement and verify fees received RM1.00, outstanding RM0.00; retrying does not duplicate it. Correct one completed purchase to cancelled with a full illustrative adjustment of -700 vendor sen/-50 fee sen: net vendor proceeds become RM7.00, net fee entitlement RM0.50, and the unchanged RM1.00 receipt leaves RM0.50 vendor credit. Preserve the full audit history. Also test cancellation/completion/close races, withdrawal during booking, cross-vendor lookup/export denial, and repeat close. The fixture demonstrates accounting behaviour, not an approved real-world refund policy.

### Part 5 — Full integration, security verification, and release readiness

**Outcome:** The complete frontend uses the backend in a test/staging environment, with evidence that the MVP's critical flow is correct and an operational release procedure.

**Build:**

- [ ] Inspect every screen/action from section 15 and remove production reliance on demo roles, local-storage records, fake authentication, simulated success, and sample totals. Keep a separately configured, visibly labelled demo environment for the competition fallback.
- [ ] Verify session expiry, refresh, direct URL entry, and permissions on every private read, server action, database function, storage write and export. Check unauthorised direct requests even when controls are hidden. Restricted functions must validate callers and use safe elevated-privilege configuration where needed.
- [ ] Recheck field/file validation, callback return-path restrictions, shared rate limits, safe errors, private-page caching, log redaction, and absence of secrets in client assets/source control. Booking and financial request keys must preserve retry safety across deploy/restart.
- [ ] Implement the agreed contact retention/removal workflow and assign the operations owner. Preserve transaction evidence only as required by the approved policy; do not use destructive profile/account deletion cascades. Align help/privacy/terms and support details with actual behaviour before live capture/sales.
- [ ] Run the focused database/security/concurrency checks from earlier parts and section 11; run the browser customer -> staff completion -> history journey against the actual staging backend. Check recovery after a lost response and expired session, plus reports against known fixtures.
- [ ] Add CI for type checking, lint, build and critical tests, with isolated data/secrets. Verify migrations from an empty database and upgrade from the preceding schema. Record the tested runtime/dependency versions.
- [ ] Verify the chosen hosting/database/storage plans, actual cost allocation, commercial-use terms, OAuth production redirects and usage limits before release. Use approved account settings/secret storage; this planning task makes no service purchases.
- [ ] Rehearse backup/export and restore in a separate environment, including meal images and auth/config recovery needs. Document compatible migration/deploy ordering, rollback, health/error checks, and a clear procedure to pause booking during an outage.
- [ ] Write the short operator runbook: publish today's stock, confirm vendor payment/collection, handle withdrawals/disputes, close unresolved reservations, reconcile daily, record received settlement, and follow up using the agreed contact process. Assign an operator and backup.
- [ ] Validate every business dependency in section 12 before enabling a supervised live pilot. If vendor/hosting/contact policy decisions are unresolved, keep the technically complete system in test/demo mode and state the outstanding launch dependencies explicitly.

**Final completion check:** Starting with a real staging sign-in, assigned staff publish an offer/photo, a customer reserves it, stock updates for another customer, the pickup pass survives refresh, staff record paid collection, and customer history/report/settlement totals reconcile. All five parts' automated checks and the production build pass; access restrictions hold under direct requests; restore/outage procedures are rehearsed; no demo records appear in live reporting. Live activation additionally requires the vendor agreement, approved contact/payment policies, hosting budget, and named operating owners already required by the business canvas.

### Execution and definition of done

Implement Parts 1–5 in order after the frontend is available, integrating each affected screen as its backend operation becomes ready. Use the existing frontend handoff and data model; adapt file names to the actual repository rather than generating a parallel application. Each part ends with its runnable checks and a working integrated deliverable. Do not mark a part complete merely because a screen displays simulated success.

By the end of Part 5, the MVP backend covers identity, profiles, vendor-scoped offers/photos, persistent reservations and history, inventory/cutoffs, cancellations/no-shows, staff completion, audit/corrections, fee reconciliation, settlements, exports, and release/recovery procedures. Future recovery/product-sales modules require their own validated business scope.
