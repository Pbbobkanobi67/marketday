'use client'

import { useState, useTransition, useEffect } from 'react'
import { ImageUpload } from '@/components/shared/ImageUpload'
import { updateVendorPayment } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'

const PAYMENT_METHODS = [
  { key: 'venmo', label: 'Venmo' },
  { key: 'paypal', label: 'PayPal' },
  { key: 'zelle', label: 'Zelle' },
  { key: 'gpay', label: 'Google Pay' },
  { key: 'applePay', label: 'Apple Pay' },
] as const

type MethodKey = (typeof PAYMENT_METHODS)[number]['key']

type PaymentState = Record<MethodKey, { qrUrl: string | null; link: string }>

export default function VendorPaymentPage() {
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [state, setState] = useState<PaymentState>({
    venmo: { qrUrl: null, link: '' },
    paypal: { qrUrl: null, link: '' },
    zelle: { qrUrl: null, link: '' },
    gpay: { qrUrl: null, link: '' },
    applePay: { qrUrl: null, link: '' },
  })

  useEffect(() => {
    fetch('/api/vendor/payment')
      .then((res) => res.json())
      .then((data) => {
        setState({
          venmo: { qrUrl: data.venmoQrUrl || null, link: data.venmoLink || '' },
          paypal: { qrUrl: data.paypalQrUrl || null, link: data.paypalLink || '' },
          zelle: { qrUrl: data.zelleQrUrl || null, link: data.zelleLink || '' },
          gpay: { qrUrl: data.gpayQrUrl || null, link: data.gpayLink || '' },
          applePay: { qrUrl: data.applePayQrUrl || null, link: data.applePayLink || '' },
        })
        setLoaded(true)
      })
      .catch(() => setLoaded(true))
  }, [])

  function setQr(key: MethodKey, url: string | null) {
    setState((prev) => ({ ...prev, [key]: { ...prev[key], qrUrl: url } }))
  }

  function setLink(key: MethodKey, link: string) {
    setState((prev) => ({ ...prev, [key]: { ...prev[key], link } }))
  }

  function handleSave() {
    setSaved(false)
    startTransition(async () => {
      await updateVendorPayment({
        venmoQrUrl: state.venmo.qrUrl,
        paypalQrUrl: state.paypal.qrUrl,
        zelleQrUrl: state.zelle.qrUrl,
        gpayQrUrl: state.gpay.qrUrl,
        applePayQrUrl: state.applePay.qrUrl,
        venmoLink: state.venmo.link || null,
        paypalLink: state.paypal.link || null,
        zelleLink: state.zelle.link || null,
        gpayLink: state.gpay.link || null,
        applePayLink: state.applePay.link || null,
      })
      setSaved(true)
    })
  }

  if (!loaded) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Payment Methods</h1>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Payment Methods</h1>
        <p className="text-sm text-muted-foreground">
          Upload QR codes and add payment links. Customers will see these on your vendor page and order confirmations.
        </p>
      </div>

      <Separator />

      <div className="space-y-8 max-w-3xl">
        {PAYMENT_METHODS.map(({ key, label }) => (
          <div key={key} className="card-market p-5">
            <h3 className="text-sm font-semibold text-market-soil mb-4">{label}</h3>
            <div className="flex flex-col sm:flex-row gap-6">
              <ImageUpload
                label="QR Code"
                value={state[key].qrUrl}
                onChange={(url) => setQr(key, url)}
              />
              <div className="flex-1 space-y-2">
                <Label htmlFor={`${key}-link`}>Payment Link</Label>
                <Input
                  id={`${key}-link`}
                  type="url"
                  placeholder={`https://${label.toLowerCase().replace(' ', '')}.com/...`}
                  value={state[key].link}
                  onChange={(e) => setLink(key, e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Direct payment link customers can click to pay you.
                </p>
              </div>
            </div>
          </div>
        ))}
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
