import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
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
    <VendorEditForm
      vendor={{
        id: vendor.id,
        name: vendor.name,
        slug: vendor.slug,
        description: vendor.description,
        category: vendor.category,
        isActive: vendor.isActive,
      }}
    />
  )
}
