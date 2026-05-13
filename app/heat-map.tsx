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
import MapView, { Marker, UrlTile } from 'react-native-maps'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
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

// Coordinates for Philippine cities commonly appearing in Meralco coverage
const CITY_COORDS: Record<string, [number, number]> = {
  'Manila': [14.5995, 120.9842],
  'Quezon City': [14.6760, 121.0437],
  'Makati': [14.5547, 121.0244],
  'Pasig': [14.5764, 121.0851],
  'Taguig': [14.5176, 121.0509],
  'Mandaluyong': [14.5794, 121.0359],
  'Marikina': [14.6507, 121.1029],
  'Caloocan': [14.6492, 120.9673],
  'Malabon': [14.6625, 120.9570],
  'Navotas': [14.6619, 120.9427],
  'Valenzuela': [14.7011, 120.9830],
  'Las Piñas': [14.4453, 120.9934],
  'Muntinlupa': [14.4081, 121.0415],
  'Parañaque': [14.4793, 121.0198],
  'Pasay': [14.5378, 120.9974],
  'San Juan': [14.6014, 121.0311],
  'Pateros': [14.5446, 121.0680],
  'Bacoor': [14.4624, 120.9645],
  'Cavite City': [14.4791, 120.8977],
  'Imus': [14.4297, 120.9367],
  'Dasmariñas': [14.3294, 120.9367],
  'General Trias': [14.3856, 120.8806],
  'Antipolo': [14.6286, 121.1760],
  'San Mateo': [14.6991, 121.1227],
  'Rodriguez': [14.7421, 121.1153],
  'Biñan': [14.3401, 121.0797],
  'Santa Rosa': [14.3122, 121.1114],
  'Calamba': [14.2117, 121.1653],
  'Laguna': [14.2786, 121.4119],
  'Bulacan': [14.7942, 120.8786],
  'Meycauayan': [14.7353, 120.9606],
  'Marilao': [14.7588, 120.9477],
  'Obando': [14.7669, 120.9319],
}

const STATUS_COLORS = { low: '#22c55e', medium: '#eab308', high: '#ef4444' }

const STATUS_CONFIG = {
  low: { bg: 'bg-green-100', border: 'border-green-300', dot: 'bg-green-500', label: 'Mababa', text: 'text-green-700' },
  medium: { bg: 'bg-yellow-100', border: 'border-yellow-300', dot: 'bg-yellow-500', label: 'Katamtaman', text: 'text-yellow-700' },
  high: { bg: 'bg-red-100', border: 'border-red-300', dot: 'bg-red-500', label: 'Mataas', text: 'text-red-700' },
}

interface UserBillMarker {
  city: string
  totalAmount: number
  kwh: number
  status: string
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
  if (!isSupabaseConfigured) throw new Error('Supabase not configured')
  const { data, error } = await supabase
    .from('city_heat_map')
    .select('city, report_count, average_amount, status')
    .order('average_amount', { ascending: false })
  if (error) throw new Error(`Fetch failed: ${error.message}`)
  return (data ?? []) as CityRow[]
}

