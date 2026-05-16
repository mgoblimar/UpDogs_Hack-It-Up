import { useState, useEffect, useCallback } from 'react'
import { View, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import WebView from 'react-native-webview'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { isDemoMode } from '@/lib/demoMode'
import { useBillStore } from '@/store/billStore'
import { Text } from '@/components/CustomText'

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

const DEMO_ROWS: CityRow[] = [
  { city: 'Quezon City', report_count: 312, average_amount: 4250, status: 'high' },
  { city: 'Makati', report_count: 198, average_amount: 3980, status: 'high' },
  { city: 'Pasig', report_count: 145, average_amount: 3650, status: 'medium' },
  { city: 'Manila', report_count: 287, average_amount: 3420, status: 'medium' },
  { city: 'Taguig', report_count: 163, average_amount: 3200, status: 'medium' },
  { city: 'Marikina', report_count: 89, average_amount: 2850, status: 'low' },
  { city: 'Parañaque', report_count: 112, average_amount: 3050, status: 'medium' },
  { city: 'Muntinlupa', report_count: 76, average_amount: 2710, status: 'low' },
  { city: 'Caloocan', report_count: 134, average_amount: 2940, status: 'medium' },
  { city: 'Antipolo', report_count: 58, average_amount: 2550, status: 'low' },
]

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

interface LeafletMarker {
  lat: number
  lng: number
  city: string
  color: string
  avg: string
  count: number
  label: string
}

interface LeafletUserMarker {
  lat: number
  lng: number
  city: string
  amount: string
  kwh: number
}

function buildLeafletHtml(
  markers: LeafletMarker[],
  userMarker: LeafletUserMarker | null,
  centerLat: number,
  centerLng: number,
): string {
  const markersJson = JSON.stringify(markers)
  const userJson = JSON.stringify(userMarker)

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #f5f0eb; }
    #map { position: absolute; top: 0; bottom: 0; left: 0; right: 0; }
    .leaflet-popup-content-wrapper {
      border-radius: 12px;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 13px;
    }
    .leaflet-popup-content b { font-size: 14px; }
    .status-pill {
      display: inline-block;
      padding: 1px 8px;
      border-radius: 99px;
      font-size: 11px;
      font-weight: 600;
      margin-top: 3px;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    var MARKERS = ${markersJson};
    var USER_MARKER = ${userJson};

    var map = L.map('map', {
      center: [${centerLat}, ${centerLng}],
      zoom: 11,
      zoomControl: true,
      attributionControl: false
    });

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(map);

    MARKERS.forEach(function(m) {
      var circle = L.circleMarker([m.lat, m.lng], {
        radius: 20,
        color: m.color,
        fillColor: m.color,
        fillOpacity: 0.45,
        weight: 2.5
      });
      circle.bindPopup(
        '<b>' + m.city + '</b><br>' +
        '&#x20B1;' + m.avg + ' avg / buwan<br>' +
        m.count + ' report' + (m.count !== 1 ? 's' : '') + '<br>' +
        '<span class="status-pill" style="background:' + m.color + '22;color:' + m.color + '">' + m.label + '</span>'
      );
      circle.addTo(map);
    });

    if (USER_MARKER) {
      var icon = L.divIcon({
        html: '<div style="background:#F97316;width:28px;height:28px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>',
        iconSize: [28, 28],
        iconAnchor: [14, 28],
        popupAnchor: [0, -30],
        className: ''
      });
      L.marker([USER_MARKER.lat, USER_MARKER.lng], { icon: icon })
        .bindPopup('<b>&#x1F4CD; ' + USER_MARKER.city + '</b><br>Iyong Bill<br>&#x20B1;' + USER_MARKER.amount + ' &middot; ' + USER_MARKER.kwh + ' kWh')
        .addTo(map)
        .openPopup();
    }
  </script>
</body>
</html>`
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
  const [activeTab, setActiveTab] = useState<'map' | 'list'>('map')

  const hasOwnBill = !!(billInput?.city && billInput.kwh && billInput.totalAmount && verdict)
  const userCity = billInput?.city ?? null

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    setError(null)

    if (isDemoMode()) {
      setRows(DEMO_ROWS)
      setLoading(false)
      setRefreshing(false)
      return
    }

    try {
      const data = await fetchHeatMap()
      setRows(data.length > 0 ? data : DEMO_ROWS)
    } catch (e) {
      setRows(DEMO_ROWS)
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

  const userBillMarker: UserBillMarker | null =
    billInput?.city && billInput.totalAmount && billInput.kwh && verdict
      ? { city: billInput.city, totalAmount: billInput.totalAmount, kwh: billInput.kwh, status: verdict.status }
      : null

  const userCoords = userBillMarker ? CITY_COORDS[userBillMarker.city] : null
  const centerLat = userCoords ? userCoords[0] : 14.5547
  const centerLng = userCoords ? userCoords[1] : 121.0244

  const leafletMarkers: LeafletMarker[] = rows
    .filter((r) => CITY_COORDS[r.city])
    .map((r) => ({
      lat: CITY_COORDS[r.city][0],
      lng: CITY_COORDS[r.city][1],
      city: r.city,
      color: STATUS_COLORS[r.status] ?? STATUS_COLORS.medium,
      avg: r.average_amount.toLocaleString(),
      count: r.report_count,
      label: STATUS_CONFIG[r.status]?.label ?? 'Katamtaman',
    }))

  const leafletUserMarker: LeafletUserMarker | null =
    userBillMarker && userCoords
      ? {
          lat: userCoords[0],
          lng: userCoords[1],
          city: userBillMarker.city,
          amount: userBillMarker.totalAmount.toLocaleString(),
          kwh: userBillMarker.kwh,
        }
      : null

  const mapHtml = buildLeafletHtml(leafletMarkers, leafletUserMarker, centerLat, centerLng)

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
            <WebView
              source={{ html: mapHtml }}
              style={{ flex: 1 }}
              originWhitelist={['*']}
              javaScriptEnabled
              domStorageEnabled
              startInLoadingState
              renderLoading={() => (
                <View style={{ position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f0eb' }}>
                  <ActivityIndicator color="#F97316" size="large" />
                  <Text className="text-stone-400 text-sm mt-3">Kino-load ang mapa...</Text>
                </View>
              )}
            />
          )}

          {/* Legend overlay */}
          {!loading && (
            <View className="absolute bottom-4 right-4 bg-white/95 rounded-2xl px-4 py-3 flex-row gap-4 shadow-sm">
              {(['low', 'medium', 'high'] as const).map((s) => (
                <View key={s} className="flex-row items-center gap-1.5">
                  <View className={`w-3 h-3 rounded-full ${STATUS_CONFIG[s].dot}`} />
                  <Text className="text-stone-600 text-xs font-medium">{STATUS_CONFIG[s].label}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Report count badge */}
          {!loading && rows.length > 0 && (
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
          {hasOwnBill && !submitted && !isDemoMode() && (
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
            {isDemoMode() ? '\n🎭 Demo mode — sample data ang ipinapakita.' : ''}
          </Text>
        </ScrollView>
      )}

    </SafeAreaView>
  )
}
