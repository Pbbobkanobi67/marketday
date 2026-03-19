'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { z } from 'zod'
import { Loader2, ArrowRight, ArrowLeft, CreditCard, Coins } from 'lucide-react'
import { toast } from 'sonner'
import { useCart } from '@/context/CartContext'
import { formatPrice, formatMarketDate, cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

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
}

const checkoutSchema = z.object({
  customerName: z.string().min(2, 'Name must be at least 2 characters').max(100),
  customerEmail: z.string().email('Please enter a valid email address'),
  customerPhone: z.string().optional(),
  customerNotes: z.string().max(500, 'Notes must be under 500 characters').optional(),
})

type CheckoutFormValues = z.infer<typeof checkoutSchema>

export default function CheckoutClient({ markets }: { markets: SerializedMarket[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const paymentMethod = (searchParams.get('method') as 'STRIPE' | 'AT_MARKET') || 'AT_MARKET'
  const { cart, itemCount, subtotal, clearCart } = useCart()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const selectedMarket = markets.find((m) => m.id === cart.marketId)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: standardSchemaResolver(checkoutSchema),
    defaultValues: {
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      customerNotes: '',
    },
  })

  // Group items by vendor for display
  const groupedByVendor = cart.items.reduce<Record<string, typeof cart.items>>((groups, item) => {
    const key = item.vendorName || 'Other'
    if (!groups[key]) groups[key] = []
    groups[key].push(item)
    return groups
  }, {})
  const vendorNames = Object.keys(groupedByVendor).sort()

  async function onSubmit(data: CheckoutFormValues) {
    if (!cart.marketId) {
      toast.error('Please select a market date first.')
      return
    }

    if (itemCount === 0) {
      toast.error('Your bag is empty.')
      return
    }

    setIsSubmitting(true)

    const payload = {
      marketId: cart.marketId,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone || undefined,
      customerNotes: data.customerNotes || undefined,
      items: cart.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
    }

    try {
      if (paymentMethod === 'STRIPE') {
        const res = await fetch('/api/stripe/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error || 'Checkout failed')
        }

        const result = await res.json()
        clearCart()
        window.location.href = result.sessionUrl
      } else {
        const res = await fetch('/api/orders/reserve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error || 'Failed to place reservation')
        }

        const result = await res.json()
        clearCart()
        router.push(`/order/${result.orderId}`)
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setIsSubmitting(false)
    }
  }

  // Redirect back to cart if empty or no market selected
  if (itemCount === 0) {
    return (
      <section className="container-market py-16">
        <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto">
          <h1 className="font-display text-2xl font-bold text-market-soil mb-3">
            Nothing to check out
          </h1>
          <p className="text-muted-foreground mb-8">
            Your bag is empty. Add some items before checking out.
          </p>
          <Link href="/vendors" className="btn-primary inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Browse Vendors
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="container-market py-10">
      {/* Back link */}
      <Link
        href="/cart"
        className="inline-flex items-center gap-1 text-sm font-medium text-market-sage hover:text-market-sage-dk transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to bag
      </Link>

      <h1 className="font-display text-3xl font-bold text-market-soil mb-8">
        Checkout
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column: Form */}
        <div className="lg:col-span-2">
          <form id="checkout-form" onSubmit={handleSubmit(onSubmit)} className="card-market p-6 space-y-6">
            <h2 className="font-display text-lg font-semibold text-market-soil">
              Your Details
            </h2>

            {/* Full Name */}
            <div className="space-y-1.5">
              <Label htmlFor="customerName">
                Full Name <span className="text-market-terra">*</span>
              </Label>
              <Input
                id="customerName"
                placeholder="Jane Smith"
                className="h-10"
                aria-invalid={!!errors.customerName}
                {...register('customerName')}
              />
              {errors.customerName && (
                <p className="text-xs text-red-600">{errors.customerName.message}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="customerEmail">
                Email <span className="text-market-terra">*</span>
              </Label>
              <Input
                id="customerEmail"
                type="email"
                placeholder="jane@example.com"
                className="h-10"
                aria-invalid={!!errors.customerEmail}
                {...register('customerEmail')}
              />
              {errors.customerEmail && (
                <p className="text-xs text-red-600">{errors.customerEmail.message}</p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <Label htmlFor="customerPhone">
                Phone <span className="text-xs text-muted-foreground font-normal">(optional)</span>
              </Label>
              <Input
                id="customerPhone"
                type="tel"
                placeholder="(555) 123-4567"
                className="h-10"
                {...register('customerPhone')}
              />
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <Label htmlFor="customerNotes">
                Special Requests / Notes{' '}
                <span className="text-xs text-muted-foreground font-normal">(optional, max 500 chars)</span>
              </Label>
              <Textarea
                id="customerNotes"
                placeholder="Any allergies, substitution preferences, or special requests..."
                rows={3}
                aria-invalid={!!errors.customerNotes}
                {...register('customerNotes')}
              />
              {errors.customerNotes && (
                <p className="text-xs text-red-600">{errors.customerNotes.message}</p>
              )}
            </div>
          </form>
        </div>

        {/* Right column: Order summary */}
        <div className="lg:col-span-1">
          <div className="card-market p-5 sticky top-20 space-y-5">
            <h2 className="font-display text-lg font-semibold text-market-soil">
              Order Summary
            </h2>

            {/* Items */}
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {vendorNames.map((vendorName) => (
                <div key={vendorName}>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                    {vendorName}
                  </p>
                  {groupedByVendor[vendorName].map((item) => (
                    <div key={item.productId} className="flex items-center justify-between py-1">
                      <span className="text-sm text-market-soil truncate flex-1 mr-2">
                        {item.productName} <span className="text-muted-foreground">x{item.quantity}</span>
                      </span>
                      <span className="text-sm font-medium text-market-soil shrink-0">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Subtotal */}
            <div className="flex items-center justify-between py-3 border-t border-market-stone/20">
              <span className="text-sm font-medium text-market-soil">Subtotal</span>
              <span className="price text-lg">{formatPrice(subtotal)}</span>
            </div>

            {/* Market date */}
            {selectedMarket && (
              <div className="py-3 border-t border-market-stone/20">
                <p className="text-xs text-muted-foreground mb-0.5">Pickup</p>
                <p className="text-sm font-medium text-market-soil">
                  {formatMarketDate(selectedMarket.date)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {selectedMarket.openTime} &ndash; {selectedMarket.closeTime} &middot; {selectedMarket.location}
                </p>
              </div>
            )}

            {/* Payment method */}
            <div className="py-3 border-t border-market-stone/20">
              <p className="text-xs text-muted-foreground mb-1">Payment</p>
              <div className="flex items-center gap-2">
                {paymentMethod === 'STRIPE' ? (
                  <>
                    <CreditCard className="w-4 h-4 text-market-sage" />
                    <span className="text-sm font-medium text-market-soil">Pay online</span>
                  </>
                ) : (
                  <>
                    <Coins className="w-4 h-4 text-market-gold" />
                    <span className="text-sm font-medium text-market-soil">Pay at market</span>
                  </>
                )}
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              form="checkout-form"
              disabled={isSubmitting}
              className={cn(
                'btn-primary flex items-center justify-center gap-2 w-full',
                isSubmitting && 'opacity-70 cursor-not-allowed'
              )}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : paymentMethod === 'STRIPE' ? (
                <>
                  Continue to Payment
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  Reserve My Order
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
