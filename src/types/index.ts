import 'next-auth'
import 'next-auth/jwt'

declare module 'next-auth' {
  interface User {
    id: string
    role: string
    vendorId?: string
  }
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      role: string
      vendorId?: string
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: string
    vendorId?: string
  }
}

// Cart
export type CartItem = {
  productId: string
  productName: string
  vendorId: string
  vendorName: string
  price: number       // cents
  quantity: number
  unit: string
  imageUrl?: string | null
}

export type CartState = {
  marketId: string | null
  items: CartItem[]
}

// Checkout form
export type CheckoutFormData = {
  customerName: string
  customerEmail: string
  customerPhone?: string
  customerNotes?: string
  paymentMethod: 'STRIPE' | 'AT_MARKET'
  marketId: string
}
