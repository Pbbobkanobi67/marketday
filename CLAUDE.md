# Backroads Certified Farmers Market

Online ordering platform for Backroads Certified Farmers Market in El Cajon, CA. Shoppers browse vendors/products, pick a market date, and either pay online (Stripe — stubbed) or reserve for pay-at-market pickup. Admins manage vendor assignments, calendar, applications, and fees. Vendors have a self-service portal for profiles, products, images, and payment QR codes.

**Identity:** Backroads Certified Farmers Market, 14335 Olde Hwy 80, El Cajon, CA 92021

## Tech Stack

- **Framework**: Next.js 14.2.x (App Router)
- **Language**: TypeScript 5.x (strict mode)
- **Styling**: Tailwind CSS 3.4.x + shadcn/ui
- **Database**: PostgreSQL via Prisma 7.x + `@prisma/adapter-neon`
- **Auth**: NextAuth v4 (two credential providers: admin + vendor, JWT sessions)
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
      market/[id]/         # Market shop page (filtered by assigned vendors w/ online ordering)
      vendors/             # Vendor list + detail pages (enhanced profiles)
      cart/                # Cart page with market/payment selection
      checkout/            # Checkout form (react-hook-form + zod)
      order/[id]/          # Order confirmation
      apply/               # Public vendor application form
    admin/                 # Protected admin area
      login/               # Admin login (NextAuth credentials)
      (protected)/         # Auth-gated admin pages
        dashboard/         # Stats, next market, recent orders
        orders/            # Order list + detail with status updates
        calendar/          # Monthly calendar grid with market overview
        vendors/           # Vendor CRUD (list, new, edit) with extended fields
        vendors/[id]/changelog/ # Per-vendor audit log
        vendors/changelog/ # Global vendor changelog
        products/          # Product CRUD
        markets/           # Market CRUD + vendor assignment per market
        applications/      # Vendor application management (approve/reject/convert)
    vendor/               # Vendor self-service portal
      login/               # Vendor login (separate credentials provider)
      (portal)/            # Auth-gated vendor pages (role === 'vendor')
        dashboard/         # Vendor dashboard overview
        profile/           # Edit name, description, contact, social, business info
        images/            # Manage product images (3 slots) + booth photo
        payment/           # Manage payment QR codes (Venmo, PayPal, Zelle)
        products/          # Vendor's own product CRUD (new, edit, delete)
    api/
      auth/[...nextauth]/  # NextAuth handler (admin-credentials + vendor-credentials)
      orders/reserve/      # AT_MARKET order creation
      stripe/checkout/     # STUBBED Stripe checkout
      stripe/webhook/      # STUBBED webhook placeholder
      admin/orders/[id]/status/ # Order status PATCH
      vendor/payment/      # Vendor payment QR endpoint
      calendar/[id]/       # Calendar .ics download
      upload/              # File upload handler
  components/
    layout/               # Header, Footer
    shop/                 # ProductCard, CartDrawer, VendorCard
    admin/                # AdminNav, StatCard, OrderStatusBadge, OrderStatusUpdater
    vendor/               # VendorNav (portal navigation)
    shared/               # ImageUpload (used by admin + vendor portal)
    ui/                   # shadcn/ui primitives
  config/market.config.ts # White-label config (all branding in one file)
  context/CartContext.tsx  # Cart state (localStorage persistence, key: backroads-cart)
  generated/prisma/       # Prisma generated client (gitignored)
  lib/                    # prisma.ts, auth.ts, utils.ts, stripe.ts (stub), resend.ts, changelog.ts
  types/index.ts          # NextAuth augmentation + Cart/Checkout types
prisma/
  schema.prisma           # PostgreSQL schema (9 models)
  seed.ts                 # Seed data (3 admins, 5 markets, 63 vendors, 12 products, 3 orders)
```

## Database Models (9)

- **AdminUser** — admin login accounts (role-based)
- **Market** — market days with type (SATURDAY_MARKET | PICKUP_EVENT) and status (UPCOMING | CANCELLED | COMPLETED)
- **Vendor** — extended profile: contact, social, payment QR URLs, portal password, images, fee tracking, needsReview flag
- **MarketVendor** — join table: vendor assignments to markets (booth space, fee, paid status)
- **VendorApplication** — public application submissions (PENDING | APPROVED | REJECTED)
- **VendorChangeLog** — audit trail for all vendor changes (profile, images, products, payment, password, admin edits)
- **Product** — items for sale with category and vendor relation
- **Order** — customer orders with payment and pickup status
- **OrderItem** — line items with price snapshot at time of order

## Key Patterns

- **Database**: PostgreSQL via Prisma 7 with `@prisma/adapter-neon`. Config in `prisma.config.ts`, `DATABASE_URL` from env.
- **Prisma client import**: `import { PrismaClient } from '@/generated/prisma/client'` (or use `prisma` from `@/lib/prisma`)
- **Status fields as strings**: All status/type fields are plain strings (no Prisma enums)
- **Path alias**: `@/*` maps to `./src/*`
- **Dual auth**: Two NextAuth credential providers — `admin-credentials` (AdminUser table) and `vendor-credentials` (Vendor table). Session includes `role` and `vendorId`.
- **Cart state**: React Context + `useState` in `CartContext.tsx`. Use the `useCart()` hook.
- **White-label**: All branding lives in `src/config/market.config.ts`
- **Stripe stubbed**: `src/lib/stripe.ts` exports mock functions that simulate checkout
- **Server actions**: Admin and vendor CRUD use Next.js server actions in `actions.ts` files
- **Audit logging**: `src/lib/changelog.ts` exports `logVendorChange()` — logs to VendorChangeLog on all vendor mutations
- **Online order gating**: `/market/[id]` only shows products from vendors with `onlineOrdersEnabled = true` AND assigned to that market via MarketVendor
- **Vendor types**: certified_farmer, artisan_craft, hot_food, baked_goods, specialty_food, nonprofit
- **Market types**: SATURDAY_MARKET, PICKUP_EVENT
- **Fee tracking**: Vendor model has `monthlyFee` (cents) and `feeStatus` (FREE default) — placeholder for billing

## Commands

```bash
npm run dev              # Start dev server (http://localhost:3000)
npm run build            # Production build
npm run start            # Start production server
npm run lint             # ESLint
npx prisma generate      # Regenerate Prisma client
npx prisma db push       # Push schema changes to PostgreSQL
npx prisma db seed       # Seed database
```

## Credentials (Dev Only)

**Admin:**
- `marci@backroadsmarket.com` / `marci2026`
- `jessica@backroadsmarket.com` / `jessica2026`

**Test admin:** `bob@backroadsmarket.com` / `Expert09$`

**Vendor login:** Uses vendor email + portal password (set by admin in vendor edit form)

## Conventions

- Use Tailwind utility classes; shadcn/ui for form elements and data display
- Keep components in their feature folder under `src/components/`
- Categories defined in `MARKET_CONFIG.categories` — update there for new categories
- Vendor types defined in `MARKET_CONFIG.vendorTypes`
- Market types defined in `MARKET_CONFIG.marketTypes`
- Prices stored as integers (cents) in database, formatted via `formatPrice()`
- All market-specific copy/config in `market.config.ts` for white-label rebranding
