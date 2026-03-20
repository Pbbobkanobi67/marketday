import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Separator } from '@/components/ui/separator'
import { VendorProfileForm } from './VendorProfileForm'

export default async function VendorProfilePage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.vendorId) redirect('/vendor/login')

  const vendor = await prisma.vendor.findUnique({
    where: { id: session.user.vendorId },
    select: {
      name: true,
      displayName: true,
      description: true,
      businessDescription: true,
      contactPerson: true,
      email: true,
      phone: true,
      website: true,
      instagramHandle: true,
      facebookHandle: true,
      vendorNotes: true,
    },
  })

  if (!vendor) redirect('/vendor/login')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Edit Profile</h1>
        <p className="text-sm text-muted-foreground">
          Update your vendor profile information. Changes go live immediately.
        </p>
      </div>
      <Separator />
      <VendorProfileForm vendor={vendor} />
    </div>
  )
}
