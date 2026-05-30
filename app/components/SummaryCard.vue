<template>
  <div class="summary-card glass-card" :class="[animationClass, variant === 'tube' ? 'summary-card--tube' : '']">
    <div class="summary-card__header">
      <div class="summary-card__icon-wrapper" :style="{ background: iconBg }">
        <span class="summary-card__icon">{{ icon }}</span>
      </div>
      <span class="summary-card__label">{{ label }}</span>
    </div>

    <div class="summary-card__value">{{ value }}</div>

    <div v-if="subtitle" class="summary-card__subtitle">{{ subtitle }}</div>

    <!-- Optional progress bar -->
    <div v-if="showProgress" class="summary-card__progress">
      <div v-if="variant === 'tube'" class="tube-container">
        <div class="tube-bg">
          <div class="tube-fill" :style="{ width: `${Math.min(progressPercent, 100)}%` }">
            <div class="tube-glow"></div>
          </div>
          <div class="tube-glass-overlay"></div>
        </div>
      </div>
      <div v-else class="progress-bar">
        <div
          class="progress-bar__fill"
          :style="{ width: `${Math.min(progressPercent, 100)}%` }"
        ></div>
      </div>
      <div class="summary-card__progress-label" :class="{ 'tube-label': variant === 'tube' }">
        <span>{{ progressLabel }}</span>
        <span class="summary-card__progress-value">{{ progressPercent.toFixed(1) }}%</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  icon: string
  label: string
  value: string
  subtitle?: string
  showProgress?: boolean
  progressPercent?: number
  progressLabel?: string
  iconBg?: string
  animationClass?: string
  variant?: 'default' | 'tube'
}

withDefaults(defineProps<Props>(), {
  subtitle: '',
  showProgress: false,
  progressPercent: 0,
  progressLabel: '',
  iconBg: 'rgba(16, 185, 129, 0.12)',
  animationClass: '',
  variant: 'default'
})
</script>

<style scoped>
.summary-card {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  position: relative;
  overflow: hidden;
}

.summary-card--tube {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 1) 100%);
  border-top: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
}

.summary-card__header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  z-index: 2;
}

.summary-card__icon-wrapper {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.summary-card__icon {
  font-size: 1.25rem;
}

.summary-card__label {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.summary-card__value {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.2;
  animation: countUp 600ms ease-out both;
  z-index: 2;
}

.summary-card__subtitle {
  font-size: 0.8125rem;
  color: var(--text-muted);
  z-index: 2;
}

.summary-card__progress {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.25rem;
  z-index: 2;
}

/* ─── Tube Styles ──────────────────────────────────────── */
.tube-container {
  width: 100%;
  padding: 0.5rem 0;
}

.tube-bg {
  position: relative;
  width: 100%;
  height: 24px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 12px;
  box-shadow: 
    inset 0 3px 6px rgba(0,0,0,0.1),
    inset 0 -2px 4px rgba(255,255,255,1),
    0 2px 4px rgba(0,0,0,0.02);
  overflow: hidden;
}

.tube-fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: linear-gradient(90deg, #10b981 0%, #14b8a6 50%, #6366f1 100%);
  border-radius: 12px;
  box-shadow: inset 0 -3px 6px rgba(0,0,0,0.3), inset 0 3px 6px rgba(255,255,255,0.4);
  transition: width 1.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  display: flex;
  align-items: center;
  overflow: hidden;
}

.tube-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent);
  animation: tube-shimmer 2.5s infinite linear;
  opacity: 0.6;
}

.tube-glass-overlay {
  position: absolute;
  inset: 0;
  border-radius: 12px;
  background: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0.15) 0%,
    rgba(255, 255, 255, 0.05) 30%,
    transparent 50%,
    rgba(0, 0, 0, 0.1) 80%,
    rgba(255, 255, 255, 0.05) 100%
  );
  pointer-events: none;
}

@keyframes tube-shimmer {
  0% { transform: translateX(-100%) skewX(-15deg); }
  100% { transform: translateX(200%) skewX(-15deg); }
}

/* ─── Default Progress Styles ──────────────────────────── */
.progress-bar {
  position: relative;
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.progress-bar__fill {
  height: 100%;
  border-radius: var(--radius-full);
  background: var(--gradient-progress);
  transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.summary-card__progress-label {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: var(--text-muted);
}

.summary-card__progress-value {
  font-weight: 600;
  color: var(--accent-emerald-light);
}

.tube-label {
  margin-top: 0.25rem;
  color: var(--text-secondary);
}
.tube-label .summary-card__progress-value {
  font-size: 0.875rem;
  color: #fff;
  text-shadow: 0 0 10px rgba(99, 102, 241, 0.5);
}
</style>
