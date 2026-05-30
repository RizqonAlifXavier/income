import { ref, computed, type Ref } from 'vue'
import { parseCSV, type ParsedRow } from '~/utils/csv-parser'
import { parseNominal } from '~/utils/format'
import { CSV_URL, COLUMN_NAMES, CATEGORIES, TARGET_INCOME } from '~/utils/config'

// ─── Types ──────────────────────────────────────────────
export interface IncomeEntry {
  id: number
  name: string
  category: string
  nominal: number
  date: string
  invoiceUrl: string
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
  dateFrom: string
  dateTo: string
}



// ─── Composable ─────────────────────────────────────────
export function useIncomeData() {
  const entries: Ref<IncomeEntry[]> = ref([])
  const isLoading = ref(true)
  const error = ref<string | null>(null)
  const lastUpdated = ref<Date | null>(null)

  const filters = ref<Filters>({
    category: '',
    dateFrom: '',
    dateTo: '',
  })

  // ─── Fetch Data ──────────────────────────────
  async function fetchData() {
    isLoading.value = true
    error.value = null

    try {
      if (!CSV_URL) {
        throw new Error('CSV URL belum dikonfigurasi di config.ts')
      }

      const response = await fetch(CSV_URL)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)

      const csvText = await response.text()
      const rows = parseCSV(csvText)

      entries.value = rows.map((row: ParsedRow, index: number) => ({
        id: index + 1,
        name: row[COLUMN_NAMES.name] || '',
        category: row[COLUMN_NAMES.category] || '',
        nominal: parseNominal(row[COLUMN_NAMES.nominal] || '0'),
        date: row[COLUMN_NAMES.date] || '',
        invoiceUrl: row[COLUMN_NAMES.invoiceUrl] || '',
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

    // Filter by date range
    if (filters.value.dateFrom) {
      const from = new Date(filters.value.dateFrom)
      result = result.filter((e) => {
        const entryDate = new Date(e.date)
        return entryDate >= from
      })
    }

    if (filters.value.dateTo) {
      const to = new Date(filters.value.dateTo)
      to.setHours(23, 59, 59, 999)
      result = result.filter((e) => {
        const entryDate = new Date(e.date)
        return entryDate <= to
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

    // Actions
    fetchData,
  }
}
