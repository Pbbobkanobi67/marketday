import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { vendorTypeLabel, cn } from '@/lib/utils'
import { format } from 'date-fns'
import { ArrowLeft, FileText } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import ApplicationActions from './ApplicationActions'

export default async function ApplicationDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const app = await prisma.vendorApplication.findUnique({
    where: { id: params.id },
  })

  if (!app) notFound()

  const STATUS_STYLES: Record<string, string> = {
    PENDING: 'bg-amber-100 text-amber-800',
    APPROVED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
  }

  const productPhotos = [
    app.productPhoto1Url,
    app.productPhoto2Url,
    app.productPhoto3Url,
    app.productPhoto4Url,
    app.productPhoto5Url,
  ].filter(Boolean) as string[]

  const documents = [
    { label: 'Insurance Certificate', url: app.insuranceDocUrl },
    { label: "Seller's Permit / Tax ID", url: app.taxDocUrl },
  ].filter((d) => d.url) as { label: string; url: string }[]

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link
          href="/admin/applications"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-market-sage transition-colors mb-3"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Applications
        </Link>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">{app.businessName}</h1>
          <span
            className={cn(
              'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium',
              STATUS_STYLES[app.status] || STATUS_STYLES.PENDING
            )}
          >
            {app.status}
          </span>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Applied {format(new Date(app.createdAt), 'MMMM d, yyyy')}
        </p>
      </div>

      <Separator />

      {/* Application details */}
      <div className="card-market p-5 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Contact Person</p>
            <p className="text-sm text-market-soil">{app.contactPerson}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email</p>
            <p className="text-sm text-market-soil">{app.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Phone</p>
            <p className="text-sm text-market-soil">{app.phone || 'Not provided'}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Vendor Type</p>
            <p className="text-sm text-market-soil">{vendorTypeLabel(app.vendorType)}</p>
          </div>
        </div>

        {app.website && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Website</p>
            <p className="text-sm text-market-sage">{app.website}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          {app.instagramHandle && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Instagram</p>
              <p className="text-sm text-market-soil">{app.instagramHandle}</p>
            </div>
          )}
          {app.facebookHandle && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Facebook</p>
              <p className="text-sm text-market-soil">{app.facebookHandle}</p>
            </div>
          )}
        </div>

        {app.productsDescription && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Products</p>
            <p className="text-sm text-market-soil whitespace-pre-wrap">{app.productsDescription}</p>
          </div>
        )}

        {app.businessDescription && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Business Description</p>
            <p className="text-sm text-market-soil whitespace-pre-wrap">{app.businessDescription}</p>
          </div>
        )}

        {/* Product Photos */}
        {productPhotos.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Product Photos</p>
            <div className="flex flex-wrap gap-2">
              {productPhotos.map((url, i) => (
                <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                  <img
                    src={url}
                    alt={`Product photo ${i + 1}`}
                    className="h-24 w-24 rounded-lg object-cover border border-market-stone/30 hover:ring-2 hover:ring-market-sage/50 transition-all"
                  />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Documents */}
        {documents.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Documents</p>
            <div className="space-y-2">
              {documents.map((doc) => (
                <a
                  key={doc.label}
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-market-sage hover:underline"
                >
                  <FileText className="h-4 w-4" />
                  {doc.label}
                </a>
              ))}
            </div>
          </div>
        )}

        {app.adminNotes && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Admin Notes</p>
            <p className="text-sm text-market-soil whitespace-pre-wrap">{app.adminNotes}</p>
          </div>
        )}
      </div>

      <Separator />

      {/* Actions */}
      <ApplicationActions
        applicationId={app.id}
        currentStatus={app.status}
        adminNotes={app.adminNotes || ''}
      />
    </div>
  )
}
