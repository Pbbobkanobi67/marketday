import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Separator } from '@/components/ui/separator'
import { VendorImagesForm } from './VendorImagesForm'

export default async function VendorImagesPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.vendorId) redirect('/vendor/login')

  const vendor = await prisma.vendor.findUnique({
    where: { id: session.user.vendorId },
    select: {
      logoUrl: true,
      boothImageUrl: true,
      productImage1Url: true,
      productImage2Url: true,
      productImage3Url: true,
    },
  })

  if (!vendor) redirect('/vendor/login')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Images</h1>
        <p className="text-sm text-muted-foreground">
          Upload your logo, booth photo, and product gallery images.
        </p>
      </div>
      <Separator />
      <VendorImagesForm vendor={vendor} />
    </div>
  )
}
