# Market Day Reserve

Farm stand reservation app for Hollow Creek Farm Stand (Millbrook, NY). Customers browse products, add to cart, and reserve items for pickup on market days (Saturdays and Wednesdays).

## Tech Stack

- **Framework**: Next.js 16 (App Router) with React 19
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4 (via `@tailwindcss/postcss`)
- **Fonts**: Inter (body) + Fraunces (headings) via `next/font/google`
- **Compiler**: React Compiler enabled (`reactCompiler: true` in next.config.ts)
- **Package manager**: npm

## Project Structure

```
src/
  app/                    # Next.js App Router pages
    page.tsx              # Home — Hero, FeaturedProducts, SeasonalCallout, MarketInfo
    shop/page.tsx         # Product listing with category filter
    shop/[slug]/          # Product detail (page.tsx + ProductDetail.tsx)
    cart/page.tsx         # Cart review
    reserve/page.tsx      # Reservation form + confirmation
  components/             # UI components grouped by feature
    home/                 # Hero, FeaturedProducts, SeasonalCallout, MarketInfo
    shop/                 # ProductCard, ProductGrid, CategoryFilter
    cart/                 # CartItem, CartSummary, EmptyCart
    reserve/              # ReservationForm, Confirmation
    layout/               # Header, Footer
  context/CartContext.tsx  # Cart state (useReducer + localStorage persistence)
  data/                   # Static data (products.ts, market.ts)
  lib/                    # Utilities (formatPrice, cn) and constants
  types/index.ts          # Shared TypeScript interfaces
```

## Key Patterns

- **No backend/database** — all data is static in `src/data/`. Cart persists via localStorage.
- **Path alias**: `@/*` maps to `./src/*`
- **Cart state**: React Context + `useReducer` in `CartContext.tsx`. Use the `useCart()` hook.
- **Styling**: Utility-first Tailwind classes. Custom `cn()` helper for conditional classes.
- **Components are client or server** — only `CartContext.tsx` and components using `useCart()` need `"use client"`.
- **Product colors**: Each product has a `color` field (Tailwind bg class) used as a visual placeholder instead of images.

## Commands

```bash
npm run dev     # Start dev server (http://localhost:3000)
npm run build   # Production build
npm run start   # Start production server
npm run lint    # ESLint
```

## Types

- `Product` — id, slug, name, price, unit, category, description, longDescription, color, featured, inSeason
- `Category` — union of "Produce" | "Eggs & Dairy" | "Honey & Preserves" | "Baked Goods" | "Seasonal Specials"
- `CartItem` — { product, quantity }
- `ReservationData` — name, email, phone, pickupDate, items, total
- `MarketInfo` — farm stand metadata

## Conventions

- Use existing Tailwind classes; do not introduce CSS modules or styled-components
- Keep components in their feature folder under `src/components/`
- Add new product categories to the `Category` type in `src/types/index.ts` and the `categories` array in `src/lib/constants.ts`
- Pickup dates are Saturdays and Wednesdays only (generated dynamically in `getPickupDates()`)
