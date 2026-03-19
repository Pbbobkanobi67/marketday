'use client'

import { useTransition } from 'react'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { deleteVendorProduct } from './actions'

interface VendorProductDeleteButtonProps {
  productId: string
  productName: string
}

export function VendorProductDeleteButton({
  productId,
  productName,
}: VendorProductDeleteButtonProps) {
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    if (!confirm(`Delete "${productName}"? This cannot be undone.`)) return
    startTransition(async () => {
      await deleteVendorProduct(productId)
    })
  }

  return (
    <Button
      variant="ghost"
      size="icon-xs"
      onClick={handleDelete}
      disabled={isPending}
    >
      <Trash2 className="h-3.5 w-3.5 text-red-500" />
      <span className="sr-only">Delete {productName}</span>
    </Button>
  )
}
