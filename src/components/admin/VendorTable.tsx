'use client'

import { useState, useMemo } from 'react'
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { categoryLabel, categoryColor, vendorTypeLabel, vendorTypeColor, cn } from '@/lib/utils'
import { AlertCircle } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useResizableColumns } from '@/hooks/useResizableColumns'
import VendorRowActions from './VendorRowActions'

type VendorData = {
  id: string
  name: string
  slug: string
  category: string
  vendorType: string
  productCount: number
  onlineOrdersEnabled: boolean
  isActive: boolean
  needsReview: boolean
}

type SortKey = 'name' | 'category' | 'type' | 'products' | 'online' | 'status'
type SortDir = 'asc' | 'desc'

const COL_WIDTHS = {
  name: 220,
  category: 140,
  type: 140,
  products: 90,
  online: 80,
  status: 90,
  actions: 100,
}

function SortIcon({ column, activeSort, activeDir }: { column: SortKey; activeSort: SortKey | null; activeDir: SortDir }) {
  if (activeSort !== column) {
    return <ArrowUpDown className="ml-1 inline h-3 w-3 text-muted-foreground/50" />
  }
  return activeDir === 'asc'
    ? <ArrowUp className="ml-1 inline h-3 w-3 text-foreground" />
    : <ArrowDown className="ml-1 inline h-3 w-3 text-foreground" />
}

function ResizeHandle({ col, onMouseDown }: { col: string; onMouseDown: (col: string, e: React.MouseEvent) => void }) {
  return (
    <div
      onMouseDown={(e) => onMouseDown(col, e)}
      className="absolute right-0 top-0 bottom-0 w-1.5 cursor-col-resize group hover:bg-primary/20 active:bg-primary/40"
    >
      <div className="absolute right-0 top-1/2 -translate-y-1/2 h-4 w-px bg-border group-hover:bg-primary/60" />
    </div>
  )
}

