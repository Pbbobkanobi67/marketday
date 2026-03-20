'use client'

import { useState, useTransition, useRef, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Plus,
  Pencil,
  Search,
  Download,
  Upload,
  FileDown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn, formatPrice, categoryLabel, categoryColor } from '@/lib/utils'
import { MARKET_CONFIG } from '@/config/market.config'
import { generateCSV } from '@/lib/csv'
import { VendorProductDeleteButton } from './VendorProductDeleteButton'
import { VendorProductImportDialog } from './VendorProductImportDialog'
import { bulkToggleAvailability, bulkDeleteVendorProducts } from './actions'

interface SerializedProduct {
  id: string
  name: string
  slug: string
  description: string
  price: number
  imageUrl: string | null
  unit: string
  category: string
  quantity: number
  isAvailable: boolean
  vendorId: string
  createdAt: string
  updatedAt: string
}

const CSV_HEADERS = ['name', 'description', 'price', 'unit', 'category', 'quantity', 'available']

const TEMPLATE_ROWS = [
  ['Organic Heirloom Tomatoes', 'Vine-ripened heirloom tomatoes, locally grown', '4.50', 'lb', 'certified_farmer', '20', 'yes'],
  ['Sourdough Bread', 'Fresh baked sourdough loaf', '8.00', 'loaf', 'baked', '10', 'yes'],
]

type AvailabilityFilter = 'all' | 'available' | 'unavailable'

