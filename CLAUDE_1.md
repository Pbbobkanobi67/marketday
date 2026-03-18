# MarketDay — One-Shot Build Specification v2.0
### Farmers Market Online Ordering Platform · White-Label Ready

---

## INSTRUCTIONS FOR CLAUDE CODE

Read this entire file before writing a single line of code.
Build everything in the exact order specified in Part 12.
Do not ask for approval on standard CRUD, UI copy, styling choices, or component structure.
Ask only before making architectural decisions not covered here.
Do not use placeholder text — all copy is provided.
Do not deviate from the tech stack listed.
After building each Part, verify it compiles before moving to the next.

---

## PART 1: PRODUCT VISION

**What this is:** A white-label online pre-ordering platform for local farmers markets.
Shoppers browse vendors and products, pick an upcoming market date, and either pay
online (Stripe) or reserve for pay-at-market pickup. Two market managers admin everything.

**White-label design:** All market-specific values live in one config file.
A buyer of this platform changes `src/config/market.config.ts` to rebrand entirely.

**Demo identity:** Liberty Station Public Market · San Diego, CA
**Admin users:** Marci and Jessica

---

## PART 2: TECH STACK

| Layer | Package | Version |
|-------|---------|---------|
| Framework | next | 14.2.x |
| Language | typescript | 5.x |
| Styling | tailwindcss | 3.4.x |
| UI components | shadcn/ui | latest |
| Database | @prisma/client + prisma | 5.x |
| Database host | Supabase (PostgreSQL) | — |
| Auth | next-auth | ^4.24.7 (NOT v5) |
| Payments | stripe | ^16.x |
| Email | resend | ^4.x |
| Image storage | @vercel/blob | latest |
| Forms | react-hook-form + zod | latest |
| Date utils | date-fns | ^3.x |
| Toasts | sonner | latest |
| Icons | lucide-react | latest |
| Animations | tailwindcss-animate | latest |
| Seed runner | tsx | latest (Windows-safe) |

---

## PART 3: SETUP COMMANDS

Run these in order from an empty project folder on Windows 11.

### 3.1 Create Next.js App

```bash
npx create-next-app@14 . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --no-git
```

When prompted:
- Would you like to use Turbopack? → **No**

### 3.2 Install All Dependencies (single command)

```bash
npm install next-auth@^4.24.7 @prisma/client prisma stripe @stripe/stripe-js resend @vercel/blob bcryptjs zod react-hook-form @hookform/resolvers date-fns sonner lucide-react class-variance-authority clsx tailwind-merge tailwindcss-animate @radix-ui/react-dialog @radix-ui/react-select @radix-ui/react-dropdown-menu @radix-ui/react-label @radix-ui/react-separator @radix-ui/react-slot @radix-ui/react-avatar @radix-ui/react-checkbox @radix-ui/react-popover @radix-ui/react-toast @radix-ui/react-tabs @radix-ui/react-badge
```

```bash
npm install -D @types/bcryptjs @types/node tsx
```

### 3.3 Initialize Prisma

```bash
npx prisma init
```

### 3.4 Initialize shadcn/ui

```bash
npx shadcn@latest init
```

When prompted:
- Style: **Default**
- Base color: **Stone**
- CSS variables: **Yes**

Then add components:

```bash
npx shadcn@latest add button card input label select badge dialog separator table tabs avatar dropdown-menu form textarea
```

### 3.5 package.json — Add Seed Script

In `package.json`, add inside the root object:

```json
"prisma": {
  "seed": "tsx prisma/seed.ts"
}
```

---

## PART 4: ENVIRONMENT VARIABLES

Create `.env.local` in the project root. Create `.env.example` with the same keys but empty values. Add `.env.local` to `.gitignore` if not already there.

```env
# ─── Database ───────────────────────────────────────
DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-us-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres.[project-ref]:[password]@aws-0-us-west-1.pooler.supabase.com:5432/postgres"

# ─── NextAuth ───────────────────────────────────────
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="replace-with-openssl-rand-base64-32-output"

# ─── Stripe ─────────────────────────────────────────
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# ─── Resend ─────────────────────────────────────────
RESEND_API_KEY="re_..."
RESEND_FROM_EMAIL="orders@marketday.com"

# ─── Vercel Blob ─────────────────────────────────────
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."

# ─── App ─────────────────────────────────────────────
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

> Note: Supabase requires both DATABASE_URL (pooled, for Prisma runtime) and DIRECT_URL (direct, for migrations). Both come from your Supabase project → Settings → Database.

---

## PART 5: CONFIGURATION FILES (write these exactly)

### 5.1 `tailwind.config.ts` — Replace entire file

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'market-cream': '#FAF7F2',
        'market-warm': '#F5EFE4',
        'market-stone': '#E8DDD0',
        'market-bark': '#7C5C3E',
        'market-soil': '#4A3728',
        'market-sage': '#6B8F71',
        'market-sage-dk': '#4E6B54',
        'market-terra': '#C2603A',
        'market-gold': '#D4A853',
        'market-ink': '#1E1410',
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      fontFamily: {
        display: ['var(--font-playfair)', 'Georgia', 'serif'],
        sans: ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-dm-mono)', 'monospace'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'slide-in-right': {
          from: { transform: 'translateX(100%)' },
          to: { transform: 'translateX(0)' },
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'badge-pop': {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.3)' },
          '100%': { transform: 'scale(1)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'fade-in': 'fade-in 0.4s ease-out',
        'badge-pop': 'badge-pop 0.25s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
export default config
```

### 5.2 `next.config.js` — Replace entire file

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
}

module.exports = nextConfig
```

### 5.3 `src/app/globals.css` — Replace entire file

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 39 60% 97%;
    --foreground: 20 30% 22%;
    --card: 0 0% 100%;
    --card-foreground: 20 30% 22%;
    --popover: 0 0% 100%;
    --popover-foreground: 20 30% 22%;
    --primary: 131 14% 49%;
    --primary-foreground: 0 0% 100%;
    --secondary: 31 35% 88%;
    --secondary-foreground: 20 30% 22%;
    --muted: 35 38% 93%;
    --muted-foreground: 22 20% 46%;
    --accent: 35 38% 93%;
    --accent-foreground: 20 30% 22%;
    --destructive: 0 84% 60%;
    --destructive-foreground: 0 0% 100%;
    --border: 31 32% 85%;
    --input: 31 32% 85%;
    --ring: 131 14% 49%;
    --radius: 0.75rem;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-market-cream text-market-ink antialiased;
    font-feature-settings: "kern" 1, "liga" 1;
  }
  h1, h2, h3, h4, h5, h6 {
    @apply font-display text-market-soil;
  }
}

@layer utilities {
  .container-market {
    @apply max-w-6xl mx-auto px-4 sm:px-6 lg:px-8;
  }
  .price {
    @apply font-sans font-semibold text-market-sage;
  }
  .card-market {
    @apply bg-white rounded-xl border border-market-stone/60 shadow-sm;
  }
  .btn-primary {
    @apply bg-market-sage hover:bg-market-sage-dk text-white font-medium rounded-lg
           px-5 py-3 transition-colors duration-150 text-sm;
  }
  .btn-secondary {
    @apply bg-market-warm hover:bg-market-stone text-market-soil font-medium rounded-lg
           px-5 py-3 transition-colors duration-150 text-sm border border-market-stone;
  }
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}

/* Sonner toast override to match brand */
[data-sonner-toaster] [data-type="success"] {
  background: #f0f6f1 !important;
  border-color: #6B8F71 !important;
  color: #4A3728 !important;
}
```

### 5.4 `src/config/market.config.ts` — Create this file (white-label hub)

