'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Minus, Plus, X, CreditCard, Coins, ShoppingBag, ArrowRight, ArrowLeft } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { formatPrice, formatMarketDate, formatMarketDateShort, cn } from '@/lib/utils'

type SerializedMarket = {
  id: string
  name: string
  date: string
  openTime: string
  closeTime: string
  location: string
  address: string
  description: string | null
  status: string
  type?: string
}

type PaymentMethod = 'STRIPE' | 'AT_MARKET' | null

export default function CartPageClient({ markets }: { markets: SerializedMarket[] }) {
  const { cart, updateQuantity, removeItem, setMarket, itemCount, subtotal } = useCart()
  const [selectedMarketId, setSelectedMarketId] = useState<string | null>(cart.marketId)
  const [paymentMethod, setPaymentMethodState] = useState<PaymentMethod>(null)

  // Load persisted payment method on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('backroads-payment-method')
      if (saved === 'STRIPE' || saved === 'AT_MARKET') {
        setPaymentMethodState(saved)
      }
    } catch {}
  }, [])

  function setPaymentMethod(method: PaymentMethod) {
    setPaymentMethodState(method)
    try {
      if (method) localStorage.setItem('backroads-payment-method', method)
      else localStorage.removeItem('backroads-payment-method')
    } catch {}
  }

  function handleSelectMarket(marketId: string) {
    setSelectedMarketId(marketId)
    setMarket(marketId)
  }

  // Group items by vendor
  const groupedByVendor = cart.items.reduce<Record<string, typeof cart.items>>((groups, item) => {
    const key = item.vendorName || 'Other'
    if (!groups[key]) groups[key] = []
    groups[key].push(item)
    return groups
  }, {})

  const vendorNames = Object.keys(groupedByVendor).sort()
  const canCheckout = selectedMarketId && paymentMethod && itemCount > 0

  // Empty state
  if (itemCount === 0) {
    return (
      <section className="container-market py-16">
        <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto">
          <div className="text-6xl mb-6" role="img" aria-label="Empty basket">
            &#129522;
          </div>
          <h1 className="font-display text-2xl font-bold text-market-soil mb-3">
            Your bag is empty
          </h1>
          <p className="text-muted-foreground mb-8">
            Start browsing the market to find fresh, local goods.
          </p>
          {markets.length > 0 ? (
            <Link href={`/market/${markets[0].id}`} className="btn-primary inline-flex items-center gap-2">
              Browse the Market
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <Link href="/vendors" className="btn-primary inline-flex items-center gap-2">
              Browse Vendors
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </section>
    )
  }

  const continueShoppingHref = cart.marketId ? `/market/${cart.marketId}` : '/'

  return (
    <section className="container-market py-10">
      <Link
        href={continueShoppingHref}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-market-sage hover:text-market-sage-dk transition-colors mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Continue Shopping
      </Link>
      <h1 className="font-display text-3xl font-bold text-market-soil mb-8">
        Your Market Bag
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column: Items + Market selector */}
        <div className="lg:col-span-2 space-y-8">
          {/* Items grouped by vendor */}
          <div className="space-y-6">
            {vendorNames.map((vendorName) => (
              <div key={vendorName} className="card-market p-5">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                  {vendorName}
                </h2>
                <div className="space-y-4">
                  {groupedByVendor[vendorName].map((item) => (
                    <div
                      key={item.productId}
                      className="flex items-center gap-4 py-3 border-b border-market-stone/20 last:border-0 last:pb-0"
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

                      {/* Name and unit */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-market-soil truncate">
                          {item.productName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatPrice(item.price)} / {item.unit}
                        </p>
                      </div>

                      {/* Quantity controls */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="flex items-center justify-center w-7 h-7 rounded-md bg-market-warm hover:bg-market-stone text-market-soil transition-colors"
                          aria-label={`Decrease quantity of ${item.productName}`}
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-sm font-medium text-market-soil w-6 text-center tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="flex items-center justify-center w-7 h-7 rounded-md bg-market-warm hover:bg-market-stone text-market-soil transition-colors"
                          aria-label={`Increase quantity of ${item.productName}`}
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Line price */}
                      <span className="price text-sm w-20 text-right shrink-0">
                        {formatPrice(item.price * item.quantity)}
                      </span>

                      {/* Remove */}
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors shrink-0"
                        aria-label={`Remove ${item.productName} from bag`}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Market date selector */}
          <div className="card-market p-5">
            <h2 className="font-display text-lg font-semibold text-market-soil mb-1">
              Pick a Market Date
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Choose when you would like to pick up your order.
            </p>

            {markets.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">
                No upcoming markets scheduled. Please check back later.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {markets.map((market) => (
                  <button
                    key={market.id}
                    onClick={() => handleSelectMarket(market.id)}
                    className={cn(
                      'flex flex-col items-start p-4 rounded-lg border-2 transition-all text-left',
                      selectedMarketId === market.id
                        ? 'border-market-sage bg-market-sage/5'
                        : 'border-market-stone/40 hover:border-market-stone'
                    )}
                  >
                    <span className="text-sm font-semibold text-market-soil">
                      {formatMarketDate(market.date)}
                    </span>
                    <span className="text-xs text-muted-foreground mt-0.5">
                      {market.openTime} &ndash; {market.closeTime}
                    </span>
                    <span className="text-xs text-muted-foreground mt-0.5">
                      {market.location}
                    </span>
                    {market.type === 'PICKUP_EVENT' && (
                      <span className="inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium bg-indigo-100 text-indigo-800 mt-1 w-fit">
                        Pickup Event
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column: Order summary */}
        <div className="lg:col-span-1">
          <div className="card-market p-5 sticky top-20 space-y-5">
            <h2 className="font-display text-lg font-semibold text-market-soil">
              Order Summary
            </h2>

            {/* Subtotal */}
            <div className="flex items-center justify-between py-3 border-b border-market-stone/20">
              <span className="text-sm text-muted-foreground">
                Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})
              </span>
              <span className="price text-lg">{formatPrice(subtotal)}</span>
            </div>

            {/* Payment method */}
            <div>
              <h3 className="text-sm font-medium text-market-soil mb-3">
                Payment Method
              </h3>
              <div className="space-y-3">
                {/* Pay now (Stripe) */}
                <button
                  onClick={() => setPaymentMethod('STRIPE')}
                  className={cn(
                    'w-full flex items-start gap-3 p-4 rounded-lg border-2 transition-all text-left',
                    paymentMethod === 'STRIPE'
                      ? 'border-market-sage bg-market-sage/5'
                      : 'border-market-stone/40 hover:border-market-stone'
                  )}
                >
                  <CreditCard className="w-5 h-5 text-market-sage shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-market-soil">Pay now</p>
                    <p className="text-xs text-muted-foreground">Secure online payment</p>
                  </div>
                </button>

                {/* Reserve & pay at market */}
                <button
                  onClick={() => setPaymentMethod('AT_MARKET')}
                  className={cn(
                    'w-full flex items-start gap-3 p-4 rounded-lg border-2 transition-all text-left',
                    paymentMethod === 'AT_MARKET'
                      ? 'border-market-sage bg-market-sage/5'
                      : 'border-market-stone/40 hover:border-market-stone'
                  )}
                >
                  <Coins className="w-5 h-5 text-market-gold shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-market-soil">Reserve &amp; pay at market</p>
                    <p className="text-xs text-muted-foreground">Pay cash or card at the stand</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Checkout button */}
            {canCheckout ? (
              <Link
                href={`/checkout?method=${paymentMethod}`}
                className="btn-primary flex items-center justify-center gap-2 w-full text-center"
              >
                Continue to Checkout
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <button
                disabled
                className="btn-primary flex items-center justify-center gap-2 w-full opacity-50 cursor-not-allowed"
              >
                Continue to Checkout
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {/* Note */}
            <p className="text-xs text-muted-foreground text-center">
              Order changes can be made until 8pm Friday
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
