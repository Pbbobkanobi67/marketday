'use client'

import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { useTransition } from 'react'
import Link from 'next/link'
import { MARKET_CONFIG } from '@/config/market.config'
import { createMarket } from '../actions'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'

const STATUSES = ['DRAFT', 'UPCOMING', 'ACTIVE', 'PAST', 'CANCELLED'] as const

const marketSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  date: z.string().min(1, 'Date is required'),
  openTime: z.string().min(1, 'Open time is required'),
  closeTime: z.string().min(1, 'Close time is required'),
  location: z.string().min(1, 'Location is required'),
  address: z.string().min(1, 'Address is required'),
  description: z.string().optional(),
  status: z.string().min(1, 'Status is required'),
})

type MarketFormValues = z.infer<typeof marketSchema>

export default function NewMarketPage() {
  const [isPending, startTransition] = useTransition()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MarketFormValues>({
    resolver: standardSchemaResolver(marketSchema),
    defaultValues: {
      name: '',
      date: '',
      openTime: MARKET_CONFIG.defaultOpenTime,
      closeTime: MARKET_CONFIG.defaultCloseTime,
      location: MARKET_CONFIG.venueName,
      address: MARKET_CONFIG.venueFullAddress,
      description: '',
      status: 'DRAFT',
    },
  })

  function onSubmit(data: MarketFormValues) {
    startTransition(async () => {
      await createMarket(data)
    })
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Add Market</h1>
        <p className="text-sm text-muted-foreground">
          Schedule a new market day.
        </p>
      </div>

      <Separator />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            placeholder="e.g. Saturday Market - March 22"
            {...register('name')}
            aria-invalid={!!errors.name}
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              {...register('date')}
              aria-invalid={!!errors.date}
            />
            {errors.date && (
              <p className="text-sm text-destructive">{errors.date.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              {...register('status')}
              aria-invalid={!!errors.status}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            {errors.status && (
              <p className="text-sm text-destructive">
                {errors.status.message}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="openTime">Open Time</Label>
            <Input
              id="openTime"
              placeholder="8:00 AM"
              {...register('openTime')}
              aria-invalid={!!errors.openTime}
            />
            {errors.openTime && (
              <p className="text-sm text-destructive">
                {errors.openTime.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="closeTime">Close Time</Label>
            <Input
              id="closeTime"
              placeholder="1:00 PM"
              {...register('closeTime')}
              aria-invalid={!!errors.closeTime}
            />
            {errors.closeTime && (
              <p className="text-sm text-destructive">
                {errors.closeTime.message}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            placeholder="Market venue name"
            {...register('location')}
            aria-invalid={!!errors.location}
          />
          {errors.location && (
            <p className="text-sm text-destructive">
              {errors.location.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            placeholder="Full street address"
            {...register('address')}
            aria-invalid={!!errors.address}
          />
          {errors.address && (
            <p className="text-sm text-destructive">
              {errors.address.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description (optional)</Label>
          <Textarea
            id="description"
            placeholder="Any special notes about this market day..."
            rows={3}
            {...register('description')}
          />
        </div>

        <Separator />

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Creating...' : 'Create Market'}
          </Button>
          <Button variant="outline" render={<Link href="/admin/markets" />}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
