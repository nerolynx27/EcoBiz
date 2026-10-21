# Commerce UI sandbox

Run from this directory:

```powershell
npm run dev -- --port 3011 --webpack
```

- Review board: http://localhost:3011/sandbox
- Fertilizer: http://localhost:3011/fertilizer
- Customer delivery: http://localhost:3011/delivery
- Student runner: http://localhost:3011/delivery/runner
- My Orders: http://localhost:3011/orders

The board uses independent temporary sample state per phone. Individual routes share browser state under `ecobiz-commerce-sandbox-v1`. The original meal demo uses its existing separate key.

All prices, stock, jobs, earnings, ETA and contact details are sample values. Add to order requires sample confirmation. Runner completion uses sample handover code **4821**. No payment, real delivery, messaging or backend is connected.

```powershell
npm run typecheck
npm run lint
npm test
npm run build -- --webpack
npm run start -- --port 3012
$env:BASE_URL='http://localhost:3012'
node tests/commerce-browser.mjs
npm run test:browser
```

This managed sandbox reuses the original installation through a node_modules junction. Webpack keeps module resolution within this arrangement. A standalone checkout can use `npm ci` instead.

Approved visual reference: public/art/commerce/approved-concept.png. Typography includes Barlow Condensed (OFL license bundled). Leaf SVG and all HTML/CSS controls remain editable. Screenshots are local verification artifacts under screenshots/.
