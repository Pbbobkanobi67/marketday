import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { VendorProductEditForm } from './VendorProductEditForm'

type Props = {
  params: { id: string }
}

export default async function VendorEditProductPage({ params }: Props) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.vendorId) redirect('/vendor/login')

  const product = await prisma.product.findUnique({
    where: { id: params.id },
  })

  if (!product || product.vendorId !== session.user.vendorId) notFound()

  return (
    <VendorProductEditForm
      product={{
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: product.price,
        quantity: product.quantity,
        unit: product.unit,
        category: product.category,
        isAvailable: product.isAvailable,
        isComingSoon: product.isComingSoon,
        imageUrl: product.imageUrl,
      }}
    />
  )
}
