'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, Package, XCircle, Loader2 } from 'lucide-react'

type OrderStatusUpdaterProps = {
  orderId: string
  currentPickupStatus: string
}

export default function OrderStatusUpdater({
  orderId,
  currentPickupStatus,
}: OrderStatusUpdaterProps) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState('')

  async function updateStatus(pickupStatus: string) {
    setLoading(pickupStatus)
    setError('')

    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pickupStatus }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to update status')
      }

      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status')
    } finally {
      setLoading(null)
    }
  }

  const isDisabled = loading !== null

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-market-soil uppercase tracking-wide">
        Update Status
      </h3>

      <div className="flex flex-wrap gap-3">
        {currentPickupStatus !== 'READY' &&
          currentPickupStatus !== 'PICKED_UP' && (
            <button
              onClick={() => updateStatus('READY')}
              disabled={isDisabled}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium
                       bg-blue-50 text-blue-700 border border-blue-200
                       hover:bg-blue-100 transition-colors disabled:opacity-50"
            >
              {loading === 'READY' ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Package className="size-4" />
              )}
              Mark Ready
            </button>
          )}

        {currentPickupStatus !== 'PICKED_UP' && (
          <button
            onClick={() => updateStatus('PICKED_UP')}
            disabled={isDisabled}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium
                     bg-green-50 text-green-700 border border-green-200
                     hover:bg-green-100 transition-colors disabled:opacity-50"
          >
            {loading === 'PICKED_UP' ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <CheckCircle className="size-4" />
            )}
            Mark Picked Up
          </button>
        )}

        {currentPickupStatus !== 'CANCELLED' && (
          <button
            onClick={() => updateStatus('CANCELLED')}
            disabled={isDisabled}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium
                     bg-red-50 text-red-700 border border-red-200
                     hover:bg-red-100 transition-colors disabled:opacity-50"
          >
            {loading === 'CANCELLED' ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <XCircle className="size-4" />
            )}
            Cancel Order
          </button>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
    </div>
  )
}
