# Verification record

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
