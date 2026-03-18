import { NextResponse } from 'next/server'

// STUBBED: Stripe webhook placeholder
// In production, this would verify the Stripe signature and update order status
export async function POST() {
  console.log('[Stripe Stub] Webhook received — returning 200')
  return NextResponse.json({ received: true })
}
