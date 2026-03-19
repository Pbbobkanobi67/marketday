'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingBag, Menu, X } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { cn } from '@/lib/utils'
import CartDrawer from '@/components/shop/CartDrawer'

const NAV_LINKS = [
  { label: 'Vendors', href: '/vendors' },
  { label: 'Become a Vendor', href: '/apply' },
  { label: 'This Saturday \u2192', href: '/markets/next' },
]

export default function Header() {
  const { itemCount, openDrawer } = useCart()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const prevCountRef = useRef(itemCount)
  const [badgeAnimating, setBadgeAnimating] = useState(false)

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 60)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (prevCountRef.current !== itemCount && itemCount > 0) {
      setBadgeAnimating(true)
      const timer = setTimeout(() => setBadgeAnimating(false), 250)
      return () => clearTimeout(timer)
    }
    prevCountRef.current = itemCount
  }, [itemCount])

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-40 transition-all duration-200',
          scrolled
            ? 'shadow-sm bg-white/95 backdrop-blur'
            : 'bg-market-cream'
        )}
      >
        <div className="container-market flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/backroads-logo.jpg"
              alt="Backroads Certified Farmers Market"
              width={40}
              height={40}
              className="rounded-full"
            />
            <span className="font-display text-xl font-bold text-market-soil hidden sm:inline">
              Backroads
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-market-bark hover:text-market-sage transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right section */}
          <div className="flex items-center gap-3">
            {/* Cart button */}
            <button
              onClick={openDrawer}
              className="relative flex items-center justify-center w-10 h-10 rounded-lg hover:bg-market-warm transition-colors"
              aria-label={`Open cart, ${itemCount} items`}
            >
              <ShoppingBag className="w-5 h-5 text-market-soil" />
              {itemCount > 0 && (
                <span
                  className={cn(
                    'absolute -top-0.5 -right-0.5 flex items-center justify-center w-5 h-5 rounded-full bg-market-terra text-white text-[10px] font-bold leading-none',
                    badgeAnimating && 'animate-badge-pop'
                  )}
                >
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </button>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(true)}
              className="flex md:hidden items-center justify-center w-10 h-10 rounded-lg hover:bg-market-warm transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5 text-market-soil" />
            </button>
          </div>
        </div>
      </header>

      {/* Spacer so content does not hide behind fixed header */}
      <div className="h-16" aria-hidden="true" />

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer panel */}
          <div className="absolute inset-0 bg-market-cream flex flex-col animate-fade-in">
            {/* Drawer header */}
            <div className="flex items-center justify-between h-16 px-4 sm:px-6">
              <Link
                href="/"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2"
              >
                <Image
                  src="/backroads-logo.jpg"
                  alt="Backroads Certified Farmers Market"
                  width={36}
                  height={36}
                  className="rounded-full"
                />
                <span className="font-display text-xl font-bold text-market-soil">
                  Backroads
                </span>
              </Link>
              <button
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-market-warm transition-colors"
                aria-label="Close menu"
              >
                <X className="w-5 h-5 text-market-soil" />
              </button>
            </div>

            {/* Drawer links */}
            <nav className="flex flex-col items-center justify-center flex-1 gap-8" aria-label="Mobile navigation">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="font-display text-2xl text-market-soil hover:text-market-sage transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <button
                onClick={() => {
                  setMobileOpen(false)
                  openDrawer()
                }}
                className="flex items-center gap-2 font-display text-2xl text-market-soil hover:text-market-sage transition-colors"
              >
                <ShoppingBag className="w-6 h-6" />
                Your Bag
                {itemCount > 0 && (
                  <span className="ml-1 flex items-center justify-center w-6 h-6 rounded-full bg-market-terra text-white text-xs font-bold">
                    {itemCount}
                  </span>
                )}
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Cart drawer */}
      <CartDrawer />
    </>
  )
}
