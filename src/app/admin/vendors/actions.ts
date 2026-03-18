'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createVendor(formData: {
  name: string
  slug: string
  description: string
  category: string
  isActive: boolean
}) {
  await prisma.vendor.create({ data: formData })
  revalidatePath('/admin/vendors')
  redirect('/admin/vendors')
}

export async function updateVendor(
  id: string,
  formData: {
    name: string
    slug: string
    description: string
    category: string
    isActive: boolean
  }
) {
  await prisma.vendor.update({ where: { id }, data: formData })
  revalidatePath('/admin/vendors')
  redirect('/admin/vendors')
}