```typescript
export const MARKET_CONFIG = {
  // ─── Brand Identity ────────────────────────────────
  marketName: 'MarketDay',
  tagline: 'Fresh from the farm. Ready at the market.',
  shortDescription: 'Your local farmers market, online.',
  contactEmail: 'hello@marketday.com',
  supportPhone: '(619) 555-0100',

  // ─── Venue ─────────────────────────────────────────
  venueName: 'Liberty Station Public Market',
  venueAddress: '2875 Historic Decatur Rd',
  venueCity: 'San Diego',
  venueState: 'CA',
  venueZip: '92106',
  venueFullAddress: '2875 Historic Decatur Rd, San Diego, CA 92106',

  // ─── Schedule ──────────────────────────────────────
  marketDay: 'Saturday',
  defaultOpenTime: '8:00 AM',
  defaultCloseTime: '1:00 PM',

  // ─── Currency ──────────────────────────────────────
  currency: 'USD',
  currencyLocale: 'en-US',

  // ─── Order Settings ────────────────────────────────
  orderNumberPrefix: 'MD',
  orderCutoffHours: 12, // hours before market opens that orders close

  // ─── SEO / Meta ────────────────────────────────────
  siteTitle: 'MarketDay — Liberty Station Public Market',
  siteDescription:
    'Order fresh produce, baked goods, and local specialties from Liberty Station farmers market. Pre-order online, pick up Saturday.',
  siteUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',

  // ─── Social ────────────────────────────────────────
  instagramHandle: '@marketdaysd',
  facebookPage: 'marketdaysd',

  // ─── Feature Flags ─────────────────────────────────
  enableOnlinePayments: true,
  enableReservePayAtMarket: true,
  enableVendorDirectory: true,

  // ─── Categories ────────────────────────────────────
  // Used for filter labels everywhere in the app
  categories: [
    { value: 'produce', label: 'Produce', emoji: '🥬' },
    { value: 'baked', label: 'Baked Goods', emoji: '🍞' },
    { value: 'meat', label: 'Meat & Poultry', emoji: '🥩' },
    { value: 'dairy', label: 'Dairy', emoji: '🧀' },
    { value: 'specialty', label: 'Specialty Foods', emoji: '🫙' },
    { value: 'flowers', label: 'Flowers & Plants', emoji: '🌷' },
  ],
} as const

export type CategoryValue = (typeof MARKET_CONFIG.categories)[number]['value']
```

### 5.5 `middleware.ts` — Create in project root (not src/)

```typescript
export { default } from 'next-auth/middleware'

export const config = {
  matcher: ['/admin/((?!login).*)'],
}
```

---

## PART 6: DATABASE SCHEMA

File: `prisma/schema.prisma` — Replace entire file.

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

model AdminUser {
  id             String   @id @default(cuid())
  name           String
  email          String   @unique
  hashedPassword String
  role           String   @default("admin")
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}

model Market {
  id          String       @id @default(cuid())
  name        String
  date        DateTime
  openTime    String
  closeTime   String
  location    String
  address     String
  description String?
  status      MarketStatus @default(UPCOMING)
  orders      Order[]
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
}

enum MarketStatus {
  DRAFT
  UPCOMING
  ACTIVE
  PAST
  CANCELLED
}

model Vendor {
  id          String      @id @default(cuid())
  name        String
  slug        String      @unique
  description String
  logoUrl     String?
  category    String
  isActive    Boolean     @default(true)
  products    Product[]
  orderItems  OrderItem[]
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
}

model Product {
  id          String      @id @default(cuid())
  name        String
  slug        String      @unique
  description String
  price       Int
  imageUrl    String?
  unit        String
  category    String
  isAvailable Boolean     @default(true)
  vendorId    String
  vendor      Vendor      @relation(fields: [vendorId], references: [id], onDelete: Cascade)
  orderItems  OrderItem[]
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
}

model Order {
  id              String        @id @default(cuid())
  orderNumber     String        @unique
  customerName    String
  customerEmail   String
  customerPhone   String?
  customerNotes   String?
  marketId        String
  market          Market        @relation(fields: [marketId], references: [id])
  items           OrderItem[]
  subtotal        Int
  paymentMethod   PaymentMethod
  paymentStatus   PaymentStatus @default(PENDING)
  pickupStatus    PickupStatus  @default(PENDING)
  stripeSessionId String?
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
}

enum PaymentMethod {
  STRIPE
  AT_MARKET
}

enum PaymentStatus {
  PENDING
  PAID
  FAILED
  REFUNDED
}

enum PickupStatus {
  PENDING
  READY
  PICKED_UP
  CANCELLED
}

