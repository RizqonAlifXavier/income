<template>
  <div class="category-card glass-card" :class="animationClass">
    <div class="category-card__header">
      <div
        class="category-card__icon-wrapper"
        :style="{ background: `${color}20` }"
      >
        <span class="category-card__icon">{{ icon }}</span>
      </div>
      <div class="category-card__info">
        <h3 class="category-card__title">{{ label }}</h3>
        <span class="category-card__count">{{ count }} transaksi</span>
      </div>
    </div>

    <div class="category-card__amount" :style="{ color }">
      {{ formattedTotal }}
    </div>

    <div class="category-card__footer">
      <div class="category-card__stat">
        <span class="category-card__stat-label">Total Nominal</span>
        <span class="category-card__stat-value" :style="{ color }">{{ formattedTotal }}</span>
      </div>
      <div class="category-card__stat">
        <span class="category-card__stat-label">Transaksi</span>
        <span class="category-card__stat-value">{{ count }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { formatCurrency } from '~/utils/format'

interface Props {
  label: string
  icon: string
  color: string
  total: number
  count: number
  animationClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  animationClass: '',
})

const formattedTotal = computed(() => formatCurrency(props.total))
</script>

<style scoped>
.category-card {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.category-card__header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.category-card__icon-wrapper {
  width: 2.75rem;
  height: 2.75rem;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.category-card__icon {
  font-size: 1.375rem;
}

.category-card__info {
  display: flex;
  flex-direction: column;
}

.category-card__title {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--text-primary);
}

.category-card__count {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.category-card__amount {
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1.2;
  animation: countUp 600ms ease-out both;
}

.category-card__footer {
  display: flex;
  justify-content: space-between;
  padding-top: 0.75rem;
  border-top: 1px solid var(--border-color);
}

.category-card__stat {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.category-card__stat-label {
  font-size: 0.6875rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.category-card__stat-value {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.category-card__bar {
  width: 100%;
  height: 4px;
  background: rgba(0, 0, 0, 0.06);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.category-card__bar-fill {
  height: 100%;
  border-radius: var(--radius-full);
  transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
