'use client'

import { useTransition, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { updateApplicationStatus, convertApplicationToVendor } from '../actions'

type Props = {
  applicationId: string
  currentStatus: string
  adminNotes: string
}

export default function ApplicationActions({ applicationId, currentStatus, adminNotes: initialNotes }: Props) {
  const [isPending, startTransition] = useTransition()
  const [notes, setNotes] = useState(initialNotes)

  function handleApprove() {
    startTransition(async () => {
      await updateApplicationStatus(applicationId, 'APPROVED', notes)
    })
  }

  function handleReject() {
    startTransition(async () => {
      await updateApplicationStatus(applicationId, 'REJECTED', notes)
    })
  }

  function handleConvert() {
    startTransition(async () => {
      await convertApplicationToVendor(applicationId)
    })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="adminNotes">Admin Notes</Label>
        <Textarea
          id="adminNotes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Internal notes about this application..."
          rows={3}
        />
      </div>

      <div className="flex flex-wrap gap-3">
        {currentStatus === 'PENDING' && (
          <>
            <Button
              onClick={handleApprove}
              disabled={isPending}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isPending ? 'Processing...' : 'Approve'}
            </Button>
            <Button
              onClick={handleReject}
              disabled={isPending}
              variant="destructive"
            >
              {isPending ? 'Processing...' : 'Reject'}
            </Button>
          </>
        )}

        {currentStatus === 'APPROVED' && (
          <Button
            onClick={handleConvert}
            disabled={isPending}
          >
            {isPending ? 'Converting...' : 'Convert to Vendor'}
          </Button>
        )}

        {currentStatus === 'REJECTED' && (
          <Button
            onClick={handleApprove}
            disabled={isPending}
            variant="outline"
          >
            {isPending ? 'Processing...' : 'Re-Approve'}
          </Button>
        )}
      </div>
    </div>
  )
}
