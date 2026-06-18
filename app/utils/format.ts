/**
 * Format number as Indonesian Rupiah currency.
 * Example: 1500000 → "Rp 1.500.000"
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Format date string to Indonesian locale.
 * Example: "2026-05-29" → "29 Mei 2026"
 */
export function formatDate(dateStr: string): string {
  if (!dateStr) return '-'

  try {
    // Handle various date formats from Google Sheets
    const date = parseDateString(dateStr)
    if (!date || isNaN(date.getTime())) return dateStr

    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date)
  } catch {
    return dateStr
  }
}

/**
 * Parse various date string formats that may come from Google Sheets.
 */
export function parseDateString(dateStr: string): Date | null {
  // Extract just the date part if there's a time component
  const datePart = dateStr.split(' ')[0] ?? dateStr

  // Try ISO format first (YYYY-MM-DD)
  if (/^\d{4}-\d{2}-\d{2}/.test(datePart)) {
    return new Date(datePart)
  }

  const slashMatch = datePart.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (slashMatch) {
    const [, p1, p2, year] = slashMatch
    const n1 = Number(p1)
    const n2 = Number(p2)

    // Jika format MM/DD/YYYY (misal 6/13/2026)
    if (n2 > 12) {
      return new Date(Number(year), n1 - 1, n2)
    }
    // Jika format DD/MM/YYYY (misal 13/6/2026)
    else if (n1 > 12) {
      return new Date(Number(year), n2 - 1, n1)
    }
    // Jika ambigu (misal 6/10/2026), asumsikan MM/DD/YYYY karena default Google Sheets
    return new Date(Number(year), n1 - 1, n2)
  }

  // Fallback
  return new Date(dateStr)
}

/**
 * Format a number as percentage.
 * Example: 0.75 → "75%"
 */
export function formatPercentage(value: number): string {
  return `${Math.min(Math.round(value * 100), 100)}%`
}

/**
 * Parse nominal string from CSV (remove non-numeric characters).
 * Example: "Rp 1.500.000" → 1500000
 * Example: "1500000" → 1500000
 */
export function parseNominal(value: string | number): number {
  if (!value) return 0
  
  // If it's already a number, return it
  if (typeof value === 'number') return value

  // Remove all characters except digits, dots, commas, and minuses
  let cleaned = String(value).replace(/[^0-9.,-]/g, '')
  
  // Remove trailing dots, commas, or minuses (handles '900.000,-' -> '900.000')
  cleaned = cleaned.replace(/[.,-]+$/, '')
  
  // Remove leading dots or commas (handles 'Rp. 900' -> '.900' -> '900')
  // We keep leading minus for negative numbers
  cleaned = cleaned.replace(/^[.,]+/, '')
  
  const lastCommaIndex = cleaned.lastIndexOf(',')
  const lastDotIndex = cleaned.lastIndexOf('.')
  
  if (lastCommaIndex > -1 && lastDotIndex > -1) {
    if (lastCommaIndex > lastDotIndex) {
      cleaned = cleaned.replace(/\./g, '').replace(',', '.')
    } else {
      cleaned = cleaned.replace(/,/g, '')
    }
  } else if (lastCommaIndex > -1) {
    const parts = cleaned.split(',')
    if (parts.length > 2 || parts[parts.length - 1]!.length === 3) {
      cleaned = cleaned.replace(/,/g, '')
    } else {
      cleaned = cleaned.replace(',', '.')
    }
  } else if (lastDotIndex > -1) {
    const parts = cleaned.split('.')
    if (parts.length > 2 || parts[parts.length - 1]!.length === 3) {
      cleaned = cleaned.replace(/\./g, '')
    }
  }

  let num = Number(cleaned)
  if (isNaN(num)) return 0

  // Otomatis perbaiki masalah lokalisasi Google Sheets.
  // Jika spreadsheet menggunakan locale English, input "900.000" dianggap sebagai
  // 900 (dengan 3 angka desimal 0), sehingga diekspor sebagai 900.
  // Karena ini dashboard income event (target puluhan juta), nilai di bawah 10.000
  // hampir pasti merupakan korban salah baca desimal ini.
  if (num > 0 && num < 10000) {
    // Angka 900 menjadi 900.000, 50 menjadi 50.000, 1.5 menjadi 1.500 (ribu)
    num = num * 1000
  }

  return num
}
