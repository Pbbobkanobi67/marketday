'use client'

import { useState, useMemo } from 'react'
import { ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { formatPrice, categoryLabel, categoryColor, cn } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import ProductRowActions from './ProductRowActions'

type ProductData = {
  id: string
  name: string
  price: number
  unit: string
  category: string
  isAvailable: boolean
  isComingSoon: boolean
}

type VendorGroup = {
  vendorId: string
  vendorName: string
  products: ProductData[]
}

type SortKey = 'name' | 'price' | 'category' | 'vendor'
type SortDir = 'asc' | 'desc'

function statusLabel(p: ProductData) {
  if (p.isComingSoon) return 'Coming Soon'
  if (p.isAvailable) return 'Available'
  return 'Not Available'
}

function statusDotColor(p: ProductData) {
  if (p.isComingSoon) return 'bg-amber-500'
  if (p.isAvailable) return 'bg-green-500'
  return 'bg-gray-400'
}

function SortIcon({ column, activeSort, activeDir }: { column: SortKey; activeSort: SortKey | null; activeDir: SortDir }) {
  if (activeSort !== column) {
    return <ArrowUpDown className="ml-1 inline h-3 w-3 text-muted-foreground/50" />
  }
  return activeDir === 'asc'
    ? <ArrowUp className="ml-1 inline h-3 w-3 text-foreground" />
    : <ArrowDown className="ml-1 inline h-3 w-3 text-foreground" />
}

export default function CollapsibleVendorProducts({ groups }: { groups: VendorGroup[] }) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [sortKey, setSortKey] = useState<SortKey | null>(null)
  const [sortDir, setSortDir] = useState<SortDir>('asc')

  const toggle = (vendorId: string) => {
    setExpanded((prev) => ({ ...prev, [vendorId]: !prev[vendorId] }))
  }

  const expandAll = () => {
    const all: Record<string, boolean> = {}
    groups.forEach((g) => (all[g.vendorId] = true))
    setExpanded(all)
  }

  const collapseAll = () => setExpanded({})

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const sortedGroups = useMemo(() => {
    // Sort vendor groups
    const sorted = [...groups].sort((a, b) => {
      if (sortKey === 'vendor') {
        const cmp = a.vendorName.localeCompare(b.vendorName)
        return sortDir === 'asc' ? cmp : -cmp
      }
      return a.vendorName.localeCompare(b.vendorName)
    })

    // Sort products within each group
    if (sortKey && sortKey !== 'vendor') {
      return sorted.map((g) => ({
        ...g,
        products: [...g.products].sort((a, b) => {
          let cmp = 0
          if (sortKey === 'name') {
            cmp = a.name.localeCompare(b.name)
          } else if (sortKey === 'price') {
            cmp = a.price - b.price
          } else if (sortKey === 'category') {
            cmp = categoryLabel(a.category).localeCompare(categoryLabel(b.category))
          }
          return sortDir === 'asc' ? cmp : -cmp
        }),
      }))
    }

    return sorted
  }, [groups, sortKey, sortDir])

  const thButton = 'flex items-center text-left cursor-pointer select-none hover:text-foreground transition-colors'

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-muted-foreground">Sort by:</span>
          {(['vendor', 'name', 'price', 'category'] as SortKey[]).map((key) => (
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
              {key === 'vendor' ? 'Vendor' : key === 'name' ? 'Name' : key === 'price' ? 'Price' : 'Category'}
              {sortKey === key && (
                sortDir === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
              )}
            </button>
          ))}
          {sortKey && (
            <button
              onClick={() => { setSortKey(null); setSortDir('asc') }}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={expandAll}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Expand all
          </button>
          <span className="text-xs text-muted-foreground">/</span>
          <button
            onClick={collapseAll}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Collapse all
          </button>
        </div>
      </div>

      {sortedGroups.map((group) => {
        const isOpen = expanded[group.vendorId] ?? false
        return (
          <div key={group.vendorId} className="rounded-lg border">
            <button
              onClick={() => toggle(group.vendorId)}
              className="flex w-full items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <ChevronRight
                  className={cn(
                    'h-4 w-4 text-muted-foreground transition-transform duration-200',
                    isOpen && 'rotate-90'
                  )}
                />
                <span className="font-medium">{group.vendorName}</span>
                <span className="text-xs text-muted-foreground">
                  ({group.products.length} product{group.products.length !== 1 ? 's' : ''})
                </span>
              </div>
            </button>

            {isOpen && (
              <div className="overflow-x-auto border-t">
                <Table>
                  <TableHeader>
                    <TableRow>
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
                      <TableHead>
                        <button onClick={() => handleSort('category')} className={thButton}>
                          Category <SortIcon column="category" activeSort={sortKey} activeDir={sortDir} />
                        </button>
                      </TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {group.products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{formatPrice(product.price)}</TableCell>
                        <TableCell className="text-muted-foreground">{product.unit}</TableCell>
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
                          <ProductRowActions
                            productId={product.id}
                            productName={product.name}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
