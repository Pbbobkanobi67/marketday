import { prisma } from '@/lib/prisma'
import { ProductCreateForm } from './ProductCreateForm'

export default async function NewProductPage() {
  const vendors = await prisma.vendor.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
    select: { id: true, name: true },
  })

  return <ProductCreateForm vendors={vendors} />
}
