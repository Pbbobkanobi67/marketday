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

export async function deleteMarket(id: string) {
  const orderCount = await prisma.order.count({ where: { marketId: id } })
  if (orderCount > 0) {
    throw new Error('Cannot delete a market that has orders. Cancel the market instead.')
  }
  await prisma.market.delete({ where: { id } })
  revalidatePath('/admin/markets')
  redirect('/admin/markets')
}

export async function duplicateMarket(id: string) {
  const source = await prisma.market.findUnique({ where: { id } })
  if (!source) throw new Error('Market not found')

  const newMarket = await prisma.market.create({
    data: {
      name: `${source.name} (Copy)`,
      date: source.date,
      openTime: source.openTime,
      closeTime: source.closeTime,
      location: source.location,
      address: source.address,
      description: source.description,
      type: source.type,
      status: 'DRAFT',
    },
  })
  revalidatePath('/admin/markets')
  redirect(`/admin/markets/${newMarket.id}/edit`)
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
