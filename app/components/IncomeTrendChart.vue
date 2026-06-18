<template>
  <div class="trend-chart glass-card animate-in animate-in-delay-4">
    <div class="trend-chart__header">
      <h3 class="trend-chart__title">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
        </svg>
        Income (6 Bulan)
      </h3>
    </div>
    
    <div class="trend-chart__body">
      <svg class="line-chart-svg" viewBox="0 0 600 200" preserveAspectRatio="none">
        <defs>
          <linearGradient id="line-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="rgba(16, 185, 129, 0.5)" />
            <stop offset="100%" stop-color="rgba(16, 185, 129, 0.0)" />
          </linearGradient>
        </defs>
        
        <!-- Grid lines -->
        <line x1="0" y1="40" x2="600" y2="40" stroke="rgba(255,255,255,0.05)" stroke-dasharray="4" />
        <line x1="0" y1="100" x2="600" y2="100" stroke="rgba(255,255,255,0.05)" stroke-dasharray="4" />
        <line x1="0" y1="160" x2="600" y2="160" stroke="rgba(255,255,255,0.1)" />

        <!-- Vertical Drop Lines (dari titik ke bawah) -->
        <g v-for="(pt, idx) in points" :key="'vline-'+idx">
          <line :x1="pt.x" :y1="160" :x2="pt.x" :y2="pt.y" stroke="rgba(16, 185, 129, 0.3)" stroke-dasharray="4 4" stroke-width="1.5" />
        </g>

        <!-- Area Fill -->
        <path :d="areaPath" fill="url(#line-gradient)" />
        
        <!-- Line -->
        <path :d="linePath" fill="none" stroke="#10b981" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="animated-line" />
        
        <!-- Points -->
        <g v-for="(pt, idx) in points" :key="'pt-'+idx">
          <circle :cx="pt.x" :cy="pt.y" r="5" fill="#0a0e1a" stroke="#10b981" stroke-width="2.5" class="data-point" />
        </g>
      </svg>
      
      <!-- Overlay Labels -->
      <div class="chart-overlay">
        <div v-for="(pt, idx) in points" :key="'label-'+idx" class="chart-point-container" :style="{ left: (pt.x / 600 * 100) + '%' }">
          <div class="point-value" :style="{ bottom: ((200 - pt.y) / 200 * 100) + '%' }">
            {{ formatShort(pt.total) }}
          </div>
          <div class="point-label">{{ pt.label }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface TrendDataPoint {
  label: string
  total: number
}

interface Props {
  trendData: TrendDataPoint[]
}

const props = defineProps<Props>()

const maxTotal = computed(() => {
  const max = Math.max(...props.trendData.map(d => d.total))
  return max > 0 ? max : 1
})

// Calculate scaled coordinates for SVG viewBox 600x200
const points = computed(() => {
  const width = 600
  const height = 200
  const paddingX = 30 
  const availableWidth = width - (paddingX * 2)
  const availableHeight = 110 // Space for line variation (160 - 50)
  
  // Prevent division by zero if there's only 1 point
  const stepX = props.trendData.length > 1 ? availableWidth / (props.trendData.length - 1) : 0
  
  return props.trendData.map((d, i) => {
    const x = paddingX + (i * stepX)
    // 160 is the Y baseline
    const y = 160 - ((d.total / maxTotal.value) * availableHeight)
    return {
      x,
      y,
      label: d.label,
      total: d.total
    }
  })
})

const linePath = computed(() => {
  if (points.value.length === 0) return ''
  return points.value.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ')
})

const areaPath = computed(() => {
  if (points.value.length === 0) return ''
  const p = points.value
  const first = p[0]
  const last = p[p.length - 1]
  
  if (!first || !last) return ''

  const start = `M ${first.x} 160`
  const line = p.map(pt => `L ${pt.x} ${pt.y}`).join(' ')
  const end = `L ${last.x} 160 Z`
  return `${start} ${line} ${end}`
})

function formatShort(num: number) {
  if (num === 0) return '0'
  if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'M'
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'jt'
  if (num >= 1_000) return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'k'
  return num.toString()
}
</script>

<style scoped>
.trend-chart {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
}

.trend-chart__header {
  margin-bottom: 1.5rem;
}

.trend-chart__title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.trend-chart__title svg {
  color: #10b981;
}

.trend-chart__body {
  position: relative;
  flex: 1;
  min-height: 220px;
  display: flex;
  align-items: stretch;
}

.line-chart-svg {
  width: 100%;
  height: 100%;
  min-height: 220px;
  overflow: visible;
}

.animated-line {
  stroke-dasharray: 2000;
  stroke-dashoffset: 2000;
  animation: drawLine 1.5s ease-out forwards;
}

@keyframes drawLine {
  to {
    stroke-dashoffset: 0;
  }
}

.data-point {
  transition: r 0.2s, fill 0.2s, stroke-width 0.2s;
  cursor: crosshair;
}

.data-point:hover {
  r: 7;
  fill: #10b981;
  stroke-width: 0;
}

/* HTML Overlay for Text */
.chart-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.chart-point-container {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 60px;
  transform: translateX(-50%); /* Center over the point */
  display: flex;
  flex-direction: column;
  pointer-events: none; 
}

.point-value {
  position: absolute;
  width: 100%;
  text-align: center;
  font-size: 0.75rem;
  color: var(--text-primary);
  font-weight: 600;
  white-space: nowrap;
  transform: translateY(-16px); /* Push up above the point */
  text-shadow: 0 1px 4px rgba(0,0,0,0.8);
}

.point-label {
  position: absolute;
  bottom: 12px; /* Align near bottom */
  width: 100%;
  text-align: center;
  font-size: 0.75rem;
  color: var(--text-muted);
  font-weight: 500;
}
</style>
