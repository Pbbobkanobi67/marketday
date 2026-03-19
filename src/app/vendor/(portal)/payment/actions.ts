'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function updateVendorPayment(formData: {
  venmoQrUrl: string | null
  paypalQrUrl: string | null
  zelleQrUrl: string | null
}) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'vendor' || !session.user.vendorId) {
    throw new Error('Unauthorized')
  }

  await prisma.vendor.update({
    where: { id: session.user.vendorId },
    data: {
      venmoQrUrl: formData.venmoQrUrl,
      paypalQrUrl: formData.paypalQrUrl,
      zelleQrUrl: formData.zelleQrUrl,
    },
  })

  revalidatePath('/vendor/payment')
  return { success: true }
}
