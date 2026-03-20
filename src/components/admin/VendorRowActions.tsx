'use client'

import Link from 'next/link'
import { Pencil, ExternalLink, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import DeleteConfirmDialog from './DeleteConfirmDialog'
import { deleteVendor } from '@/app/admin/(protected)/vendors/actions'

type Props = {
  vendorId: string
  vendorName: string
  vendorSlug: string
}

export default function VendorRowActions({ vendorId, vendorName, vendorSlug }: Props) {
  return (
    <div className="flex items-center justify-end gap-1">
      <Button
        variant="ghost"
        size="icon-xs"
        render={<Link href={`/admin/vendors/${vendorId}/edit`} />}
      >
        <Pencil className="h-3.5 w-3.5" />
        <span className="sr-only">Edit {vendorName}</span>
      </Button>
      <Button
        variant="ghost"
        size="icon-xs"
        render={<Link href={`/vendors/${vendorSlug}`} />}
      >
        <ExternalLink className="h-3.5 w-3.5" />
        <span className="sr-only">View {vendorName}</span>
      </Button>
      <DeleteConfirmDialog
        title={`Delete ${vendorName}?`}
        description="This will permanently delete this vendor, their products, and all related data. Vendors with existing orders cannot be deleted."
        onConfirm={() => deleteVendor(vendorId)}
        trigger={
          <Button variant="ghost" size="icon-xs" className="text-red-500 hover:text-red-700 hover:bg-red-50">
            <Trash2 className="h-3.5 w-3.5" />
            <span className="sr-only">Delete {vendorName}</span>
          </Button>
        }
      />
    </div>
  )
}
