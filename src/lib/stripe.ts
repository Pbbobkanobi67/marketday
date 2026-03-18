// ── STUBBED STRIPE ──────────────────────────────────
// No real Stripe calls. This module provides mock functions
// that simulate Stripe behavior for development.

export const stripe = {
  checkout: {
    sessions: {
      async create(params: {
        payment_method_types: string[]
        mode: string
        customer_email: string
        line_items: Array<{
          price_data: {
            currency: string
            product_data: { name: string; description?: string }
            unit_amount: number
          }
          quantity: number
        }>
        metadata: Record<string, string>
        success_url: string
        cancel_url: string
      }) {
        console.log('[Stripe Stub] Creating checkout session:', {
          email: params.customer_email,
          items: params.line_items.length,
          metadata: params.metadata,
        })
        // Return a mock session that redirects to the success URL
        const successUrl = params.success_url.replace('{CHECKOUT_SESSION_ID}', 'stub_session_' + Date.now())
        return {
          id: 'stub_session_' + Date.now(),
          url: successUrl,
        }
      },
    },
  },
  webhooks: {
    constructEvent(body: string, sig: string, secret: string) {
      console.log('[Stripe Stub] Webhook event received (stub)')
      return {
        type: 'checkout.session.completed',
        data: { object: { metadata: {} } },
      }
    },
  },
}
