'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Check, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { parseCSV } from '@/lib/csv'
import { MARKET_CONFIG } from '@/config/market.config'
import { bulkCreateVendorProducts } from './actions'

const EXPECTED_HEADERS = ['name', 'description', 'price', 'unit', 'category', 'quantity', 'available']

const validUnitValues = MARKET_CONFIG.units.map((u) => u.value as string)
const validCategoryValues = MARKET_CONFIG.categories.map((c) => c.value as string)
const validUnits = new Set(validUnitValues)
const validCategories = new Set(validCategoryValues)

interface PreviewRow {
  name: string
  description: string
  price: number // cents
  unit: string
  category: string
  quantity: number
  isAvailable: boolean
  errors: string[]
}

function validateRow(row: string[]): PreviewRow {
  const errors: string[] = []
  const [name, description, priceStr, unit, category, quantityStr, availableStr] = row

  // Name
  const trimName = (name || '').trim()
  if (!trimName) errors.push('Name is required')

  // Description
  const trimDesc = (description || '').trim()
  if (!trimDesc) errors.push('Description is required')

  // Price
  const priceNum = parseFloat(priceStr || '')
  let priceCents = 0
  if (isNaN(priceNum) || priceNum <= 0) {
    errors.push('Price must be a positive number')
  } else {
    priceCents = Math.round(priceNum * 100)
  }

  // Unit
  const trimUnit = (unit || '').trim().toLowerCase()
  if (!validUnits.has(trimUnit)) {
    errors.push(`Invalid unit "${unit || ''}" (use: ${validUnitValues.join(', ')})`)
  }

  // Category
  const trimCat = (category || '').trim().toLowerCase()
  if (!validCategories.has(trimCat)) {
    errors.push(`Invalid category "${category || ''}" (use: ${validCategoryValues.join(', ')})`)
  }

  // Quantity (optional, default 0)
  const qtyStr = (quantityStr || '0').trim()
  const qty = parseInt(qtyStr, 10)
  if (isNaN(qty) || qty < 0) {
    errors.push('Quantity must be a non-negative integer')
  }

  // Available (optional, default yes)
  const avail = (availableStr || 'yes').trim().toLowerCase()
  const isAvailable = avail !== 'no'

  return {
    name: trimName,
    description: trimDesc,
    price: priceCents,
    unit: trimUnit,
    category: trimCat,
    quantity: isNaN(qty) || qty < 0 ? 0 : qty,
    isAvailable,
    errors,
  }
}

interface VendorProductImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  csvText: string
}

export function VendorProductImportDialog({
  open,
  onOpenChange,
  csvText,
}: VendorProductImportDialogProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [previewRows, setPreviewRows] = useState<PreviewRow[]>([])
  const [headerError, setHeaderError] = useState('')
  const [result, setResult] = useState<{ created: number; errors: number } | null>(null)

  useEffect(() => {
    if (!open || !csvText) {
      setPreviewRows([])
      setHeaderError('')
      setResult(null)
      return
    }

    const { headers, rows } = parseCSV(csvText)

    if (rows.length === 0 && headers.length === 0) {
      setHeaderError('The file appears to be empty.')
      return
    }

    // Normalize headers for comparison
    const normalized = headers.map((h) => h.toLowerCase().trim())
    const missingHeaders = EXPECTED_HEADERS.filter((h) => !normalized.includes(h))

    if (missingHeaders.length > 0) {
      setHeaderError(
        `CSV headers don't match the expected format. Missing: ${missingHeaders.join(', ')}. Please download and use the template.`
      )
      return
    }

    // Map columns by header position
    const colIndex = EXPECTED_HEADERS.map((h) => normalized.indexOf(h))

    const parsed = rows.map((row) => {
      const reordered = colIndex.map((i) => (i >= 0 && i < row.length ? row[i] : ''))
      return validateRow(reordered)
    })

    setPreviewRows(parsed)
    setHeaderError('')
  }, [open, csvText])

  const validRows = previewRows.filter((r) => r.errors.length === 0)
  const invalidRows = previewRows.filter((r) => r.errors.length > 0)

  function handleImport() {
    const toImport = validRows.map((r) => ({
      name: r.name,
      description: r.description,
      price: r.price,
      unit: r.unit,
      category: r.category,
      quantity: r.quantity,
      isAvailable: r.isAvailable,
    }))

    startTransition(async () => {
      const res = await bulkCreateVendorProducts(toImport)
      setResult({ created: res.created, errors: res.errors.length })
      router.refresh()
    })
  }

  const showResult = result !== null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import Products</DialogTitle>
          <DialogDescription>
            {showResult
              ? 'Import complete.'
              : 'Review the products below before importing.'}
          </DialogDescription>
        </DialogHeader>

        {showResult ? (
          <div className="space-y-3 py-4">
            <div className="flex items-center gap-2 text-green-700">
              <Check className="h-5 w-5" />
              <span className="font-medium">
                {result.created} product{result.created !== 1 ? 's' : ''} imported
                successfully.
              </span>
            </div>
            {result.errors > 0 && (
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-5 w-5" />
                <span>
                  {result.errors} product{result.errors !== 1 ? 's' : ''} failed to
                  import.
                </span>
              </div>
            )}
          </div>
        ) : headerError ? (
          <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{headerError}</span>
          </div>
        ) : previewRows.length === 0 ? (
          <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>The file appears to be empty.</span>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {validRows.length} of {previewRows.length} product
              {previewRows.length !== 1 ? 's' : ''} ready to import.
              {invalidRows.length > 0 &&
                ` ${invalidRows.length} ha${invalidRows.length !== 1 ? 've' : 's'} errors.`}
            </p>

            <div className="max-h-80 overflow-auto rounded-lg border">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-muted">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium w-8"></th>
                    <th className="px-3 py-2 text-left font-medium">Name</th>
                    <th className="px-3 py-2 text-left font-medium">Price</th>
                    <th className="px-3 py-2 text-left font-medium">Unit</th>
                    <th className="px-3 py-2 text-left font-medium">Category</th>
                    <th className="px-3 py-2 text-center font-medium">Qty</th>
                  </tr>
                </thead>
                <tbody>
                  {previewRows.map((row, i) => {
                    const hasErrors = row.errors.length > 0
                    return (
                      <tr
                        key={i}
                        className={cn(
                          'border-t',
                          hasErrors ? 'bg-red-50' : ''
                        )}
                      >
                        <td className="px-3 py-2">
                          {hasErrors ? (
                            <AlertCircle className="h-4 w-4 text-red-500" />
                          ) : (
                            <Check className="h-4 w-4 text-green-600" />
                          )}
                        </td>
                        <td className="px-3 py-2">
                          <div>{row.name || '(empty)'}</div>
                          {hasErrors && (
                            <div className="mt-1 text-xs text-red-600">
                              {row.errors.join('; ')}
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-2 font-mono">
                          {row.price > 0
                            ? `$${(row.price / 100).toFixed(2)}`
                            : '-'}
                        </td>
                        <td className="px-3 py-2">{row.unit || '-'}</td>
                        <td className="px-3 py-2">{row.category || '-'}</td>
                        <td className="px-3 py-2 text-center">{row.quantity}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <DialogFooter>
          {showResult ? (
            <Button onClick={() => onOpenChange(false)}>Done</Button>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              {!headerError && validRows.length > 0 && (
                <Button onClick={handleImport} disabled={isPending}>
                  {isPending
                    ? 'Importing...'
                    : `Import ${validRows.length} Product${validRows.length !== 1 ? 's' : ''}`}
                </Button>
              )}
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
