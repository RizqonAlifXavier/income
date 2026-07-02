import { ref, computed, type Ref } from 'vue'
import { parseCSV, type ParsedRow } from '~/utils/csv-parser'
import { parseNominal, parseDateString } from '~/utils/format'
import { CSV_URL, COLUMN_NAMES, CATEGORIES, TARGET_INCOME } from '~/utils/config'

// ─── Types ──────────────────────────────────────────────
export interface IncomeEntry {
  id: number
  name: string
  category: string
  nominal: number
  date: string
  periode: string
  invoiceUrl: string
  timestampStr: string
}

export interface CategorySummary {
  key: string
  label: string
  icon: string
  color: string
  gradient: string
  total: number
  count: number
}

export interface Filters {
  category: string
  month: string
}



// ─── Composable ─────────────────────────────────────────
export function useIncomeData() {
  const entries: Ref<IncomeEntry[]> = ref([])
  const isLoading = ref(true)
  const error = ref<string | null>(null)
  const lastUpdated = ref<Date | null>(null)

  const now = new Date()
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  const filters = ref<Filters>({
    category: '',
    month: currentMonthStr,
  })

  // ─── Fetch Data ──────────────────────────────
  async function fetchData() {
    isLoading.value = true
    error.value = null

    try {
      if (!CSV_URL) {
        throw new Error('CSV URL belum dikonfigurasi di config.ts')
      }

      // Prevent caching by appending timestamp
      const fetchUrl = CSV_URL.includes('?') 
        ? `${CSV_URL}&t=${Date.now()}` 
        : `${CSV_URL}?t=${Date.now()}`

      const response = await fetch(fetchUrl, {
        cache: 'no-store',
        headers: {
          'Pragma': 'no-cache',
          'Cache-Control': 'no-cache'
        }
      })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)

      const csvText = await response.text()
      const rows = parseCSV(csvText)

      entries.value = rows.map((row: ParsedRow, index: number) => ({
        id: index + 1,
        name: row[COLUMN_NAMES.name] || '',
        category: row[COLUMN_NAMES.category] || '',
        nominal: parseNominal(row[COLUMN_NAMES.nominal] || '0'),
        date: row[COLUMN_NAMES.date] || row['Timestamp'] || '',
        periode: row[COLUMN_NAMES.periode] || '',
        invoiceUrl: row[COLUMN_NAMES.invoiceUrl] || '',
        timestampStr: row['Timestamp'] || row[COLUMN_NAMES.date] || '',
      }))

      lastUpdated.value = new Date()
    } catch (e: any) {
      error.value = e?.message || 'Gagal mengambil data'
    } finally {
      isLoading.value = false
    }
  }

  // ─── Filtered Data ───────────────────────────
  const filteredEntries = computed(() => {
    let result = entries.value

    // Filter by category
    if (filters.value.category) {
      result = result.filter((e) => e.category === filters.value.category)
    }

    // Filter by month
    if (filters.value.month) {
      const [yearStr = '', monthStr = ''] = filters.value.month.split('-')
      const targetYear = parseInt(yearStr, 10)
      const targetMonth = parseInt(monthStr, 10) - 1 // 0-indexed in JS Date

      result = result.filter((e) => {
        // Filter by Event Date instead of Timestamp
        const entryDate = parseDateString(e.date)
        if (!entryDate || isNaN(entryDate.getTime())) return false
        return entryDate.getFullYear() === targetYear && entryDate.getMonth() === targetMonth
      })
    }

    return result
  })

  // ─── Summary Computations ────────────────────
  const totalIncome = computed(() =>
    filteredEntries.value.reduce((sum, e) => sum + e.nominal, 0)
  )

  const totalTransactions = computed(() => filteredEntries.value.length)

  const targetProgress = computed(() => {
    if (TARGET_INCOME <= 0) return 0
    return totalIncome.value / TARGET_INCOME
  })

  // ─── Category Summaries ──────────────────────
  const categorySummaries = computed<CategorySummary[]>(() =>
    CATEGORIES.map((cat) => {
      const categoryEntries = filteredEntries.value.filter(
        (e) => e.category === cat.key
      )

      return {
        key: cat.key,
        label: cat.label,
        icon: cat.icon,
        color: cat.color,
        gradient: cat.gradient,
        total: categoryEntries.reduce((sum, e) => sum + e.nominal, 0),
        count: categoryEntries.length,
      }
    })
  )

  // ─── Trend Data (Last 6 Months) ──────────────
  const trendData = computed(() => {
    let targetYear: number
    let targetMonth: number

    // Jika filter bulan aktif, gunakan bulan tersebut. Jika tidak, gunakan bulan saat ini.
    if (filters.value.month) {
      const [yearStr = '', monthStr = ''] = filters.value.month.split('-')
      targetYear = parseInt(yearStr, 10)
      targetMonth = parseInt(monthStr, 10) - 1
    } else {
      const now = new Date()
      targetYear = now.getFullYear()
      targetMonth = now.getMonth()
    }

    // Inisialisasi array 6 bulan ke belakang
    const months: { year: number; month: number; label: string; total: number }[] = []
    
    for (let i = 5; i >= 0; i--) {
      let m = targetMonth - i
      let y = targetYear
      if (m < 0) {
        m += 12
        y -= 1
      }
      
      const date = new Date(y, m, 1)
      const label = new Intl.DateTimeFormat('id-ID', { month: 'short' }).format(date)
      
      months.push({ year: y, month: m, label, total: 0 })
    }

    // Gunakan seluruh entri data (tidak difilter berdasar bulan)
    // tetapi tetap pertimbangkan filter kategori jika ada.
    let baseEntries = entries.value
    if (filters.value.category) {
      baseEntries = baseEntries.filter(e => e.category === filters.value.category)
    }

    baseEntries.forEach(e => {
      // Use Event Date for trend
      const entryDate = parseDateString(e.date)
      if (!entryDate || isNaN(entryDate.getTime())) return
      
      const ey = entryDate.getFullYear()
      const em = entryDate.getMonth()
      
      const match = months.find(m => m.year === ey && m.month === em)
      if (match) {
        match.total += e.nominal
      }
    })

    return months.map(m => ({
      label: m.label,
      total: m.total
    }))
  })

  return {
    // State
    entries,
    filteredEntries,
    isLoading,
    error,
    lastUpdated,
    filters,

    // Computed
    totalIncome,
    totalTransactions,
    targetProgress,
    categorySummaries,
    trendData,

    // Actions
    fetchData,
  }
}
