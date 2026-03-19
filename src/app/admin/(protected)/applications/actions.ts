'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function updateApplicationStatus(
  id: string,
  status: string,
  adminNotes?: string
) {
  await prisma.vendorApplication.update({
    where: { id },
    data: {
      status,
      adminNotes: adminNotes || null,
    },
  })
  revalidatePath('/admin/applications')
  revalidatePath(`/admin/applications/${id}`)
}

export async function convertApplicationToVendor(applicationId: string) {
  const app = await prisma.vendorApplication.findUnique({
    where: { id: applicationId },
  })

  if (!app) throw new Error('Application not found')

  // Generate slug from business name
  const slug = app.businessName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

  // Check for slug collision
  const existing = await prisma.vendor.findUnique({ where: { slug } })
  const finalSlug = existing ? `${slug}-${Date.now().toString(36)}` : slug

  await prisma.vendor.create({
    data: {
      name: app.businessName,
      slug: finalSlug,
      description: app.businessDescription || app.productsDescription || '',
      category: app.vendorType === 'certified_farmer' ? 'certified_farmer' : app.vendorType,
      vendorType: app.vendorType,
      isActive: true,
      onlineOrdersEnabled: false,
      contactPerson: app.contactPerson,
      email: app.email,
      phone: app.phone,
      website: app.website,
      instagramHandle: app.instagramHandle,
      facebookHandle: app.facebookHandle,
      businessDescription: app.businessDescription,
      signupDate: new Date(),
    },
  })

  // Mark application as approved
  await prisma.vendorApplication.update({
    where: { id: applicationId },
    data: { status: 'APPROVED' },
  })

  revalidatePath('/admin/applications')
  revalidatePath('/admin/vendors')
  redirect('/admin/vendors')
}
