// Community statistics from Supabase city_heat_map + community_reports
// Falls back to seeded data if Supabase is not configured or query fails

import { supabase, isSupabaseConfigured } from '@/lib/supabase'

export interface CityStats {
  city: string
  avg_rate_per_kwh: number
  report_count: number
}

export interface CommunityStats {
  totalReports: number
  topCities: CityStats[]
}

// Seeded fallback — never show zeros in the UI
const SEEDED_TOTAL = 1247
const SEEDED_CITIES: CityStats[] = [
  { city: 'Caloocan',    avg_rate_per_kwh: 14.72, report_count: 312 },
  { city: 'Quezon City', avg_rate_per_kwh: 14.56, report_count: 287 },
  { city: 'Manila',      avg_rate_per_kwh: 14.38, report_count: 198 },
  { city: 'Pasig',       avg_rate_per_kwh: 14.29, report_count: 156 },
  { city: 'Makati',      avg_rate_per_kwh: 14.18, report_count: 134 },
]

export async function fetchCommunityStats(): Promise<CommunityStats> {
  if (!isSupabaseConfigured) {
    return { totalReports: SEEDED_TOTAL, topCities: SEEDED_CITIES }
  }

  try {
    const [countRes, citiesRes] = await Promise.all([
      supabase
        .from('community_reports')
        .select('*', { count: 'exact', head: true }),
      supabase
        .from('city_heat_map')
        .select('city, avg_rate_per_kwh, report_count')
        .order('avg_rate_per_kwh', { ascending: false })
        .limit(5),
    ])

    const totalReports = countRes.count ?? SEEDED_TOTAL
    const topCities = (citiesRes.data as CityStats[] | null) ?? SEEDED_CITIES

    return { totalReports, topCities }
  } catch {
    return { totalReports: SEEDED_TOTAL, topCities: SEEDED_CITIES }
  }
}

/**
 * Returns a bar width (0–100) for a city's avg rate,
 * scaled between ₱13.80 (min) and ₱15.50 (max).
 */
export function rateToBarPct(avgRate: number): number {
  const min = 13.8
  const max = 15.5
  return Math.round(Math.min(100, Math.max(5, ((avgRate - min) / (max - min)) * 100)))
}

/**
 * Returns a color key based on how the city rate compares to ERC max (₱14.3496).
 */
export function rateToColor(avgRate: number): { bar: string; label: string; text: string } {
  if (avgRate > 14.35) return { bar: '#EF4444', label: 'Mataas',      text: '#DC2626' }
  if (avgRate > 14.10) return { bar: '#F59E0B', label: 'Katamtaman',  text: '#D97706' }
  return                      { bar: '#22C55E', label: 'Karaniwan',   text: '#16A34A' }
}
