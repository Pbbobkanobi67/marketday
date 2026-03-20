'use client'

import Link from 'next/link'
import { Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import DeleteConfirmDialog from './DeleteConfirmDialog'
import { deleteProduct } from '@/app/admin/(protected)/products/actions'

type Props = {
  productId: string
  productName: string
}

export default function ProductRowActions({ productId, productName }: Props) {
  return (
    <div className="flex items-center justify-end gap-1">
      <Button
        variant="ghost"
        size="icon-xs"
        render={<Link href={`/admin/products/${productId}/edit`} />}
      >
        <Pencil className="h-3.5 w-3.5" />
        <span className="sr-only">Edit {productName}</span>
      </Button>
      <DeleteConfirmDialog
        title={`Delete ${productName}?`}
        description="Products with existing orders will be marked unavailable instead of deleted."
        onConfirm={() => deleteProduct(productId)}
        trigger={
          <Button variant="ghost" size="icon-xs" className="text-red-500 hover:text-red-700 hover:bg-red-50">
            <Trash2 className="h-3.5 w-3.5" />
            <span className="sr-only">Delete {productName}</span>
          </Button>
        }
      />
    </div>
  )
}