async function submitReport(payload: {
  city: string
  kwh_range: string
  amount_range: string
  report_type: string
}): Promise<SubmitResult> {
  if (!isSupabaseConfigured) return { ok: false, message: 'Supabase not configured' }
  const { error } = await supabase.from('community_reports').insert(payload)
  if (error) {
    console.error('[HeatMap] Submit error:', error.message)
    return { ok: false, message: 'Hindi makapag-submit ngayon. Subukan ulit.' }
  }
  return { ok: true, message: 'Salamat! Na-share na ang iyong datos sa komunidad.' }
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
  const userCity = billInput?.city ?? null  // used in list tab highlight

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

  const [activeTab, setActiveTab] = useState<'map' | 'list'>('map')
  const userBillMarker: UserBillMarker | null =
    billInput?.city && billInput.totalAmount && billInput.kwh && verdict
      ? { city: billInput.city, totalAmount: billInput.totalAmount, kwh: billInput.kwh, status: verdict.status }
      : null

  const userCoords = userBillMarker ? CITY_COORDS[userBillMarker.city] : null
  const initialRegion = {
    latitude: userCoords ? userCoords[0] : 14.5547,
    longitude: userCoords ? userCoords[1] : 121.0244,
    latitudeDelta: 0.35,
    longitudeDelta: 0.35,
  }

  return (
    <SafeAreaView className="flex-1 bg-stone-50" edges={['bottom']}>

      {/* Tab switcher */}
      <View className="flex-row bg-white border-b border-stone-100">
        {(['map', 'list'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            className={`flex-1 py-3 items-center border-b-2 ${
              activeTab === tab ? 'border-brand-orange' : 'border-transparent'
            }`}
            activeOpacity={0.7}
          >
            <Text className={`text-sm font-semibold ${
              activeTab === tab ? 'text-brand-orange' : 'text-stone-400'
            }`}>
              {tab === 'map' ? '🗺️  Mapa' : '📋  Listahan'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Full-screen map tab */}
      {activeTab === 'map' && (
        <View className="flex-1">
          {loading ? (
            <View className="flex-1 items-center justify-center bg-stone-100">
              <ActivityIndicator color="#F97316" size="large" />
              <Text className="text-stone-400 text-sm mt-3">Kino-load ang mapa...</Text>
            </View>
          ) : (
            <MapView style={{ flex: 1 }} initialRegion={initialRegion}>
              <UrlTile
                urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                maximumZ={19}
                flipY={false}
              />

              {/* Community city markers */}
              {rows.filter((r) => CITY_COORDS[r.city]).map((r) => (
                <Marker
                  key={r.city}
                  coordinate={{ latitude: CITY_COORDS[r.city][0], longitude: CITY_COORDS[r.city][1] }}
                  title={r.city}
                  description={`Avg: ₱${r.average_amount.toLocaleString()} · ${r.report_count} report${r.report_count !== 1 ? 's' : ''}`}
                  pinColor={STATUS_COLORS[r.status] ?? STATUS_COLORS.medium}
                />
              ))}

              {/* Personal bill marker */}
              {userBillMarker && userCoords && (
                <Marker
                  coordinate={{ latitude: userCoords[0], longitude: userCoords[1] }}
                  title={`📍 ${userBillMarker.city} — Iyong Bill`}
                  description={`₱${userBillMarker.totalAmount.toLocaleString()} · ${userBillMarker.kwh} kWh`}
                  pinColor="#F97316"
                />
              )}
            </MapView>
          )}

          {/* Legend overlay */}
          <View className="absolute bottom-4 right-4 bg-white/95 rounded-2xl px-4 py-3 flex-row gap-4 shadow-sm">
            {(['low', 'medium', 'high'] as const).map((s) => (
              <View key={s} className="flex-row items-center gap-1.5">
                <View className={`w-3 h-3 rounded-full ${STATUS_CONFIG[s].dot}`} />
                <Text className="text-stone-600 text-xs font-medium">{STATUS_CONFIG[s].label}</Text>
              </View>
            ))}
          </View>

          {/* Report count badge */}
          {rows.length > 0 && (
            <View className="absolute top-4 left-4 bg-white/95 rounded-2xl px-3 py-2 shadow-sm">
              <Text className="text-stone-700 text-xs font-semibold">{rows.length} lungsod</Text>
              <Text className="text-stone-400 text-xs">{rows.reduce((a, r) => a + r.report_count, 0)} reports</Text>
            </View>
          )}
        </View>
      )}

      {/* List tab */}
      {activeTab === 'list' && (
      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-8"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor="#F97316" />
        }
      >
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
              const hasCoords = !!CITY_COORDS[row.city]
              return (
                <View
                  key={row.city}
                  className={`rounded-2xl p-4 ${cfg.bg} ${isUserCity ? 'border-2 border-brand-orange' : `border ${cfg.border}`}`}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-2 flex-1">
                      <Text className="text-stone-500 text-sm w-6">{i + 1}.</Text>
                      <View className={`w-3 h-3 rounded-full ${cfg.dot}`} />
                      <Text className={`font-bold text-sm flex-1 ${isUserCity ? 'text-brand-orange' : 'text-stone-800'}`}>
                        {row.city}
                        {isUserCity ? ' 📍' : ''}
                        {!hasCoords ? ' *' : ''}
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
          {'\n'}* Hindi pa nakalagay sa mapa ang lungsod na ito.
        </Text>
      </ScrollView>
      )}

    </SafeAreaView>
  )
}
