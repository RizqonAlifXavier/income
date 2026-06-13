<template>
  <div class="income-table-wrapper glass-card animate-in animate-in-delay-4">
    <div class="income-table__header">
      <h2 class="income-table__title">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10 9 9 9 8 9"/>
        </svg>
        Data Transaksi
      </h2>
      <span class="income-table__count">{{ entries.length }} record</span>
    </div>

    <!-- Empty State -->
    <div v-if="entries.length === 0" class="income-table__empty">
      <div class="income-table__empty-icon">📭</div>
      <p>Tidak ada data yang sesuai filter</p>
    </div>

    <!-- Table -->
    <div v-else class="income-table__scroll">
      <table class="data-table" id="income-data-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Nama Event/Tenant</th>
            <th>Kategori</th>
            <th>Periode</th>
            <th>Nominal</th>
            <th>Tanggal Input</th>
            <th>Invoice</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(entry, index) in entries" :key="entry.id">
            <td class="income-table__num">{{ index + 1 }}</td>
            <td class="income-table__name">{{ entry.name }}</td>
            <td>
              <span :class="getCategoryBadgeClass(entry.category)" class="badge">
                {{ getCategoryIcon(entry.category) }} {{ entry.category }}
              </span>
            </td>
            <td class="income-table__periode">{{ entry.periode || '-' }}</td>
            <td class="income-table__nominal">{{ formatCurrency(entry.nominal) }}</td>
            <td class="income-table__date">{{ formatDate(entry.date) }}</td>
            <td>
              <button
                v-if="entry.invoiceUrl"
                class="btn btn--ghost btn--sm"
                @click="$emit('viewInvoice', entry)"
                :id="`view-invoice-${entry.id}`"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                Lihat
              </button>
              <span v-else class="income-table__no-invoice">—</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IncomeEntry } from '~/composables/useIncomeData'
import { formatCurrency, formatDate } from '~/utils/format'
import { CATEGORIES } from '~/utils/config'

interface Props {
  entries: IncomeEntry[]
}

defineProps<Props>()

defineEmits<{
  viewInvoice: [entry: IncomeEntry]
}>()

function getCategoryBadgeClass(category: string): string {
  if (category === 'Sewa') return 'badge--sewa'
  if (category === 'Revenue Sharing Bazaar') return 'badge--bazaar'
  if (category === 'Revenue Sharing Event') return 'badge--event'
  if (category === 'Revenue Sharing Island') return 'badge--island'
  return ''
}

function getCategoryIcon(category: string): string {
  const cat = CATEGORIES.find((c) => c.key === category)
  return cat?.icon ?? '📋'
}
</script>

<style scoped>
.income-table-wrapper {
  overflow: hidden;
}

.income-table__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.income-table__title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.income-table__title svg {
  color: var(--text-muted);
}

.income-table__count {
  font-size: 0.75rem;
  color: var(--text-muted);
  background: rgba(0, 0, 0, 0.05);
  padding: 0.25rem 0.625rem;
  border-radius: var(--radius-full);
}

.income-table__scroll {
  overflow-x: auto;
}

.income-table__num {
  font-size: 0.75rem;
  color: var(--text-muted);
  font-weight: 500;
  width: 3rem;
}

.income-table__name {
  font-weight: 500;
  color: var(--text-primary) !important;
  min-width: 200px;
}

.income-table__nominal {
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--text-primary) !important;
  white-space: nowrap;
}

.income-table__date {
  white-space: nowrap;
}

.income-table__no-invoice {
  color: var(--text-muted);
  font-size: 0.875rem;
}

.income-table__empty {
  padding: 3rem 1.5rem;
  text-align: center;
  color: var(--text-muted);
}

.income-table__empty-icon {
  font-size: 2.5rem;
  margin-bottom: 0.75rem;
}

</style>
