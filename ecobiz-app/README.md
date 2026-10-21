# EcoBiz application guide

For the project introduction, selected documents, and license, see the [project README](../README.md). This guide covers the local frontend demonstration and its implementation details.

For a quick test on Windows, extract the whole repository and double-click **[START_ECOBIZ.bat](../START_ECOBIZ.bat)** at its root. It prepares Node.js and dependencies, starts the current app, and opens your browser. No manual installation or build is needed. Keep its window open while testing.

The [project README](../README.md#try-the-app-on-windows) has a short Meals, Fertilizer and Delivery tour. The [verification record](../docs/VERIFICATION.md) distinguishes the latest launcher checks from earlier application checks.

## Organic leaf styling — 16 October 2026

The approved leaf/ribbon SVG style now extends across customer and vendor routes. Six small vector files in `public/art/leaves/` provide corner flows, behind-card ribbons, contour arcs, sprigs, side sweeps and closing flourishes. `LeafDecoration.tsx` and its CSS Module handle route-specific backings; existing vendor/help section breaks have small margin accents. Leaves are static, hidden from assistive technology and cannot intercept pointer input. Only the decorative viewport clips; content and keyboard focus remain unclipped.

The SVG requirement applies to these organic decorations. Food photos, logos, uploads, page layouts, navigation and business behavior retain their existing implementations. Future leaf decorations should be genuine SVG paths/shapes, without embedded raster pictures or executable content.

Historical design evidence and source snapshots are retained locally, outside the published repository. Curated current captures and the verification record are linked from the project README.

One Next.js / TypeScript / CSS Modules application under `ecobiz-app/`. Part 3 extends the existing dashboard, assets and shared state. No OAuth, database, real payment, vendor agreement or deployment is connected.

## Developer setup and checks

Node.js 24 and npm. From this directory:

```powershell
npm ci
npm run typecheck
npm run lint
npm test
npm run build -- --webpack
npm run start -- --port 3001
```

Open **http://127.0.0.1:3001**. Stop the previous server before starting another on this port. A port is a server address, not another version of the application. Browser storage is separate per port. For development with the existing sandbox installation, use `npm run dev -- --webpack --port 3001` instead of the production server.

With the server running:

```powershell
$env:BASE_URL='http://127.0.0.1:3001'
npm run test:browser
```

The browser script uses installed Edge (`BROWSER_CHANNEL=chrome` selects Chrome). It runs the retained customer/cancellation journey and the staff journey. No new dependencies were added.

## Access over the same Wi-Fi / LAN

The one-click launcher is local-only and does not configure the firewall. For an optional developer-led LAN demonstration, start the server manually with npm run dev -- --webpack --hostname 0.0.0.0 --port 3001. Open the computer's LAN address, such as http://192.168.1.10:3001, from a device on the same Wi-Fi. Keep the computer and server running.

If Windows blocks access, the existing setup_lan_firewall.ps1 is a separate administrator-run helper for Node.js TCP port 3001 on LocalSubnet addresses. It is never run by the launcher. Browser records remain separate on each device and origin; Wi-Fi client isolation can prevent access.

## Full demonstration

1. Open **Demo controls → Reset demo**. Guest, sample offers, seeded history and 1 October 2026 at 9:15 pm MYT are restored.
2. Choose **Staff demo · Cabin Vendor**. Operations has its own navigation. Choose Create sample offer, select one of four meal templates or + for a blank custom meal, fill its required fields and confirm Publish meal. The single editor stays above the growing shared published list. Vendor/service date come from the displayed demo context; new offers use a 50 sen fee. Prices entered in RM are stored as integer sen.
3. Switch Demo session to Guest. Browse the new offer → Reserve → Continue with demo account. Save invented profile details, e.g. Sample Student / 0100000000; confirm the reservation.
4. Refresh and reopen the pass through My Orders → Meal reservations. Note its reference. One stock unit was allocated. The pass means reserved/pay at pickup, not paid/collected.
5. Switch to Staff demo. Find the reference. Check **Meal handed over** AND **Payment received**, then confirm completion. The status event records actor and time; repeating completion cannot count again.
6. Switch to Muaz/customer mode. The pass and history show Completed; the dashboard has no active booking.
7. Return to Staff demo for the service date. One 700 + 50 sen completed meal contributes 1 unit, RM7.00 vendor proceeds, RM0.50 fee owed, RM0.00 settled and RM0.50 outstanding.
8. Download the sample CSV. Daily summary includes historical settlements and signed adjustments; their input controls and dedicated review scenarios have been removed.

Existing cancellation loop: reserve as a customer, attempt another meal (blocked by the active rule), cancel before cutoff with confirmation, then verify cancelled history, no active pass and one stock restoration. Account editing changes the shared greeting; sign out clears the session but keeps the browser records.

## Staff review controls and rules

Use **Reset demo** before an independent scenario. Changing back to Available does not undo records.

- **Staff action failure:** invoke a staff action; nothing commits. Choose Available and retry with the same entered values.
- **Permission denied**, **Loading**, **Load error**, **Server error:** review staff boundary/loading/recovery screens. Retry buttons recover load/server errors. Direct staff URLs in customer mode are denied.
- Reserve a meal first, then enter staff mode for **No-show review** (moves the demo clock after pickup; confirm evening close), **Withdrawal review** (withdraws that offer with a sample reason). These controlled fixtures use the same mutations as product actions.
- Manual withdrawal: edit an offer, enter a reason, confirm the affected reservation count. Booking stops and outstanding passes show the reason. Withdrawn offers are not republished; create a new offer instead.
- Active reservations permit only unreserved-stock and publication-status changes. Paused/Draft stops new bookings while existing agreements remain. Material edits require withdraw/cancel and a new offer. Financial corrections do not rewrite snapshots.
- Evening close requires reconciliation confirmation and time strictly after every relevant pickup window. It marks only remaining reserved records for the vendor/date as no-show. Repeating it adds no events and reopens no stock.
- The four labelled demo-clock choices cover before/exactly-at/after cutoff and after pickup. All stored timestamps are UTC; displayed pickup/date values use Asia/Kuala_Lumpur. This is a frozen demo date, independent of wall-clock time.

Part 2 scenarios remain: last meal taken during review, duplicate confirmation, failure before creation, lost response with **Checking reservation** recovery, cancellation failure, stale pass, vendor cancellation, existing active reservation, sign-in error/cancelled and empty history. Empty history clears untouched seeded terminal history only; records with audit or financial evidence are retained. Alex starts with separate empty history and can demonstrate frontend ownership filtering. Part 1 loading/empty/image/long-name/unavailable states remain.

## Persistence, images and money

Payload version 3 uses the existing `ecobiz-demo-v2` key; valid Part 2 payloads migrate in place. Browser state restores before definitive session/empty UI. Missing state seeds the demo; corrupt/incompatible data resets with a notice. Storage failures explicitly warn that refresh recovery is unavailable. Reset replaces sample state; sign out does not erase records.

Photo input supports JPEG/PNG/WebP up to 5 MB and 24 megapixels. Preview exists only in the current tab; no image bytes enter localStorage. Refresh displays a labelled fallback for uploaded photos. Existing bundled food photos and original EcoBiz logo are unchanged.

Historical settlement validation (no frontend recording flow): full original EcoBiz fee per selected completed reservation, once, within one vendor/service date. No partial/double coverage; zero-fee meals need no settlement. Reservation adjustments change proceeds/fees owed; settlement adjustments change settled fees and must have zero vendor delta. Outstanding = adjusted fees owed − adjusted fees settled. A negative balance is a credit/discrepancy to reconcile. Original evidence is never silently deleted.

This is editable, unencrypted sample browser state. Use invented details only. Local role switching, ownership filtering, draft cloning and request keys do **not** prove secure authorisation, database atomicity or reliable multi-user/cross-tab operation. Review in one tab. Reports and exports are labelled SAMPLE DEMO and contain no profile phone numbers.

## Verification and files

- `npm test`: customer availability/booking/cancellation/recovery plus staff permissions, invalid offers, active edit restrictions, repeated completion/cancellation/close, withdrawal, settlement duplication, signed corrections, CSV/control-prefix escaping and version migration.
- `npm run test:browser`: both customer and staff journeys, production routes/refresh, CSV download/totals, account editing, image rejection/fallback, recovery states, keyboard confirmations/focus, and 320/390/1440px layouts.
- Screenshots: `screenshots/part2-*` and `screenshots/part3-*`. Tall captures extend viewport height so navigation sits below the complete content. Report tables scroll inside their own labelled region.
- Source snapshots before earlier development stages are retained locally and excluded from the published repository.
- Backend contract and live-release work: [BACKEND_HANDOFF.md](BACKEND_HANDOFF.md).

Earlier Part 3 verification predates the compact-editor update. The dated note below records its original checks; the verification record above describes the latest publication checks.

## Remaining live work

Help/privacy/terms now contain useful draft guidance, not placeholders. Support configuration is centrally unset and honestly labelled; retention/removal, operating policies, vendor agreement and support ownership still need approval. `/auth/callback` explains that auth is unconnected without creating fake credentials or success. Replace the demo session/storage/role/clock/image substitutions with real authentication, backend transactions, RLS, authorised uploads and the release checks in the existing plan. No deployment or service purchases were performed.


## Compact meal editor update — 1 October 2026

- Closed is the only closed-availability scenario. Booking at/after the stored deadline or outside the service day stays blocked. Legacy Expired scenario state migrates to Closed without losing records.
- New offers derive both booking and cancellation cutoffs from pickup start in saveOffer, provisionally. Existing offer cutoffs and reservation snapshots are never rewritten by this derivation. Customer booking/cancellation stop exactly at their applicable deadline. Evening close still waits until all pickup windows have ended and handovers are reconciled.
- Prepared images are missing for Nasi ayam goreng, masak merah, kicap and masak lemak. Generic chicken-rice/fish-rice assets are not presented as these dishes. Templates show Photo unavailable; custom meals start blank and reuse validated photo selection/preview. No paid assets or dependencies were added.
- New Offer omits portion, ingredient and cutoff inputs. Customer dietary information remains explicitly unavailable when not supplied. Existing-offer editing and active-reservation restrictions remain.
- Staff navigation uses hand / Operations (existing dashboard), shopping bag / Offers (meal editor and published cards), and question mark / Help (expandable FAQs), with icons above labels and an active indicator. Evening close is last on the operations dashboard; the settlement/correction evidence section is removed. Historical data still contributes to daily totals and CSV.
- Staff Help has ten independent native disclosure questions; customer Help remains separate. Support uses the existing unset configuration.
- Publication locks repeated submissions for one editor, keeps failed values for retry, and appends only on success. Create another offer or choose a meal to start a distinct draft.

### Historical verification — 1 October 2026

Passed on 1 October 2026: `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, and `npm run test:browser` against the final production build at port 3001. Both customer and staff browser journeys passed. Updated checks cover selected service-date context, all four template selections, blank custom fields, integer-sen prices, invalid pickup ordering, failure preserving values without appending, two successive publications below one editor, repeat-submit prevention, cutoff boundaries, history-preserving scenario migration, repeated Evening close, customer visibility, image handling, independent FAQ expansion, and icon-above-label active navigation. Edge layouts at 320, 390 and 1440 pixels had no page overflow; phone/desktop editor and FAQ screenshots were reviewed. Native keyboard/dialog focus checks passed. Actual screen-reader speech, physical devices and other browser engines were not tested.
