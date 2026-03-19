'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import bcrypt from 'bcryptjs'

export async function updateVendorProfile(formData: {
  name: string
  description: string
  businessDescription?: string
  contactPerson?: string
  email?: string
  phone?: string
  website?: string
  instagramHandle?: string
  facebookHandle?: string
}) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'vendor' || !session.user.vendorId) {
    throw new Error('Unauthorized')
  }

  await prisma.vendor.update({
    where: { id: session.user.vendorId },
    data: {
      name: formData.name,
      description: formData.description,
      businessDescription: formData.businessDescription || null,
      contactPerson: formData.contactPerson || null,
      email: formData.email || null,
      phone: formData.phone || null,
      website: formData.website || null,
      instagramHandle: formData.instagramHandle || null,
      facebookHandle: formData.facebookHandle || null,
      needsReview: true,
    },
  })

  revalidatePath('/vendor/profile')
  revalidatePath(`/vendors`)
  return { success: true }
}

export async function changeVendorPassword(formData: {
  currentPassword: string
  newPassword: string
}) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'vendor' || !session.user.vendorId) {
    throw new Error('Unauthorized')
  }

  const vendor = await prisma.vendor.findUnique({
    where: { id: session.user.vendorId },
    select: { hashedPassword: true },
  })

  if (!vendor?.hashedPassword) {
    throw new Error('No password set')
  }

  const isValid = await bcrypt.compare(formData.currentPassword, vendor.hashedPassword)
  if (!isValid) {
    return { error: 'Current password is incorrect' }
  }

  const hashedPassword = await bcrypt.hash(formData.newPassword, 10)
  await prisma.vendor.update({
    where: { id: session.user.vendorId },
    data: { hashedPassword },
  })

  return { success: true }
}
