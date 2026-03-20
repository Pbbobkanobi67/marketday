'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { logVendorChange } from '@/lib/changelog'
import { generateSlug } from '@/lib/utils'

async function getVendorId() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'vendor' || !session.user.vendorId) {
    throw new Error('Unauthorized')
  }
  return session.user.vendorId
}

export async function createVendorProduct(formData: {
  name: string
  slug: string
  description: string
  price: number
  unit: string
  category: string
  isAvailable: boolean
  quantity: number
  imageUrl: string | null
}) {
  const vendorId = await getVendorId()

  const product = await prisma.product.create({
    data: {
      ...formData,
      vendorId,
    },
  })
  await logVendorChange(vendorId, 'PRODUCT_CREATE', 'vendor', `Created product "${product.name}"`)
  revalidatePath('/vendor/products')
  redirect('/vendor/products')
}

export async function updateVendorProduct(
  id: string,
  formData: {
    name: string
    slug: string
    description: string
    price: number
    unit: string
    category: string
    isAvailable: boolean
    quantity: number
    imageUrl: string | null
  }
) {
  const vendorId = await getVendorId()

  // Verify ownership
  const product = await prisma.product.findUnique({
    where: { id },
    select: { vendorId: true },
  })
  if (!product || product.vendorId !== vendorId) {
    throw new Error('Unauthorized')
  }

  await prisma.product.update({
    where: { id },
    data: formData,
  })
  await logVendorChange(vendorId, 'PRODUCT_UPDATE', 'vendor', `Updated product "${formData.name}"`)
  revalidatePath('/vendor/products')
  redirect('/vendor/products')
}

export async function deleteVendorProduct(id: string) {
  const vendorId = await getVendorId()

  // Verify ownership
  const product = await prisma.product.findUnique({
    where: { id },
    select: { vendorId: true, name: true },
  })
  if (!product || product.vendorId !== vendorId) {
    throw new Error('Unauthorized')
  }

  await prisma.product.delete({ where: { id } })
  await logVendorChange(vendorId, 'PRODUCT_DELETE', 'vendor', `Deleted product "${product.name}"`)
  revalidatePath('/vendor/products')
}

// --- Bulk operations ---

export async function bulkCreateVendorProducts(
  products: {
    name: string
    description: string
    price: number
    unit: string
    category: string
    quantity: number
    isAvailable: boolean
  }[]
): Promise<{ created: number; errors: { index: number; name: string; error: string }[] }> {
  const vendorId = await getVendorId()
  const errors: { index: number; name: string; error: string }[] = []
  let created = 0

  for (let i = 0; i < products.length; i++) {
    const p = products[i]
    try {
      let slug = generateSlug(p.name)
      // Check for slug collision and append timestamp if needed
      const existing = await prisma.product.findUnique({ where: { slug } })
      if (existing) {
        slug = `${slug}-${Date.now()}`
      }

      await prisma.product.create({
        data: {
          name: p.name,
          description: p.description,
          price: p.price,
          unit: p.unit,
          category: p.category,
          quantity: p.quantity,
          isAvailable: p.isAvailable,
          slug,
          vendorId,
        },
      })
      created++
    } catch (err) {
      errors.push({
        index: i,
        name: p.name,
        error: err instanceof Error ? err.message : 'Unknown error',
      })
    }
  }

  if (created > 0) {
    await logVendorChange(
      vendorId,
      'PRODUCT_BULK_IMPORT',
      'vendor',
      `Bulk imported ${created} product(s)`,
      { count: created, errorCount: errors.length }
    )
  }

  revalidatePath('/vendor/products')
  return { created, errors }
}

export async function bulkToggleAvailability(
  productIds: string[],
  isAvailable: boolean
) {
  const vendorId = await getVendorId()

  // Verify ownership
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, vendorId },
    select: { id: true },
  })
  const ownedIds = products.map((p) => p.id)

  if (ownedIds.length === 0) return

  await prisma.product.updateMany({
    where: { id: { in: ownedIds } },
    data: { isAvailable },
  })

  await logVendorChange(
    vendorId,
    'PRODUCT_BULK_UPDATE',
    'vendor',
    `Bulk ${isAvailable ? 'enabled' : 'disabled'} ${ownedIds.length} product(s)`
  )
  revalidatePath('/vendor/products')
}

export async function bulkDeleteVendorProducts(productIds: string[]) {
  const vendorId = await getVendorId()

  // Verify ownership and check for order history
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, vendorId },
    select: {
      id: true,
      name: true,
      _count: { select: { orderItems: true } },
    },
  })

  const toHardDelete: string[] = []
  const toSoftDelete: string[] = []

  for (const p of products) {
    if (p._count.orderItems > 0) {
      toSoftDelete.push(p.id)
    } else {
      toHardDelete.push(p.id)
    }
  }

  if (toSoftDelete.length > 0) {
    await prisma.product.updateMany({
      where: { id: { in: toSoftDelete } },
      data: { isAvailable: false },
    })
  }

  if (toHardDelete.length > 0) {
    await prisma.product.deleteMany({
      where: { id: { in: toHardDelete } },
    })
  }

  const total = toHardDelete.length + toSoftDelete.length
  if (total > 0) {
    await logVendorChange(
      vendorId,
      'PRODUCT_BULK_DELETE',
      'vendor',
      `Bulk deleted ${total} product(s) (${toHardDelete.length} removed, ${toSoftDelete.length} disabled)`,
      { hardDeleted: toHardDelete.length, softDeleted: toSoftDelete.length }
    )
  }

  revalidatePath('/vendor/products')
}
