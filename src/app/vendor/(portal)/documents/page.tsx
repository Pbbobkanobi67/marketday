import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { FileText } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { MARKET_CONFIG } from '@/config/market.config'

export default async function VendorDocumentsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.vendorId) redirect('/vendor/login')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Documents</h1>
        <p className="text-sm text-muted-foreground">
          Market documents, guidelines, and agreements for vendors.
        </p>
      </div>

      <Separator />

      <div className="grid gap-4 max-w-3xl">
        {MARKET_CONFIG.documents.map((doc) => (
          <div key={doc.id} className="card-market p-5 flex items-start gap-4">
            <div className="rounded-lg bg-market-warm p-2.5 shrink-0">
              <FileText className="size-5 text-market-sage" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-market-soil">{doc.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{doc.description}</p>
              <p className="text-xs text-muted-foreground mt-2 italic">
                Document content coming soon.
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
