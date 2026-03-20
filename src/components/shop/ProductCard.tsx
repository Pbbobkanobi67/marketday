'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Minus, ShoppingBag, Check } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { formatPrice, categoryLabel, categoryColor, cn } from '@/lib/utils'

type ProductCardProduct = {
  id: string
  name: string
  slug: string
  description: string
  price: number
  imageUrl: string | null
  unit: string
  category: string
  isAvailable: boolean
  vendor: {
    name: string
    slug: string
  }
}

type ProductCardProps = {
  product: ProductCardProduct
  showVendor?: boolean
}

type CardState = 'idle' | 'adding' | 'added'

export default function ProductCard({ product, showVendor = false }: ProductCardProps) {
  const { addItem, cart, updateQuantity, removeItem } = useCart()
  const [state, setState] = useState<CardState>('idle')

  const existingItem = cart.items.find((i) => i.productId === product.id)
  const quantity = existingItem?.quantity ?? 0

  useEffect(() => {
    if (state === 'added') {
      const timer = setTimeout(() => setState('idle'), 1500)
      return () => clearTimeout(timer)
    }
  }, [state])

  function handleAddToBag() {
    if (!product.isAvailable) return
    setState('adding')
  }

  function handleConfirmAdd() {
    addItem({
      productId: product.id,
      productName: product.name,
      vendorId: '',
      vendorName: product.vendor.name,
      price: product.price,
      quantity: 1,
      unit: product.unit,
      imageUrl: product.imageUrl,
    })
    setState('added')
  }

  function handleIncrement() {
    updateQuantity(product.id, quantity + 1)
  }

  function handleDecrement() {
    if (quantity <= 1) {
      removeItem(product.id)
      setState('idle')
    } else {
      updateQuantity(product.id, quantity - 1)
    }
  }

  const soldOut = !product.isAvailable

  return (
    <div
      className={cn(
        'card-market overflow-hidden flex flex-col transition-all duration-200 hover:shadow-md',
        soldOut && 'opacity-60 pointer-events-none'
      )}
    >
      {/* Image placeholder */}
      <Link href={`/shop/${product.slug}`} className="relative block">
        <div className="relative aspect-[4/3] bg-market-warm flex items-center justify-center overflow-hidden">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="font-display text-4xl font-bold text-market-stone select-none">
              {product.name.charAt(0)}
            </span>
          )}

          {/* Category badge */}
          <span
            className={cn(
              'absolute top-3 left-3 text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full',
              categoryColor(product.category)
            )}
          >
            {categoryLabel(product.category)}
          </span>

          {/* Sold out badge */}
          {soldOut && (
            <span className="absolute top-3 right-3 text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-red-100 text-red-800">
              Sold Out
            </span>
          )}
        </div>
      </Link>

      {/* Body */}
      <div className="flex flex-col flex-1 p-4 gap-1.5">
        {/* Vendor name */}
        {showVendor && (
          <Link
            href={`/vendors/${product.vendor.slug}`}
            className="text-xs text-muted-foreground hover:text-market-sage transition-colors"
          >
            {product.vendor.name}
          </Link>
        )}

        {/* Product name */}
        <Link href={`/shop/${product.slug}`}>
          <h3 className="font-display text-base font-semibold text-market-soil leading-tight hover:text-market-sage transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2 flex-1">
          {product.description}
        </p>

        {/* Price and action */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-market-stone/30">
          <div className="price text-base">
            {formatPrice(product.price)}
            <span className="text-xs text-muted-foreground font-normal ml-0.5">
              / {product.unit}
            </span>
          </div>

          {/* State: idle */}
          {state === 'idle' && quantity === 0 && (
            <button
              onClick={handleAddToBag}
              disabled={soldOut}
              className="btn-primary flex items-center gap-1.5 !px-3 !py-2 text-xs"
              aria-label={`Add ${product.name} to bag`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              Add to Bag
            </button>
          )}

          {/* State: idle but has items in cart */}
          {state === 'idle' && quantity > 0 && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleDecrement}
                className="flex items-center justify-center w-8 h-8 rounded-md bg-market-warm hover:bg-market-stone text-market-soil transition-colors"
                aria-label={`Decrease quantity of ${product.name}`}
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="text-sm font-medium text-market-soil w-5 text-center tabular-nums">
                {quantity}
              </span>
              <button
                onClick={handleIncrement}
                className="flex items-center justify-center w-8 h-8 rounded-md bg-market-sage hover:bg-market-sage-dk text-white transition-colors"
                aria-label={`Increase quantity of ${product.name}`}
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* State: adding (showing quantity controls for first add) */}
          {state === 'adding' && (
            <button
              onClick={handleConfirmAdd}
              className="btn-primary flex items-center gap-1.5 !px-3 !py-2 text-xs"
              aria-label={`Confirm add ${product.name} to bag`}
            >
              <Plus className="w-3.5 h-3.5" />
              Confirm
            </button>
          )}

          {/* State: added */}
          {state === 'added' && (
            <span className="flex items-center gap-1.5 text-xs font-medium text-market-sage px-3 py-2">
              <Check className="w-3.5 h-3.5" />
              Added
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
