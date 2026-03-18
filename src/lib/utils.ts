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