model OrderItem {
  id           String  @id @default(cuid())
  orderId      String
  order        Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)
  productId    String
  product      Product @relation(fields: [productId], references: [id])
  vendorId     String
  vendor       Vendor  @relation(fields: [vendorId], references: [id])
  quantity     Int
  priceAtTime  Int
  productName  String
  vendorName   String
}
```

After writing the schema, run:

```bash
npx prisma generate
npx prisma db push
```

---

## PART 7: SEED DATA

File: `prisma/seed.ts` — Create this file exactly.

```typescript
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding MarketDay database...')

  // ── Clean slate ──────────────────────────────────────────
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.product.deleteMany()
  await prisma.vendor.deleteMany()
  await prisma.market.deleteMany()
  await prisma.adminUser.deleteMany()

  // ── Admin Users ──────────────────────────────────────────
  const marci = await prisma.adminUser.create({
    data: {
      name: 'Marci',
      email: 'marci@marketday.com',
      hashedPassword: await bcrypt.hash('marci2026', 12),
      role: 'admin',
    },
  })

  await prisma.adminUser.create({
    data: {
      name: 'Jessica',
      email: 'jessica@marketday.com',
      hashedPassword: await bcrypt.hash('jessica2026', 12),
      role: 'admin',
    },
  })
  console.log('✓ 2 admin users created')

  // ── Markets ──────────────────────────────────────────────
  const market1 = await prisma.market.create({
    data: {
      name: 'Spring Opening Market',
      date: new Date('2026-04-05T08:00:00-07:00'),
      openTime: '8:00 AM',
      closeTime: '1:00 PM',
      location: 'Liberty Station Public Market',
      address: '2875 Historic Decatur Rd, San Diego, CA 92106',
      description: 'Our first market of the spring season. Come celebrate longer days and longer tables.',
      status: 'UPCOMING',
    },
  })

  const market2 = await prisma.market.create({
    data: {
      name: 'Earth Day Weekend Market',
      date: new Date('2026-04-19T08:00:00-07:00'),
      openTime: '8:00 AM',
      closeTime: '1:00 PM',
      location: 'Liberty Station Public Market',
      address: '2875 Historic Decatur Rd, San Diego, CA 92106',
      description: 'Celebrating local, sustainable food. All vendors are certified organic or beyond organic.',
      status: 'UPCOMING',
    },
  })

  await prisma.market.create({
    data: {
      name: 'May Day Market',
      date: new Date('2026-05-03T08:00:00-07:00'),
      openTime: '8:00 AM',
      closeTime: '1:00 PM',
      location: 'Liberty Station Public Market',
      address: '2875 Historic Decatur Rd, San Diego, CA 92106',
      description: 'May flowers, May flavors. The season is hitting its stride.',
      status: 'UPCOMING',
    },
  })
  console.log('✓ 3 markets created')

  // ── Vendors ──────────────────────────────────────────────
  const sunridge = await prisma.vendor.create({
    data: {
      name: 'Sunridge Farm',
      slug: 'sunridge-farm',
      description: 'Family-owned since 1987. We grow over 40 varieties of vegetables on 12 acres in Escondido — no synthetic pesticides, ever. Our stand smells like the earth should.',
      category: 'produce',
      isActive: true,
    },
  })

  const goldenGrain = await prisma.vendor.create({
    data: {
      name: 'Golden Grain Bakehouse',
      slug: 'golden-grain-bakehouse',
      description: 'Long-fermented sourdoughs and laminated pastries baked before sunrise every Friday. Everything is made from California-grown wheat, milled in small batches.',
      category: 'baked',
      isActive: true,
    },
  })

  const mesaHoney = await prisma.vendor.create({
    data: {
      name: 'Mesa Honey Co.',
      slug: 'mesa-honey-co',
      description: 'Raw varietal honeys harvested from our hives across San Diego County. From coastal wildflower to mountain sage — each jar tastes like a specific place.',
      category: 'specialty',
      isActive: true,
    },
  })

  const coastalBloom = await prisma.vendor.create({
    data: {
      name: 'Coastal Bloom',
      slug: 'coastal-bloom',
      description: 'Cut flowers and potted herbs grown on our Carlsbad property. We cut to order on Saturday mornings so everything you take home is as fresh as it gets.',
      category: 'flowers',
      isActive: true,
    },
  })

  const ranchoLibre = await prisma.vendor.create({
    data: {
      name: 'Rancho Libre',
      slug: 'rancho-libre',
      description: 'Grass-fed beef and pastured pork from our family ranch in Valley Center. Animals raised on open pasture, never crowded, never rushed.',
      category: 'meat',
      isActive: true,
    },
  })

  const blueSky = await prisma.vendor.create({
    data: {
      name: 'Blue Sky Creamery',
      slug: 'blue-sky-creamery',
      description: 'Handmade artisan cheese, cultured butter, and whole-milk yogurt from a small herd of Jersey cows in Ramona. Rich, golden milk — the kind that turns heads.',
      category: 'dairy',
      isActive: true,
    },
  })

  const pacificJam = await prisma.vendor.create({
    data: {
      name: 'Pacific Jam Co.',
      slug: 'pacific-jam-co',
      description: 'Small-batch preserves made in a licensed cottage kitchen. We chase peak-season fruit — strawberry in spring, stone fruit in summer, citrus all winter.',
      category: 'specialty',
      isActive: true,
    },
  })

  const desertRoots = await prisma.vendor.create({
    data: {
      name: 'Desert Roots',
      slug: 'desert-roots',
      description: 'Certified organic root vegetables and microgreens from our Borrego Springs operation. Desert sun grows something you can taste.',
      category: 'produce',
      isActive: true,
    },
  })
  console.log('✓ 8 vendors created')

  // ── Products ──────────────────────────────────────────────
  // Sunridge Farm
  const p1 = await prisma.product.create({ data: { name: 'Heirloom Tomato Mix', slug: 'sunridge-heirloom-tomato-mix', description: 'Six varieties, hand-picked that morning. Paste, slicer, and cherry types in one bag.', price: 800, unit: 'lb', category: 'produce', vendorId: sunridge.id, isAvailable: true } })
  const p2 = await prisma.product.create({ data: { name: 'Lacinato Kale', slug: 'sunridge-lacinato-kale', description: 'Dark, tender Tuscan kale. Grown in full sun, harvested young for sweetness.', price: 450, unit: 'bunch', category: 'produce', vendorId: sunridge.id, isAvailable: true } })
  const p3 = await prisma.product.create({ data: { name: 'Seasonal Greens Box', slug: 'sunridge-seasonal-greens-box', description: 'A curated 5 lb box of whatever\'s best this week — greens, herbs, and something unexpected.', price: 1800, unit: 'each', category: 'produce', vendorId: sunridge.id, isAvailable: true } })

  // Golden Grain
  const p4 = await prisma.product.create({ data: { name: 'Country Sourdough Loaf', slug: 'golden-grain-country-sourdough', description: '48-hour cold ferment, open crumb, mahogany crust. The one people drive across town for.', price: 1200, unit: 'loaf', category: 'baked', vendorId: goldenGrain.id, isAvailable: true } })
  const p5 = await prisma.product.create({ data: { name: 'Almond Croissant', slug: 'golden-grain-almond-croissant', description: 'Laminated with cultured butter, filled and topped with house almond cream.', price: 550, unit: 'each', category: 'baked', vendorId: goldenGrain.id, isAvailable: true } })
  await prisma.product.create({ data: { name: 'Seeded Rye Loaf', slug: 'golden-grain-seeded-rye', description: 'Dark rye flour, caraway, sunflower, and sesame. Dense, complex, keeps well.', price: 1100, unit: 'loaf', category: 'baked', vendorId: goldenGrain.id, isAvailable: true } })

  // Mesa Honey
  const p7 = await prisma.product.create({ data: { name: 'Coastal Wildflower Honey', slug: 'mesa-coastal-wildflower-honey', description: 'Light floral honey from hives near the Batiquitos Lagoon. Mild, buttery, unforgettable on warm bread.', price: 1600, unit: 'jar', category: 'specialty', vendorId: mesaHoney.id, isAvailable: true } })
  await prisma.product.create({ data: { name: 'Mountain Sage Honey', slug: 'mesa-mountain-sage-honey', description: 'Harvested from high-elevation sage in bloom. Herbal, slightly savory — a wild and honest honey.', price: 1800, unit: 'jar', category: 'specialty', vendorId: mesaHoney.id, isAvailable: true } })
  await prisma.product.create({ data: { name: 'Honeycomb Square', slug: 'mesa-honeycomb-square', description: 'Raw comb cut to order. Spread it, eat it straight, or serve it on a cheese board.', price: 1400, unit: 'each', category: 'specialty', vendorId: mesaHoney.id, isAvailable: true } })

  // Coastal Bloom
  const p10 = await prisma.product.create({ data: { name: 'Mixed Seasonal Bouquet', slug: 'coastal-bloom-seasonal-bouquet', description: 'Cut-to-order that morning. Ranunculus, anemone, and whatever else is peaking. No two alike.', price: 2200, unit: 'each', category: 'flowers', vendorId: coastalBloom.id, isAvailable: true } })
  await prisma.product.create({ data: { name: 'Fresh Herb Pot — Basil', slug: 'coastal-bloom-basil-pot', description: 'Lush Genovese basil in a 4-inch terracotta pot. Ready to grow on a sunny sill or straight into dinner.', price: 700, unit: 'each', category: 'flowers', vendorId: coastalBloom.id, isAvailable: true } })
  await prisma.product.create({ data: { name: 'Sunflower Bundle', slug: 'coastal-bloom-sunflower-bundle', description: 'Six stems, bright and tall. Picked Friday, in water by Saturday morning.', price: 1200, unit: 'bunch', category: 'flowers', vendorId: coastalBloom.id, isAvailable: true } })

  // Rancho Libre
  const p13 = await prisma.product.create({ data: { name: 'Grass-Fed Ground Beef', slug: 'rancho-libre-ground-beef', description: '85/15 blend. Rich, clean-tasting beef from cattle finished on orchard grass. Vacuum sealed.', price: 1400, unit: 'lb', category: 'meat', vendorId: ranchoLibre.id, isAvailable: true } })
  await prisma.product.create({ data: { name: 'Pastured Pork Sausage', slug: 'rancho-libre-pork-sausage', description: 'Mild Italian-style. Made with fennel seed and San Diego chile. No fillers, no nitrates.', price: 1600, unit: 'lb', category: 'meat', vendorId: ranchoLibre.id, isAvailable: true } })
  await prisma.product.create({ data: { name: 'Bone-In Short Ribs', slug: 'rancho-libre-short-ribs', description: 'Cut thick for braising. From cattle that lived well. Ask us about our weekend slow-cook method.', price: 2800, unit: 'lb', category: 'meat', vendorId: ranchoLibre.id, isAvailable: true } })

  // Blue Sky Creamery
  const p16 = await prisma.product.create({ data: { name: 'Aged Manchego-Style', slug: 'blue-sky-manchego-style', description: 'Three-month aged wheel from our Jersey herd. Firm, slightly nutty, melts beautifully. ~8 oz.', price: 2400, unit: 'each', category: 'dairy', vendorId: blueSky.id, isAvailable: true } })
  await prisma.product.create({ data: { name: 'Cultured Butter', slug: 'blue-sky-cultured-butter', description: 'European-style, 84% fat, made with live cultures. Salted and unsalted, both available. 4 oz roll.', price: 900, unit: 'each', category: 'dairy', vendorId: blueSky.id, isAvailable: true } })
  await prisma.product.create({ data: { name: 'Whole Milk Yogurt', slug: 'blue-sky-whole-milk-yogurt', description: 'Thick, tangy, and deeply creamy. Jersey milk, live cultures, nothing else. 8 oz jar.', price: 700, unit: 'each', category: 'dairy', vendorId: blueSky.id, isAvailable: true } })

  // Pacific Jam Co.
  const p19 = await prisma.product.create({ data: { name: 'Strawberry Vanilla Jam', slug: 'pacific-strawberry-vanilla-jam', description: 'Carlsbad strawberries at peak season with real Tahitian vanilla. Small batch, pectin-free.', price: 1100, unit: 'jar', category: 'specialty', vendorId: pacificJam.id, isAvailable: true } })
  await prisma.product.create({ data: { name: 'Meyer Lemon Marmalade', slug: 'pacific-meyer-lemon-marmalade', description: 'Bright, not too bitter. Made from San Diego backyard Meyers. Perfect on sourdough.', price: 1100, unit: 'jar', category: 'specialty', vendorId: pacificJam.id, isAvailable: true } })
  await prisma.product.create({ data: { name: 'White Peach Preserve', slug: 'pacific-white-peach-preserve', description: 'Summer peaches from Blossom Valley, preserved whole in light syrup. Very limited each season.', price: 1200, unit: 'jar', category: 'specialty', vendorId: pacificJam.id, isAvailable: true } })

  // Desert Roots
  const p22 = await prisma.product.create({ data: { name: 'Rainbow Carrots', slug: 'desert-roots-rainbow-carrots', description: 'Five colors, grown slow in sandy desert soil. Sweeter than anything from a grocery store.', price: 500, unit: 'bunch', category: 'produce', vendorId: desertRoots.id, isAvailable: true } })
  await prisma.product.create({ data: { name: 'Watermelon Radish', slug: 'desert-roots-watermelon-radish', description: 'Pale outside, hot pink inside. Crisp, mild, and stunning sliced thin on anything.', price: 600, unit: 'bunch', category: 'produce', vendorId: desertRoots.id, isAvailable: true } })
  await prisma.product.create({ data: { name: 'Mixed Microgreens', slug: 'desert-roots-microgreens', description: '2 oz clamshell. Sunflower, pea shoot, radish, and red amaranth. Grown to order, cut same day.', price: 800, unit: 'each', category: 'produce', vendorId: desertRoots.id, isAvailable: true } })
  console.log('✓ 24 products created')

  // ── Sample Orders (for dashboard preview) ─────────────────
  const order1 = await prisma.order.create({
    data: {
      orderNumber: 'MD-2026-0001',
      customerName: 'Sarah Mitchell',
      customerEmail: 'sarah@example.com',
      customerPhone: '619-555-0101',
      marketId: market1.id,
      subtotal: p4.price * 1 + p5.price * 2,
      paymentMethod: 'STRIPE',
      paymentStatus: 'PAID',
      pickupStatus: 'PENDING',
      items: {
        create: [
          { productId: p4.id, vendorId: goldenGrain.id, quantity: 1, priceAtTime: p4.price, productName: p4.name, vendorName: goldenGrain.name },
          { productId: p5.id, vendorId: goldenGrain.id, quantity: 2, priceAtTime: p5.price, productName: p5.name, vendorName: goldenGrain.name },
        ],
      },
    },
  })

  await prisma.order.create({
    data: {
      orderNumber: 'MD-2026-0002',
      customerName: 'James Rivera',
      customerEmail: 'jrivera@example.com',
      customerPhone: '619-555-0202',
      marketId: market1.id,
      subtotal: p1.price * 2 + p7.price * 1,
      paymentMethod: 'AT_MARKET',
      paymentStatus: 'PENDING',
      pickupStatus: 'PENDING',
      items: {
        create: [
          { productId: p1.id, vendorId: sunridge.id, quantity: 2, priceAtTime: p1.price, productName: p1.name, vendorName: sunridge.name },
          { productId: p7.id, vendorId: mesaHoney.id, quantity: 1, priceAtTime: p7.price, productName: p7.name, vendorName: mesaHoney.name },
        ],
      },
    },
  })

  await prisma.order.create({
    data: {
      orderNumber: 'MD-2026-0003',
      customerName: 'Leila Nakamura',
      customerEmail: 'leila@example.com',
      marketId: market1.id,
      subtotal: p10.price * 1 + p16.price * 1 + p19.price * 2,
      paymentMethod: 'STRIPE',
      paymentStatus: 'PAID',
      pickupStatus: 'READY',
      items: {
        create: [
          { productId: p10.id, vendorId: coastalBloom.id, quantity: 1, priceAtTime: p10.price, productName: p10.name, vendorName: coastalBloom.name },
          { productId: p16.id, vendorId: blueSky.id, quantity: 1, priceAtTime: p16.price, productName: p16.name, vendorName: blueSky.name },
          { productId: p19.id, vendorId: pacificJam.id, quantity: 2, priceAtTime: p19.price, productName: p19.name, vendorName: pacificJam.name },
        ],
      },
    },
  })

  await prisma.order.create({
    data: {
      orderNumber: 'MD-2026-0004',
      customerName: 'Tom Callahan',
      customerEmail: 'tcallahan@example.com',
      customerPhone: '760-555-0303',
      marketId: market2.id,
      subtotal: p13.price * 3 + p2.price * 2,
      paymentMethod: 'AT_MARKET',
      paymentStatus: 'PENDING',
      pickupStatus: 'PENDING',
      items: {
        create: [
          { productId: p13.id, vendorId: ranchoLibre.id, quantity: 3, priceAtTime: p13.price, productName: p13.name, vendorName: ranchoLibre.name },
          { productId: p2.id, vendorId: sunridge.id, quantity: 2, priceAtTime: p2.price, productName: p2.name, vendorName: sunridge.name },
        ],
      },
    },
  })

  await prisma.order.create({
    data: {
      orderNumber: 'MD-2026-0005',
      customerName: 'Priya Okafor',
      customerEmail: 'priya@example.com',
      marketId: market2.id,
      subtotal: p22.price * 2 + p3.price * 1,
      paymentMethod: 'STRIPE',
      paymentStatus: 'PAID',
      pickupStatus: 'PICKED_UP',
      items: {
        create: [
          { productId: p22.id, vendorId: desertRoots.id, quantity: 2, priceAtTime: p22.price, productName: p22.name, vendorName: desertRoots.name },
          { productId: p3.id, vendorId: sunridge.id, quantity: 1, priceAtTime: p3.price, productName: p3.name, vendorName: sunridge.name },
        ],
      },
    },
  })
  console.log('✓ 5 sample orders created')

  console.log('\n✅ Seed complete!')
  console.log('   Admin logins:')
  console.log('   marci@marketday.com / marci2026')
  console.log('   jessica@marketday.com / jessica2026')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
