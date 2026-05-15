import type { ERCRates } from '@/types/rates'

// ERC-cleared Meralco rates (May 2026)
// Source: meralco.com.ph official rate schedule + ERC clearance
// Overall residential rate May 2026: ₱14.3345/kWh (down ₱0.0151 from April)
// Generation charge up to ₱8.7942 but offset by ERC PSA line rental caps (-₱0.1793)
// and suspension of GEA-All collection + lower transmission charges
export const ERC_RATES: ERCRates = {
  generationMax: 8.7942,
  transmissionMax: 0.9007, // down ₱0.0493 from April
  systemLossMax: 0.78,     // ERC cap is 8.5% of system load
  distributionMax: 2.76,   // Frozen by ERC since August 2022
  supplyMax: 0.45,
  meteringMax: 0.25,
  overallMax: 14.3345,     // Official ERC-cleared May 2026 residential rate
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
  generationCharge: 'Bayad sa power plant na gumawa ng kuryente mo. Ito ang pinakamalaking bahagi ng bill mo.',
  transmissionCharge: 'Bayad sa NGCP para sa pagdadala ng kuryente mula power plant papunta sa iyong lugar.',
  systemLossCharge: 'Bahagi ng kuryenteng nawala sa linya habang dinadala. Max 8.5% lang ang legal.',
  distributionCharge: 'Bayad sa Meralco para sa lokal na linya, metering, at supply service.',
  subsidies: 'Bawas mula sa gobyerno para sa mga low-income household (lifeline subsidy).',
  universalCharges: 'Bayad para sa mga stranded costs ng NPC at missionary electrification.',
  fitAll: 'Feed-in Tariff para suportahan ang renewable energy sources tulad ng solar at wind.',
  taxes: 'Government taxes — 12% VAT sa karamihan ng charges. Mandatoryo, hindi kontrolado ng Meralco.',
}

export const STORAGE_KEYS = {
  ERC_RATES: 'erc_rates',
  ERC_RATES_AT: 'erc_rates_at',
  FAQ_CACHE: 'faq_cache',
  FAQ_CACHED_AT: 'faq_cached_at',
  HEATMAP_CACHE: 'heatmap_cache',
} as const
