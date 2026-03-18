'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createProduct(formData: {
  name: string
  slug: string
  description: string
  price: number
  unit: string
  category: string
  vendorId: string
  isAvailable: boolean
}) {
  await prisma.product.create({ data: formData })
  revalidatePath('/admin/products')
  redirect('/admin/products')
}

export async function updateProduct(
  id: string,
  formData: {
    name: string
    slug: string
    description: string
    price: number
    unit: string
    category: string
    vendorId: string
    isAvailable: boolean
  }
) {
  await prisma.product.update({ where: { id }, data: formData })
  revalidatePath('/admin/products')
  redirect('/admin/products')
}
