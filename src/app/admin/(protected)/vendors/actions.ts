'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import bcrypt from 'bcryptjs'
import { logVendorChange } from '@/lib/changelog'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function createVendor(formData: {
  name: string
  slug: string
  description: string
  category: string
  isActive: boolean
  contactPerson?: string
  email?: string
  phone?: string
  website?: string
  instagramHandle?: string
  facebookHandle?: string
  vendorType: string
  businessDescription?: string
  onlineOrdersEnabled: boolean
  portalPassword?: string
}) {
  const { portalPassword, ...rest } = formData
  const hashedPassword = portalPassword
    ? await bcrypt.hash(portalPassword, 10)
    : null

  await prisma.vendor.create({
    data: {
      name: rest.name,
      slug: rest.slug,
      description: rest.description,
      category: rest.category,
      isActive: rest.isActive,
      contactPerson: rest.contactPerson || null,
      email: rest.email || null,
      phone: rest.phone || null,
      website: rest.website || null,
      instagramHandle: rest.instagramHandle || null,
      facebookHandle: rest.facebookHandle || null,
      vendorType: rest.vendorType,
      businessDescription: rest.businessDescription || null,
      onlineOrdersEnabled: rest.onlineOrdersEnabled,
      signupDate: new Date(),
      hashedPassword,
    },
  })
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
    contactPerson?: string
    email?: string
    phone?: string
    website?: string
    instagramHandle?: string
    facebookHandle?: string
    vendorType: string
    businessDescription?: string
    onlineOrdersEnabled: boolean
    portalPassword?: string
  }
) {
  const { portalPassword, ...rest } = formData

  const data: Record<string, unknown> = {
    name: rest.name,
    slug: rest.slug,
    description: rest.description,
    category: rest.category,
    isActive: rest.isActive,
    contactPerson: rest.contactPerson || null,
    email: rest.email || null,
    phone: rest.phone || null,
    website: rest.website || null,
    instagramHandle: rest.instagramHandle || null,
    facebookHandle: rest.facebookHandle || null,
    vendorType: rest.vendorType,
    businessDescription: rest.businessDescription || null,
    onlineOrdersEnabled: rest.onlineOrdersEnabled,
  }

  if (portalPassword) {
    data.hashedPassword = await bcrypt.hash(portalPassword, 10)
  }

  await prisma.vendor.update({ where: { id }, data })

  const session = await getServerSession(authOptions)
  const adminName = session?.user?.name || 'admin'
  await logVendorChange(id, 'ADMIN_EDIT', adminName, `Admin updated vendor "${rest.name}"`)

  revalidatePath('/admin/vendors')
  redirect('/admin/vendors')
}

export async function clearVendorReview(vendorId: string) {
  await prisma.vendor.update({
    where: { id: vendorId },
    data: { needsReview: false },
  })

  const session = await getServerSession(authOptions)
  const adminName = session?.user?.name || 'admin'
  await logVendorChange(vendorId, 'REVIEW_CLEARED', adminName, 'Cleared review flag')

  revalidatePath('/admin/vendors')
}
