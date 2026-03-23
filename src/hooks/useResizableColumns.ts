'use client'

import { useState, useCallback, useRef } from 'react'

export function useResizableColumns(initialWidths: Record<string, number>) {
  const [widths, setWidths] = useState(initialWidths)
  const startX = useRef(0)
  const startWidth = useRef(0)
  const activeCol = useRef<string | null>(null)

  const onMouseDown = useCallback(
    (col: string, e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      activeCol.current = col
      startX.current = e.clientX
      startWidth.current = widths[col] ?? 100

      const onMouseMove = (ev: MouseEvent) => {
        const delta = ev.clientX - startX.current
        const newWidth = Math.max(40, startWidth.current + delta)
        setWidths((prev) => ({ ...prev, [col]: newWidth }))
      }

      const onMouseUp = () => {
        activeCol.current = null
        document.removeEventListener('mousemove', onMouseMove)
        document.removeEventListener('mouseup', onMouseUp)
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
      }

      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
      document.addEventListener('mousemove', onMouseMove)
      document.addEventListener('mouseup', onMouseUp)
    },
    [widths]
  )

  return { widths, onMouseDown }
}