export default function VendorTable({ vendors }: { vendors: VendorData[] }) {
  const [sortKey, setSortKey] = useState<SortKey | null>(null)
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const { widths, onMouseDown } = useResizableColumns(COL_WIDTHS)

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const sorted = useMemo(() => {
    if (!sortKey) return vendors
    return [...vendors].sort((a, b) => {
      let cmp = 0
      if (sortKey === 'name') cmp = a.name.localeCompare(b.name)
      else if (sortKey === 'category') cmp = categoryLabel(a.category).localeCompare(categoryLabel(b.category))
      else if (sortKey === 'type') cmp = vendorTypeLabel(a.vendorType).localeCompare(vendorTypeLabel(b.vendorType))
      else if (sortKey === 'products') cmp = a.productCount - b.productCount
      else if (sortKey === 'online') cmp = (a.onlineOrdersEnabled ? 0 : 1) - (b.onlineOrdersEnabled ? 0 : 1)
      else if (sortKey === 'status') cmp = (a.isActive ? 0 : 1) - (b.isActive ? 0 : 1)
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [vendors, sortKey, sortDir])

  const thButton = 'flex items-center text-left cursor-pointer select-none hover:text-foreground transition-colors'

  return (
    <div className="space-y-3">
      {/* Sort bar */}
      <div className="flex items-center gap-3 rounded-lg border bg-muted/30 px-4 py-2.5">
        <span className="text-sm font-semibold text-foreground w-20 shrink-0">Sort by</span>
        {(['name', 'category', 'type', 'products', 'online', 'status'] as SortKey[]).map((key) => {
          const labels: Record<SortKey, string> = { name: 'Name', category: 'Category', type: 'Type', products: 'Products', online: 'Online', status: 'Status' }
          return (
            <button
              key={key}
              onClick={() => handleSort(key)}
              className={cn(
                'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors',
                sortKey === key
                  ? 'bg-market-sage text-white'
                  : 'bg-market-warm text-market-soil hover:bg-market-stone/30'
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

      {/* Table */}
      <div className="overflow-x-auto -mx-1">
        <Table className="table-fixed">
          <TableHeader>
            <TableRow>
              <TableHead className="relative overflow-visible" style={{ width: widths.name }}>
                <button onClick={() => handleSort('name')} className={thButton}>
                  Name <SortIcon column="name" activeSort={sortKey} activeDir={sortDir} />
                </button>
                <ResizeHandle col="name" onMouseDown={onMouseDown} />
              </TableHead>
              <TableHead className="relative overflow-visible" style={{ width: widths.category }}>
                <button onClick={() => handleSort('category')} className={thButton}>
                  Category <SortIcon column="category" activeSort={sortKey} activeDir={sortDir} />
                </button>
                <ResizeHandle col="category" onMouseDown={onMouseDown} />
              </TableHead>
              <TableHead className="relative overflow-visible" style={{ width: widths.type }}>
                <button onClick={() => handleSort('type')} className={thButton}>
                  Vendor Type <SortIcon column="type" activeSort={sortKey} activeDir={sortDir} />
                </button>
                <ResizeHandle col="type" onMouseDown={onMouseDown} />
              </TableHead>
              <TableHead className="relative overflow-visible text-center" style={{ width: widths.products }}>
                <button onClick={() => handleSort('products')} className={cn(thButton, 'justify-center w-full')}>
                  Products <SortIcon column="products" activeSort={sortKey} activeDir={sortDir} />
                </button>
                <ResizeHandle col="products" onMouseDown={onMouseDown} />
              </TableHead>
              <TableHead className="relative overflow-visible text-center" style={{ width: widths.online }}>
                <button onClick={() => handleSort('online')} className={cn(thButton, 'justify-center w-full')}>
                  Online <SortIcon column="online" activeSort={sortKey} activeDir={sortDir} />
                </button>
                <ResizeHandle col="online" onMouseDown={onMouseDown} />
              </TableHead>
              <TableHead className="relative overflow-visible text-center" style={{ width: widths.status }}>
                <button onClick={() => handleSort('status')} className={cn(thButton, 'justify-center w-full')}>
                  Status <SortIcon column="status" activeSort={sortKey} activeDir={sortDir} />
                </button>
                <ResizeHandle col="status" onMouseDown={onMouseDown} />
              </TableHead>
              <TableHead className="text-right" style={{ width: widths.actions }}>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((vendor) => (
              <TableRow key={vendor.id}>
                <TableCell className="font-medium truncate" style={{ width: widths.name }}>
                  <span className="flex items-center gap-1.5">
                    {vendor.name}
                    {vendor.needsReview && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                        <AlertCircle className="h-3 w-3" />
                        Review
                      </span>
                    )}
                  </span>
                </TableCell>
                <TableCell style={{ width: widths.category }}>
                  <span
                    className={cn(
                      'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                      categoryColor(vendor.category)
                    )}
                  >
                    {categoryLabel(vendor.category)}
                  </span>
                </TableCell>
                <TableCell style={{ width: widths.type }}>
                  <span
                    className={cn(
                      'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                      vendorTypeColor(vendor.vendorType)
                    )}
                  >
                    {vendorTypeLabel(vendor.vendorType)}
                  </span>
                </TableCell>
                <TableCell className="text-center" style={{ width: widths.products }}>
                  {vendor.productCount}
                </TableCell>
                <TableCell className="text-center" style={{ width: widths.online }}>
                  <span className="inline-flex items-center gap-1.5 text-xs">
                    <span
                      className={cn(
                        'inline-block h-2 w-2 rounded-full',
                        vendor.onlineOrdersEnabled ? 'bg-blue-500' : 'bg-gray-400'
                      )}
                    />
                    {vendor.onlineOrdersEnabled ? 'Yes' : 'No'}
                  </span>
                </TableCell>
                <TableCell className="text-center" style={{ width: widths.status }}>
                  <span className="inline-flex items-center gap-1.5 text-xs">
                    <span
                      className={cn(
                        'inline-block h-2 w-2 rounded-full',
                        vendor.isActive ? 'bg-green-500' : 'bg-gray-400'
                      )}
                    />
                    {vendor.isActive ? 'Active' : 'Inactive'}
                  </span>
                </TableCell>
                <TableCell className="text-right" style={{ width: widths.actions }}>
                  <VendorRowActions
                    vendorId={vendor.id}
                    vendorName={vendor.name}
                    vendorSlug={vendor.slug}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
