# Fertilizer story-first page

Approved: story first, development steps, one order card, then the product FAQ; selected green Garden Rhythm photos for 1/3/5 kg. Shared Meals header, typography and green remain.

Implementation: Fertilizer.tsx owns the page and existing ordering controls. Fertilizer.module.css scopes its long-form sections. Three local optimized WebP assets preserve the selected generated photos; their generation IDs are recorded in public/art/fertilizer/provenance.json. The isolated three-phone review board now scrolls independently inside each phone.

Copy source: documents/business/ECOBIZ_BUSINESS_MODEL_CANVAS.md describes an experiment, purchased trial inputs and unvalidated formulation/processing. The page therefore describes the mission and development approach without inventing ingredients, composting timelines, performance, campus-waste recovery results or application rates. Exact recipe/method and use guidance remain provisional pending the user's answer.

Checks: added browser assertions for story before ordering, absent Garden Pack card, and matching photo/price when choosing 1, 3 and 5 kg. The test failed on the absent story before implementation. Existing order dialog, local persistence and runner behavior retained.


User clarification: bokashi with bayam, carrots, cabbage and cauliflower scraps. Protein inputs are only possible future trials, not tested or confirmed. WSU Extension (https://extension.wsu.edu/kitsap/bokashi-composting/) supports the explanation of sealed fermentation, protein applicability and further soil/compost decomposition. No invented timings, doses or efficacy claims.

User visual direction: adapt the actual Meals ecobiz-hero-reference.svg artwork, preserving its detailed leaves, veins, ivory ribbons, highlights and contour lines while removing the plate and chopsticks. The three organic-flow SVGs in public/art/fertilizer provide the large opening sweep, story-to-photo transition and quieter process contours. Decorations are noninteractive and aria-hidden; readable text, the shared header, Meals typography and green remain. The order card now precedes the product FAQ, following the latest approved section swap.

Validation: production webpack build passed; commerce browser journey and responsive checks passed at 320/390/768/1440; existing customer/browser journey passed. Inspected 390px fertilizer and 1440px sandbox screenshots. Earlier lint, typecheck and unit suites passed. Corrected decoration viewport overflow found at 320px.