```

Run with:
```bash
npx prisma db seed
```

---

## PART 8: LIBRARY FILES (write these exactly)

### 8.1 `src/lib/prisma.ts`

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ log: process.env.NODE_ENV === 'development' ? ['error'] : [] })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

### 8.2 `src/lib/auth.ts`

```typescript
import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  pages: { signIn: '/admin/login' },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        const user = await prisma.adminUser.findUnique({
          where: { email: credentials.email },
        })
        if (!user) return null
        const isValid = await bcrypt.compare(credentials.password, user.hashedPassword)
        if (!isValid) return null
        return { id: user.id, name: user.name, email: user.email, role: user.role }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as { role: string }).role
      }
      return token
    },
    session({ session, token }) {
      if (token && session.user) {
        (session.user as { id?: string }).id = token.id as string;
        (session.user as { role?: string }).role = token.role as string
      }
      return session
    },
  },
}
```

### 8.3 `src/lib/utils.ts`

```typescript
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(cents: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)
}

export function formatMarketDate(date: Date | string): string {
  return format(new Date(date), 'EEEE, MMMM d, yyyy')
}

export function formatMarketDateShort(date: Date | string): string {
  return format(new Date(date), 'MMM d')
}

export function formatMarketDateTime(date: Date | string, openTime: string, closeTime: string): string {
  return `${format(new Date(date), 'EEEE, MMMM d')} · ${openTime}–${closeTime}`
}

export function generateSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export function truncate(str: string, length: number): string {
  return str.length > length ? str.substring(0, length) + '…' : str
}

export function categoryLabel(value: string): string {
  const map: Record<string, string> = {
    produce: 'Produce', baked: 'Baked Goods', meat: 'Meat & Poultry',
    dairy: 'Dairy', specialty: 'Specialty Foods', flowers: 'Flowers & Plants',
  }
  return map[value] || value
}

export function categoryColor(value: string): string {
  const map: Record<string, string> = {
    produce: 'bg-green-100 text-green-800',
    baked: 'bg-amber-100 text-amber-800',
    meat: 'bg-red-100 text-red-800',
    dairy: 'bg-blue-100 text-blue-800',
    specialty: 'bg-purple-100 text-purple-800',
    flowers: 'bg-pink-100 text-pink-800',
  }
  return map[value] || 'bg-gray-100 text-gray-800'
}
```

### 8.4 `src/lib/stripe.ts`

```typescript
import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
  typescript: true,
})
```

### 8.5 `src/lib/resend.ts`

```typescript
import { Resend } from 'resend'

export const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

export function buildOrderConfirmationEmail({
  customerName,
  orderNumber,
  marketDate,
  marketLocation,
  items,
  subtotal,
  paymentMethod,
}: {
  customerName: string
  orderNumber: string
  marketDate: string
  marketLocation: string
  items: { name: string; quantity: number; price: number; unit: string }[]
  subtotal: number
  paymentMethod: 'STRIPE' | 'AT_MARKET'
}): string {
  const itemRows = items
    .map(
      (i) =>
        `<tr><td style="padding:6px 0;border-bottom:1px solid #E8DDD0">${i.name} <span style="color:#7C5C3E;font-size:13px">× ${i.quantity} ${i.unit}</span></td><td style="text-align:right;padding:6px 0;border-bottom:1px solid #E8DDD0">${new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(i.price/100)}</td></tr>`
    )
    .join('')

  const paymentNote =
    paymentMethod === 'STRIPE'
      ? 'Your order has been paid online and is confirmed.'
      : 'Your order is reserved. Please bring cash or card to pay at the stand.'

  return `
<!DOCTYPE html>
<html>
<head><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;background:#FAF7F2;margin:0;padding:0">
  <div style="max-width:540px;margin:32px auto;background:white;border-radius:12px;overflow:hidden;border:1px solid #E8DDD0">
    <div style="background:#6B8F71;padding:28px 32px">
      <h1 style="margin:0;color:white;font-size:22px;font-weight:600">MarketDay</h1>
      <p style="margin:4px 0 0;color:rgba(255,255,255,0.85);font-size:14px">Liberty Station Public Market · San Diego</p>
    </div>
    <div style="padding:32px">
      <h2 style="margin:0 0 4px;color:#4A3728;font-size:20px">Your order is confirmed, ${customerName.split(' ')[0]}!</h2>
      <p style="color:#7C5C3E;margin:0 0 24px;font-size:14px">${paymentNote}</p>
      
      <div style="background:#F5EFE4;border-radius:8px;padding:16px;margin-bottom:24px">
        <p style="margin:0 0 4px;font-size:12px;color:#7C5C3E;text-transform:uppercase;letter-spacing:0.5px">Order Number</p>
        <p style="margin:0;font-size:22px;font-weight:700;color:#4A3728;font-family:monospace">${orderNumber}</p>
      </div>

      <div style="margin-bottom:24px">
        <p style="margin:0 0 4px;font-size:12px;color:#7C5C3E;text-transform:uppercase;letter-spacing:0.5px">Pickup At</p>
        <p style="margin:0;font-size:15px;color:#4A3728;font-weight:500">${marketDate}</p>
        <p style="margin:2px 0 0;font-size:14px;color:#7C5C3E">${marketLocation}</p>
      </div>

      <table style="width:100%;border-collapse:collapse;margin-bottom:16px">
        <tbody>${itemRows}</tbody>
        <tfoot>
          <tr>
            <td style="padding:12px 0 0;font-weight:600;color:#4A3728">Total</td>
            <td style="text-align:right;padding:12px 0 0;font-weight:600;color:#6B8F71;font-size:18px">${new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(subtotal/100)}</td>
          </tr>
        </tfoot>
      </table>
      
      <hr style="border:none;border-top:1px solid #E8DDD0;margin:24px 0">
      <p style="margin:0;font-size:13px;color:#7C5C3E">Questions? Reply to this email or find us at the info booth on market day.</p>
    </div>
  </div>
</body>
</html>`
}
```

### 8.6 `src/types/index.ts` — TypeScript declarations + shared types

```typescript
import 'next-auth'
import 'next-auth/jwt'

