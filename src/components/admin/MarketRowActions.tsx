'use client'

import Link from 'next/link'
import { Pencil, Users, Copy, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import DeleteConfirmDialog from './DeleteConfirmDialog'
import { deleteMarket, duplicateMarket } from '@/app/admin/(protected)/markets/actions'

type Props = {
  marketId: string
  marketName: string
}

export default function MarketRowActions({ marketId, marketName }: Props) {
  return (
    <div className="flex items-center justify-end gap-1">
      <Button
        variant="ghost"
        size="icon-xs"
        render={<Link href={`/admin/markets/${marketId}/vendors`} />}
      >
        <Users className="h-3.5 w-3.5" />
        <span className="sr-only">Manage vendors for {marketName}</span>
      </Button>
      <Button
        variant="ghost"
        size="icon-xs"
        render={<Link href={`/admin/markets/${marketId}/edit`} />}
      >
        <Pencil className="h-3.5 w-3.5" />
        <span className="sr-only">Edit {marketName}</span>
      </Button>
      <Button
        variant="ghost"
        size="icon-xs"
        onClick={() => duplicateMarket(marketId)}
      >
        <Copy className="h-3.5 w-3.5" />
        <span className="sr-only">Duplicate {marketName}</span>
      </Button>
      <DeleteConfirmDialog
        title={`Delete ${marketName}?`}
        description="Markets with existing orders cannot be deleted. Cancel the market instead."
        onConfirm={() => deleteMarket(marketId)}
        trigger={
          <Button variant="ghost" size="icon-xs" className="text-red-500 hover:text-red-700 hover:bg-red-50">
            <Trash2 className="h-3.5 w-3.5" />
            <span className="sr-only">Delete {marketName}</span>
          </Button>
        }
      />
    </div>
  )
}
