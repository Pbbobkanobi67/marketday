'use client'

import { useState, useTransition, useEffect } from 'react'
import { ImageUpload } from '@/components/shared/ImageUpload'
import { updateVendorPayment } from './actions'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

export default function VendorPaymentPage() {
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  const [venmoQrUrl, setVenmoQrUrl] = useState<string | null>(null)
  const [paypalQrUrl, setPaypalQrUrl] = useState<string | null>(null)
  const [zelleQrUrl, setZelleQrUrl] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    fetch('/api/vendor/payment')
      .then((res) => res.json())
      .then((data) => {
        setVenmoQrUrl(data.venmoQrUrl)
        setPaypalQrUrl(data.paypalQrUrl)
        setZelleQrUrl(data.zelleQrUrl)
        setLoaded(true)
      })
      .catch(() => setLoaded(true))
  }, [])

  function handleSave() {
    setSaved(false)
    startTransition(async () => {
      await updateVendorPayment({
        venmoQrUrl,
        paypalQrUrl,
        zelleQrUrl,
      })
      setSaved(true)
    })
  }

  if (!loaded) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Payment QR Codes</h1>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Payment QR Codes</h1>
        <p className="text-sm text-muted-foreground">
          Upload QR codes for your payment methods. Customers will see these on your vendor page and order confirmations.
        </p>
      </div>

      <Separator />

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 max-w-2xl">
        <ImageUpload label="Venmo QR" value={venmoQrUrl} onChange={setVenmoQrUrl} />
        <ImageUpload label="PayPal QR" value={paypalQrUrl} onChange={setPaypalQrUrl} />
        <ImageUpload label="Zelle QR" value={zelleQrUrl} onChange={setZelleQrUrl} />
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={handleSave} disabled={isPending}>
          {isPending ? 'Saving...' : 'Save Payment Methods'}
        </Button>
        {saved && (
          <p className="text-sm text-green-600">Payment methods saved!</p>
        )}
      </div>
    </div>
  )
}