declare module 'next-auth' {
  interface User {
    id: string
    role: string
  }
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      role: string
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: string
  }
}

// Cart
export type CartItem = {
  productId: string
  productName: string
  vendorId: string
  vendorName: string
  price: number       // cents
  quantity: number
  unit: string
  imageUrl?: string | null
}

export type CartState = {
  marketId: string | null
  items: CartItem[]
}

// Checkout form
export type CheckoutFormData = {
  customerName: string
  customerEmail: string
  customerPhone?: string
  customerNotes?: string
  paymentMethod: 'STRIPE' | 'AT_MARKET'
  marketId: string
}
```

### 8.7 `src/context/CartContext.tsx` — `"use client"` context

```typescript
'use client'

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'
import type { CartItem, CartState } from '@/types'

const STORAGE_KEY = 'marketday-cart'

const defaultCart: CartState = { marketId: null, items: [] }

type CartContextType = {
  cart: CartState
  addItem: (item: CartItem) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  setMarket: (marketId: string) => void
  clearCart: () => void
  itemCount: number
  subtotal: number
  isDrawerOpen: boolean
  openDrawer: () => void
  closeDrawer: () => void
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartState>(defaultCart)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setCart(JSON.parse(stored))
    } catch {}
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (hydrated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart))
    }
  }, [cart, hydrated])

  const addItem = useCallback((item: CartItem) => {
    setCart((prev) => {
      const existing = prev.items.find((i) => i.productId === item.productId)
      if (existing) {
        return {
          ...prev,
          items: prev.items.map((i) =>
            i.productId === item.productId
              ? { ...i, quantity: Math.min(i.quantity + item.quantity, 20) }
              : i
          ),
        }
      }
      return { ...prev, items: [...prev.items, item] }
    })
  }, [])

  const removeItem = useCallback((productId: string) => {
    setCart((prev) => ({ ...prev, items: prev.items.filter((i) => i.productId !== productId) }))
  }, [])

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart((prev) => ({ ...prev, items: prev.items.filter((i) => i.productId !== productId) }))
    } else {
      setCart((prev) => ({
        ...prev,
        items: prev.items.map((i) =>
          i.productId === productId ? { ...i, quantity: Math.min(quantity, 20) } : i
        ),
      }))
    }
  }, [])

  const setMarket = useCallback((marketId: string) => {
    setCart((prev) => ({ ...prev, marketId }))
  }, [])

  const clearCart = useCallback(() => {
    setCart(defaultCart)
  }, [])

  const itemCount = cart.items.reduce((sum, i) => sum + i.quantity, 0)
  const subtotal = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        cart, addItem, removeItem, updateQuantity, setMarket, clearCart,
        itemCount, subtotal, isDrawerOpen,
        openDrawer: () => setIsDrawerOpen(true),
        closeDrawer: () => setIsDrawerOpen(false),
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}
```

---

## PART 9: ROOT LAYOUT

### 9.1 `src/app/layout.tsx`

```typescript
import type { Metadata } from 'next'
import { Playfair_Display, DM_Sans, DM_Mono } from 'next/font/google'
import { CartProvider } from '@/context/CartContext'
import { Toaster } from 'sonner'
import './globals.css'
import { MARKET_CONFIG } from '@/config/market.config'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
})

const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-dm-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: MARKET_CONFIG.siteTitle,
  description: MARKET_CONFIG.siteDescription,
  keywords: 'farmers market, San Diego, fresh produce, local food, Liberty Station',
  openGraph: {
    title: MARKET_CONFIG.siteTitle,
    description: MARKET_CONFIG.siteDescription,
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${playfair.variable} ${dmSans.variable} ${dmMono.variable} font-sans`}>
        <CartProvider>
          {children}
          <Toaster position="bottom-right" richColors />
        </CartProvider>
      </body>
    </html>
  )
}
```

### 9.2 `src/app/api/auth/[...nextauth]/route.ts`

```typescript
import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
```

---

## PART 10: API ROUTES

### 10.1 `src/app/api/orders/reserve/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { resend, buildOrderConfirmationEmail } from '@/lib/resend'
import { z } from 'zod'
import { formatMarketDateTime } from '@/lib/utils'
import { MARKET_CONFIG } from '@/config/market.config'

const reserveSchema = z.object({
  marketId: z.string().min(1),
  customerName: z.string().min(2).max(100),
  customerEmail: z.string().email(),
  customerPhone: z.string().optional(),
  customerNotes: z.string().max(500).optional(),
  items: z.array(z.object({ productId: z.string(), quantity: z.number().int().min(1).max(20) })).min(1),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = reserveSchema.parse(body)

    const market = await prisma.market.findUnique({ where: { id: data.marketId } })
    if (!market || market.status === 'CANCELLED' || market.status === 'PAST') {
      return NextResponse.json({ error: 'Market not available' }, { status: 400 })
    }

    const products = await prisma.product.findMany({
      where: { id: { in: data.items.map((i) => i.productId) }, isAvailable: true },
      include: { vendor: true },
    })

    if (products.length !== data.items.length) {
      return NextResponse.json({ error: 'One or more products are unavailable' }, { status: 400 })
    }

    const subtotal = data.items.reduce((sum, item) => {
      const product = products.find((p) => p.id === item.productId)!
      return sum + product.price * item.quantity
    }, 0)

    // Generate order number
    const orderCount = await prisma.order.count()
    const orderNumber = `${MARKET_CONFIG.orderNumberPrefix}-${new Date().getFullYear()}-${String(orderCount + 1).padStart(4, '0')}`

    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        customerNotes: data.customerNotes,
        marketId: data.marketId,
        subtotal,
        paymentMethod: 'AT_MARKET',
        paymentStatus: 'PENDING',
        pickupStatus: 'PENDING',
        items: {
          create: data.items.map((item) => {
            const product = products.find((p) => p.id === item.productId)!
            return {
              productId: item.productId,
              vendorId: product.vendorId,
              quantity: item.quantity,
              priceAtTime: product.price,
              productName: product.name,
              vendorName: product.vendor.name,
            }
          }),
        },
      },
      include: { items: true, market: true },
    })

    // Send confirmation email (non-blocking, fail silently in dev)
    if (resend) {
      try {
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || 'orders@marketday.com',
          to: data.customerEmail,
          subject: `Your MarketDay order is confirmed — ${orderNumber}`,
          html: buildOrderConfirmationEmail({
            customerName: data.customerName,
            orderNumber,
            marketDate: formatMarketDateTime(market.date, market.openTime, market.closeTime),
            marketLocation: market.location,
            items: order.items.map((i) => ({ name: i.productName, quantity: i.quantity, price: i.priceAtTime, unit: products.find(p => p.id === i.productId)?.unit || 'each' })),
            subtotal,
            paymentMethod: 'AT_MARKET',
          }),
        })
      } catch (emailErr) {
        console.error('Email send failed:', emailErr)
      }
    }

    return NextResponse.json({ orderId: order.id, orderNumber })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 422 })
    }
    console.error('Reserve order error:', err)
    return NextResponse.json({ error: 'Failed to place order' }, { status: 500 })
  }
}
```

### 10.2 `src/app/api/stripe/checkout/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'
import { z } from 'zod'
import { MARKET_CONFIG } from '@/config/market.config'

