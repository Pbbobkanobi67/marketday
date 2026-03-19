import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { vendorTypeLabel, vendorTypeColor, cn } from '@/lib/utils'
import { format } from 'date-fns'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Eye } from 'lucide-react'

const STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
}

export default async function ApplicationsPage() {
  const applications = await prisma.vendorApplication.findMany({
    orderBy: { createdAt: 'desc' },
  })

  const pending = applications.filter((a) => a.status === 'PENDING')
  const approved = applications.filter((a) => a.status === 'APPROVED')
  const rejected = applications.filter((a) => a.status === 'REJECTED')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Vendor Applications</h1>
        <p className="text-sm text-muted-foreground">
          Review and manage vendor applications.
        </p>
      </div>

      {/* Summary badges */}
      <div className="flex gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium bg-amber-100 text-amber-800">
          {pending.length} Pending
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium bg-green-100 text-green-800">
          {approved.length} Approved
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium bg-red-100 text-red-800">
          {rejected.length} Rejected
        </span>
      </div>

      <Separator />

      {applications.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <p className="text-sm text-muted-foreground">
            No vendor applications yet.
          </p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Business Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.map((app) => (
              <TableRow key={app.id}>
                <TableCell className="font-medium">{app.businessName}</TableCell>
                <TableCell>
                  <div className="text-sm">{app.contactPerson}</div>
                  <div className="text-xs text-muted-foreground">{app.email}</div>
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                      vendorTypeColor(app.vendorType)
                    )}
                  >
                    {vendorTypeLabel(app.vendorType)}
                  </span>
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                      STATUS_STYLES[app.status] || STATUS_STYLES.PENDING
                    )}
                  >
                    {app.status}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {format(new Date(app.createdAt), 'MMM d, yyyy')}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    render={<Link href={`/admin/applications/${app.id}`} />}
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span className="sr-only">View {app.businessName}</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
