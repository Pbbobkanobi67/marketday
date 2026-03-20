'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateOrderNotes } from '@/app/admin/(protected)/orders/actions'
import { Button } from '@/components/ui/button'
import { Loader2, MessageSquare } from 'lucide-react'

type Props = {
  orderId: string
  initialNotes: string | null
}

export default function AdminNotesEditor({ orderId, initialNotes }: Props) {
  const router = useRouter()
  const [notes, setNotes] = useState(initialNotes || '')
  const [editing, setEditing] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleSave() {
    startTransition(async () => {
      await updateOrderNotes(orderId, notes)
      setEditing(false)
      router.refresh()
    })
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-market-soil uppercase tracking-wide flex items-center gap-2">
          <MessageSquare className="size-4" />
          Admin Notes
        </h3>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="text-xs text-market-sage hover:text-market-sage-dk font-medium transition-colors"
          >
            {initialNotes ? 'Edit' : 'Add note'}
          </button>
        )}
      </div>

      {editing ? (
        <div className="space-y-2">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full min-h-[80px] rounded-lg border border-market-stone/40 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-market-sage/30"
            placeholder="Internal notes about this order..."
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSave} disabled={isPending}>
              {isPending && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
              Save
            </Button>
            <Button size="sm" variant="outline" onClick={() => { setEditing(false); setNotes(initialNotes || '') }}>
              Cancel
            </Button>
          </div>
        </div>
      ) : initialNotes ? (
        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{initialNotes}</p>
      ) : (
        <p className="text-xs text-muted-foreground italic">No admin notes yet.</p>
      )}
    </div>
  )
}