const checkoutSchema = z.object({
  marketId: z.string().min(1),
  customerName: z.string().min(2).max(100),
  customerEmail: z.string().email(),
  customerPhone: z.string().optional(),
  customerNotes: z.string().max(500).optional(),
  items: z.array(z.object({ productId: z.string(), quantity: z.number().int().min(1).max(20) })).min(1),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = checkoutSchema.parse(body)

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const market = await prisma.market.findUnique({ where: { id: data.marketId } })
    if (!market) return NextResponse.json({ error: 'Market not found' }, { status: 404 })

    const products = await prisma.product.findMany({
      where: { id: { in: data.items.map((i) => i.productId) }, isAvailable: true },
      include: { vendor: true },
    })
    if (products.length !== data.items.length) {
      return NextResponse.json({ error: 'One or more products are unavailable' }, { status: 400 })
    }

    const subtotal = data.items.reduce((sum, item) => {
      const p = products.find((p) => p.id === item.productId)!
      return sum + p.price * item.quantity
    }, 0)

    const orderCount = await prisma.order.count()
    const orderNumber = `${MARKET_CONFIG.orderNumberPrefix}-${new Date().getFullYear()}-${String(orderCount + 1).padStart(4, '0')}`

    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        customerNotes: data.customerNotes,
        marketId: data.marketId,
        subtotal,
        paymentMethod: 'STRIPE',
        paymentStatus: 'PENDING',
        pickupStatus: 'PENDING',
        items: {
          create: data.items.map((item) => {
            const product = products.find((p) => p.id === item.productId)!
            return {
              productId: item.productId,
              vendorId: product.vendorId,
              quantity: item.quantity,
              priceAtTime: product.price,
              productName: product.name,
              vendorName: product.vendor.name,
            }
          }),
        },
      },
    })

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: data.customerEmail,
      line_items: data.items.map((item) => {
        const product = products.find((p) => p.id === item.productId)!
        return {
          price_data: {
            currency: 'usd',
            product_data: {
              name: product.name,
              description: `From ${product.vendor.name} · ${product.unit}`,
            },
            unit_amount: product.price,
          },
          quantity: item.quantity,
        }
      }),
      metadata: { orderId: order.id, orderNumber },
      success_url: `${appUrl}/order/${order.id}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/cart`,
    })

    await prisma.order.update({
      where: { id: order.id },
      data: { stripeSessionId: session.id },
    })

    return NextResponse.json({ sessionUrl: session.url })
  } catch (err) {
    console.error('Stripe checkout error:', err)
    return NextResponse.json({ error: 'Checkout failed' }, { status: 500 })
  }
}
```

### 10.3 `src/app/api/stripe/webhook/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { resend, buildOrderConfirmationEmail } from '@/lib/resend'
import { formatMarketDateTime } from '@/lib/utils'
import Stripe from 'stripe'

export const config = { api: { bodyParser: false } }

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')
  if (!sig) return NextResponse.json({ error: 'No signature' }, { status: 400 })

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const orderId = session.metadata?.orderId
    if (!orderId) return NextResponse.json({ received: true })

    const order = await prisma.order.update({
      where: { id: orderId },
      data: { paymentStatus: 'PAID' },
      include: { items: true, market: true },
    })

    if (resend && order) {
      try {
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || 'orders@marketday.com',
          to: order.customerEmail,
          subject: `Your MarketDay order is confirmed — ${order.orderNumber}`,
          html: buildOrderConfirmationEmail({
            customerName: order.customerName,
            orderNumber: order.orderNumber,
            marketDate: formatMarketDateTime(order.market.date, order.market.openTime, order.market.closeTime),
            marketLocation: order.market.location,
            items: order.items.map((i) => ({ name: i.productName, quantity: i.quantity, price: i.priceAtTime, unit: 'each' })),
            subtotal: order.subtotal,
            paymentMethod: 'STRIPE',
          }),
        })
      } catch (emailErr) {
        console.error('Webhook email error:', emailErr)
      }
    }
  }

  return NextResponse.json({ received: true })
}
```

### 10.4 `src/app/api/admin/orders/[id]/status/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const schema = z.object({
  pickupStatus: z.enum(['PENDING', 'READY', 'PICKED_UP', 'CANCELLED']).optional(),
  paymentStatus: z.enum(['PENDING', 'PAID', 'FAILED', 'REFUNDED']).optional(),
})

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const data = schema.parse(body)

  const order = await prisma.order.update({
    where: { id: params.id },
    data,
  })
  return NextResponse.json(order)
}
```

---

## PART 11: PAGE SPECIFICATIONS

### 11.1 Shop Layout: `src/app/(shop)/layout.tsx`

Server component. Renders `<Header />` and `<Footer />` around `{children}`.
Import `<CartDrawer />` here too so it's available everywhere in the shop.

### 11.2 Homepage: `src/app/(shop)/page.tsx`

Server component. Fetch data at the top:
```typescript
const [markets, vendors] = await Promise.all([
  prisma.market.findMany({ where: { status: 'UPCOMING' }, orderBy: { date: 'asc' } }),
  prisma.vendor.findMany({ where: { isActive: true }, take: 6 }),
])
const nextMarket = markets[0]
```

**Section 1 — Hero** (full-width, `bg-market-cream`)
- Left column (desktop), full-width (mobile)
- `<h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-market-soil leading-tight">`
  Line 1: "Fresh from"  Line 2: "the farm."  Line 3 (accent color): "Ready Saturday."
- Subheadline: "Browse vendors, place your order, and pick up at Liberty Station. No waiting, no missing out."
- If nextMarket: show pill → "Next market: [date], [openTime]–[closeTime]"
- CTA 1: `<Link href={`/market/${nextMarket?.id}`}>Browse This Saturday's Market</Link>` — sage green button
- CTA 2: `<Link href="/vendors">Meet Our Vendors</Link>` — outline button
- Right column (desktop only): 2×2 grid of vendor category "icons" — styled divs with emoji and category name, `bg-market-warm` cards

**Section 2 — How It Works** (3 steps, `bg-white`, horizontal on desktop, stacked on mobile)
- Step 1: "Browse the market" — "Explore vendors by category or scroll the full market listing."
- Step 2: "Add to your bag" — "Pick your items, choose a market date. Your bag saves automatically."
- Step 3: "Pay now or at the stand" — "Secure online payment or reserve free and pay at pickup."
- Each step: large number (font-display, text-market-stone, text-6xl), heading, body

**Section 3 — Featured Vendors** ("Who's at the Market")
- 6 vendor cards, 2-col mobile, 3-col desktop
- Each: logo initials circle (bg-market-sage text-white), vendor name, category badge, 2-line description truncated, "See Products →" link

**Section 4 — Upcoming Markets** ("Mark Your Calendar")
- `bg-market-warm`, 3 market cards stacked or in a row
- Each: large date (font-display), day/time, location, "Shop This Market →" CTA
- If no markets: "Markets coming soon — check back soon."

**Section 5 — Footer**
- `<Footer />` component

### 11.3 Market Page: `src/app/(shop)/market/[id]/page.tsx`

This page has a server wrapper that fetches data and a `"use client"` child for filtering.

Server component fetches:
```typescript
const market = await prisma.market.findUnique({ where: { id: params.id } })
if (!market) notFound()
const products = await prisma.product.findMany({
  where: { isAvailable: true },
  include: { vendor: { select: { name: true, slug: true, isActive: true } } },
  orderBy: [{ vendor: { name: 'asc' } }, { name: 'asc' }],
})
```

Pass to `<MarketShopClient market={market} products={products} />` — client component.

The client component handles:
- Category filter tabs at top (sticky on mobile, `bg-white/95 backdrop-blur`)
- Filtered product grid (2 cols mobile, 3 cols desktop)
- `<ProductCard />` for each item
- Floating "View My Bag" bar at bottom of mobile (shows itemCount + subtotal + button to open drawer)
- Show market name/date/location in a warm hero strip at top

### 11.4 Vendors List: `src/app/(shop)/vendors/page.tsx`

Server component. Fetch all active vendors.
- Page heading: "The Makers Behind the Market"
- Category filter (client island `<VendorCategoryFilter />` that uses `useSearchParams`)
- Grid: 2 cols mobile, 3 cols tablet, 4 cols desktop
- `<VendorCard />` for each

### 11.5 Vendor Detail: `src/app/(shop)/vendors/[slug]/page.tsx`

Server component. Fetch vendor + products.
- Breadcrumb: Home > Vendors > [Vendor Name]
- Large header: vendor logo (initials), name, category badge, full description
- "Products Available This Season" heading
- Same product grid as market page (without sticky filter bar)
- Back link: "← All Vendors"

