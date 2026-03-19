import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

const actionColors: Record<string, string> = {
  PROFILE_UPDATE: 'bg-blue-100 text-blue-700',
  IMAGE_UPDATE: 'bg-purple-100 text-purple-700',
  PRODUCT_CREATE: 'bg-green-100 text-green-700',
  PRODUCT_UPDATE: 'bg-yellow-100 text-yellow-700',
  PRODUCT_DELETE: 'bg-red-100 text-red-700',
  PAYMENT_UPDATE: 'bg-indigo-100 text-indigo-700',
  PASSWORD_CHANGE: 'bg-orange-100 text-orange-700',
  ADMIN_EDIT: 'bg-gray-100 text-gray-700',
  REVIEW_CLEARED: 'bg-teal-100 text-teal-700',
}

function formatAction(action: string) {
  return action.replace(/_/g, ' ')
}

export default async function VendorChangelogPage({
  params,
}: {
  params: { id: string }
}) {
  const vendor = await prisma.vendor.findUnique({
    where: { id: params.id },
    select: { id: true, name: true },
  })

  if (!vendor) notFound()

  const logs = await prisma.vendorChangeLog.findMany({
    where: { vendorId: vendor.id },
    orderBy: { createdAt: 'desc' },
    take: 200,
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Button
              variant="ghost"
              size="icon-xs"
              render={<Link href={`/admin/vendors/${vendor.id}/edit`} />}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold tracking-tight">
              Changelog: {vendor.name}
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            All changes for this vendor.
          </p>
        </div>
      </div>

      <Separator />

      {logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <p className="text-sm text-muted-foreground">No changes logged for this vendor yet.</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Time</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Changed By</TableHead>
              <TableHead>Summary</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                  {log.createdAt.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold',
                      actionColors[log.action] || 'bg-gray-100 text-gray-700'
                    )}
                  >
                    {formatAction(log.action)}
                  </span>
                </TableCell>
                <TableCell className="text-sm">{log.changedBy}</TableCell>
                <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                  {log.summary}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
