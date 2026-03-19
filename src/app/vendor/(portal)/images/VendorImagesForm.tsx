'use client'

import { useState, useTransition } from 'react'
import { ImageUpload } from '@/components/shared/ImageUpload'
import { updateVendorImages } from './actions'
import { Button } from '@/components/ui/button'

interface VendorImagesFormProps {
  vendor: {
    logoUrl: string | null
    boothImageUrl: string | null
    productImage1Url: string | null
    productImage2Url: string | null
    productImage3Url: string | null
  }
}

export function VendorImagesForm({ vendor }: VendorImagesFormProps) {
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  const [logoUrl, setLogoUrl] = useState(vendor.logoUrl)
  const [boothImageUrl, setBoothImageUrl] = useState(vendor.boothImageUrl)
  const [productImage1Url, setProductImage1Url] = useState(vendor.productImage1Url)
  const [productImage2Url, setProductImage2Url] = useState(vendor.productImage2Url)
  const [productImage3Url, setProductImage3Url] = useState(vendor.productImage3Url)

  function handleSave() {
    setSaved(false)
    startTransition(async () => {
      await updateVendorImages({
        logoUrl,
        boothImageUrl,
        productImage1Url,
        productImage2Url,
        productImage3Url,
      })
      setSaved(true)
    })
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
        <ImageUpload label="Logo" value={logoUrl} onChange={setLogoUrl} />
        <ImageUpload label="Booth Image" value={boothImageUrl} onChange={setBoothImageUrl} />
      </div>

      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Product Gallery
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
          <ImageUpload label="Image 1" value={productImage1Url} onChange={setProductImage1Url} />
          <ImageUpload label="Image 2" value={productImage2Url} onChange={setProductImage2Url} />
          <ImageUpload label="Image 3" value={productImage3Url} onChange={setProductImage3Url} />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={handleSave} disabled={isPending}>
          {isPending ? 'Saving...' : 'Save Images'}
        </Button>
        {saved && (
          <p className="text-sm text-green-600">Images saved!</p>
        )}
      </div>
    </div>
  )
}
