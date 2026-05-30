<template>
  <div class="dashboard-wrapper">
    <div class="dashboard main-glass-panel">
      <!-- Header -->
    <header class="dashboard__header animate-in">
      <div class="dashboard__header-content">
        <div class="dashboard__brand">
          <div class="dashboard__logo">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="url(#logo-gradient)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <defs>
                <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#10b981"/>
                  <stop offset="100%" stop-color="#6366f1"/>
                </linearGradient>
              </defs>
              <line x1="12" y1="1" x2="12" y2="23"/>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          </div>
          <div>
            <h1 class="dashboard__title">Event Income <span class="text-gradient">Dashboard</span></h1>
            <p class="dashboard__subtitle">Track & monitor income dari event Anda</p>
          </div>
        </div>

        <div class="dashboard__meta">
          <div v-if="lastUpdated" class="dashboard__updated">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            Update: {{ formattedLastUpdated }}
          </div>
          <button class="btn btn--ghost btn--sm" @click="refreshData" :disabled="isLoading" id="refresh-data-btn">
            <svg
              width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
              :class="{ 'spin-animation': isLoading }"
            >
              <polyline points="23 4 23 10 17 10"/>
              <polyline points="1 20 1 14 7 14"/>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
            </svg>
            {{ isLoading ? 'Memuat...' : 'Refresh' }}
          </button>
        </div>
      </div>
    </header>

    <!-- Loading State -->
    <div v-if="isLoading && entries.length === 0" class="dashboard__loading">
      <div class="dashboard__loading-grid">
        <div v-for="i in 3" :key="i" class="skeleton" style="height: 140px; border-radius: var(--radius-lg);"></div>
      </div>
      <div class="dashboard__loading-grid dashboard__loading-grid--3">
        <div v-for="i in 3" :key="i" class="skeleton" style="height: 180px; border-radius: var(--radius-lg);"></div>
      </div>
      <div class="skeleton" style="height: 60px; border-radius: var(--radius-lg);"></div>
      <div class="skeleton" style="height: 300px; border-radius: var(--radius-lg);"></div>
    </div>

    <!-- Error Banner -->
    <div v-if="error" class="dashboard__error glass-card">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <span>{{ error }}</span>
    </div>

    <!-- Dashboard Content -->
    <main v-if="!isLoading || entries.length > 0" class="dashboard__content">

      <!-- Summary Cards -->
      <section class="dashboard__summary" aria-label="Ringkasan Income">
        <SummaryCard
          icon="💰"
          label="Total Income"
          :value="formatCurrency(totalIncome)"
          icon-bg="rgba(16, 185, 129, 0.12)"
          animation-class="animate-in animate-in-delay-1"
        />
        <SummaryCard
          icon="🎯"
          label="Target Income"
          :value="formatCurrency(TARGET_INCOME)"
          :show-progress="true"
          :progress-percent="targetProgress * 100"
          :progress-label="`${formatCurrency(totalIncome)} dari ${formatCurrency(TARGET_INCOME)}`"
          icon-bg="rgba(99, 102, 241, 0.12)"
          animation-class="animate-in animate-in-delay-2"
          variant="tube"
        />
        <SummaryCard
          icon="📊"
          label="Total Transaksi"
          :value="`${totalTransactions}`"
          :subtitle="`Total ${totalTransactions} transaksi tercatat`"
          icon-bg="rgba(245, 158, 11, 0.12)"
          animation-class="animate-in animate-in-delay-3"
        />
      </section>

      <!-- Category Breakdown -->
      <section class="dashboard__categories" aria-label="Breakdown per Kategori">
        <CategoryCard
          v-for="(cat, index) in categorySummaries"
          :key="cat.key"
          :label="cat.label"
          :icon="cat.icon"
          :color="cat.color"
          :total="cat.total"
          :count="cat.count"
          :animation-class="`animate-in animate-in-delay-${index + 1}`"
        />
      </section>

      <!-- Filters -->
      <FilterBar
        v-model:model-category="filters.category"
        v-model:model-date-from="filters.dateFrom"
        v-model:model-date-to="filters.dateTo"
        :result-count="filteredEntries.length"
        @reset="resetFilters"
      />

      <!-- Income Table -->
      <IncomeTable
        :entries="filteredEntries"
        @view-invoice="openInvoice"
      />
    </main>

    <!-- Invoice Modal -->
    <InvoiceModal
      :show="showInvoiceModal"
      :entry="selectedEntry"
      @close="closeInvoice"
    />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useIncomeData, type IncomeEntry } from '~/composables/useIncomeData'
