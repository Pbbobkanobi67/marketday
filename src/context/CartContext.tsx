'use client'

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'
import type { CartItem, CartState } from '@/types'

const STORAGE_KEY = 'marketday-cart'

const defaultCart: CartState = { marketId: null, items: [] }

type CartContextType = {
  cart: CartState
  addItem: (item: CartItem) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  setMarket: (marketId: string) => void
  clearCart: () => void
  itemCount: number
  subtotal: number
  isDrawerOpen: boolean
  openDrawer: () => void
  closeDrawer: () => void
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartState>(defaultCart)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setCart(JSON.parse(stored))
    } catch {}
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (hydrated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart))
    }
  }, [cart, hydrated])

  const addItem = useCallback((item: CartItem) => {
    setCart((prev) => {
      const existing = prev.items.find((i) => i.productId === item.productId)
      if (existing) {
        return {
          ...prev,
          items: prev.items.map((i) =>
            i.productId === item.productId
              ? { ...i, quantity: Math.min(i.quantity + item.quantity, 20) }
              : i
          ),
        }
      }
      return { ...prev, items: [...prev.items, item] }
    })
  }, [])

  const removeItem = useCallback((productId: string) => {
    setCart((prev) => ({ ...prev, items: prev.items.filter((i) => i.productId !== productId) }))
  }, [])

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart((prev) => ({ ...prev, items: prev.items.filter((i) => i.productId !== productId) }))
    } else {
      setCart((prev) => ({
        ...prev,
        items: prev.items.map((i) =>
          i.productId === productId ? { ...i, quantity: Math.min(quantity, 20) } : i
        ),
      }))
    }
  }, [])

  const setMarket = useCallback((marketId: string) => {
    setCart((prev) => ({ ...prev, marketId }))
  }, [])

  const clearCart = useCallback(() => {
    setCart(defaultCart)
  }, [])

  const itemCount = cart.items.reduce((sum, i) => sum + i.quantity, 0)
  const subtotal = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        cart, addItem, removeItem, updateQuantity, setMarket, clearCart,
        itemCount, subtotal, isDrawerOpen,
        openDrawer: () => setIsDrawerOpen(true),
        closeDrawer: () => setIsDrawerOpen(false),
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}
