'use client'

import { useState, useTransition } from 'react'
import { Calendar, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { setVendorAvailability, removeVendorAvailability } from './actions'

const selectClass = 'flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50'

interface SerializedMarket {
  id: string
  name: string
  date: string
  openTime: string
  closeTime: string
}

interface AssignedMarket {
  id: string
  boothSpace: string | null
  market: SerializedMarket
}

interface AvailabilityEntry {
  id: string
  status: string
  notes: string | null
  market: SerializedMarket
}

interface UpcomingMarket {
  id: string
  name: string
  date: string
  openTime: string
  closeTime: string
}

interface VendorScheduleClientProps {
  assignedMarkets: AssignedMarket[]
  availability: AvailabilityEntry[]
  upcomingMarkets: UpcomingMarket[]
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export function VendorScheduleClient({
  assignedMarkets,
  availability,
  upcomingMarkets,
}: VendorScheduleClientProps) {
  const [isPending, startTransition] = useTransition()
  const [selectedMarketId, setSelectedMarketId] = useState('')
  const [status, setStatus] = useState<'SUBSTITUTE' | 'UNAVAILABLE'>('SUBSTITUTE')
  const [notes, setNotes] = useState('')

  // Filter out markets that the vendor is already assigned to or has availability for
  const assignedIds = new Set(assignedMarkets.map((m) => m.market.id))
  const availabilityIds = new Set(availability.map((a) => a.market.id))
  const availableForSelection = upcomingMarkets.filter(
    (m) => !assignedIds.has(m.id) && !availabilityIds.has(m.id)
  )

  function handleAdd() {
    if (!selectedMarketId) return
    startTransition(async () => {
      await setVendorAvailability({
        marketId: selectedMarketId,
        status,
        notes: notes.trim() || null,
      })
      setSelectedMarketId('')
      setNotes('')
    })
  }

  function handleRemove(id: string) {
    startTransition(async () => {
      await removeVendorAvailability(id)
    })
  }

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Scheduled Markets */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Scheduled Markets
        </h2>
        {assignedMarkets.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            You are not currently assigned to any upcoming markets.
          </p>
        ) : (
          <div className="space-y-2">
            {assignedMarkets.map((mv) => (
              <div
                key={mv.id}
                className="card-market p-4 flex items-center gap-3"
              >
                <Calendar className="size-4 text-market-sage shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-market-soil">
                    {formatDate(mv.market.date)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {mv.market.openTime}&ndash;{mv.market.closeTime}
                    {mv.boothSpace && ` · Booth: ${mv.boothSpace}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Separator />

      {/* Your Availability */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Your Availability
        </h2>
        {availability.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No availability entries yet. Use the form below to indicate your availability for unassigned markets.
          </p>
        ) : (
          <div className="space-y-2">
            {availability.map((entry) => (
              <div
                key={entry.id}
                className="card-market p-4 flex items-center gap-3"
              >
                <span
                  className={`inline-block h-2.5 w-2.5 rounded-full shrink-0 ${
                    entry.status === 'SUBSTITUTE' ? 'bg-green-500' : 'bg-red-500'
                  }`}
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-market-soil">
                    {formatDate(entry.market.date)}
                    <span className={`ml-2 text-xs font-normal ${
                      entry.status === 'SUBSTITUTE' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {entry.status === 'SUBSTITUTE' ? 'Available as Substitute' : 'Unavailable'}
                    </span>
                  </p>
                  {entry.notes && (
                    <p className="text-xs text-muted-foreground mt-0.5">{entry.notes}</p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => handleRemove(entry.id)}
                  disabled={isPending}
                >
                  <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Separator />

      {/* Add Availability */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Add Availability
        </h2>

        {availableForSelection.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No additional upcoming markets available. You are assigned to or have set availability for all upcoming markets.
          </p>
        ) : (
          <div className="space-y-4 max-w-md">
            <div className="space-y-2">
              <Label htmlFor="market">Market Date</Label>
              <select
                id="market"
                className={selectClass}
                value={selectedMarketId}
                onChange={(e) => setSelectedMarketId(e.target.value)}
              >
                <option value="">Select a market...</option>
                {availableForSelection.map((m) => (
                  <option key={m.id} value={m.id}>
                    {formatDate(m.date)} · {m.openTime}–{m.closeTime}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    checked={status === 'SUBSTITUTE'}
                    onChange={() => setStatus('SUBSTITUTE')}
                    className="accent-market-sage"
                  />
                  Available as Substitute
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    checked={status === 'UNAVAILABLE'}
                    onChange={() => setStatus('UNAVAILABLE')}
                    className="accent-market-terra"
                  />
                  Unavailable
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                rows={2}
                placeholder="Any details about your availability..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <Button onClick={handleAdd} disabled={isPending || !selectedMarketId}>
              {isPending ? 'Saving...' : 'Save Availability'}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
