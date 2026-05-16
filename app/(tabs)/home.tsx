import { View, TouchableOpacity, ScrollView, Image, Animated } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter, Redirect, useFocusEffect } from 'expo-router'
import { useBillStore } from '@/store/billStore'
import { useHistoryStore } from '@/store/historyStore'
import { useEffect, useState, useRef, useMemo, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import type { Session } from '@supabase/supabase-js'
import { FontAwesome6 } from '@expo/vector-icons'
import { Text } from '@/components/CustomText'
import { Image as ExpoImage } from 'expo-image'
import { ERC_RATES } from '@/lib/constants'
import { isDemoMode } from '@/lib/demoMode'
import { fetchCommunityStats, rateToBarPct, rateToColor } from '@/services/communityService'
import type { CommunityStats } from '@/services/communityService'

// ─── constants ────────────────────────────────────────────────────────────────

const KOKO_LINES = [
  'May tanong ka? Kausapin mo ako! 💬',
  'Tara, suriin natin ang bill mo! ⚡',
  'Pssst! Magtanong ka sa akin! 🦉',
  'Alamin natin kung tama ang bill mo!',
  'Tanong mo ko! 👋',
  'Ako si KoKo! Kausapin mo ako. 🤖',
  'Baka na-overcharge ka? Sabihin mo sa akin!',
  'Handa akong tumulong sa iyong bill! ✅',
]

const MONTHS_PH = [
  'Enero', 'Pebrero', 'Marso', 'Abril', 'Mayo', 'Hunyo',
  'Hulyo', 'Agosto', 'Setyembre', 'Oktubre', 'Nobyembre', 'Disyembre',
]

const MONTHS_PH_UPPER = [
  'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
  'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER',
]

const SEEDED_STATS: CommunityStats = {
  totalReports: 1247,
  topCities: [
    { city: 'Caloocan',    avg_rate_per_kwh: 14.72, report_count: 312 },
    { city: 'Quezon City', avg_rate_per_kwh: 14.56, report_count: 287 },
    { city: 'Manila',      avg_rate_per_kwh: 14.38, report_count: 198 },
  ],
}

// ─── helpers ──────────────────────────────────────────────────────────────────

function getFormattedDate() {
  const now = new Date()
  return `${MONTHS_PH_UPPER[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`
}

function formatMonthPH(isoMonth: string): string {
  const [year, month] = isoMonth.split('-').map(Number)
  return `${MONTHS_PH[(month ?? 1) - 1]} ${year}`
}

function getCurrentMonthLabel(): string {
  const now = new Date()
  return `${MONTHS_PH[now.getMonth()]} ${now.getFullYear()}`
}

// ─── main screen ──────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const router = useRouter()
  const reset = useBillStore((s) => s.reset)
  const loadHistory = useHistoryStore((s) => s.loadForUser)
  const bills = useHistoryStore((s) => s.bills)
  const [session, setSession] = useState<Session | null | undefined>(undefined)
  const [isGuest, setIsGuest] = useState(false)
  const [communityStats, setCommunityStats] = useState<CommunityStats>(SEEDED_STATS)
  const bubbleOpacity = useRef(new Animated.Value(0)).current
  const [kokoLine] = useState(() => KOKO_LINES[Math.floor(Math.random() * KOKO_LINES.length)])
  const [gifActive, setGifActive] = useState(true)
  const gifTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Play GIF once each time this tab comes into focus, then freeze on static image
  useFocusEffect(
    useCallback(() => {
      setGifActive(true)
      gifTimerRef.current = setTimeout(() => setGifActive(false), 2500)
      return () => {
        if (gifTimerRef.current) clearTimeout(gifTimerRef.current)
      }
    }, []),
  )

  useEffect(() => {
    reset()

    // Demo / guest mode — skip network auth entirely, navigate instantly
    if (isDemoMode()) {
      setIsGuest(true)
      setSession(null)
      loadHistory('demo-guest')
      return
    }

    if (!isSupabaseConfigured) {
      setSession(null)
      return
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      if (data.session?.user?.id) loadHistory(data.session.user.id)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s)
      if (s?.user?.id) loadHistory(s.user.id)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  // Fetch live community stats on mount
  useEffect(() => {
    fetchCommunityStats()
      .then(setCommunityStats)
      .catch(() => null)
  }, [])

  // KoKo speech bubble animation
  useEffect(() => {
    if (!session && !isGuest) return
    Animated.sequence([
      Animated.timing(bubbleOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.delay(3500),
      Animated.timing(bubbleOpacity, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start()
  }, [session])

  // ── Estimated Bill ─────────────────────────────────────────────────────────
  // Formula: current month's rate × average kWh from past bills
  // Falls back to averaging total amounts if rate is unavailable.
  const estimatedBill = useMemo(() => {
    if (bills.length === 0) return null

    const latest = bills[0]
    const currentRate = latest.ratePerKwh

    // Need at least 2 bills to compute a meaningful kWh average
    if (currentRate && bills.length >= 2) {
      const recentBills = bills.slice(0, Math.min(bills.length, 3))
      const avgKwh = recentBills.reduce((s, b) => s + b.kwh, 0) / recentBills.length
      const amount = currentRate * avgKwh
      return {
        amount,
        label: `₱${currentRate.toFixed(4)}/kWh × avg ${Math.round(avgKwh)} kWh`,
      }
    }

    // Fallback: average of last 3 total amounts
    if (bills.length >= 3) {
      const avg = bills.slice(0, 3).reduce((s, b) => s + b.totalAmount, 0) / 3
      return {
        amount: avg,
        label: 'Average ng iyong huling 3 bill',
      }
    }

    // Last resort: most recent bill as-is
    return {
      amount: latest.totalAmount,
      label: 'Batay sa iyong pinakabagong bill',
    }
  }, [bills])

  // ── Fairness Check (Phase 8C) ──────────────────────────────────────────────
  const fairnessCheck = useMemo(() => {
    if (bills.length === 0) return null
    const latest = bills[0]
    const rate = latest.ratePerKwh
    const erc = ERC_RATES.overallMax
    const diff = rate - erc
    const status: 'overcharged' | 'high' | 'fair' =
      diff > 0.5 ? 'overcharged' : diff > 0.1 ? 'high' : 'fair'
    return { rate, erc, diff, status, city: latest.city }
  }, [bills])

  if (session === undefined && !isGuest) return null
  if (!session && !isGuest) return <Redirect href="/sign-in" />

  const rawName = isGuest ? 'Ka-KuryenteKo' : (session?.user?.email?.split('@')[0] ?? 'Ka-KuryenteKo')
  const displayName = rawName
    .split(' ')
    .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-[#f8fafc]">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pt-2 pb-10"
        showsVerticalScrollIndicator={false}
      >
        {/* Date chip */}
        <View className="self-start bg-slate-100 rounded-full px-2 py-1 mb-4">
          <Text className="text-[10px] text-slate-500 font-bold uppercase">{getFormattedDate()}</Text>
        </View>

        {/* Greeting row + KoKo owl */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <View style={{ flex: 1, paddingRight: 8 }}>
            <Text style={{ fontSize: 13, color: '#94A3B8', fontWeight: '600', marginBottom: 2 }}>
              Magandang araw,
            </Text>
            <Text style={{ fontSize: 22, fontWeight: '700', color: '#1C2B3A' }} numberOfLines={1}>
              {displayName}!
            </Text>
          </View>

          {/* KoKo owl — bubble floats to the left, no layout impact */}
          <View style={{ alignItems: 'flex-end' }}>
            <Animated.View style={{
              position: 'absolute', right: 92, bottom: 0,
              opacity: bubbleOpacity, flexDirection: 'row', alignItems: 'center', zIndex: 10,
            }}>
              <View style={{
                backgroundColor: '#1C2B3A', borderRadius: 14, borderBottomRightRadius: 4,
                paddingHorizontal: 12, paddingVertical: 8, maxWidth: 190,
                shadowColor: '#000', shadowOpacity: 0.18, shadowOffset: { width: 0, height: 2 }, shadowRadius: 5, elevation: 5,
              }}>
                <Text style={{ color: '#F5C518', fontSize: 11, fontWeight: '700' }}>{kokoLine}</Text>
              </View>
              {/* right-pointing caret toward the owl */}
              <View style={{
                width: 0, height: 0,
                borderTopWidth: 6, borderTopColor: 'transparent',
                borderBottomWidth: 6, borderBottomColor: 'transparent',
                borderLeftWidth: 8, borderLeftColor: '#1C2B3A',
              }} />
            </Animated.View>

            <TouchableOpacity
              onPress={() => router.push('/chat')}
              activeOpacity={0.85}
              style={{ shadowColor: '#000', shadowOpacity: 0.15, shadowOffset: { width: 0, height: 3 }, shadowRadius: 6, elevation: 6 }}
            >
              {gifActive ? (
                <ExpoImage
                  source={require('@/assets/KuryenteKo/chatbot/animated_owl.gif')}
                  style={{ width: 84, height: 84 }}
                  contentFit="contain"
                />
              ) : (
                <Image
                  source={require('@/assets/KuryenteKo/figures/Owl-sitting.png')}
                  style={{ width: 84, height: 84 }}
                  resizeMode="contain"
                />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* KoKo intro banner */}
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEFCE8', borderWidth: 1, borderColor: '#FEF08A', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 16, gap: 8 }}>
          <Text style={{ fontSize: 18 }}>🦉</Text>
          <Text style={{ flex: 1, fontSize: 13, color: '#78716C' }}>
            Ako si <Text style={{ fontWeight: '800', color: '#1C2B3A' }}>KoKo</Text> — bantay ng iyong kuryente bill!
          </Text>
        </View>

        {/* ── Estimated Bill widget (Phase 8B) ─────────────────────────────── */}
        <View className="bg-slate-800 rounded-3xl p-6 mb-4 shadow-sm relative overflow-hidden flex-col justify-center min-h-[140px]">
          <View className="absolute -right-2 -bottom-6 opacity-30">
            <Image
              source={require('@/assets/KuryenteKo/figures/Owl-sitting.png')}
              style={{ width: 120, height: 120 }}
              resizeMode="contain"
            />
          </View>
          <View className="relative z-10 w-[72%]">
            <Text className="text-sm text-slate-300 mb-1">Estimatong Bill Ngayong Buwan</Text>
            {estimatedBill ? (
              <>
                <Text className="text-4xl font-bold mb-1 tracking-tight text-white">
                  ₱{estimatedBill.amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Text>
                <Text className="text-xs text-slate-400 mb-3">{estimatedBill.label}</Text>
              </>
            ) : (
              <>
                <Text className="text-4xl font-bold mb-1 tracking-tight text-slate-500">₱ —</Text>
                <Text className="text-xs text-slate-500 mb-3">I-scan ang iyong bill para makita ang estimate</Text>
              </>
            )}
            <View className="flex-row justify-between items-center border-t border-slate-600 pt-3">
              <Text className="text-sm text-slate-400">Para sa: {getCurrentMonthLabel()}</Text>
            </View>
          </View>
        </View>

        {/* ── Scan button ──────────────────────────────────────────────────── */}
        <TouchableOpacity
          onPress={() => router.push('/scanner')}
          activeOpacity={0.85}
          className="bg-[#facc15] py-4 rounded-xl shadow-sm flex-row justify-center items-center mb-4"
        >
          <FontAwesome6 name="camera" size={18} color="#0f172a" />
          <Text className="text-slate-900 font-bold ml-2">I-SCAN / INPUT</Text>
        </TouchableOpacity>

        {/* ── Fairness Check widget (Phase 8C) ─────────────────────────────── */}
        {fairnessCheck ? (
          <View style={{
            backgroundColor: '#fff',
            borderRadius: 20,
            padding: 16,
            marginBottom: 16,
            borderWidth: 1.5,
            borderColor: fairnessCheck.status === 'overcharged' ? '#FECACA'
              : fairnessCheck.status === 'high' ? '#FDE68A' : '#A7F3D0',
            shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <Text style={{ color: '#1C2B3A', fontWeight: '800', fontSize: 14 }}>⚖️ Fairness Check</Text>
              <View style={{
                backgroundColor: fairnessCheck.status === 'overcharged' ? '#FEE2E2'
                  : fairnessCheck.status === 'high' ? '#FEF3C7' : '#DCFCE7',
                borderRadius: 50, paddingHorizontal: 10, paddingVertical: 3,
              }}>
                <Text style={{
                  fontSize: 10, fontWeight: '800',
                  color: fairnessCheck.status === 'overcharged' ? '#DC2626'
                    : fairnessCheck.status === 'high' ? '#D97706' : '#16A34A',
                }}>
                  {fairnessCheck.status === 'overcharged' ? 'OVERCHARGED'
                    : fairnessCheck.status === 'high' ? 'MATAAS' : 'FAIR'}
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' }}>
              <Text style={{ color: '#9CA3AF', fontSize: 13 }}>Iyong rate</Text>
              <Text style={{
                fontWeight: '700', fontSize: 13,
                color: fairnessCheck.status === 'overcharged' ? '#DC2626'
                  : fairnessCheck.status === 'high' ? '#D97706' : '#059669',
              }}>₱{fairnessCheck.rate.toFixed(4)}/kWh</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' }}>
              <Text style={{ color: '#9CA3AF', fontSize: 13 }}>ERC maximum</Text>
              <Text style={{ fontWeight: '700', fontSize: 13, color: '#1C2B3A' }}>₱{fairnessCheck.erc.toFixed(4)}/kWh</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 }}>
              <Text style={{ color: '#9CA3AF', fontSize: 13 }}>Pagkakaiba</Text>
              <Text style={{
                fontWeight: '700', fontSize: 13,
                color: fairnessCheck.diff > 0 ? '#DC2626' : '#059669',
              }}>
                {fairnessCheck.diff > 0 ? '+' : ''}₱{fairnessCheck.diff.toFixed(4)}/kWh
              </Text>
            </View>

            {fairnessCheck.status === 'overcharged' && (
              <TouchableOpacity
                onPress={() => router.push('/erc-complaint')}
                activeOpacity={0.85}
                style={{ backgroundColor: '#1C2B3A', borderRadius: 10, paddingVertical: 10, alignItems: 'center', marginTop: 10 }}
              >
                <Text style={{ color: '#F5C518', fontWeight: '800', fontSize: 13 }}>⚖️ Gumawa ng ERC Complaint</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          /* Placeholder card when no bills yet */
          <View style={{
            backgroundColor: '#F8FAFC', borderRadius: 20, padding: 16, marginBottom: 16,
            borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center',
          }}>
            <Text style={{ color: '#94A3B8', fontSize: 13, textAlign: 'center' }}>
              ⚖️ I-scan ang iyong bill para makita ang{'\n'}Fairness Check vs ERC maximum rate
            </Text>
          </View>
        )}

        {/* ── Community Update (Phase 8D) ──────────────────────────────────── */}
        <Text className="font-semibold text-lg mb-3 text-slate-800">Kommunity Update:</Text>

        <View className="flex-row gap-4 mb-4">
          <View className="flex-1 bg-green-50 border border-green-200 rounded-2xl p-4 items-center shadow-sm">
            <Text className="text-2xl font-bold text-green-700">
              {communityStats.totalReports.toLocaleString('en-PH')}
            </Text>
            <Text className="text-xs text-green-600 mt-1 text-center">Bills na-verify</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/map')}
            activeOpacity={0.85}
            className="flex-1 bg-blue-50 border border-blue-200 rounded-2xl p-4 items-center justify-center shadow-sm"
          >
            <Text className="text-xl font-bold text-blue-700">🗺️</Text>
            <Text className="text-xs text-blue-700 font-bold mt-1 text-center">Tingnan ang Heat Map</Text>
          </TouchableOpacity>
        </View>

        {/* Live overcharge bar chart */}
        <View className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm mb-4">
          <Text className="text-sm font-semibold mb-3 text-center text-slate-800">Live Overcharge Data</Text>
          <View className="flex-col gap-3">
            {communityStats.topCities.slice(0, 3).map((city) => {
              const colors = rateToColor(city.avg_rate_per_kwh)
              const barPct = rateToBarPct(city.avg_rate_per_kwh)
              return (
                <View key={city.city}>
                  <View className="flex-row justify-between mb-1">
                    <Text style={{ fontSize: 11, color: colors.text, fontWeight: '600' }}>{colors.label}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text className="text-xs text-slate-500">{city.city}</Text>
                      <Text style={{ fontSize: 10, color: colors.text, fontWeight: '700' }}>
                        ₱{city.avg_rate_per_kwh.toFixed(2)}/kWh
                      </Text>
                    </View>
                  </View>
                  <View className="w-full bg-slate-100 rounded-full h-2">
                    <View style={{ backgroundColor: colors.bar, height: 8, borderRadius: 4, width: `${barPct}%` }} />
                  </View>
                </View>
              )
            })}
          </View>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/map')}
            activeOpacity={0.7}
            style={{ marginTop: 12, alignItems: 'center' }}
          >
            <Text style={{ color: '#94A3B8', fontSize: 11 }}>Tingnan ang lahat ng lungsod →</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  )
}