### 11.6 Cart: `src/app/(shop)/cart/page.tsx`

`"use client"` page. Uses `useCart()`.

If `itemCount === 0`:
- Warm empty state with large emoji (🧺), heading "Your bag is empty", subtext, CTA → `/market/[nextMarket?.id]`

If cart has items, 2-column layout (items left, summary right on desktop; stacked on mobile):

**Left column:**
- Items grouped by vendor. Each group: vendor name heading, items list.
- Each item: product name, unit, `−` qty `+` controls, price × qty, remove button (X icon)
- Market date selector: show upcoming markets as selectable cards. Required before checkout.

**Right column (Order Summary):**
- "Order Summary" heading
- Subtotal
- "Payment Method" heading with 2 selectable cards:
  - **Pay now (Stripe):** credit card icon, "Secure online payment", "Order confirmed instantly"
  - **Reserve & pay at market:** coin icon, "No charge today", "Pay cash or card at the stand"
- "Continue to Checkout" button — disabled if no market selected or no payment method
  - Navigates to `/checkout` with query params: `?method=STRIPE` or `?method=AT_MARKET`
- Note: "Order changes can be made until 8pm Friday"

### 11.7 Checkout: `src/app/(shop)/checkout/page.tsx`

`"use client"` page. Reads `?method=` from searchParams.

Form fields (use react-hook-form + zod):
- Full Name (required)
- Email (required, email validation)
- Phone (optional)
- Special requests / notes (textarea, optional, max 500 chars)

Order summary sidebar (right, desktop) or section (below, mobile):
- Items, subtotal, market date, payment method

Submit button text:
- STRIPE: "Continue to Payment →"
- AT_MARKET: "Reserve My Order →"

On submit:
- STRIPE: POST to `/api/stripe/checkout`, then `window.location.href = data.sessionUrl`
- AT_MARKET: POST to `/api/orders/reserve`, then `router.push('/order/' + data.orderId)`
- Show loading spinner on button during submission
- Show toast error if API fails

### 11.8 Order Confirmation: `src/app/(shop)/order/[id]/page.tsx`

Server component.

```typescript
const order = await prisma.order.findUnique({
  where: { id: params.id },
  include: { items: true, market: true },
})
if (!order) notFound()
```

If `searchParams.session_id` present AND order.paymentStatus is still PENDING, update to PAID
(Stripe webhook may not have fired yet — this is a safe fallback).

Layout:
- Large green checkmark circle
- "You're all set, [firstName]!" — font-display
- Order number: monospace, styled box, prominent
- Market pickup details: date, time, location
- Items list: grouped by vendor
- Subtotal + payment method
- "A confirmation email has been sent to [email]"
- If AT_MARKET: amber-tinted callout "Remember to bring this order number to the stand"
- CTA: "← Back to the Market"

---

## PART 12: ADMIN PAGES

### 12.1 Admin Login: `src/app/admin/login/page.tsx`

`"use client"` page.

```typescript
// Use signIn from 'next-auth/react'
// On submit: signIn('credentials', { email, password, callbackUrl: '/admin/dashboard' })
// Show error if result.error exists
```

UI: centered card (`max-w-sm mx-auto mt-24`), MarketDay logo, "Admin Portal" subtitle, email + password fields, "Sign In" button, loading state.

### 12.2 Admin Layout: `src/app/admin/layout.tsx`

Server component. Protect with:
```typescript
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'

const session = await getServerSession(authOptions)
if (!session) redirect('/admin/login')
```

Render `<AdminNav session={session} />` and `{children}`.
AdminNav: left sidebar on desktop (`w-64 fixed`), mobile hamburger menu.

### 12.3 Admin Dashboard: `src/app/admin/dashboard/page.tsx`

Server component. Fetch stats:
```typescript
const now = new Date()
const nextMarket = await prisma.market.findFirst({
  where: { status: 'UPCOMING', date: { gte: now } },
  orderBy: { date: 'asc' },
})
const [totalOrders, paidOrders, vendorCount, productCount] = await Promise.all([
  prisma.order.count({ where: nextMarket ? { marketId: nextMarket.id } : {} }),
  prisma.order.aggregate({ where: { paymentStatus: 'PAID' }, _sum: { subtotal: true } }),
  prisma.vendor.count({ where: { isActive: true } }),
  prisma.product.count({ where: { isAvailable: true } }),
])
const recentOrders = await prisma.order.findMany({
  take: 10,
  orderBy: { createdAt: 'desc' },
  include: { market: { select: { name: true, date: true } } },
})
```

UI:
- "Good [morning/afternoon], [session.user.name]." greeting (dynamic by hour)
- 4 stat cards (grid-cols-2 on mobile, grid-cols-4 on desktop):
  1. Upcoming orders for next market
  2. Total revenue (paid orders, all time)
  3. Active vendors
  4. Available products
- "Next Market" card: date, time, location, order count, "View Orders" CTA
- Recent orders table: Order #, Customer, Market, Items, Total, Method, Pickup Status, Time

### 12.4 Admin Orders: `src/app/admin/orders/page.tsx`

Server component + client filter island.

Fetch all orders with filters from searchParams (marketId, paymentMethod, pickupStatus).
Table: Order #, Customer, Market Date, Items count, Total, Payment Method, Pickup Status, Actions.
Pickup status can be updated inline via PATCH to `/api/admin/orders/[id]/status`.
Click row → `/admin/orders/[id]`.

### 12.5 Admin Order Detail: `src/app/admin/orders/[id]/page.tsx`

Full order info: all customer fields, timestamps, items grouped by vendor.
Status update buttons: "Mark Ready", "Mark Picked Up", "Cancel Order" — each PATCH status.
Back button → orders list.

### 12.6 Admin Vendors: Full CRUD

**List:** Table with name, category badge, product count, active status toggle, edit/view links.
**New/Edit Form:** name, slug (auto-generated from name, editable), description, category select, active toggle, logo image upload (Vercel Blob — optional, graceful if not configured).
**Deactivate:** sets `isActive: false`, hides from public. Does not delete.

### 12.7 Admin Products: Full CRUD

**List:** Table with name, vendor, price, unit, category, available toggle, edit link.
**New/Edit Form:** name, slug (auto), description, price (formatted currency input, stores cents), unit select, category select, vendor select, available toggle, image upload.

### 12.8 Admin Markets: Full CRUD

**List:** Table with name, date, status badge, order count, edit link.
**New/Edit Form:** name, date picker, openTime text, closeTime text, location, address, description, status select.

---

## PART 13: COMPONENTS

### 13.1 `src/components/layout/Header.tsx` — `"use client"`

```
- Top bar: MarketDay logo (font-display) left, nav links center (hidden on mobile), cart button right
- Cart button: bag icon + animated count badge (animate-badge-pop on count change)
- Mobile: hamburger menu → full-screen drawer with nav links
- On scroll > 60px: add `shadow-sm bg-white/95 backdrop-blur` to header
- Nav links: "Vendors", "Markets" (or "This Saturday →" linking to next market)
```

### 13.2 `src/components/layout/Footer.tsx`

```
- bg-market-soil text-white (inverted, warm)
- Logo + tagline left
- Links right: Home, Vendors, Markets, Admin (subtle, small text)
- Bottom bar: "© 2026 MarketDay · Liberty Station · San Diego, CA"
```

### 13.3 `src/components/shop/ProductCard.tsx` — `"use client"`

Props: `{ product: Product & { vendor: { name, slug } }, showVendor?: boolean }`

States: `idle | adding | added`

Layout:
```
┌──────────────────────────────────────┐
│  [Image 4:3 aspect] [category badge] │
│  Vendor Name (small, muted)           │
│  Product Name (font-display, 18px)    │
│  Description (2-line clamp, 14px)     │
│  ─────────────────────────────────── │
│  $X.XX / unit        [Add to Bag ▸]  │
└──────────────────────────────────────┘
```

- Image: `<Image>` with `fill` and `object-cover`, fallback placeholder (bg-market-warm, centered initial letter)
- Category badge: top-left overlay on image, semi-transparent pill
- "Add to Bag" button: full-width bottom, sage green
- When clicked and item is already in cart: show quantity `−1+` controls inline (animated transition)
- `isAvailable === false`: "Sold Out" badge on image, disabled button, 60% opacity card

### 13.4 `src/components/shop/CartDrawer.tsx` — `"use client"`

```
- Fixed overlay (right slide-in) — NOT portal/dialog, use position-fixed with z-50
- Dimmed backdrop (onClick closes)
- Header: "Your Market Bag" + X close button
- Body: items grouped by vendor, qty controls, remove
- Empty state: "Nothing in your bag yet" with CTA
- Footer: subtotal + "Review My Bag →" button (→ /cart)
- Max height: 100vh with overflow-y-auto on body section
```

