# MarketDay

White-label farmers market online ordering platform. Shoppers browse vendors/products, pick a market date, and either pay online (Stripe — stubbed) or reserve for pay-at-market pickup. Two admin users manage everything.

**Demo identity:** Liberty Station Public Market, San Diego, CA

## Tech Stack

- **Framework**: Next.js 14.2.x (App Router)
- **Language**: TypeScript 5.x (strict mode)
- **Styling**: Tailwind CSS 3.4.x + shadcn/ui
- **Database**: SQLite via Prisma 7.x + better-sqlite3 adapter
- **Auth**: NextAuth v4 (credentials provider, JWT sessions)
- **Payments**: Stripe — STUBBED (mock functions, no real API calls)
- **Email**: Resend — null-safe (silently skipped without API key)
- **Fonts**: Playfair Display (headings) + DM Sans (body) + DM Mono
- **Package manager**: npm

## Project Structure

```
src/
  app/
    (shop)/               # Public shop pages (layout with Header/Footer/CartDrawer)
      page.tsx             # Homepage — hero, how-it-works, vendors, markets
      market/[id]/         # Market shop page with category filters
      vendors/             # Vendor list + detail pages
      cart/                # Cart page with market/payment selection
      checkout/            # Checkout form (react-hook-form + zod)
      order/[id]/          # Order confirmation
    admin/                 # Protected admin area
      login/               # Admin login (NextAuth credentials)
      dashboard/           # Stats, next market, recent orders
      orders/              # Order list + detail with status updates
      vendors/             # Vendor CRUD (list, new, edit)
      products/            # Product CRUD
      markets/             # Market CRUD
    api/
      auth/[...nextauth]/  # NextAuth handler
      orders/reserve/      # AT_MARKET order creation
      stripe/checkout/     # STUBBED Stripe checkout
      stripe/webhook/      # STUBBED webhook placeholder
      admin/orders/[id]/status/ # Order status PATCH
  components/
    layout/               # Header, Footer
    shop/                 # ProductCard, CartDrawer, VendorCard
    admin/                # AdminNav, StatCard, OrderStatusBadge, OrderStatusUpdater
    ui/                   # shadcn/ui primitives
  config/market.config.ts # White-label config (all branding in one file)
  context/CartContext.tsx  # Cart state (localStorage persistence)
  generated/prisma/       # Prisma generated client (gitignored)
  lib/                    # prisma.ts, auth.ts, utils.ts, stripe.ts (stub), resend.ts
  types/index.ts          # NextAuth augmentation + Cart/Checkout types
prisma/
  schema.prisma           # SQLite schema (6 models)
  seed.ts                 # Seed data (2 admins, 3 markets, 8 vendors, 24 products, 5 orders)
  dev.db                  # SQLite database (gitignored)
```

## Key Patterns

- **Database**: SQLite via Prisma 7 with `@prisma/adapter-better-sqlite3`. Config in `prisma.config.ts`.
- **Prisma client import**: `import { PrismaClient } from '@/generated/prisma/client'` (or use `prisma` from `@/lib/prisma`)
- **Enums as strings**: SQLite doesn't support enums — all status/type fields are plain strings
- **Path alias**: `@/*` maps to `./src/*`
- **Cart state**: React Context + `useState` in `CartContext.tsx`. Use the `useCart()` hook.
- **White-label**: All branding lives in `src/config/market.config.ts`
- **Stripe stubbed**: `src/lib/stripe.ts` exports mock functions that simulate checkout
- **Server actions**: Admin CRUD uses Next.js server actions in `actions.ts` files

## Commands

```bash
npm run dev              # Start dev server (http://localhost:3000)
npm run build            # Production build
npm run start            # Start production server
npm run lint             # ESLint
npx prisma generate      # Regenerate Prisma client
npx prisma db push       # Push schema changes to SQLite
npx prisma db seed       # Seed database
```

## Admin Credentials

- `marci@marketday.com` / `marci2026`
- `jessica@marketday.com` / `jessica2026`

## Conventions

- Use Tailwind utility classes; shadcn/ui for form elements and data display
- Keep components in their feature folder under `src/components/`
- Categories defined in `MARKET_CONFIG.categories` — update there for new categories
- Prices stored as integers (cents) in database, formatted via `formatPrice()`
- All market-specific copy/config in `market.config.ts` for white-label rebranding
