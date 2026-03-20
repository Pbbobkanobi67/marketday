'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { logVendorChange } from '@/lib/changelog'

export async function updateVendorPayment(formData: {
  venmoQrUrl: string | null
  paypalQrUrl: string | null
  zelleQrUrl: string | null
  gpayQrUrl: string | null
  applePayQrUrl: string | null
  venmoLink: string | null
  paypalLink: string | null
  zelleLink: string | null
  gpayLink: string | null
  applePayLink: string | null
}) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'vendor' || !session.user.vendorId) {
    throw new Error('Unauthorized')
  }

  await prisma.vendor.update({
    where: { id: session.user.vendorId },
    data: {
      venmoQrUrl: formData.venmoQrUrl,
      paypalQrUrl: formData.paypalQrUrl,
      zelleQrUrl: formData.zelleQrUrl,
      gpayQrUrl: formData.gpayQrUrl,
      applePayQrUrl: formData.applePayQrUrl,
      venmoLink: formData.venmoLink || null,
      paypalLink: formData.paypalLink || null,
      zelleLink: formData.zelleLink || null,
      gpayLink: formData.gpayLink || null,
      applePayLink: formData.applePayLink || null,
    },
  })

  const methods: string[] = []
  if (formData.venmoQrUrl || formData.venmoLink) methods.push('Venmo')
  if (formData.paypalQrUrl || formData.paypalLink) methods.push('PayPal')
  if (formData.zelleQrUrl || formData.zelleLink) methods.push('Zelle')
  if (formData.gpayQrUrl || formData.gpayLink) methods.push('Google Pay')
  if (formData.applePayQrUrl || formData.applePayLink) methods.push('Apple Pay')
  await logVendorChange(
    session.user.vendorId,
    'PAYMENT_UPDATE',
    'vendor',
    methods.length > 0 ? `Updated payment methods: ${methods.join(', ')}` : 'Cleared all payment methods'
  )

  revalidatePath('/vendor/payment')
  return { success: true }
}
