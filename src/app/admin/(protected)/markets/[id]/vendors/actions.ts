'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function assignVendorToMarket(marketId: string, vendorId: string) {
  await prisma.marketVendor.create({
    data: { marketId, vendorId },
  })
  revalidatePath(`/admin/markets/${marketId}/vendors`)
}

export async function unassignVendorFromMarket(marketId: string, vendorId: string) {
  await prisma.marketVendor.deleteMany({
    where: { marketId, vendorId },
  })
  revalidatePath(`/admin/markets/${marketId}/vendors`)
}

export async function updateMarketVendor(
  id: string,
  marketId: string,
  data: {
    boothSpace?: string
    boothFee?: number
    isPaid?: boolean
    notes?: string
  }
) {
  await prisma.marketVendor.update({
    where: { id },
    data: {
      boothSpace: data.boothSpace || null,
      boothFee: data.boothFee ?? null,
      isPaid: data.isPaid ?? false,
      notes: data.notes || null,
    },
  })
  revalidatePath(`/admin/markets/${marketId}/vendors`)
}
