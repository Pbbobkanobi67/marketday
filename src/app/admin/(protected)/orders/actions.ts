'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function updateOrderNotes(orderId: string, adminNotes: string) {
  await prisma.order.update({
    where: { id: orderId },
    data: { adminNotes: adminNotes || null },
  })
  revalidatePath(`/admin/orders/${orderId}`)
}

export async function updateOrderCustomerInfo(
  orderId: string,
  data: {
    customerName: string
    customerEmail: string
    customerPhone?: string
    customerNotes?: string
  }
) {
  await prisma.order.update({
    where: { id: orderId },
    data: {
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone || null,
      customerNotes: data.customerNotes || null,
    },
  })
  revalidatePath(`/admin/orders/${orderId}`)
}
