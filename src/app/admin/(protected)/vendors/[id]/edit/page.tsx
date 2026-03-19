import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { History } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { VendorEditForm } from './VendorEditForm'

export default async function EditVendorPage({
  params,
}: {
  params: { id: string }
}) {
  const vendor = await prisma.vendor.findUnique({
    where: { id: params.id },
  })

  if (!vendor) {
    notFound()
  }

  return (
    <>
      <div className="mx-auto max-w-2xl flex justify-end mb-2">
        <Button variant="outline" size="sm" render={<Link href={`/admin/vendors/${vendor.id}/changelog`} />}>
          <History className="mr-1.5 h-3.5 w-3.5" />
          View Changelog
        </Button>
      </div>
      <VendorEditForm
        vendor={{
          id: vendor.id,
          name: vendor.name,
          slug: vendor.slug,
          description: vendor.description,
          category: vendor.category,
          isActive: vendor.isActive,
          contactPerson: vendor.contactPerson,
          email: vendor.email,
          phone: vendor.phone,
          website: vendor.website,
          instagramHandle: vendor.instagramHandle,
          facebookHandle: vendor.facebookHandle,
          vendorType: vendor.vendorType,
          businessDescription: vendor.businessDescription,
          onlineOrdersEnabled: vendor.onlineOrdersEnabled,
          hashedPassword: vendor.hashedPassword,
        }}
      />
    </>
  )
}
