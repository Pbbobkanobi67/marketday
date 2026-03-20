'use client'

import { useState, useEffect } from 'react'
import { Plus, Minus, ShoppingBag, Check } from 'lucide-react'
import { useCart } from '@/context/CartContext'

type AddToCartButtonProps = {
  product: {
    id: string
    name: string
    price: number
    unit: string
    imageUrl: string | null
    vendorName: string
  }
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const { addItem, cart, updateQuantity, removeItem } = useCart()
  const [justAdded, setJustAdded] = useState(false)

  const existingItem = cart.items.find((i) => i.productId === product.id)
  const quantity = existingItem?.quantity ?? 0

  useEffect(() => {
    if (justAdded) {
      const timer = setTimeout(() => setJustAdded(false), 1500)
      return () => clearTimeout(timer)
    }
  }, [justAdded])

  function handleAdd() {
    addItem({
      productId: product.id,
      productName: product.name,
      vendorId: '',
      vendorName: product.vendorName,
      price: product.price,
      quantity: 1,
      unit: product.unit,
      imageUrl: product.imageUrl,
    })
    setJustAdded(true)
  }

  function handleIncrement() {
    updateQuantity(product.id, quantity + 1)
  }

  function handleDecrement() {
    if (quantity <= 1) {
      removeItem(product.id)
    } else {
      updateQuantity(product.id, quantity - 1)
    }
  }

  if (justAdded) {
    return (
      <div className="flex items-center gap-2 text-market-sage font-medium">
        <Check className="w-5 h-5" />
        Added to bag
      </div>
    )
  }

  if (quantity > 0) {
    return (
      <div className="flex items-center gap-3">
        <button
          onClick={handleDecrement}
          className="flex items-center justify-center w-10 h-10 rounded-lg bg-market-warm hover:bg-market-stone text-market-soil transition-colors"
          aria-label="Decrease quantity"
        >
          <Minus className="w-4 h-4" />
        </button>
        <span className="text-lg font-semibold text-market-soil w-8 text-center tabular-nums">
          {quantity}
        </span>
        <button
          onClick={handleIncrement}
          className="flex items-center justify-center w-10 h-10 rounded-lg bg-market-sage hover:bg-market-sage-dk text-white transition-colors"
          aria-label="Increase quantity"
        >
          <Plus className="w-4 h-4" />
        </button>
        <span className="text-sm text-muted-foreground ml-2">in bag</span>
      </div>
    )
  }

  return (
    <button
      onClick={handleAdd}
      className="btn-primary flex items-center gap-2 w-fit !px-6 !py-3"
    >
      <ShoppingBag className="w-4 h-4" />
      Add to Bag
    </button>
  )
}
