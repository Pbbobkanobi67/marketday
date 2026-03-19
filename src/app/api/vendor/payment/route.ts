import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'vendor' || !session.user.vendorId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const vendor = await prisma.vendor.findUnique({
    where: { id: session.user.vendorId },
    select: {
      venmoQrUrl: true,
      paypalQrUrl: true,
      zelleQrUrl: true,
    },
  })

  return NextResponse.json(vendor || { venmoQrUrl: null, paypalQrUrl: null, zelleQrUrl: null })
}
