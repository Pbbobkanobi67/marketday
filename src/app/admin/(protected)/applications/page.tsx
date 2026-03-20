import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@/generated/prisma/client'
import { vendorTypeLabel, vendorTypeColor, cn } from '@/lib/utils'
import { format } from 'date-fns'
import { Separator } from '@/components/ui/separator'
import FilterPills from '@/components/admin/FilterPills'
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

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const params = await searchParams
  const statusFilter = params.status || ''

  // Always fetch all for counts
  const allApplications = await prisma.vendorApplication.findMany({
    orderBy: { createdAt: 'desc' },
  })

  const pending = allApplications.filter((a) => a.status === 'PENDING')
  const approved = allApplications.filter((a) => a.status === 'APPROVED')
  const rejected = allApplications.filter((a) => a.status === 'REJECTED')

  // Apply filter for display
  const applications = statusFilter
    ? allApplications.filter((a) => a.status === statusFilter)
    : allApplications

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Vendor Applications</h1>
        <p className="text-sm text-muted-foreground">
          {applications.length} application{applications.length !== 1 ? 's' : ''}{statusFilter ? ` (${statusFilter.toLowerCase()})` : ' total'}
        </p>
      </div>

      {/* Clickable status filter pills */}
      <FilterPills
        paramName="status"
        allLabel={`All (${allApplications.length})`}
        options={[
          { value: 'PENDING', label: `Pending (${pending.length})` },
          { value: 'APPROVED', label: `Approved (${approved.length})` },
          { value: 'REJECTED', label: `Rejected (${rejected.length})` },
        ]}
      />

      <Separator />

      {applications.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <p className="text-sm text-muted-foreground">
            No vendor applications yet.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto -mx-1">
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
        </div>
      )}
    </div>
  )
}
