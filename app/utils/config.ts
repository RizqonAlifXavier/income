// ============================================================
// Dashboard Configuration
// Edit these values to customize the dashboard behavior
// ============================================================

/**
 * Target income dalam Rupiah.
 * Ubah angka ini sesuai target event Anda.
 */
export const TARGET_INCOME = 80_000_000 // Rp 80.000.000

/**
 * URL CSV dari Google Spreadsheet yang di-publish.
 * Cara mendapatkan URL:
 * 1. Buka Google Spreadsheet
 * 2. File → Share → Publish to web
 * 3. Pilih sheet → Format: CSV → Publish
 * 4. Copy URL yang muncul, paste di sini
 *
 * Contoh: https://docs.google.com/spreadsheets/d/e/2PACX-.../pub?output=csv
 */
export const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSigcyhNqQWWt5n_GV-yg6LvRnLD2dCiPL2GtRO3Aag-RU3-Ph4oNTgKt1UeijS7M2H0QbuB1vc9l4j/pub?output=csv' // ← Isi URL CSV di sini

/**
 * Nama kolom di spreadsheet (harus match persis)
 */
export const COLUMN_NAMES = {
  name: 'Nama Event',
  category: 'Kategori',
  nominal: 'Nominal',
  date: 'Tanggal Event',
  periode: 'Periode Event',
  invoiceUrl: 'Bukti Bayar',
} as const

/**
 * Definisi kategori income beserta warna & icon
 */
export const CATEGORIES = [
  {
    key: 'Sewa',
    label: 'Sewa',
    icon: '🏢',
    color: '#6366f1', // indigo
    gradient: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
  },
  {
    key: 'Revenue Sharing Bazaar',
    label: 'Revenue Sharing Bazaar',
    icon: '🛍️',
    color: '#f59e0b', // amber
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
  },
  {
    key: 'Revenue Sharing Event',
    label: 'Revenue Sharing Event',
    icon: '🎪',
    color: '#10b981', // emerald
    gradient: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
  },
  {
    key: 'Revenue Sharing Island',
    label: 'Revenue Sharing Island',
    icon: '🛸',
    color: '#0ea5e9', // sky blue
    gradient: 'linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)',
  },
] as const


