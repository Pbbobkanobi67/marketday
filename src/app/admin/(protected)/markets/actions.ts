'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createMarket(formData: {
  name: string
  date: string
  openTime: string
  closeTime: string
  location: string
  address: string
  description?: string
  type: string
  status: string
}) {
  await prisma.market.create({
    data: {
      ...formData,
      date: new Date(formData.date),
      description: formData.description || null,
    },
  })
  revalidatePath('/admin/markets')
  redirect('/admin/markets')
}

export async function updateMarket(
  id: string,
  formData: {
    name: string
    date: string
    openTime: string
    closeTime: string
    location: string
    address: string
    description?: string
    type: string
    status: string
  }
) {
  await prisma.market.update({
    where: { id },
    data: {
      ...formData,
      date: new Date(formData.date),
      description: formData.description || null,
    },
  })
  revalidatePath('/admin/markets')
  redirect('/admin/markets')
}
