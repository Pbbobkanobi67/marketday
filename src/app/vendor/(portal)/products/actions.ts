'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

async function getVendorId() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'vendor' || !session.user.vendorId) {
    throw new Error('Unauthorized')
  }
  return session.user.vendorId
}

export async function createVendorProduct(formData: {
  name: string
  slug: string
  description: string
  price: number
  unit: string
  category: string
  isAvailable: boolean
}) {
  const vendorId = await getVendorId()

  await prisma.product.create({
    data: {
      ...formData,
      vendorId,
    },
  })
  revalidatePath('/vendor/products')
  redirect('/vendor/products')
}

export async function updateVendorProduct(
  id: string,
  formData: {
    name: string
    slug: string
    description: string
    price: number
    unit: string
    category: string
    isAvailable: boolean
  }
) {
  const vendorId = await getVendorId()

  // Verify ownership
  const product = await prisma.product.findUnique({
    where: { id },
    select: { vendorId: true },
  })
  if (!product || product.vendorId !== vendorId) {
    throw new Error('Unauthorized')
  }

  await prisma.product.update({
    where: { id },
    data: formData,
  })
  revalidatePath('/vendor/products')
  redirect('/vendor/products')
}

export async function deleteVendorProduct(id: string) {
  const vendorId = await getVendorId()

  // Verify ownership
  const product = await prisma.product.findUnique({
    where: { id },
    select: { vendorId: true },
  })
  if (!product || product.vendorId !== vendorId) {
    throw new Error('Unauthorized')
  }

  await prisma.product.delete({ where: { id } })
  revalidatePath('/vendor/products')
}
