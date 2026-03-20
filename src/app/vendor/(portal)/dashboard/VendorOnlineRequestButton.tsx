'use client'

import { useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { requestOnlineOrdering } from './actions'

interface VendorOnlineRequestButtonProps {
  requested: boolean
}

export function VendorOnlineRequestButton({ requested }: VendorOnlineRequestButtonProps) {
  const [isPending, startTransition] = useTransition()

  function handleRequest() {
    startTransition(async () => {
      await requestOnlineOrdering()
    })
  }

  if (requested) {
    return (
      <p className="text-sm text-amber-600 font-medium">
        Request Pending — an admin will review your request.
      </p>
    )
  }

  return (
    <Button onClick={handleRequest} disabled={isPending} variant="outline">
      {isPending ? 'Requesting...' : 'Request Online Ordering'}
    </Button>
  )
}
