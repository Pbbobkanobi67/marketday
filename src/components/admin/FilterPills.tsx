'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

type FilterPillsProps = {
  paramName: string
  options: { value: string; label: string }[]
  allLabel?: string
}

export default function FilterPills({
  paramName,
  options,
  allLabel = 'All',
}: FilterPillsProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const current = searchParams.get(paramName) || ''

  function setFilter(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(paramName, value)
    } else {
      params.delete(paramName)
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      <button
        onClick={() => setFilter('')}
        className={cn(
          'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors',
          !current
            ? 'bg-market-sage text-white'
            : 'bg-market-warm text-market-soil hover:bg-market-stone/30'
        )}
      >
        {allLabel}
      </button>
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => setFilter(opt.value)}
          className={cn(
            'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors',
            current === opt.value
              ? 'bg-market-sage text-white'
              : 'bg-market-warm text-market-soil hover:bg-market-stone/30'
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
