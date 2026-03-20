'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateOrderCustomerInfo } from '@/app/admin/(protected)/orders/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Pencil, User, Mail, Phone, StickyNote } from 'lucide-react'

type Props = {
  orderId: string
  customerName: string
  customerEmail: string
  customerPhone: string | null
  customerNotes: string | null
}

export default function CustomerInfoEditor({
  orderId,
  customerName,
  customerEmail,
  customerPhone,
  customerNotes,
}: Props) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(customerName)
  const [email, setEmail] = useState(customerEmail)
  const [phone, setPhone] = useState(customerPhone || '')
  const [notes, setNotes] = useState(customerNotes || '')
  const [isPending, startTransition] = useTransition()

  function handleSave() {
    startTransition(async () => {
      await updateOrderCustomerInfo(orderId, {
        customerName: name,
        customerEmail: email,
        customerPhone: phone || undefined,
        customerNotes: notes || undefined,
      })
      setEditing(false)
      router.refresh()
    })
  }

  function handleCancel() {
    setEditing(false)
    setName(customerName)
    setEmail(customerEmail)
    setPhone(customerPhone || '')
    setNotes(customerNotes || '')
  }

  if (editing) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-market-soil">
            Customer Details
          </h2>
        </div>
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Email</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Phone</label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Optional" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Customer Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full min-h-[60px] rounded-lg border border-market-stone/40 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-market-sage/30"
              placeholder="Optional"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={handleSave} disabled={isPending}>
            {isPending && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
            Save
          </Button>
          <Button size="sm" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-market-soil">
          Customer Details
        </h2>
        <button
          onClick={() => setEditing(true)}
          className="inline-flex items-center gap-1 text-xs text-market-sage hover:text-market-sage-dk font-medium transition-colors"
        >
          <Pencil className="size-3" />
          Edit
        </button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <User className="size-4 text-market-sage shrink-0" />
          <span className="text-sm">{customerName}</span>
        </div>
        <div className="flex items-center gap-3">
          <Mail className="size-4 text-market-sage shrink-0" />
          <a
            href={`mailto:${customerEmail}`}
            className="text-sm text-market-sage hover:underline"
          >
            {customerEmail}
          </a>
        </div>
        {customerPhone && (
          <div className="flex items-center gap-3">
            <Phone className="size-4 text-market-sage shrink-0" />
            <a
              href={`tel:${customerPhone}`}
              className="text-sm text-market-sage hover:underline"
            >
              {customerPhone}
            </a>
          </div>
        )}
        {customerNotes && (
          <div className="flex items-start gap-3">
            <StickyNote className="size-4 text-market-sage shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">
              {customerNotes}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
