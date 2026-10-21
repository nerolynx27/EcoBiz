# Verification record

## One-click Windows launcher and README — 22 October 2026

The launcher was exercised from a clean ZIP-style copy of the repository in a path containing spaces, launched from a different working directory. Node.js and npm were removed from that process's PATH. It downloaded Node.js 24 from nodejs.org, verified the archive against the official SHA-256 checksum, installed the locked dependencies, built the app with webpack, started a loopback-only production server and opened the browser.

A second start through the earlier ecobiz-app/run_me.bat compatibility shortcut reused the private runtime, dependencies and production build. Both cache timestamps stayed unchanged, no install/build step ran, and the app returned HTTP 200. Stopping the owned test launcher process tree stopped its server; the existing port-3012 preview was unaffected.

| Check | Result |
| --- | --- |
| Windows launcher tests | Passed: script parsing, occupied-port fallback, checksum rejection before extraction, hashing without Get-FileHash, paths with spaces, dependency caching, dependency updates, failed-install recovery, build reuse, source/asset invalidation and failed-build recovery. |
| Clean first start | Passed on Windows x64 with no system Node.js/npm available to the launcher. Private Node.js 24.22.1 was downloaded and used. |
| Cached second start | Passed through the compatibility launcher without downloads, dependency installation or a rebuild. |
| Production browser journeys | Both commerce-browser.mjs and browser.mjs passed against the launcher-served app, including customer/staff flows, storage failure recovery, keyboard controls and responsive widths. |
| Typecheck and lint | Both passed on the final working tree. |
| Application unit suite | Passed: existing customer, staff and commerce rules. |
| README links and ordering | Passed: local links resolve, the introduction and What you can try precede the quick-start instructions, and all three screenshot panels load. |
| README visual review | Meals, Fertilizer's Our story section and customer Delivery were freshly captured at 390 × 844 and reviewed together in the rendered README. |

The initial development-mode launcher exposed the Next.js development toolbar over the Meals navigation during a storage-recovery browser check. The launcher was changed to an automatically cached production preview, and the same browser suite then passed without changing application behavior or weakening the tests. Source, public assets and application configuration/package files determine when the production build is refreshed.

The first setup needs internet access. Windows x64 was tested; the ARM64 download path is implemented but was not exercised on ARM hardware. These remain local frontend-demo checks, not verification of live authentication, payments, delivery services or backend concurrency.

## Earlier application and publication checks — 18 October 2026
Verified on **18 October 2026**, using Node.js 24 and the local production build on port 3001.

| Check | Result |
| --- | --- |
| `npm run typecheck` | Passed. |
| `npm run lint` | Passed. |
| `npm test` | Passed: customer and staff rules, integer-sen money, cutoff boundaries, request recovery, state migration, and CSV handling. |
| `npm run build` | Passed: production build and route generation. |
| `npm run test:browser` | Passed, exit code 0: customer and staff journeys against the production server, including 320, 390, and 1440 pixel layouts. |
| Focused mobile check | Passed in headless Microsoft Edge with touch/mobile emulation at 320, 360, 390, and 430 pixel viewport widths. |

The focused check confirmed the replacement UNITEN PNG loads at its 428 × 165 natural size, the server returns the current file's exact bytes, the logo does not overlap the account control, customer and staff pages have no horizontal overflow at those widths, staff navigation is visible, and no JavaScript page errors occur. The two README screenshots were captured from the local sample demo at 390 × 844 pixels. They and the README banner were visually inspected.

The README banner reuses the project's existing SVG hero artwork. No new Higgsfield image generation was needed.

Edge could not initialize its temporary profile inside the execution sandbox. Browser checks were rerun with the browser and local server in the same nonsandboxed context; this environment issue did not require an application change.

These checks use an emulated mobile viewport in Chromium, not a physical phone. Safari, Firefox, real-device behavior, screen-reader speech, backend security/concurrency, and a fresh dependency installation were not tested in this run. This is frontend demo verification, not production readiness certification.

Publication preparation changes documentation, ignore rules, licensing, and README visuals. Recovery archives, recordings, historical working materials, installed dependencies, test captures, and generated application output remain local. No Git repository was initialized, and nothing was staged, committed, or pushed during preparation.

The publication-boundary check used the root ignore rules to enumerate the candidate files without initializing Git. It confirmed the three selected planning documents and the pitch PDF are included, while unselected materials and generated files are excluded. All local Markdown links and image references resolve inside the publication subset. A limited scan of candidate text files found no matches for common GitHub token, AWS access-key, Stripe secret-key, or private-key-header patterns; this is not a comprehensive secrets audit or a rights review of embedded binary document content.
