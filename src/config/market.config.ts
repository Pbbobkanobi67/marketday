export const MARKET_CONFIG = {
  // --- Brand Identity ------------------------------------
  marketName: 'Backroads Certified Farmers Market',
  tagline: 'Fresh from the farm. Ready on Saturday.',
  shortDescription: 'El Cajon\'s certified farmers market, now with online ordering.',
  contactEmail: 'hello@backroadsmarket.com',
  supportPhone: '(619) 555-0100',

  // --- Venue ---------------------------------------------
  venueName: 'Backroads Certified Farmers Market',
  venueAddress: '14335 Olde Hwy 80',
  venueCity: 'El Cajon',
  venueState: 'CA',
  venueZip: '92021',
  venueFullAddress: '14335 Olde Hwy 80, El Cajon, CA 92021',

  // --- Schedule ------------------------------------------
  marketDay: 'Saturday',
  defaultOpenTime: '9:00 AM',
  defaultCloseTime: '1:00 PM',

  // --- Currency ------------------------------------------
  currency: 'USD',
  currencyLocale: 'en-US',

  // --- Order Settings ------------------------------------
  orderNumberPrefix: 'BR',
  orderCutoffHours: 12,

  // --- SEO / Meta ----------------------------------------
  siteTitle: 'Backroads Certified Farmers Market — El Cajon, CA',
  siteDescription:
    'Order fresh produce, baked goods, and local specialties from Backroads Certified Farmers Market in El Cajon. Pre-order online, pick up Saturday.',
  siteUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',

  // --- Social --------------------------------------------
  facebookPage: 'https://www.facebook.com/p/Backroads-Certified-Farmers-Market-61579022200120/',

  // --- Feature Flags -------------------------------------
  enableOnlinePayments: true,
  enableReservePayAtMarket: true,
  enableVendorDirectory: true,

  // --- Categories (product-level grouping) ----------------
  categories: [
    { value: 'certified_farmer', label: 'Certified Farmer', emoji: '🌾' },
    { value: 'artisan_craft', label: 'Artisan & Craft', emoji: '🎨' },
    { value: 'hot_food', label: 'Hot Food', emoji: '🍲' },
    { value: 'baked', label: 'Baked Goods', emoji: '🍞' },
    { value: 'specialty', label: 'Specialty Food', emoji: '🫙' },
    { value: 'nonprofit', label: 'Nonprofit', emoji: '💛' },
  ],

  // --- Vendor Types (vendor-level classification) --------
  vendorTypes: [
    { value: 'certified_farmer', label: 'Certified Farmer' },
    { value: 'artisan_craft', label: 'Artisan & Craft' },
    { value: 'hot_food', label: 'Hot Food' },
    { value: 'baked_goods', label: 'Baked Goods' },
    { value: 'specialty_food', label: 'Specialty Food' },
    { value: 'nonprofit', label: 'Nonprofit' },
  ],

  // --- Market Types --------------------------------------
  marketTypes: [
    { value: 'SATURDAY_MARKET', label: 'Saturday Market' },
    { value: 'PICKUP_EVENT', label: 'Pickup Event' },
  ],

  // --- Vendor Documents ----------------------------------
  documents: [
    {
      id: 'market-rules',
      title: 'Market Rules & Regulations',
      description: 'General rules, code of conduct, and expectations for all vendors participating in the market.',
      category: 'rules',
    },
    {
      id: 'vendor-agreement',
      title: 'Vendor Agreement',
      description: 'The vendor participation agreement outlining terms, responsibilities, and market policies.',
      category: 'agreement',
    },
    {
      id: 'food-safety',
      title: 'Food Safety Guidelines',
      description: 'Food handling requirements, temperature guidelines, and health department compliance information.',
      category: 'safety',
    },
    {
      id: 'insurance-requirements',
      title: 'Insurance Requirements',
      description: 'Liability insurance requirements and proof of coverage needed to participate as a vendor.',
      category: 'insurance',
    },
    {
      id: 'booth-setup',
      title: 'Booth Setup Guide',
      description: 'Guidelines for booth setup, teardown, signage, and display standards at the market.',
      category: 'setup',
    },
  ],
} as const

export type CategoryValue = (typeof MARKET_CONFIG.categories)[number]['value']
export type VendorTypeValue = (typeof MARKET_CONFIG.vendorTypes)[number]['value']
export type MarketTypeValue = (typeof MARKET_CONFIG.marketTypes)[number]['value']
