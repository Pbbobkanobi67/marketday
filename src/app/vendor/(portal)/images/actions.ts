'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { logVendorChange } from '@/lib/changelog'

export async function updateVendorImages(formData: {
  logoUrl: string | null
  boothImageUrl: string | null
  productImage1Url: string | null
  productImage2Url: string | null
  productImage3Url: string | null
}) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'vendor' || !session.user.vendorId) {
    throw new Error('Unauthorized')
  }

  await prisma.vendor.update({
    where: { id: session.user.vendorId },
    data: {
      logoUrl: formData.logoUrl,
      boothImageUrl: formData.boothImageUrl,
      productImage1Url: formData.productImage1Url,
      productImage2Url: formData.productImage2Url,
      productImage3Url: formData.productImage3Url,
      needsReview: true,
    },
  })

  await logVendorChange(session.user.vendorId, 'IMAGE_UPDATE', 'vendor', 'Updated images')

  revalidatePath('/vendor/images')
  revalidatePath('/vendors')
  return { success: true }
}
