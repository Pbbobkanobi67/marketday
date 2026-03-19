'use server'

import { prisma } from '@/lib/prisma'

export async function submitVendorApplication(formData: {
  businessName: string
  contactPerson: string
  email: string
  phone?: string
  website?: string
  instagramHandle?: string
  facebookHandle?: string
  vendorType: string
  productsDescription?: string
  businessDescription?: string
}) {
  await prisma.vendorApplication.create({
    data: {
      businessName: formData.businessName,
      contactPerson: formData.contactPerson,
      email: formData.email,
      phone: formData.phone || null,
      website: formData.website || null,
      instagramHandle: formData.instagramHandle || null,
      facebookHandle: formData.facebookHandle || null,
      vendorType: formData.vendorType,
      productsDescription: formData.productsDescription || null,
      businessDescription: formData.businessDescription || null,
      status: 'PENDING',
    },
  })

  return { success: true }
}