export function VendorProductsClient({
  products,
}: {
  products: SerializedProduct[]
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [availFilter, setAvailFilter] = useState<AvailabilityFilter>('all')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [importOpen, setImportOpen] = useState(false)
  const [importCsv, setImportCsv] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false
      if (categoryFilter && p.category !== categoryFilter) return false
      if (availFilter === 'available' && !p.isAvailable) return false
      if (availFilter === 'unavailable' && p.isAvailable) return false
      return true
    })
  }, [products, search, categoryFilter, availFilter])

  const filteredIds = useMemo(() => new Set(filtered.map((p) => p.id)), [filtered])

  // Only keep selected items that are visible
  const activeSelected = useMemo(
    () => new Set(Array.from(selected).filter((id) => filteredIds.has(id))),
    [selected, filteredIds]
  )

  const allVisibleSelected =
    filtered.length > 0 && filtered.every((p) => selected.has(p.id))

  function toggleSelectAll() {
    if (allVisibleSelected) {
      setSelected((prev) => {
        const next = new Set(prev)
        filtered.forEach((p) => next.delete(p.id))
        return next
      })
    } else {
      setSelected((prev) => {
        const next = new Set(prev)
        filtered.forEach((p) => next.add(p.id))
        return next
      })
    }
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function downloadCsv(filename: string, headers: string[], rows: string[][]) {
    const csv = generateCSV(headers, rows)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleExport() {
    const rows = products.map((p) => [
      p.name,
      p.description,
      (p.price / 100).toFixed(2),
      p.unit,
      p.category,
      p.quantity.toString(),
      p.isAvailable ? 'yes' : 'no',
    ])
    const date = new Date().toISOString().slice(0, 10)
    downloadCsv(`products-${date}.csv`, CSV_HEADERS, rows)
  }

  function handleTemplate() {
    downloadCsv('product-template.csv', CSV_HEADERS, TEMPLATE_ROWS)
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      setImportCsv(text)
      setImportOpen(true)
    }
    reader.readAsText(file)
    // Reset so same file can be re-selected
    e.target.value = ''
  }

  function handleBulkAvailability(isAvailable: boolean) {
    const ids = Array.from(activeSelected)
    startTransition(async () => {
      await bulkToggleAvailability(ids, isAvailable)
      setSelected(new Set())
      router.refresh()
    })
  }

  function handleBulkDelete() {
    const ids = Array.from(activeSelected)
    if (
      !confirm(
        `Delete ${ids.length} selected product(s)? Products with order history will be marked unavailable instead.`
      )
    )
      return
    startTransition(async () => {
      await bulkDeleteVendorProducts(ids)
      setSelected(new Set())
      router.refresh()
    })
  }

  const selectClass =
    'flex h-8 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Products</h1>
          <p className="text-sm text-muted-foreground">
            {products.length} product{products.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleTemplate}>
            <FileDown className="mr-1.5 h-3.5 w-3.5" />
            Template
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="mr-1.5 h-3.5 w-3.5" />
            Export
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="mr-1.5 h-3.5 w-3.5" />
            Import
          </Button>
          <Button size="sm" render={<Link href="/vendor/products/new" />}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Add Product
          </Button>
        </div>
      </div>

      <Separator />

      {/* Search & Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8"
          />
        </div>
        <select
          className={selectClass}
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="">All Categories</option>
          {MARKET_CONFIG.categories.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
        <div className="flex items-center gap-1 rounded-lg border p-0.5">
          {(['all', 'available', 'unavailable'] as const).map((val) => (
            <button
              key={val}
              onClick={() => setAvailFilter(val)}
              className={cn(
                'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
                availFilter === val
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {val === 'all' ? 'All' : val === 'available' ? 'Available' : 'Unavailable'}
            </button>
          ))}
        </div>
      </div>

      {/* Bulk action bar */}
      {activeSelected.size > 0 && (
        <div className="flex items-center gap-3 rounded-lg border bg-muted/50 px-4 py-2">
          <span className="text-sm font-medium">
            {activeSelected.size} selected
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkAvailability(true)}
              disabled={isPending}
            >
              Mark Available
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkAvailability(false)}
              disabled={isPending}
            >
              Mark Unavailable
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-700"
              onClick={handleBulkDelete}
              disabled={isPending}
            >
              Delete Selected
            </Button>
          </div>
        </div>
      )}

      {/* Product table */}
      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <p className="text-sm text-muted-foreground">
            No products yet. Add your first product to get started.
          </p>
          <Button
            variant="outline"
            className="mt-4"
            render={<Link href="/vendor/products/new" />}
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Add Product
          </Button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <p className="text-sm text-muted-foreground">
            No products match your filters.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto -mx-1">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <input
                    type="checkbox"
                    checked={allVisibleSelected}
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300"
                  />
                </TableHead>
                <TableHead className="w-12"></TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead className="text-center">Qty</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((product) => (
                <TableRow
                  key={product.id}
                  className={cn(
                    activeSelected.has(product.id) && 'bg-muted/50'
                  )}
                >
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selected.has(product.id)}
                      onChange={() => toggleSelect(product.id)}
                      className="rounded border-gray-300"
                    />
                  </TableCell>
                  <TableCell>
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-8 w-8 rounded object-cover"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded bg-muted" />
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell className="font-mono">
                    {formatPrice(product.price)}
                  </TableCell>
                  <TableCell>{product.unit}</TableCell>
                  <TableCell className="text-center font-mono text-sm">
                    {product.quantity}
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                        categoryColor(product.category)
                      )}
                    >
                      {categoryLabel(product.category)}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="inline-flex items-center gap-1.5 text-xs">
                      <span
                        className={cn(
                          'inline-block h-2 w-2 rounded-full',
                          product.isAvailable ? 'bg-green-500' : 'bg-gray-400'
                        )}
                      />
                      {product.isAvailable ? 'Available' : 'Unavailable'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        render={
                          <Link
                            href={`/vendor/products/${product.id}/edit`}
                          />
                        }
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        <span className="sr-only">Edit {product.name}</span>
                      </Button>
                      <VendorProductDeleteButton
                        productId={product.id}
                        productName={product.name}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Hidden file input for CSV import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Import dialog */}
      <VendorProductImportDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        csvText={importCsv}
      />
    </div>
  )
}
