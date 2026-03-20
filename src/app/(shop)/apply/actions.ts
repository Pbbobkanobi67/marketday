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
  productPhoto1Url?: string | null
  productPhoto2Url?: string | null
  productPhoto3Url?: string | null
  productPhoto4Url?: string | null
  productPhoto5Url?: string | null
  insuranceDocUrl?: string | null
  taxDocUrl?: string | null
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
      productPhoto1Url: formData.productPhoto1Url || null,
      productPhoto2Url: formData.productPhoto2Url || null,
      productPhoto3Url: formData.productPhoto3Url || null,
      productPhoto4Url: formData.productPhoto4Url || null,
      productPhoto5Url: formData.productPhoto5Url || null,
      insuranceDocUrl: formData.insuranceDocUrl || null,
      taxDocUrl: formData.taxDocUrl || null,
      status: 'PENDING',
    },
  })

  return { success: true }
}
