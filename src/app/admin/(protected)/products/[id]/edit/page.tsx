import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { ProductEditForm } from './ProductEditForm'

export default async function EditProductPage({
  params,
}: {
  params: { id: string }
}) {
  const [product, vendors] = await Promise.all([
    prisma.product.findUnique({ where: { id: params.id } }),
    prisma.vendor.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    }),
  ])

  if (!product) {
    notFound()
  }

  return (
    <ProductEditForm
      product={{
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: product.price,
        unit: product.unit,
        category: product.category,
        vendorId: product.vendorId,
        isAvailable: product.isAvailable,
        isComingSoon: product.isComingSoon,
      }}
      vendors={vendors}
    />
  )
}
