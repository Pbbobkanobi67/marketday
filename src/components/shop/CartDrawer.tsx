'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { formatPrice, cn } from '@/lib/utils'

export default function CartDrawer() {
  const {
    cart,
    isDrawerOpen,
    closeDrawer,
    updateQuantity,
    removeItem,
    itemCount,
    subtotal,
  } = useCart()

  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isDrawerOpen])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isDrawerOpen) {
        closeDrawer()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isDrawerOpen, closeDrawer])

  if (!isDrawerOpen) return null

  // Group items by vendor
  const groupedByVendor = cart.items.reduce<
    Record<string, typeof cart.items>
  >((groups, item) => {
    const key = item.vendorName || 'Other'
    if (!groups[key]) groups[key] = []
    groups[key].push(item)
    return groups
  }, {})

  const vendorNames = Object.keys(groupedByVendor).sort()

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Shopping bag">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 transition-opacity"
        onClick={closeDrawer}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div className="absolute top-0 right-0 bottom-0 w-full max-w-md bg-white shadow-xl flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-market-stone/30">
          <h2 className="font-display text-lg font-semibold text-market-soil">
            Your Market Bag
          </h2>
          <button
            onClick={closeDrawer}
            className="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-market-warm transition-colors"
            aria-label="Close shopping bag"
          >
            <X className="w-5 h-5 text-market-soil" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {cart.items.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center h-full px-5 py-12 text-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-market-warm mb-4">
                <ShoppingBag className="w-7 h-7 text-market-stone" />
              </div>
              <p className="font-display text-lg text-market-soil mb-1">
                Nothing in your bag yet
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                Browse our vendors and add some farm-fresh favorites.
              </p>
              <Link
                href="/vendors"
                onClick={closeDrawer}
                className="btn-primary inline-flex items-center"
              >
                Browse Vendors
              </Link>
            </div>
          ) : (
            /* Items grouped by vendor */
            <div className="px-5 py-4 space-y-6">
              {vendorNames.map((vendorName) => (
                <div key={vendorName}>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                    {vendorName}
                  </h3>
                  <div className="space-y-3">
                    {groupedByVendor[vendorName].map((item) => (
                      <div
                        key={item.productId}
                        className="flex items-start gap-3 p-3 rounded-lg bg-market-cream/50"
                      >
                        {/* Product image or initial */}
                        <div className="w-12 h-12 rounded-lg bg-market-warm flex items-center justify-center shrink-0 overflow-hidden">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="font-display text-lg font-bold text-market-stone select-none">
                              {item.productName.charAt(0)}
                            </span>
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-market-soil truncate">
                            {item.productName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatPrice(item.price)} / {item.unit}
                          </p>

                          {/* Quantity controls */}
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              onClick={() =>
                                updateQuantity(item.productId, item.quantity - 1)
                              }
                              className="flex items-center justify-center w-6 h-6 rounded bg-market-warm hover:bg-market-stone text-market-soil transition-colors"
                              aria-label={`Decrease quantity of ${item.productName}`}
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-sm font-medium text-market-soil w-5 text-center tabular-nums">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(item.productId, item.quantity + 1)
                              }
                              className="flex items-center justify-center w-6 h-6 rounded bg-market-warm hover:bg-market-stone text-market-soil transition-colors"
                              aria-label={`Increase quantity of ${item.productName}`}
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Line total + remove */}
                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                          <span className="price text-sm">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                          <button
                            onClick={() => removeItem(item.productId)}
                            className="flex items-center justify-center w-6 h-6 rounded hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors"
                            aria-label={`Remove ${item.productName} from bag`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.items.length > 0 && (
          <div className="border-t border-market-stone/30 px-5 py-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})
              </span>
              <span className="price text-lg">{formatPrice(subtotal)}</span>
            </div>
            <Link
              href="/cart"
              onClick={closeDrawer}
              className="btn-primary block text-center w-full"
            >
              Review My Bag &rarr;
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
