'use client'

import { useTransition } from 'react'
import { vendorTypeLabel, vendorTypeColor, cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Plus, X, Check } from 'lucide-react'
import {
  assignVendorToMarket,
  unassignVendorFromMarket,
  updateMarketVendor,
} from './actions'

type Assignment = {
  id: string
  vendorId: string
  vendorName: string
  vendorType: string
  boothSpace: string | null
  boothFee: number | null
  isPaid: boolean
  notes: string | null
  onlineOrdersEnabled: boolean
}

type UnassignedVendor = {
  id: string
  name: string
  vendorType: string
}

type Props = {
  market: {
    id: string
    name: string
    date: string
    type: string
    status: string
  }
  assignments: Assignment[]
  unassignedVendors: UnassignedVendor[]
}

export default function MarketVendorsClient({ market, assignments, unassignedVendors }: Props) {
  const [isPending, startTransition] = useTransition()

  function handleAssign(vendorId: string) {
    startTransition(async () => {
      await assignVendorToMarket(market.id, vendorId)
    })
  }

  function handleUnassign(vendorId: string) {
    startTransition(async () => {
      await unassignVendorFromMarket(market.id, vendorId)
    })
  }

  function handleTogglePaid(assignment: Assignment) {
    startTransition(async () => {
      await updateMarketVendor(assignment.id, market.id, {
        boothSpace: assignment.boothSpace || undefined,
        boothFee: assignment.boothFee ?? undefined,
        isPaid: !assignment.isPaid,
        notes: assignment.notes || undefined,
      })
    })
  }

  return (
    <div className="space-y-6">
      {/* Assigned Vendors */}
      <div className="card-market p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
          Assigned Vendors ({assignments.length})
        </h2>

        {assignments.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">
            No vendors assigned to this market yet.
          </p>
        ) : (
          <div className="space-y-3">
            {assignments.map((a) => (
              <div
                key={a.id}
                className="flex items-center gap-3 p-3 rounded-lg border border-market-stone/20 bg-white"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-market-soil">
                      {a.vendorName}
                    </span>
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium',
                        vendorTypeColor(a.vendorType)
                      )}
                    >
                      {vendorTypeLabel(a.vendorType)}
                    </span>
                    {a.onlineOrdersEnabled && (
                      <span className="inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium bg-blue-100 text-blue-800">
                        Online
                      </span>
                    )}
                  </div>
                </div>

                {/* Paid toggle */}
                <button
                  onClick={() => handleTogglePaid(a)}
                  disabled={isPending}
                  className={cn(
                    'flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors',
                    a.isPaid
                      ? 'bg-green-100 text-green-800 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  )}
                >
                  {a.isPaid ? <Check className="h-3 w-3" /> : null}
                  {a.isPaid ? 'Paid' : 'Unpaid'}
                </button>

                {/* Remove */}
                <button
                  onClick={() => handleUnassign(a.vendorId)}
                  disabled={isPending}
                  className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors"
                  aria-label={`Remove ${a.vendorName}`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Separator />

      {/* Unassigned Vendors */}
      <div className="card-market p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
          Available Vendors ({unassignedVendors.length})
        </h2>

        {unassignedVendors.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">
            All active vendors are assigned to this market.
          </p>
        ) : (
          <div className="space-y-2">
            {unassignedVendors.map((v) => (
              <div
                key={v.id}
                className="flex items-center gap-3 p-3 rounded-lg border border-dashed border-market-stone/30"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-market-soil">
                      {v.name}
                    </span>
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium',
                        vendorTypeColor(v.vendorType)
                      )}
                    >
                      {vendorTypeLabel(v.vendorType)}
                    </span>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleAssign(v.id)}
                  disabled={isPending}
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Assign
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
