/**
 * Simple CSV parser — handles quoted fields, commas in quotes, etc.
 * No external dependencies needed.
 */

export interface ParsedRow {
  [key: string]: string
}

/**
 * Parse a CSV string into an array of objects.
 * The first row is treated as headers.
 */
export function parseCSV(csvText: string): ParsedRow[] {
  const lines = splitCSVLines(csvText)
  if (lines.length < 2) return []

  const headers = parseCSVLine(lines[0] || '').map((h) => h.trim())
  const rows: ParsedRow[] = []

  for (let i = 1; i < lines.length; i++) {
    const line = (lines[i] || '').trim()
    if (!line) continue

    const values = parseCSVLine(line)
    const row: ParsedRow = {}

    headers.forEach((header, index) => {
      row[header] = values[index]?.trim() ?? ''
    })

    rows.push(row)
  }

  return rows
}

/**
 * Split CSV text into lines, respecting quoted fields that may contain newlines.
 */
function splitCSVLines(text: string): string[] {
  const lines: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < text.length; i++) {
    const char = text[i]

    if (char === '"') {
      inQuotes = !inQuotes
      current += char
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && text[i + 1] === '\n') {
        i++ // Skip \n after \r
      }
      lines.push(current)
      current = ''
    } else {
      current += char
    }
  }

  if (current) {
    lines.push(current)
  }

  return lines
}

/**
 * Parse a single CSV line into an array of field values.
 */
function parseCSVLine(line: string): string[] {
  const fields: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped quote
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      fields.push(current)
      current = ''
    } else {
      current += char
    }
  }

  fields.push(current)
  return fields
}
