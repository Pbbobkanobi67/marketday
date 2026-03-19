'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

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
}) {
  await prisma.vendor.create({
    data: {
      name: formData.name,
      slug: formData.slug,
      description: formData.description,
      category: formData.category,
      isActive: formData.isActive,
      contactPerson: formData.contactPerson || null,
      email: formData.email || null,
      phone: formData.phone || null,
      website: formData.website || null,
      instagramHandle: formData.instagramHandle || null,
      facebookHandle: formData.facebookHandle || null,
      vendorType: formData.vendorType,
      businessDescription: formData.businessDescription || null,
      onlineOrdersEnabled: formData.onlineOrdersEnabled,
      signupDate: new Date(),
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
  }
) {
  await prisma.vendor.update({
    where: { id },
    data: {
      name: formData.name,
      slug: formData.slug,
      description: formData.description,
      category: formData.category,
      isActive: formData.isActive,
      contactPerson: formData.contactPerson || null,
      email: formData.email || null,
      phone: formData.phone || null,
      website: formData.website || null,
      instagramHandle: formData.instagramHandle || null,
      facebookHandle: formData.facebookHandle || null,
      vendorType: formData.vendorType,
      businessDescription: formData.businessDescription || null,
      onlineOrdersEnabled: formData.onlineOrdersEnabled,
    },
  })
  revalidatePath('/admin/vendors')
  redirect('/admin/vendors')
}
