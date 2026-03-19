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
    certified_farmer: 'Certified Farmer',
    artisan_craft: 'Artisan Craft',
    hot_food: 'Hot Food',
    baked: 'Baked Goods',
    specialty: 'Specialty Foods',
    nonprofit: 'Nonprofit',
  }
  return map[value] || value
}

export function categoryColor(value: string): string {
  const map: Record<string, string> = {
    certified_farmer: 'bg-green-100 text-green-800',
    artisan_craft: 'bg-violet-100 text-violet-800',
    hot_food: 'bg-orange-100 text-orange-800',
    baked: 'bg-amber-100 text-amber-800',
    specialty: 'bg-purple-100 text-purple-800',
    nonprofit: 'bg-yellow-100 text-yellow-800',
  }
  return map[value] || 'bg-gray-100 text-gray-800'
}

export function vendorTypeLabel(value: string): string {
  const map: Record<string, string> = {
    certified_farmer: 'Certified Farmer',
    artisan_craft: 'Artisan / Craft',
    hot_food: 'Hot Food Vendor',
    baked_goods: 'Baked Goods',
    specialty_food: 'Specialty Food',
    nonprofit: 'Nonprofit',
  }
  return map[value] || value
}

export function vendorTypeColor(value: string): string {
  const map: Record<string, string> = {
    certified_farmer: 'bg-green-100 text-green-800',
    artisan_craft: 'bg-violet-100 text-violet-800',
    hot_food: 'bg-orange-100 text-orange-800',
    baked_goods: 'bg-amber-100 text-amber-800',
    specialty_food: 'bg-purple-100 text-purple-800',
    nonprofit: 'bg-yellow-100 text-yellow-800',
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
