# Fertilizer and student delivery — approved visual design

Approved reference: `ecobiz-app/public/art/commerce/approved-concept.png`.

Goal: reproduce all three approved mobile screens as working frontend demo views in a separate sandbox, preserving existing meal/staff journeys.

- Fertilizer: green page, leaf accents, EcoBiz wordmark, UNITEN label, ivory product card, reference product artwork, 1/3/5 kg selector, RM8/20/30 sample pricing, pickup/delivery selection, Add to order, Garden Pack card.
- Customer delivery: My deliveries / Earn as runner segments, On the way badge, reference cyclist artwork, 10–15 min sample ETA, route, four progress steps, Amir contact row, handover code 4821. Contact opens an explicitly sample-only panel.
- Runner: availability switch, RM12 / 3 deliveries sample starting totals, RM3 meal and RM4 fertilizer jobs, acceptance, pickup and code-confirmed completion. No concurrent acceptance or duplicate earnings.
- Customer bottom navigation: Meals, Fertilizer, Delivery, My Orders, Account. Staff navigation remains separate.
- Visual fidelity: forest #062d20, ivory #faf7eb, lime #c6fb60; original Inter/Manrope and condensed commerce typography, shared Meals/Account logo header, thin line icons, 14px rounded cards. Short copy, no extra marketing sections. Use the actual reference imagery with CSS image windows; implement all UI text and controls as native HTML.
- Routes: /fertilizer, /delivery, /delivery/runner, /orders, /sandbox (three-screen review board).
- Local frontend state uses its own browser storage key; real payments, GPS, messaging, multi-user delivery, and real stock are outside this visual-demo scope. A small Sample demo label identifies sample values.
- Responsive: match the reference proportions at 430px, support 320/390/768/1440 without horizontal overflow; visible keyboard focus, labelled toggles, live feedback, native confirmation dialog.

User approved the image and explicitly requested planning followed by implementation in a separate sandbox. No further design stage is required for this visual demo.
