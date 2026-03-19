import { prisma } from '@/lib/prisma'

export async function logVendorChange(
  vendorId: string,
  action: string,
  changedBy: string,
  summary: string,
  details?: Record<string, unknown>
) {
  await prisma.vendorChangeLog.create({
    data: {
      vendorId,
      action,
      changedBy,
      summary,
      details: details ? JSON.stringify(details) : null,
    },
  })
}
