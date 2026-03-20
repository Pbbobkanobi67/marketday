'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useRef, useEffect } from 'react'
import { Search, X } from 'lucide-react'

export default function SearchBar({ placeholder = 'Search...' }: { placeholder?: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const inputRef = useRef<HTMLInputElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout>>()

  const currentQuery = searchParams.get('q') || ''

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.value = currentQuery
    }
  }, [currentQuery])

  function updateSearch(term: string) {
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (term) {
        params.set('q', term)
      } else {
        params.delete('q')
      }
      router.push(`${pathname}?${params.toString()}`)
    }, 300)
  }

  function clearSearch() {
    if (inputRef.current) inputRef.current.value = ''
    const params = new URLSearchParams(searchParams.toString())
    params.delete('q')
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="relative flex-1 max-w-sm">
      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
      <input
        ref={inputRef}
        type="text"
        defaultValue={currentQuery}
        onChange={(e) => updateSearch(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-market-stone/40 bg-white pl-8 pr-8 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-market-sage/30"
      />
      {currentQuery && (
        <button
          onClick={clearSearch}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-market-soil transition-colors"
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  )
}
