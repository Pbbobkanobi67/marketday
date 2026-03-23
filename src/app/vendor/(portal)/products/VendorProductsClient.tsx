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
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
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
  isComingSoon: boolean
  vendorId: string
  createdAt: string
  updatedAt: string
}

const CSV_HEADERS = ['name', 'description', 'price', 'unit', 'category', 'quantity', 'available', 'image_url']

const TEMPLATE_ROWS = [
  ['Organic Heirloom Tomatoes', 'Vine-ripened heirloom tomatoes, locally grown', '4.50', 'lb', 'certified_farmer', '20', 'yes', 'https://example.com/tomatoes.jpg'],
  ['Sourdough Bread', 'Fresh baked sourdough loaf', '8.00', 'loaf', 'baked', '10', 'yes', ''],
]

type StatusFilter = 'all' | 'available' | 'unavailable' | 'coming_soon'
type SortKey = 'name' | 'price' | 'category' | 'status'
type SortDir = 'asc' | 'desc'

function statusLabel(p: SerializedProduct) {
  if (p.isComingSoon) return 'Coming Soon'
  if (p.isAvailable) return 'Available'
  return 'Not Available'
}

function statusDotColor(p: SerializedProduct) {
  if (p.isComingSoon) return 'bg-amber-500'
  if (p.isAvailable) return 'bg-green-500'
  return 'bg-gray-400'
}

function statusRank(p: SerializedProduct) {
  if (p.isAvailable) return 0
  if (p.isComingSoon) return 1
  return 2
}

function SortIcon({ column, activeSort, activeDir }: { column: SortKey; activeSort: SortKey | null; activeDir: SortDir }) {
  if (activeSort !== column) {
    return <ArrowUpDown className="ml-1 inline h-3 w-3 text-muted-foreground/50" />
  }
  return activeDir === 'asc'
    ? <ArrowUp className="ml-1 inline h-3 w-3 text-foreground" />
    : <ArrowDown className="ml-1 inline h-3 w-3 text-foreground" />
}

export function VendorProductsClient({
  products,
}: {
  products: SerializedProduct[]
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [sortKey, setSortKey] = useState<SortKey | null>(null)
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [importOpen, setImportOpen] = useState(false)
  const [importCsv, setImportCsv] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false
      if (categoryFilter && p.category !== categoryFilter) return false
      if (statusFilter === 'available' && !p.isAvailable) return false
      if (statusFilter === 'unavailable' && (p.isAvailable || p.isComingSoon)) return false
      if (statusFilter === 'coming_soon' && !p.isComingSoon) return false
      return true
    })
  }, [products, search, categoryFilter, statusFilter])

  const sorted = useMemo(() => {
    if (!sortKey) return filtered
    return [...filtered].sort((a, b) => {
      let cmp = 0
      if (sortKey === 'name') cmp = a.name.localeCompare(b.name)
      else if (sortKey === 'price') cmp = a.price - b.price
      else if (sortKey === 'category') cmp = categoryLabel(a.category).localeCompare(categoryLabel(b.category))
      else if (sortKey === 'status') cmp = statusRank(a) - statusRank(b)
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [filtered, sortKey, sortDir])

  const filteredIds = useMemo(() => new Set(sorted.map((p) => p.id)), [sorted])

  // Only keep selected items that are visible
  const activeSelected = useMemo(
    () => new Set(Array.from(selected).filter((id) => filteredIds.has(id))),
    [selected, filteredIds]
  )

  const allVisibleSelected =
    sorted.length > 0 && sorted.every((p) => selected.has(p.id))

  function toggleSelectAll() {
    if (allVisibleSelected) {
      setSelected((prev) => {
        const next = new Set(prev)
        sorted.forEach((p) => next.delete(p.id))
        return next
      })
    } else {
      setSelected((prev) => {
        const next = new Set(prev)
        sorted.forEach((p) => next.add(p.id))
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
      p.isComingSoon ? 'coming_soon' : p.isAvailable ? 'yes' : 'no',
      p.imageUrl || '',
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

  const thButton = 'flex items-center text-left cursor-pointer select-none hover:text-foreground transition-colors'

  const statusOptions: { value: StatusFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'available', label: 'Available' },
    { value: 'unavailable', label: 'Not Available' },
    { value: 'coming_soon', label: 'Coming Soon' },
  ]

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
          {statusOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              className={cn(
                'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
                statusFilter === opt.value
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sort pills */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-medium text-muted-foreground">Sort by:</span>
        {(['name', 'price', 'category', 'status'] as SortKey[]).map((key) => {
          const labels: Record<SortKey, string> = { name: 'Name', price: 'Price', category: 'Category', status: 'Status' }
          return (
            <button
              key={key}
              onClick={() => handleSort(key)}
              className={cn(
                'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors',
                sortKey === key
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              )}
            >
              {labels[key]}
              {sortKey === key && (
                sortDir === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
              )}
            </button>
          )
        })}
        {sortKey && (
          <button
            onClick={() => { setSortKey(null); setSortDir('asc') }}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Clear
          </button>
        )}
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
      ) : sorted.length === 0 ? (
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
                <TableHead>
                  <button onClick={() => handleSort('name')} className={thButton}>
                    Name <SortIcon column="name" activeSort={sortKey} activeDir={sortDir} />
                  </button>
                </TableHead>
                <TableHead>
                  <button onClick={() => handleSort('price')} className={thButton}>
                    Price <SortIcon column="price" activeSort={sortKey} activeDir={sortDir} />
                  </button>
                </TableHead>
                <TableHead>Unit</TableHead>
                <TableHead className="text-center">Qty</TableHead>
                <TableHead>
                  <button onClick={() => handleSort('category')} className={thButton}>
                    Category <SortIcon column="category" activeSort={sortKey} activeDir={sortDir} />
                  </button>
                </TableHead>
                <TableHead className="text-center">
                  <button onClick={() => handleSort('status')} className={cn(thButton, 'justify-center w-full')}>
                    Status <SortIcon column="status" activeSort={sortKey} activeDir={sortDir} />
                  </button>
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((product) => (
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
                          statusDotColor(product)
                        )}
                      />
                      {statusLabel(product)}
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
