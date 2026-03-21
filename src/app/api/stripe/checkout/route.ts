import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'
import { z } from 'zod'
import { MARKET_CONFIG } from '@/config/market.config'

const checkoutSchema = z.object({
  marketId: z.string().min(1),
  customerName: z.string().min(2).max(100),
  customerEmail: z.string().email(),
  customerPhone: z.string().optional(),
  customerNotes: z.string().max(500).optional(),
  items: z.array(z.object({ productId: z.string(), quantity: z.number().int().min(1).max(20) })).min(1),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = checkoutSchema.parse(body)

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const market = await prisma.market.findUnique({ where: { id: data.marketId } })
    if (!market) return NextResponse.json({ error: 'Market not found' }, { status: 404 })

    const products = await prisma.product.findMany({
      where: { id: { in: data.items.map((i) => i.productId) }, isAvailable: true },
      include: { vendor: true },
    })
    if (products.length !== data.items.length) {
      return NextResponse.json({ error: 'One or more products are unavailable' }, { status: 400 })
    }

    // Stock validation: quantity > 0 means tracked inventory
    const stockErrors: { productId: string; productName: string; available: number; requested: number }[] = []
    for (const item of data.items) {
      const product = products.find((p) => p.id === item.productId)!
      if (product.quantity > 0 && item.quantity > product.quantity) {
        stockErrors.push({
          productId: product.id,
          productName: product.name,
          available: product.quantity,
          requested: item.quantity,
        })
      }
    }
    if (stockErrors.length > 0) {
      return NextResponse.json(
        { error: 'Insufficient stock', details: stockErrors },
        { status: 409 }
      )
    }

    const subtotal = data.items.reduce((sum, item) => {
      const p = products.find((p) => p.id === item.productId)!
      return sum + p.price * item.quantity
    }, 0)

    const orderCount = await prisma.order.count()
    const orderNumber = `${MARKET_CONFIG.orderNumberPrefix}-${new Date().getFullYear()}-${String(orderCount + 1).padStart(4, '0')}`

    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        customerNotes: data.customerNotes,
        marketId: data.marketId,
        subtotal,
        paymentMethod: 'STRIPE',
        paymentStatus: 'PENDING',
        pickupStatus: 'PENDING',
        items: {
          create: data.items.map((item) => {
            const product = products.find((p) => p.id === item.productId)!
            return {
              productId: item.productId,
              vendorId: product.vendorId,
              quantity: item.quantity,
              priceAtTime: product.price,
              productName: product.name,
              vendorName: product.vendor.name,
            }
          }),
        },
      },
    })

    // Decrement stock for tracked products (quantity > 0)
    for (const item of data.items) {
      const product = products.find((p) => p.id === item.productId)!
      if (product.quantity > 0) {
        await prisma.product.update({
          where: { id: product.id },
          data: { quantity: { decrement: item.quantity } },
        })
      }
    }

    // STUBBED: Instead of real Stripe, create a mock session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: data.customerEmail,
      line_items: data.items.map((item) => {
        const product = products.find((p) => p.id === item.productId)!
        return {
          price_data: {
            currency: 'usd',
            product_data: {
              name: product.name,
              description: `From ${product.vendor.name} · ${product.unit}`,
            },
            unit_amount: product.price,
          },
          quantity: item.quantity,
        }
      }),
      metadata: { orderId: order.id, orderNumber },
      success_url: `${appUrl}/order/${order.id}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/cart`,
    })

    await prisma.order.update({
      where: { id: order.id },
      data: { stripeSessionId: session.id, paymentStatus: 'PAID' },
    })

    return NextResponse.json({ sessionUrl: session.url })
  } catch (err) {
    console.error('Stripe checkout error:', err)
    return NextResponse.json({ error: 'Checkout failed' }, { status: 500 })
  }
}
