import type { ERCRates } from '@/types/rates'

// ERC-approved maximum rates (May 2026)
// Source: ERC Resolution No. 14 Series of 2025
export const ERC_RATES: ERCRates = {
  generationMax: 7.50,
  transmissionMax: 0.95,
  systemLossMax: 0.65,   // 8.5% of generation charge (approx)
  distributionMax: 2.10,
  supplyMax: 0.45,
  meteringMax: 0.25,
  overallMax: 11.90,
  updatedAt: '2026-05',
}

export const METRO_MANILA_CITIES = [
  'Caloocan',
  'Las Piñas',
  'Makati',
  'Malabon',
  'Mandaluyong',
  'Manila',
  'Marikina',
  'Muntinlupa',
  'Navotas',
  'Parañaque',
  'Pasay',
  'Pasig',
  'Pateros',
  'Quezon City',
  'San Juan',
  'Taguig',
  'Valenzuela',
] as const

export type MetroManilaCity = typeof METRO_MANILA_CITIES[number]

export const CHARGE_LABELS: Record<string, string> = {
  generationCharge: 'Generation Charge',
  transmissionCharge: 'Transmission Charge',
  systemLossCharge: 'System Loss Charge',
  distributionCharge: 'Distribution Charge',
  supplyCharge: 'Supply Charge',
  meteringCharge: 'Metering Charge',
  subsidies: 'Subsidies',
  taxes: 'Taxes (VAT)',
}

export const CHARGE_EXPLANATIONS: Record<string, string> = {
  generationCharge: 'Bayad sa power plant na gumawa ng kuryente mo.',
  transmissionCharge: 'Bayad sa pagdadala ng kuryente mula power plant papunta sa iyong lugar.',
  systemLossCharge: 'Bahagi ng kuryenteng nawala sa linya habang dinadala. Max 8.5% lang ang legal.',
  distributionCharge: 'Bayad sa Meralco para sa lokal na distribution network.',
  supplyCharge: 'Bayad sa serbisyo ng billing at customer service ng Meralco.',
  meteringCharge: 'Bayad sa electric meter na naka-install sa iyong bahay.',
  subsidies: 'Bawas mula sa gobyerno para sa mga low-income household. Negative ito.',
  taxes: 'VAT at iba pang buwis na kinukuha ng gobyerno.',
}

export const STORAGE_KEYS = {
  ERC_RATES: 'erc_rates',
  ERC_RATES_AT: 'erc_rates_at',
  FAQ_CACHE: 'faq_cache',
  FAQ_CACHED_AT: 'faq_cached_at',
  HEATMAP_CACHE: 'heatmap_cache',
} as const
