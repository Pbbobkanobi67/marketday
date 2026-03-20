/**
 * CSV generation and parsing utilities.
 * Handles proper escaping for Excel compatibility.
 */

export function generateCSV(
  headers: string[],
  rows: string[][]
): string {
  const escape = (val: string): string => {
    if (val.includes(',') || val.includes('"') || val.includes('\n') || val.includes('\r')) {
      return `"${val.replace(/"/g, '""')}"`
    }
    return val
  }

  const lines = [
    headers.map(escape).join(','),
    ...rows.map((row) => row.map(escape).join(',')),
  ]

  return lines.join('\r\n') + '\r\n'
}

export function parseCSV(text: string): { headers: string[]; rows: string[][] } {
  // Strip BOM
  const cleaned = text.replace(/^\uFEFF/, '')

  const rows: string[][] = []
  let current: string[] = []
  let field = ''
  let inQuotes = false
  let i = 0

  while (i < cleaned.length) {
    const ch = cleaned[i]

    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < cleaned.length && cleaned[i + 1] === '"') {
          field += '"'
          i += 2
        } else {
          inQuotes = false
          i++
        }
      } else {
        field += ch
        i++
      }
    } else {
      if (ch === '"') {
        inQuotes = true
        i++
      } else if (ch === ',') {
        current.push(field.trim())
        field = ''
        i++
      } else if (ch === '\r' && i + 1 < cleaned.length && cleaned[i + 1] === '\n') {
        current.push(field.trim())
        field = ''
        rows.push(current)
        current = []
        i += 2
      } else if (ch === '\n') {
        current.push(field.trim())
        field = ''
        rows.push(current)
        current = []
        i++
      } else {
        field += ch
        i++
      }
    }
  }

  // Last field/row
  if (field || current.length > 0) {
    current.push(field.trim())
    rows.push(current)
  }

  // Filter out empty trailing rows
  while (rows.length > 0 && rows[rows.length - 1].every((c) => c === '')) {
    rows.pop()
  }

  const headers = rows.length > 0 ? rows[0] : []
  return { headers, rows: rows.slice(1) }
}
