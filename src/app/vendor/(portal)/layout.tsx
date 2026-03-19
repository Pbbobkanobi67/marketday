import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import VendorNav from '@/components/vendor/VendorNav'

export default async function VendorPortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'vendor') redirect('/vendor/login')

  const vendor = await prisma.vendor.findUnique({
    where: { id: session.user.vendorId },
    select: { onlineOrdersEnabled: true },
  })

  return (
    <div className="min-h-screen bg-market-cream">
      <VendorNav
        session={session}
        onlineOrdersEnabled={vendor?.onlineOrdersEnabled ?? false}
      />
      <main className="lg:ml-64 p-6">{children}</main>
    </div>
  )
}
