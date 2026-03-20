'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  LayoutDashboard,
  User,
  ImageIcon,
  Package,
  CalendarDays,
  CreditCard,
  FileText,
  LogOut,
  Menu,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type VendorNavProps = {
  session: {
    user: {
      name?: string | null
      email?: string | null
    }
  }
  onlineOrdersEnabled: boolean
}

const getNavLinks = (onlineOrdersEnabled: boolean) => [
  { href: '/vendor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/vendor/profile', label: 'Profile', icon: User },
  { href: '/vendor/images', label: 'Images', icon: ImageIcon },
  ...(onlineOrdersEnabled
    ? [{ href: '/vendor/products', label: 'Products', icon: Package }]
    : []),
  { href: '/vendor/schedule', label: 'Schedule', icon: CalendarDays },
  { href: '/vendor/payment', label: 'Payment', icon: CreditCard },
  { href: '/vendor/documents', label: 'Documents', icon: FileText },
]

export default function VendorNav({ session, onlineOrdersEnabled }: VendorNavProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const navLinks = getNavLinks(onlineOrdersEnabled)

  function isActive(href: string) {
    if (href === '/vendor/dashboard') {
      return pathname === '/vendor/dashboard'
    }
    return pathname.startsWith(href)
  }

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="px-6 py-5 border-b border-market-stone/40">
        <h1 className="font-display text-xl text-market-sage font-bold">
          Backroads
        </h1>
        <span className="inline-block mt-1 text-[10px] font-semibold uppercase tracking-widest text-market-bark bg-market-warm px-2 py-0.5 rounded">
          Vendor
        </span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navLinks.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={() => setMobileOpen(false)}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
              isActive(href)
                ? 'bg-market-warm text-market-soil'
                : 'text-muted-foreground hover:bg-market-warm/50 hover:text-market-soil'
            )}
          >
            <Icon className="size-4 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="px-4 py-4 border-t border-market-stone/40">
        <p className="text-sm font-medium text-market-soil truncate">
          {session.user.name || session.user.email}
        </p>
        <button
          onClick={() => signOut({ callbackUrl: '/vendor/login' })}
          className="flex items-center gap-2 mt-3 text-sm text-muted-foreground hover:text-market-terra transition-colors"
        >
          <LogOut className="size-4" />
          Sign Out
        </button>
      </div>
    </div>
  )

  return (
    <>
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white border-r border-market-stone/40">
        {sidebarContent}
      </aside>

      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-market-stone/40 px-4 py-3 flex items-center justify-between">
        <h1 className="font-display text-lg text-market-sage font-bold">
          Backroads
        </h1>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg hover:bg-market-warm transition-colors"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {mobileOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 z-40 bg-black/30"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-market-stone/40 animate-slide-in-right">
            {sidebarContent}
          </aside>
        </>
      )}

      <div className="lg:hidden h-14" />
    </>
  )
}
