'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { logVendorChange } from '@/lib/changelog'

export async function requestOnlineOrdering() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'vendor' || !session.user.vendorId) {
    throw new Error('Unauthorized')
  }

  await prisma.vendor.update({
    where: { id: session.user.vendorId },
    data: {
      onlineOrdersRequested: true,
      needsReview: true,
    },
  })

  await logVendorChange(
    session.user.vendorId,
    'ONLINE_ORDERS_REQUEST',
    'vendor',
    'Requested to enable online ordering'
  )

  revalidatePath('/vendor/dashboard')
  return { success: true }
}
