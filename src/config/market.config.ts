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
