import { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useBillStore } from '@/store/billStore'

interface CityRow {
  city: string
  report_count: number
  average_amount: number
  status: 'low' | 'medium' | 'high'
}

interface SubmitResult {
  ok: boolean
  message: string
}

function kwh_range(kwh: number): string {
  if (kwh <= 100) return '0-100'
  if (kwh <= 200) return '101-200'
  if (kwh <= 300) return '201-300'
  return '300+'
}

function amount_range(amount: number): string {
  if (amount <= 2000) return '0-2000'
  if (amount <= 4000) return '2001-4000'
  if (amount <= 6000) return '4001-6000'
  return '6000+'
}

async function fetchHeatMap(): Promise<CityRow[]> {
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) throw new Error('Supabase not configured')

  const res = await fetch(
    `${supabaseUrl}/rest/v1/city_heat_map?select=city,report_count,average_amount,status&order=average_amount.desc`,
    {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
    }
  )

  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`)
  return res.json()
}

async function submitReport(payload: {
  city: string
  kwh_range: string
  amount_range: string
  report_type: string
}): Promise<SubmitResult> {
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) return { ok: false, message: 'Supabase not configured' }

  const res = await fetch(`${supabaseUrl}/rest/v1/community_reports`, {
    method: 'POST',
  headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error('[HeatMap] Submit error:', err)
    return { ok: false, message: 'Hindi makapag-submit ngayon. Subukan ulit.' }
  }

  return { ok: true, message: 'Salamat! Na-share na ang iyong datos sa komunidad.' }
}

const STATUS_CONFIG = {
  low: { bg: 'bg-green-100', border: 'border-green-300', dot: 'bg-green-500', label: 'Mababa', text: 'text-green-700' },
  medium: { bg: 'bg-yellow-100', border: 'border-yellow-300', dot: 'bg-yellow-500', label: 'Katamtaman', text: 'text-yellow-700' },
  high: { bg: 'bg-red-100', border: 'border-red-300', dot: 'bg-red-500', label: 'Mataas', text: 'text-red-700' },
}

export default function HeatMapScreen() {
  const billInput = useBillStore((s) => s.billInput)
  const verdict = useBillStore((s) => s.verdict)

  const [rows, setRows] = useState<CityRow[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitMsg, setSubmitMsg] = useState<string | null>(null)

  const hasOwnBill = !!(billInput?.city && billInput.kwh && billInput.totalAmount && verdict)

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    setError(null)
    try {
      const data = await fetchHeatMap()
      setRows(data)
    } catch (e) {
      setError('Hindi ma-load ang data. Siguraduhin na naka-connect sa internet.')
      console.error('[HeatMap] Load error:', e)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  async function handleSubmit() {
    if (!hasOwnBill || submitting) return
    setSubmitting(true)
    const result = await submitReport({
      city: billInput!.city!,
      kwh_range: kwh_range(billInput!.kwh!),
      amount_range: amount_range(billInput!.totalAmount!),
      report_type: verdict!.status === 'normal' ? 'normal' : 'overcharge',
    })
    setSubmitMsg(result.message)
    if (result.ok) {
      setSubmitted(true)
      await load(true)
    }
    setSubmitting(false)
  }

  const userCity = billInput?.city ?? null

  return (
    <SafeAreaView className="flex-1 bg-stone-50" edges={['bottom']}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-8"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor="#F97316" />
        }
      >
        {/* Header */}
        <View className="bg-brand-orange px-6 pt-6 pb-8">
          <Text className="text-white text-2xl font-bold">Community Heat Map 🏘️</Text>
          <Text className="text-white/80 text-sm mt-1">
            Tingnan kung gaano ka-mataas ang average bill sa bawat lungsod sa Metro Manila
          </Text>
        </View>

        {/* Legend */}
        <View className="mx-6 -mt-4 bg-white rounded-2xl p-4 shadow-sm flex-row justify-around">
          {(['low', 'medium', 'high'] as const).map((s) => (
            <View key={s} className="items-center gap-1">
              <View className={`w-4 h-4 rounded-full ${STATUS_CONFIG[s].dot}`} />
              <Text className="text-stone-500 text-xs">{STATUS_CONFIG[s].label}</Text>
            </View>
          ))}
        </View>

        {/* Submit own bill */}
        {hasOwnBill && !submitted && (
          <View className="mx-6 mt-4 bg-brand-orange/10 border border-brand-orange/30 rounded-2xl p-4">
            <Text className="text-stone-800 font-bold text-sm">I-share ang iyong bill data</Text>
            <Text className="text-stone-500 text-xs mt-1 mb-3">
              Tulungan ang iyong komunidad sa pag-share ng anonymous na datos mula sa iyong bill sa{' '}
              <Text className="font-semibold">{billInput?.city}</Text>.
            </Text>
            {submitMsg && (
              <Text className="text-brand-orange text-xs mb-2 font-medium">{submitMsg}</Text>
            )}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={submitting}
              className="bg-brand-orange rounded-xl py-2 items-center"
              activeOpacity={0.85}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text className="text-white font-bold text-sm">I-share ang Datos Ko</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {submitted && submitMsg && (
          <View className="mx-6 mt-4 bg-green-50 border border-green-200 rounded-2xl p-4">
            <Text className="text-green-700 text-sm font-medium">✅ {submitMsg}</Text>
          </View>
        )}

        {/* City list */}
        <Text className="text-stone-800 text-base font-bold px-6 mt-5 mb-3">
          Average Bill sa Bawat Lungsod
        </Text>

        {loading && (
          <View className="items-center py-12">
            <ActivityIndicator color="#F97316" size="large" />
            <Text className="text-stone-400 text-sm mt-3">Kino-load ang datos...</Text>
          </View>
        )}

        {error && !loading && (
          <View className="mx-6 bg-red-50 border border-red-200 rounded-2xl p-4">
            <Text className="text-red-700 text-sm">{error}</Text>
            <TouchableOpacity onPress={() => load()} className="mt-3 bg-red-100 rounded-xl py-2 items-center">
              <Text className="text-red-700 text-sm font-bold">Subukan Ulit</Text>
            </TouchableOpacity>
          </View>
        )}

        {!loading && !error && rows.length === 0 && (
          <View className="mx-6 items-center py-8">
            <Text className="text-4xl mb-2">🏙️</Text>
            <Text className="text-stone-500 text-sm text-center">
              Wala pang datos sa community. Maging una sa pag-share ng iyong bill!
            </Text>
          </View>
        )}

        {!loading && rows.length > 0 && (
          <View className="px-6 gap-3">
            {rows.map((row, i) => {
              const cfg = STATUS_CONFIG[row.status] ?? STATUS_CONFIG.medium
              const isUserCity = userCity?.toLowerCase().trim() === row.city.toLowerCase().trim()
              return (
                <View
                  key={row.city}
                  className={`rounded-2xl p-4 border ${cfg.bg} ${cfg.border} ${
                    isUserCity ? 'border-2' : 'border'
                  }`}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-2 flex-1">
                      <Text className="text-stone-500 text-sm w-6">{i + 1}.</Text>
                      <View className={`w-3 h-3 rounded-full ${cfg.dot}`} />
                      <Text className={`font-bold text-sm flex-1 ${isUserCity ? 'text-brand-orange' : 'text-stone-800'}`}>
                        {row.city}
                        {isUserCity ? ' 📍' : ''}
                      </Text>
                    </View>
                    <View className="items-end">
                      <Text className={`font-bold text-base ${cfg.text}`}>
                        ₱{row.average_amount.toLocaleString()}
                      </Text>
                      <Text className="text-stone-400 text-xs">avg/buwan</Text>
                    </View>
                  </View>
                  <View className="flex-row items-center justify-between mt-2">
                    <Text className={`text-xs ${cfg.text}`}>{cfg.label}</Text>
                    <Text className="text-stone-400 text-xs">{row.report_count} report{row.report_count !== 1 ? 's' : ''}</Text>
                  </View>
                </View>
              )
            })}
          </View>
        )}

        <Text className="text-stone-300 text-xs text-center mt-6 px-6">
          Ang datos ay anonymous at aggregated. Walang personal na impormasyon ang naka-store.
        </Text>
      </ScrollView>
    </SafeAreaView>
  )
}
