'use client'

import { useState, useRef } from 'react'
import { Upload, X, Loader2, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DocumentUploadProps {
  label: string
  value?: string | null
  onChange: (url: string | null) => void
  uploadUrl?: string
  className?: string
}

function isPdf(url: string) {
  return url.toLowerCase().includes('.pdf')
}

export function DocumentUpload({
  label,
  value,
  onChange,
  uploadUrl = '/api/upload/public',
  className,
}: DocumentUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)
    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Upload failed')
        return
      }

      onChange(data.url)
    } catch {
      setError('Upload failed. Please try again.')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  function handleRemove() {
    onChange(null)
  }

  return (
    <div className={cn('space-y-2', className)}>
      <p className="text-sm font-medium">{label}</p>

      {value ? (
        <div className="relative inline-block">
          {isPdf(value) ? (
            <div className="flex items-center gap-2 h-32 w-32 rounded-lg border border-market-stone/30 bg-muted/30 p-3">
              <FileText className="h-8 w-8 text-market-sage shrink-0" />
              <span className="text-xs text-muted-foreground truncate">PDF</span>
            </div>
          ) : (
            <img
              src={value}
              alt={label}
              className="h-32 w-32 rounded-lg object-cover border border-market-stone/30"
            />
          )}
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex flex-col items-center justify-center h-32 w-32 rounded-lg border-2 border-dashed border-market-stone/30 hover:border-market-sage/50 transition-colors text-muted-foreground hover:text-market-sage"
        >
          {uploading ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <>
              <Upload className="h-6 w-6 mb-1" />
              <span className="text-xs">Upload</span>
            </>
          )}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
        onChange={handleFileChange}
        className="hidden"
      />

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
