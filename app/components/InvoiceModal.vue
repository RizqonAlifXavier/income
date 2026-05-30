<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="modal-overlay"
      @click.self="$emit('close')"
      id="invoice-modal-overlay"
    >
      <div class="modal-content invoice-modal">
        <!-- Header -->
        <div class="invoice-modal__header">
          <div class="invoice-modal__header-info">
            <h3 class="invoice-modal__title">Bukti Pembayaran</h3>
            <p class="invoice-modal__subtitle" v-if="entry">{{ entry.name }}</p>
          </div>
          <button
            class="btn btn--ghost btn--icon"
            @click="$emit('close')"
            id="invoice-modal-close"
            aria-label="Tutup"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <!-- Entry Details -->
        <div v-if="entry" class="invoice-modal__details">
          <div class="invoice-modal__detail">
            <span class="invoice-modal__detail-label">Kategori</span>
            <span :class="getCategoryBadgeClass(entry.category)" class="badge">
              {{ entry.category }}
            </span>
          </div>
          <div class="invoice-modal__detail">
            <span class="invoice-modal__detail-label">Nominal</span>
            <span class="invoice-modal__detail-value">{{ formatCurrency(entry.nominal) }}</span>
          </div>
          <div class="invoice-modal__detail">
            <span class="invoice-modal__detail-label">Tanggal</span>
            <span class="invoice-modal__detail-value">{{ formatDate(entry.date) }}</span>
          </div>
        </div>

        <!-- Invoice Preview -->
        <div class="invoice-modal__preview">
          <div v-if="embedUrl" class="invoice-modal__image-wrap">
            <img
              :src="embedUrl"
              :alt="`Bukti bayar ${entry?.name}`"
              class="invoice-modal__image"
              @error="imageError = true"
              @load="imageLoaded = true"
            />
            <div v-if="!imageLoaded && !imageError" class="invoice-modal__loading">
              <div class="invoice-modal__spinner"></div>
              <p>Memuat gambar...</p>
            </div>
            <div v-if="imageError" class="invoice-modal__error">
              <p>⚠️ Gambar tidak dapat dimuat</p>
              <a :href="entry?.invoiceUrl" target="_blank" rel="noopener" class="btn btn--primary btn--sm">
                Buka di Google Drive
              </a>
            </div>
          </div>
          <div v-else class="invoice-modal__no-preview">
            <p>Preview tidak tersedia</p>
            <a
              v-if="entry?.invoiceUrl"
              :href="entry.invoiceUrl"
              target="_blank"
              rel="noopener"
              class="btn btn--primary btn--sm"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                <polyline points="15 3 21 3 21 9"/>
                <line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
              Buka di Google Drive
            </a>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { IncomeEntry } from '~/composables/useIncomeData'
import { formatCurrency, formatDate } from '~/utils/format'

interface Props {
  show: boolean
  entry: IncomeEntry | null
}

const props = defineProps<Props>()

defineEmits<{
  close: []
}>()

const imageError = ref(false)
const imageLoaded = ref(false)

// Reset states when entry changes
watch(() => props.entry, () => {
  imageError.value = false
  imageLoaded.value = false
})

/**
 * Convert Google Drive share link to embeddable image URL.
 * Supports formats:
 * - https://drive.google.com/file/d/FILE_ID/view
 * - https://drive.google.com/open?id=FILE_ID
 */
const embedUrl = computed(() => {
  if (!props.entry?.invoiceUrl) return ''

  const url = props.entry.invoiceUrl

  // Extract file ID from various Google Drive URL formats
  let fileId = ''

  const match1 = url.match(/\/file\/d\/([^/]+)/)
  if (match1 && match1[1]) fileId = match1[1]

  const match2 = url.match(/[?&]id=([^&]+)/)
  if (match2 && match2[1]) fileId = match2[1]

  if (fileId) {
    return `https://drive.google.com/uc?export=view&id=${fileId}`
  }

  // If it's already a direct image URL, return as-is
  if (url.match(/\.(jpg|jpeg|png|gif|webp)(\?|$)/i)) {
    return url
  }

  return ''
})

function getCategoryBadgeClass(category: string): string {
  if (category === 'Sewa') return 'badge--sewa'
  if (category === 'Revenue Sharing Bazaar') return 'badge--bazaar'
  if (category === 'Revenue Sharing Event') return 'badge--event'
  return ''
}
</script>

<style scoped>
.invoice-modal {
  max-width: 560px;
}

.invoice-modal__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.invoice-modal__title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
}

.invoice-modal__subtitle {
  font-size: 0.8125rem;
  color: var(--text-muted);
  margin-top: 0.25rem;
}

.invoice-modal__details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
  background: rgba(0, 0, 0, 0.02);
}

.invoice-modal__detail {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.invoice-modal__detail-label {
  font-size: 0.6875rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 500;
}

.invoice-modal__detail-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
}

.invoice-modal__preview {
  padding: 1.5rem;
}

.invoice-modal__image-wrap {
  position: relative;
  border-radius: var(--radius-md);
  overflow: hidden;
  background: rgba(0, 0, 0, 0.03);
  min-height: 200px;
}

.invoice-modal__image {
  width: 100%;
  height: auto;
  display: block;
  border-radius: var(--radius-md);
}

.invoice-modal__loading,
.invoice-modal__error,
.invoice-modal__no-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 2.5rem 1.5rem;
  text-align: center;
  color: var(--text-muted);
  font-size: 0.875rem;
}

.invoice-modal__spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--border-color);
  border-top-color: var(--accent-emerald);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
