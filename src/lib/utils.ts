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
  return str.length > length ? str.substring(0, length) + '...' : str
}

export function categoryLabel(value: string): string {
  const map: Record<string, string> = {
    // Legacy (kept for backward compat with existing data)
    certified_farmer: 'Certified Farmer',
    artisan_craft: 'Artisan & Craft',
    // Food & Beverage
    fresh_produce: 'Fresh Produce',
    eggs_dairy: 'Eggs & Dairy',
    honey_preserves: 'Honey & Preserves',
    baked: 'Baked Goods',
    hot_food: 'Hot Food',
    specialty: 'Specialty Food',
    beverages: 'Beverages',
    // Artisan & Handmade
    candles: 'Candles',
    wax_melts: 'Wax Melts',
    car_freshies: 'Car Freshies',
    bath_body: 'Bath & Body',
    jewelry: 'Jewelry',
    clothing: 'Clothing & Accessories',
    plants: 'Plants & Flowers',
    art_ceramics: 'Art & Ceramics',
    pet_supplies: 'Pet Supplies',
    home_decor: 'Home & Decor',
    handmade: 'Handmade Goods',
    nonprofit: 'Nonprofit',
  }
  return map[value] || value
}

export function categoryColor(value: string): string {
  const map: Record<string, string> = {
    // Legacy
    certified_farmer: 'bg-green-100 text-green-800',
    artisan_craft: 'bg-violet-100 text-violet-800',
    // Food & Beverage
    fresh_produce: 'bg-green-100 text-green-800',
    eggs_dairy: 'bg-lime-100 text-lime-800',
    honey_preserves: 'bg-amber-100 text-amber-800',
    baked: 'bg-amber-100 text-amber-800',
    hot_food: 'bg-orange-100 text-orange-800',
    specialty: 'bg-purple-100 text-purple-800',
    beverages: 'bg-sky-100 text-sky-800',
    // Artisan & Handmade
    candles: 'bg-rose-100 text-rose-800',
    wax_melts: 'bg-pink-100 text-pink-800',
    car_freshies: 'bg-indigo-100 text-indigo-800',
    bath_body: 'bg-teal-100 text-teal-800',
    jewelry: 'bg-fuchsia-100 text-fuchsia-800',
    clothing: 'bg-violet-100 text-violet-800',
    plants: 'bg-emerald-100 text-emerald-800',
    art_ceramics: 'bg-cyan-100 text-cyan-800',
    pet_supplies: 'bg-orange-100 text-orange-800',
    home_decor: 'bg-slate-100 text-slate-800',
    handmade: 'bg-violet-100 text-violet-800',
    nonprofit: 'bg-yellow-100 text-yellow-800',
  }
  return map[value] || 'bg-gray-100 text-gray-800'
}

export function vendorTypeLabel(value: string): string {
  const map: Record<string, string> = {
    certified_farmer: 'Certified Farmer',
    artisan_craft: 'Artisan & Craft',
    hot_food: 'Hot Food',
    baked_goods: 'Baked Goods',
    specialty_food: 'Specialty Food',
    nonprofit: 'Nonprofit',
  }
  return map[value] || value
}

export function vendorTypeColor(value: string): string {
  const map: Record<string, string> = {
    certified_farmer: 'bg-emerald-100 text-emerald-800',
    artisan_craft: 'bg-indigo-100 text-indigo-800',
    hot_food: 'bg-red-100 text-red-800',
    baked_goods: 'bg-amber-100 text-amber-800',
    specialty_food: 'bg-teal-100 text-teal-800',
    nonprofit: 'bg-sky-100 text-sky-800',
  }
  return map[value] || 'bg-gray-100 text-gray-800'
}

export function marketTypeLabel(value: string): string {
  const map: Record<string, string> = {
    SATURDAY_MARKET: 'Saturday Market',
    PICKUP_EVENT: 'Pickup Event',
  }
  return map[value] || value
}