### 13.5 `src/components/shop/VendorCard.tsx`

Logo circle (initials on sage background if no image), vendor name (font-display), category badge, description (1-line clamp), "View Products →" link.

### 13.6 `src/components/admin/StatCard.tsx`

Props: `{ title, value, subtitle?, trend?, icon? }`
White card with label, large number, optional trend indicator.

### 13.7 `src/components/admin/OrderStatusBadge.tsx`

Maps PickupStatus and PaymentStatus to colored badges using `categoryColor` pattern.

---

## PART 14: BUILD ORDER (follow exactly)

```
1.  [ ] npx create-next-app and install deps (Part 3)
2.  [ ] Write tailwind.config.ts, next.config.js, globals.css (Part 5.1-5.3)
3.  [ ] Write market.config.ts (Part 5.4)
4.  [ ] Write middleware.ts (Part 5.5)
5.  [ ] Write prisma/schema.prisma (Part 6)
6.  [ ] Run: npx prisma generate && npx prisma db push
7.  [ ] Write prisma/seed.ts (Part 7)
8.  [ ] Run: npx prisma db seed
9.  [ ] Write all lib files: prisma.ts, auth.ts, utils.ts, stripe.ts, resend.ts (Part 8.1-8.5)
10. [ ] Write src/types/index.ts (Part 8.6)
11. [ ] Write CartContext.tsx (Part 8.7)
12. [ ] Write root layout.tsx (Part 9.1)
13. [ ] Write /api/auth/[...nextauth]/route.ts (Part 9.2)
14. [ ] Write all API routes (Part 10)
15. [ ] Write shadcn/ui components (npx shadcn@latest add ...) if not done in step 1
16. [ ] Build shared components: Header, Footer, AdminNav, ProductCard, VendorCard, CartDrawer, StatCard, OrderStatusBadge (Part 13)
17. [ ] Build (shop) layout.tsx
18. [ ] Build Homepage (Part 11.2)
19. [ ] Build Market page (Part 11.3)
20. [ ] Build Vendors pages (Part 11.4-11.5)
21. [ ] Build Cart page (Part 11.6)
22. [ ] Build Checkout page (Part 11.7)
23. [ ] Build Order confirmation (Part 11.8)
24. [ ] Build Admin login (Part 12.1)
25. [ ] Build Admin layout + nav (Part 12.2)
26. [ ] Build Admin dashboard (Part 12.3)
27. [ ] Build Admin orders (Part 12.4-12.5)
28. [ ] Build Admin vendors CRUD (Part 12.6)
29. [ ] Build Admin products CRUD (Part 12.7)
30. [ ] Build Admin markets CRUD (Part 12.8)
31. [ ] Run: npm run build — fix all TypeScript errors before continuing
32. [ ] Verify all pages load in dev server
33. [ ] Test: add product to cart, go through checkout flow (AT_MARKET), confirm order page
34. [ ] Test: admin login, dashboard stats visible, update order status
```

---

## PART 15: MOBILE CHECKLIST

Apply these throughout — do not leave for the end:

- [ ] All tap targets ≥ 44px (use `min-h-[44px]` or `py-3.5`)
- [ ] No horizontal scroll at 390px
- [ ] Product grid: `grid-cols-2` on mobile (never `grid-cols-1`)
- [ ] Vendor grid: `grid-cols-2` mobile, `grid-cols-3` tablet, `grid-cols-4` desktop
- [ ] Cart drawer: `max-h-[85vh]` with internal scroll
- [ ] Checkout form: full-width inputs, comfortable padding
- [ ] Floating "View Bag" bar on `/market/[id]`: `fixed bottom-0 left-0 right-0 bg-white border-t`
- [ ] Admin tables: horizontally scrollable on mobile (`overflow-x-auto`)
- [ ] Font sizes: minimum `text-sm` (14px) on mobile

---

## PART 16: GITHUB & VERCEL DEPLOYMENT

### 16.1 GitHub

```bash
git init
git add .
git commit -m "feat: initial MarketDay build"
```

Then either:
```bash
gh repo create marketday --public --source=. --remote=origin --push
```

Or manually create repo at github.com, then:
```bash
git remote add origin https://github.com/YOUR_USERNAME/marketday.git
git branch -M main
git push -u origin main
```

### 16.2 Vercel

1. Go to vercel.com → New Project → Import from GitHub
2. Framework preset: Next.js (auto-detected)
3. Root directory: `.`
4. Add all env vars from `.env.local` to Vercel dashboard
5. Deploy

After first deploy, update these env vars in Vercel:
- `NEXTAUTH_URL` → your Vercel URL (e.g. `https://marketday.vercel.app`)
- `NEXT_PUBLIC_APP_URL` → same Vercel URL

Redeploy to pick up the change.

### 16.3 Stripe Webhooks (Production)

1. Stripe Dashboard → Developers → Webhooks → Add endpoint
2. URL: `https://your-vercel-url.vercel.app/api/stripe/webhook`
3. Events: `checkout.session.completed`
4. Copy signing secret → add to Vercel env as `STRIPE_WEBHOOK_SECRET`

### 16.4 Stripe Webhook (Local Dev)

Install Stripe CLI for Windows: https://stripe.com/docs/stripe-cli#install
Then:
```bash
stripe login
stripe listen --forward-to localhost:3000/api/stripe/webhook
# Copy the "whsec_..." secret shown and add to .env.local as STRIPE_WEBHOOK_SECRET
```

---

## PART 17: LOCAL DEV COMMANDS

```bash
npm run dev              # Dev server at localhost:3000
npx prisma studio        # DB browser at localhost:5555
npx prisma db push       # Sync schema changes
npx prisma db seed       # Re-seed (deletes and recreates all data)
npx prisma generate      # Regenerate client after schema changes
npm run build            # Production build
npm run lint             # ESLint
stripe listen --forward-to localhost:3000/api/stripe/webhook  # Stripe webhook proxy
```

---

## PART 18: WHITE-LABEL CUSTOMIZATION GUIDE

To rebrand this app for a new market client, change ONLY these things:

1. **`src/config/market.config.ts`** — All names, addresses, contact info, schedule
2. **`tailwind.config.ts`** — Replace the `market-*` color values with client's brand colors
3. **`src/app/globals.css`** — Update CSS variable HSL values to match new brand colors
4. **`/public/logo.png`** — Replace with client's logo (also update `<Header />` to use `<Image>`)
5. **`.env.local`** — New Supabase DB, Stripe keys, Resend sender domain, app URL

Seed data is fully configurable in `prisma/seed.ts`.

**Estimated white-label time for a new client: 30–60 minutes.**

---

## PART 19: WHAT NOT TO DO

- Do NOT install `react-email` — use the plain HTML email builder in `lib/resend.ts`
- Do NOT use `next-auth` v5 — use v4 (^4.24.7) per this spec
- Do NOT use `pages/` router — everything is App Router
- Do NOT store prices as floats — always store as integers (cents)
- Do NOT add `"use client"` to pages that don't need it — prefer server components
- Do NOT add any page without also adding its link in the nav or breadcrumb
- Do NOT use `<form>` action attributes — use react-hook-form `handleSubmit`
- Do NOT use lorem ipsum anywhere — all copy is provided in this document
- Do NOT use `Math.random()` for order numbers — use count-based sequential numbers

---

## PART 20: POST-BUILD VERIFICATION

Before pushing to GitHub, verify each of the following manually:

**Public flows:**
- [ ] Homepage loads with vendor cards and market dates
- [ ] Market page loads, category filter works
- [ ] Product "Add to Bag" works, cart count badge updates
- [ ] Cart drawer opens and shows items
- [ ] Cart page shows items + market picker + payment picker
- [ ] AT_MARKET checkout flow completes and shows order confirmation
- [ ] Order confirmation page shows order number and details
- [ ] Vendors list shows all 8 vendors
- [ ] Individual vendor page shows vendor + products
- [ ] All nav links are functional

**Admin flows:**
- [ ] `/admin/login` loads, bad credentials show error
- [ ] `marci@marketday.com / marci2026` signs in successfully
- [ ] Dashboard shows 5 orders, stats, next market
- [ ] Order list shows all orders with filters
- [ ] Order detail shows full order, status can be updated
- [ ] Vendor list shows all 8 vendors
- [ ] Can create a new vendor via admin
- [ ] Product list shows all 24 products
- [ ] Market list shows 3 markets
- [ ] Sign out works, redirects to login

**Build:**
- [ ] `npm run build` completes with 0 errors, 0 TypeScript errors
- [ ] `npm run lint` passes

---

*MarketDay v2.0 · Built with Next.js 14, Prisma, NextAuth v4, Stripe, Supabase, Vercel*
*Liberty Station Public Market · San Diego, CA · Ready for white-labeling*
