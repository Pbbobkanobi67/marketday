import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { resend, buildOrderConfirmationEmail } from '@/lib/resend'
import { z } from 'zod'
import { formatMarketDateTime } from '@/lib/utils'
import { MARKET_CONFIG } from '@/config/market.config'

const reserveSchema = z.object({
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
    const data = reserveSchema.parse(body)

    const market = await prisma.market.findUnique({ where: { id: data.marketId } })
    if (!market || market.status === 'CANCELLED' || market.status === 'PAST') {
      return NextResponse.json({ error: 'Market not available' }, { status: 400 })
    }

    const products = await prisma.product.findMany({
      where: { id: { in: data.items.map((i) => i.productId) }, isAvailable: true },
      include: { vendor: true },
    })

    if (products.length !== data.items.length) {
      return NextResponse.json({ error: 'One or more products are unavailable' }, { status: 400 })
    }

    const subtotal = data.items.reduce((sum, item) => {
      const product = products.find((p) => p.id === item.productId)!
      return sum + product.price * item.quantity
    }, 0)

    // Generate order number
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
        paymentMethod: 'AT_MARKET',
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
      include: { items: true, market: true },
    })

    // Send confirmation email (non-blocking, fail silently in dev)
    if (resend) {
      try {
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || 'orders@marketday.com',
          to: data.customerEmail,
          subject: `Your MarketDay order is confirmed — ${orderNumber}`,
          html: buildOrderConfirmationEmail({
            customerName: data.customerName,
            orderNumber,
            marketDate: formatMarketDateTime(market.date, market.openTime, market.closeTime),
            marketLocation: market.location,
            items: order.items.map((i) => ({ name: i.productName, quantity: i.quantity, price: i.priceAtTime, unit: products.find(p => p.id === i.productId)?.unit || 'each' })),
            subtotal,
            paymentMethod: 'AT_MARKET',
          }),
        })
      } catch (emailErr) {
        console.error('Email send failed:', emailErr)
      }
    }

    return NextResponse.json({ orderId: order.id, orderNumber })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0].message }, { status: 422 })
    }
    console.error('Reserve order error:', err)
    return NextResponse.json({ error: 'Failed to place order' }, { status: 500 })
  }
}
