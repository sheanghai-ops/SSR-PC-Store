# SSR PC Store

An Angular storefront demo for ready-to-go desktop PCs. The All PCs tab has ten mixed products, and each of the five category tabs has ten products. The six tabs use the 60 SVG product pictures in `public/assets/pc-store-images/`. The store also includes product details, a browser-saved cart, a demo checkout, and a downloadable HTML invoice.

## Run locally

```bash
npm install
npm start
```

Open `http://localhost:4200/`. The storefront uses Bootstrap 5 and the blue-and-white layout from the companion `simplepcweb` design, adapted to Angular routes and templates.

## Pages

- `/` — catalog, search, categories, and sorting
- `/category/:category` — direct, refreshable category listings (for example `/category/Gaming%20PC`)
- `/product/:id` — PC details and specifications
- `/cart` — quantity changes, promo codes, and totals
- `/checkout` — demo customer and payment form
- `/invoice/:id` — order summary and downloadable `.html` invoice

Product examples are kept in `src/app/data/sample-products.ts`. Each category contains ten products. Cart and order data use browser local storage; no backend or real payment processing is connected.

## Project layout

- `src/app/app.ts`, `app.html`, `app.css` — storefront shell and page views
- `src/app/data/` — sample catalog data
- `src/app/models/` — product and order types
- `src/app/services/` — catalog, cart, and demo order behavior
- `public/assets/pc-store-images/` — the 60 category and catalog illustrations
- `public/assets/hero-battle-station.svg` — home page banner artwork

## Build

```bash
npm run build
```

The Angular application is configured for server-side rendering. The store itself remains a frontend demo and does not require a backend.
