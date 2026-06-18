<template>
  <div class="filter-bar glass-card animate-in animate-in-delay-3">
    <div class="filter-bar__inner">
      <div class="filter-bar__group">
        <label for="filter-category" class="form-label">Kategori</label>
        <select
          id="filter-category"
          class="form-select"
          :value="modelCategory"
          @change="$emit('update:modelCategory', ($event.target as HTMLSelectElement).value)"
        >
          <option value="">Semua Kategori</option>
          <option v-for="cat in CATEGORIES" :key="cat.key" :value="cat.key">
            {{ cat.icon }} {{ cat.label }}
          </option>
        </select>
      </div>

      <div class="filter-bar__group">
        <label for="filter-month" class="form-label">Bulan</label>
        <input
          id="filter-month"
          type="month"
          class="form-input"
          :value="modelMonth"
          @input="$emit('update:modelMonth', ($event.target as HTMLInputElement).value)"
        />
      </div>

      <div class="filter-bar__actions">
        <button
          v-if="hasActiveFilters"
          class="btn btn--ghost btn--sm"
          @click="$emit('reset')"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
          Reset
        </button>
      </div>
    </div>

    <div v-if="resultCount !== undefined" class="filter-bar__results">
      Menampilkan <strong>{{ resultCount }}</strong> transaksi
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { CATEGORIES } from '~/utils/config'

interface Props {
  modelCategory: string
  modelMonth: string
  resultCount?: number
}

const props = defineProps<Props>()

defineEmits<{
  'update:modelCategory': [value: string]
  'update:modelMonth': [value: string]
  reset: []
}>()

const hasActiveFilters = computed(
  () => props.modelCategory || props.modelMonth
)
</script>

<style scoped>
.filter-bar {
  padding: 1.25rem;
}

.filter-bar__inner {
  display: flex;
  gap: 1rem;
  align-items: flex-end;
  flex-wrap: wrap;
}

.filter-bar__group {
  flex: 1;
  min-width: 180px;
}

.filter-bar__actions {
  display: flex;
  align-items: flex-end;
  padding-bottom: 2px;
}

.filter-bar__results {
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--border-color);
  font-size: 0.8125rem;
  color: var(--text-muted);
}

.filter-bar__results strong {
  color: var(--text-primary);
  font-weight: 600;
}

@media (max-width: 640px) {
  .filter-bar__inner {
    flex-direction: column;
  }

  .filter-bar__group {
    min-width: 100%;
  }
}
</style>
