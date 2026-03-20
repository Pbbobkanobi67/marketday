'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import bcrypt from 'bcryptjs'
import { logVendorChange } from '@/lib/changelog'

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
  vendorNotes?: string
}) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'vendor' || !session.user.vendorId) {
    throw new Error('Unauthorized')
  }

  const vendor = await prisma.vendor.findUnique({
    where: { id: session.user.vendorId },
    select: { name: true, description: true, contactPerson: true, email: true, phone: true, website: true, instagramHandle: true, facebookHandle: true, businessDescription: true, vendorNotes: true },
  })

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
      vendorNotes: formData.vendorNotes || null,
      needsReview: true,
    },
  })

  const changed: string[] = []
  if (vendor) {
    if (vendor.name !== formData.name) changed.push('name')
    if (vendor.description !== formData.description) changed.push('description')
    if ((vendor.contactPerson || '') !== (formData.contactPerson || '')) changed.push('contactPerson')
    if ((vendor.email || '') !== (formData.email || '')) changed.push('email')
    if ((vendor.phone || '') !== (formData.phone || '')) changed.push('phone')
    if ((vendor.website || '') !== (formData.website || '')) changed.push('website')
    if ((vendor.instagramHandle || '') !== (formData.instagramHandle || '')) changed.push('instagram')
    if ((vendor.facebookHandle || '') !== (formData.facebookHandle || '')) changed.push('facebook')
    if ((vendor.businessDescription || '') !== (formData.businessDescription || '')) changed.push('businessDescription')
    if ((vendor.vendorNotes || '') !== (formData.vendorNotes || '')) changed.push('notes')
  }
  const summary = changed.length > 0 ? `Updated ${changed.join(', ')}` : 'Profile saved (no changes)'
  await logVendorChange(session.user.vendorId, 'PROFILE_UPDATE', 'vendor', summary)

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

  await logVendorChange(session.user.vendorId, 'PASSWORD_CHANGE', 'vendor', 'Changed portal password')

  return { success: true }
}