import { formatCurrency } from '~/utils/format'
import { TARGET_INCOME } from '~/utils/config'

// ─── Data ──────────────────────────────────────────────
const {
  entries,
  filteredEntries,
  isLoading,
  error,
  lastUpdated,
  filters,
  totalIncome,
  totalTransactions,
  targetProgress,
  categorySummaries,
  fetchData,
} = useIncomeData()

// ─── Invoice Modal ─────────────────────────────────────
const showInvoiceModal = ref(false)
const selectedEntry = ref<IncomeEntry | null>(null)

function openInvoice(entry: IncomeEntry) {
  selectedEntry.value = entry
  showInvoiceModal.value = true
}

function closeInvoice() {
  showInvoiceModal.value = false
  selectedEntry.value = null
}

// ─── Actions ───────────────────────────────────────────
function resetFilters() {
  filters.value = {
    category: '',
    dateFrom: '',
    dateTo: '',
  }
}

async function refreshData() {
  await fetchData()
}

const formattedLastUpdated = computed(() => {
  if (!lastUpdated.value) return ''
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(lastUpdated.value)
})

// ─── Lifecycle ─────────────────────────────────────────
onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.dashboard-wrapper {
  padding: 2rem 1.5rem 4rem;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.main-glass-panel {
  width: 100%;
  max-width: 1240px;
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 32px;
  padding: 2.5rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255,255,255,0.05) inset;
}

/* ─── Header ─────────────────────────────────────────── */
.dashboard__header {
  margin-bottom: 2rem;
}

.dashboard__header-content {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.dashboard__brand {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.dashboard__logo {
  width: 3rem;
  height: 3rem;
  background: rgba(16, 185, 129, 0.08);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(16, 185, 129, 0.15);
}

.dashboard__title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-on-bg);
  line-height: 1.3;
}

.dashboard__subtitle {
  font-size: 0.8125rem;
  color: var(--text-on-bg-muted);
  margin-top: 0.125rem;
}

.dashboard__meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.dashboard__meta .btn--ghost {
  color: var(--text-on-bg-muted);
  border-color: rgba(255, 255, 255, 0.2);
}

.dashboard__meta .btn--ghost:hover {
  color: var(--text-on-bg);
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.4);
}

.dashboard__updated {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.75rem;
  color: var(--text-on-bg-muted);
  white-space: nowrap;
}

/* ─── Summary Section ────────────────────────────────── */
.dashboard__summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

/* ─── Categories Section ─────────────────────────────── */
.dashboard__categories {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

/* ─── Content ────────────────────────────────────────── */
.dashboard__content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* ─── Error Banner ───────────────────────────────────── */
.dashboard__error {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.875rem 1.25rem;
  margin-bottom: 1.5rem;
  font-size: 0.8125rem;
  color: var(--accent-amber);
  border-color: rgba(245, 158, 11, 0.2);
  background: rgba(245, 158, 11, 0.06);
}

.dashboard__error:hover {
  transform: none;
}

/* ─── Loading State ──────────────────────────────────── */
.dashboard__loading {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.dashboard__loading-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

/* ─── Spin Animation ─────────────────────────────────── */
.spin-animation {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ─── Responsive ─────────────────────────────────────── */
@media (max-width: 1024px) {
  .dashboard__summary,
  .dashboard__categories,
  .dashboard__loading-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .dashboard-wrapper {
    padding: 1rem 0.5rem 2rem;
  }
  .main-glass-panel {
    padding: 1.5rem 1rem;
    border-radius: 20px;
  }

  .dashboard__header-content {
    flex-direction: column;
  }

  .dashboard__title {
    font-size: 1.25rem;
  }

  .dashboard__summary,
  .dashboard__categories,
  .dashboard__loading-grid {
    grid-template-columns: 1fr;
  }
}
</style>
