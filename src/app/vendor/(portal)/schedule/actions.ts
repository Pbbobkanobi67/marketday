'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { logVendorChange } from '@/lib/changelog'

async function getVendorId() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'vendor' || !session.user.vendorId) {
    throw new Error('Unauthorized')
  }
  return session.user.vendorId
}

export async function setVendorAvailability(data: {
  marketId: string
  status: string
  notes: string | null
}) {
  const vendorId = await getVendorId()

  const market = await prisma.market.findUnique({
    where: { id: data.marketId },
    select: { name: true, date: true },
  })

  await prisma.vendorAvailability.upsert({
    where: { vendorId_marketId: { vendorId, marketId: data.marketId } },
    create: {
      vendorId,
      marketId: data.marketId,
      status: data.status,
      notes: data.notes,
    },
    update: {
      status: data.status,
      notes: data.notes,
    },
  })

  const statusLabel = data.status === 'SUBSTITUTE' ? 'available as substitute' : 'unavailable'
  await logVendorChange(
    vendorId,
    'AVAILABILITY_UPDATE',
    'vendor',
    `Marked ${statusLabel} for ${market?.name || 'market'}`
  )

  revalidatePath('/vendor/schedule')
  return { success: true }
}

export async function removeVendorAvailability(id: string) {
  const vendorId = await getVendorId()

  const record = await prisma.vendorAvailability.findUnique({
    where: { id },
    include: { market: { select: { name: true } } },
  })

  if (!record || record.vendorId !== vendorId) {
    throw new Error('Unauthorized')
  }

  await prisma.vendorAvailability.delete({ where: { id } })

  await logVendorChange(
    vendorId,
    'AVAILABILITY_REMOVE',
    'vendor',
    `Removed availability entry for ${record.market.name}`
  )

  revalidatePath('/vendor/schedule')
  return { success: true }
}
