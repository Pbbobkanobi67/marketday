import { cn } from '@/lib/utils'

type OrderStatusBadgeProps = {
  status: string
  type?: 'pickup' | 'payment'
}

const PICKUP_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  READY: 'bg-blue-100 text-blue-800',
  PICKED_UP: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
}

const PAYMENT_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PAID: 'bg-green-100 text-green-800',
  FAILED: 'bg-red-100 text-red-800',
  REFUNDED: 'bg-purple-100 text-purple-800',
}

const PICKUP_LABELS: Record<string, string> = {
  PENDING: 'Pending',
  READY: 'Ready',
  PICKED_UP: 'Picked Up',
  CANCELLED: 'Cancelled',
}

const PAYMENT_LABELS: Record<string, string> = {
  PENDING: 'Pending',
  PAID: 'Paid',
  FAILED: 'Failed',
  REFUNDED: 'Refunded',
}

function getColorClass(status: string, type: 'pickup' | 'payment'): string {
  const map = type === 'pickup' ? PICKUP_COLORS : PAYMENT_COLORS
  return map[status] || 'bg-gray-100 text-gray-800'
}

function getLabel(status: string, type: 'pickup' | 'payment'): string {
  const map = type === 'pickup' ? PICKUP_LABELS : PAYMENT_LABELS
  return map[status] || status
}

export default function OrderStatusBadge({
  status,
  type = 'pickup',
}: OrderStatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wide',
        getColorClass(status, type)
      )}
    >
      {getLabel(status, type)}
    </span>
  )
}
