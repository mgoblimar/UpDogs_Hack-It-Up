import { View, ScrollView, TouchableOpacity, Linking, Image, ActivityIndicator } from 'react-native'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'expo-router'
import { useBillStore } from '@/store/billStore'
import { useHistoryStore } from '@/store/historyStore'
import AppHeader from '@/components/AppHeader'
import ExplanationRow from '@/components/ExplanationRow'
import { Text } from '@/components/CustomText'
import electricityContext from '@/data/electricity-context.json'
import { fetchEnergyNews } from '@/services/newsService'
import type { NewsResult } from '@/services/newsService'

// ─── helpers ──────────────────────────────────────────────────────────────────

function getDomain(url: string): string {
  const m = url.match(/https?:\/\/([^/]+)/)
  return m ? m[1] : url
}

function getFaviconUrl(url: string): string {
  return `https://www.google.com/s2/favicons?domain=${getDomain(url)}&sz=64`
}

const ISSUE_ICONS: Record<string, string> = {
  'Malampaya Natural Gas Field Depletion': '🔥',
  'El Niño at Summer Peak Demand': '☀️',
  'WESM (Wholesale Electricity Spot Market) Price Spikes': '📈',
  'Global Coal Price Fluctuations': '⛏️',
  'Transmission Constraints at Grid Issues': '⚡',
  'Distribution Charge Freeze': '✅',
  'Renewable Energy Transition (FiT-All)': '🌱',
}

const IMPACT_STYLE: Record<string, { bg: string; text: string; dot: string }> = {
  HIGH:   { bg: '#FEE2E2', text: '#DC2626', dot: '#DC2626' },
  MEDIUM: { bg: '#FEF3C7', text: '#D97706', dot: '#D97706' },
  LOW:    { bg: '#DCFCE7', text: '#16A34A', dot: '#16A34A' },
}

/** Returns true during PH summer peak / El Niño season (Mar – Jun) */
function isSummerSeason(): boolean {
  const month = new Date().getMonth() + 1 // 1-indexed
  return month >= 3 && month <= 6
}

// ─── sub-components ───────────────────────────────────────────────────────────

function IssueAccordion({
  issue,
  isOpen,
  onToggle,
  isLast,
}: {
  issue: (typeof electricityContext.keyIssues)[number]
  isOpen: boolean
  onToggle: () => void
  isLast: boolean
}) {
  const style = IMPACT_STYLE[issue.impact] ?? IMPACT_STYLE.LOW
  const icon = ISSUE_ICONS[issue.issue] ?? '📌'

  return (
    <TouchableOpacity
      onPress={onToggle}
      activeOpacity={0.85}
      style={{
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: '#F3F4F6',
      }}
    >
      {/* Row header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 }}>
        <View style={{
          width: 38, height: 38, borderRadius: 19,
          backgroundColor: '#F8FAFC',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <Text style={{ fontSize: 18 }}>{icon}</Text>
        </View>

        <View style={{ flex: 1 }}>
          <Text style={{ color: '#1C2B3A', fontWeight: '700', fontSize: 13, lineHeight: 18 }}>
            {issue.issue}
          </Text>
        </View>

        <View style={{ alignItems: 'flex-end', gap: 4 }}>
          <View style={{ backgroundColor: style.bg, borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 }}>
            <Text style={{ color: style.text, fontSize: 9, fontWeight: '800', letterSpacing: 0.4 }}>
              {issue.impact}
            </Text>
          </View>
          <Text style={{ color: '#9CA3AF', fontSize: 11 }}>{isOpen ? '▲' : '▼'}</Text>
        </View>
      </View>

      {/* Expanded body */}
      {isOpen && (
        <View style={{ paddingHorizontal: 14, paddingBottom: 14, backgroundColor: '#FAFAFA' }}>
          <Text style={{ color: '#374151', fontSize: 13, lineHeight: 20 }}>
            {issue.description}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 8 }}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: style.dot }} />
            <Text style={{ color: '#9CA3AF', fontSize: 11, fontStyle: 'italic', flex: 1 }}>
              {issue.source}
            </Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  )
}

function SourceCard({ source }: { source: { name: string; url: string } }) {
  const domain = getDomain(source.url)
  return (
    <TouchableOpacity
      onPress={() => Linking.openURL(source.url)}
      activeOpacity={0.75}
      style={{
        flexDirection: 'row', alignItems: 'center', gap: 10,
        backgroundColor: '#F8FAFC',
        borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10,
        marginBottom: 8,
        borderWidth: 1, borderColor: '#E2E8F0',
      }}
    >
      <Image
        source={{ uri: getFaviconUrl(source.url) }}
        style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: '#F3F4F6' }}
        resizeMode="contain"
      />
      <View style={{ flex: 1 }}>
        <Text style={{ color: '#1C2B3A', fontSize: 12, fontWeight: '600', lineHeight: 17 }} numberOfLines={2}>
          {source.name}
        </Text>
        <Text style={{ color: '#94A3B8', fontSize: 10, marginTop: 1 }} numberOfLines={1}>{domain}</Text>
      </View>
      <Text style={{ color: '#CBD5E1', fontSize: 16 }}>›</Text>
    </TouchableOpacity>
  )
}

// ─── main screen ──────────────────────────────────────────────────────────────

export default function VerdictScreen() {
  const router = useRouter()
  const verdict = useBillStore((s) => s.verdict)
  const billInput = useBillStore((s) => s.billInput)
  const reset = useBillStore((s) => s.reset)
  const addBill = useHistoryStore((s) => s.addBill)
  const savedRef = useRef(false)

  const [openIssue, setOpenIssue] = useState<string | null>(null)
  const [sourcesOpen, setSourcesOpen] = useState(false)
  const [news, setNews] = useState<NewsResult | null>(null)
  const [newsLoading, setNewsLoading] = useState(true)

  useEffect(() => {
    if (!verdict || !billInput) {
      router.replace('/home')
      return
    }
    if (savedRef.current) return
    savedRef.current = true
    addBill({
      id: `${billInput.city ?? ''}-${billInput.totalAmount ?? 0}-${billInput.kwh ?? 0}`,
      date: new Date().toISOString(),
      city: billInput.city ?? '',
      totalAmount: billInput.totalAmount ?? 0,
      kwh: billInput.kwh ?? 0,
      ratePerKwh: verdict.userRatePerKwh,
      verdict: {
        status: verdict.status,
        overchargeAmount: verdict.overchargeAmount,
        userRatePerKwh: verdict.userRatePerKwh,
        ercMaxRatePerKwh: verdict.ercMaxRatePerKwh,
      },
    })
  }, [verdict, billInput])

  // Fetch live Tavily news on mount
  useEffect(() => {
    fetchEnergyNews()
      .then(setNews)
      .catch(() => null)
      .finally(() => setNewsLoading(false))
  }, [])

  if (!verdict || !billInput) return null

  const isOvercharged = verdict.status === 'overcharged'
  const isHigh = verdict.status === 'high'
  const showElNino = isSummerSeason()

  function handleScanNew() {
    reset()
    router.push('/scanner')
  }

  function toggleIssue(key: string) {
    setOpenIssue((prev) => (prev === key ? null : key))
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F8F8F8' }}>
      <AppHeader showBell showMenu />

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 48 }} showsVerticalScrollIndicator={false}>

        {/* Progress dots + date */}
        <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6, marginBottom: 12 }}>
            <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: '#E5E7EB' }} />
            <View style={{ width: 28, height: 7, borderRadius: 4, backgroundColor: '#F5C518' }} />
            <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: '#E5E7EB' }} />
          </View>
          <Text style={{ color: '#9CA3AF', fontSize: 11, fontWeight: '600', letterSpacing: 0.5, textAlign: 'center' }}>
            {new Date().toLocaleDateString('fil-PH', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase()}
          </Text>
        </View>

        <Text style={{ color: '#1C2B3A', fontSize: 22, fontWeight: '900', textAlign: 'center', marginTop: 8, letterSpacing: 1 }}>
          RESULTA
        </Text>

        {/* ── Main verdict card ── */}
        <View style={{
          marginHorizontal: 20, marginTop: 16, borderRadius: 20,
          backgroundColor: isOvercharged ? '#FFF0F0' : isHigh ? '#FFFBEA' : '#F0FFF4',
          borderWidth: 2,
          borderColor: isOvercharged ? '#FECACA' : isHigh ? '#FDE68A' : '#A7F3D0',
          padding: 24, alignItems: 'center',
          shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
        }}>
          <View style={{
            width: 56, height: 56, borderRadius: 28, borderWidth: 2.5,
            borderColor: isOvercharged ? '#DC2626' : isHigh ? '#D97706' : '#059669',
            alignItems: 'center', justifyContent: 'center', marginBottom: 12,
          }}>
            <Text style={{ fontSize: 24 }}>{isOvercharged ? '⚠️' : isHigh ? '⚠️' : '✅'}</Text>
          </View>

          <Text style={{ color: isOvercharged ? '#DC2626' : isHigh ? '#D97706' : '#059669', fontSize: 18, fontWeight: '800', textAlign: 'center' }}>
            {isOvercharged ? 'May Overcharge!' : isHigh ? 'Medyo Mataas ang Bill!' : 'Mukhang Normal ang Bill Mo'}
          </Text>

          {verdict.overchargeAmount > 0 && (
            <Text style={{ color: isOvercharged ? '#DC2626' : '#D97706', fontSize: 40, fontWeight: '900', letterSpacing: -1, marginVertical: 8 }}>
              ₱{verdict.overchargeAmount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
          )}

          <View style={{
            backgroundColor: isOvercharged ? '#FECACA' : isHigh ? '#FDE68A' : '#A7F3D0',
            borderRadius: 50, paddingHorizontal: 16, paddingVertical: 6, marginTop: 4,
          }}>
            <Text style={{ color: isOvercharged ? '#7F1D1D' : isHigh ? '#78350F' : '#065F46', fontSize: 12, fontWeight: '700' }}>
              {isOvercharged ? 'Sobra sa legal rate ng ERC' : isHigh ? 'Malapit sa ERC maximum' : 'Nasa loob ng ERC limits'}
            </Text>
          </View>
        </View>

        {/* ── El Niño / Summer Alert Banner ── */}
        {showElNino && (
          <View style={{
            marginHorizontal: 20, marginTop: 14,
            backgroundColor: '#FFF7ED',
            borderRadius: 16,
            borderLeftWidth: 4, borderLeftColor: '#F97316',
            padding: 14,
            flexDirection: 'row', gap: 12, alignItems: 'flex-start',
          }}>
            <Text style={{ fontSize: 22 }}>☀️</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#C2410C', fontSize: 13, fontWeight: '800', marginBottom: 3 }}>
                El Niño / Summer Season Alert
              </Text>
              <Text style={{ color: '#7C2D12', fontSize: 12, lineHeight: 18 }}>
                Kasalukuyang tag-araw (Marso–Hunyo). Mataas na demand sa aircon + mababang tubig sa mga dam = mas mahal na kuryente. Ang WESM spot prices ay umabot ng hanggang ₱62/kWh sa peak hours ngayong season.
              </Text>
            </View>
          </View>
        )}

        {/* ── Paliwanag section ── */}
        <Text style={{ color: '#1C2B3A', fontSize: 17, fontWeight: '800', paddingHorizontal: 20, marginTop: 24, marginBottom: 12 }}>
          Paliwanag ng KuryenteKo
        </Text>

        <View style={{ marginHorizontal: 20, backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 }}>
          <ExplanationRow
            icon="📊"
            title={`Iyong Rate: ₱${verdict.userRatePerKwh.toFixed(2)}/kWh`}
            description={`ERC maximum: ₱${verdict.ercMaxRatePerKwh.toFixed(2)}/kWh`}
            isLast={false}
            isUp={isOvercharged || isHigh}
          />
          {verdict.overchargeAmount > 0 && (
            <ExplanationRow
              icon="🏠"
              title="Illegal Sub-meter Rate"
              description={`Ang charge sa iyo ay ₱${verdict.userRatePerKwh.toFixed(2)}/kWh. Ang legal na rate dapat sa iyong lugar ay ₱${verdict.ercMaxRatePerKwh.toFixed(2)}/kWh lang.`}
              isLast={true}
              isUp={true}
            />
          )}
        </View>

        {/* ── Rate comparison card ── */}
        <View style={{ marginHorizontal: 20, marginTop: 12, backgroundColor: '#fff', borderRadius: 20, padding: 20, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 }}>
          <Text style={{ color: '#1C2B3A', fontSize: 15, fontWeight: '700', marginBottom: 12 }}>Rate Comparison</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' }}>
            <Text style={{ color: '#9CA3AF', fontSize: 14 }}>Iyong rate</Text>
            <Text style={{ color: isOvercharged ? '#DC2626' : isHigh ? '#D97706' : '#059669', fontWeight: '700', fontSize: 14 }}>
              ₱{verdict.userRatePerKwh.toFixed(4)}/kWh
            </Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' }}>
            <Text style={{ color: '#9CA3AF', fontSize: 14 }}>ERC maximum</Text>
            <Text style={{ color: '#1C2B3A', fontWeight: '700', fontSize: 14 }}>₱{verdict.ercMaxRatePerKwh.toFixed(4)}/kWh</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 }}>
            <Text style={{ color: '#9CA3AF', fontSize: 14 }}>Pagkakaiba</Text>
            <Text style={{ color: verdict.userRatePerKwh > verdict.ercMaxRatePerKwh ? '#DC2626' : '#059669', fontWeight: '700', fontSize: 14 }}>
              {verdict.userRatePerKwh > verdict.ercMaxRatePerKwh ? '+' : ''}₱{(verdict.userRatePerKwh - verdict.ercMaxRatePerKwh).toFixed(4)}/kWh
            </Text>
          </View>
        </View>

        {/* ── Bakit Mataas? accordion ── */}
        <Text style={{ color: '#1C2B3A', fontSize: 17, fontWeight: '800', paddingHorizontal: 20, marginTop: 24, marginBottom: 12 }}>
          Bakit Ganito ang Presyo?
        </Text>

        <View style={{ marginHorizontal: 20, backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 }}>
          {electricityContext.keyIssues.map((issue, idx) => (
            <IssueAccordion
              key={issue.issue}
              issue={issue}
              isOpen={openIssue === issue.issue}
              onToggle={() => toggleIssue(issue.issue)}
              isLast={idx === electricityContext.keyIssues.length - 1}
            />
          ))}
        </View>

        {/* ── Sources dropdown ── */}
        <View style={{ marginHorizontal: 20, marginTop: 14 }}>
          <TouchableOpacity
            onPress={() => setSourcesOpen((v) => !v)}
            activeOpacity={0.8}
            style={{
              backgroundColor: '#fff',
              borderRadius: sourcesOpen ? 20 : 20,
              borderBottomLeftRadius: sourcesOpen ? 0 : 20,
              borderBottomRightRadius: sourcesOpen ? 0 : 20,
              paddingHorizontal: 18, paddingVertical: 14,
              flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
              shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
              borderBottomWidth: sourcesOpen ? 1 : 0,
              borderBottomColor: '#F3F4F6',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Text style={{ fontSize: 16 }}>📚</Text>
              <Text style={{ color: '#1C2B3A', fontSize: 14, fontWeight: '700' }}>Mga Pinagkukunan</Text>
              <View style={{ backgroundColor: '#F3F4F6', borderRadius: 10, paddingHorizontal: 7, paddingVertical: 2 }}>
                <Text style={{ color: '#6B7280', fontSize: 11, fontWeight: '700' }}>{electricityContext.sources.length}</Text>
              </View>
            </View>
            <Text style={{ color: '#9CA3AF', fontSize: 13 }}>{sourcesOpen ? '▲' : '▼'}</Text>
          </TouchableOpacity>

          {sourcesOpen && (
            <View style={{
              backgroundColor: '#fff',
              borderBottomLeftRadius: 20,
              borderBottomRightRadius: 20,
              paddingHorizontal: 16,
              paddingTop: 12,
              paddingBottom: 16,
              shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
            }}>
              <Text style={{ color: '#9CA3AF', fontSize: 11, marginBottom: 10 }}>
                Naka-base ang data sa mga sumusunod na sources. I-tap para buksan.
              </Text>
              {electricityContext.sources.map((src) => (
                <SourceCard key={src.url} source={src} />
              ))}
            </View>
          )}
        </View>

        {/* ── Live News (Tavily) ── */}
        {!newsLoading && (!news || news.articles.length === 0) && (
          <View style={{ marginHorizontal: 20, marginTop: 14, backgroundColor: '#F8FAFC', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center', gap: 6 }}>
            <Text style={{ fontSize: 20 }}>📰</Text>
            <Text style={{ color: '#94A3B8', fontSize: 13, fontWeight: '600' }}>Walang live news ngayon</Text>
            <Text style={{ color: '#CBD5E1', fontSize: 11, textAlign: 'center' }}>Idagdag ang EXPO_PUBLIC_TAVILY_API_KEY sa .env para makita ang pinakabagong balita</Text>
          </View>
        )}

        {(newsLoading || (news && news.articles.length > 0)) && (
          <View style={{ marginHorizontal: 20, marginTop: 14 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <Text style={{ color: '#1C2B3A', fontSize: 15, fontWeight: '800' }}>📰 Pinakabagong Balita</Text>
              {newsLoading && <ActivityIndicator size="small" color="#F5C518" />}
            </View>

            {news && news.summary ? (
              <View style={{ backgroundColor: '#FFFBEA', borderRadius: 14, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: '#FDE68A' }}>
                <Text style={{ color: '#78350F', fontSize: 12, lineHeight: 18 }}>{news.summary}</Text>
              </View>
            ) : null}

            {news?.articles.map((article) => {
              const domain = article.url.match(/https?:\/\/([^/]+)/)?.[1] ?? article.url
              const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`
              const dateLabel = article.publishedDate
                ? new Date(article.publishedDate).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
                : null

              return (
                <TouchableOpacity
                  key={article.url}
                  onPress={() => Linking.openURL(article.url)}
                  activeOpacity={0.75}
                  style={{
                    flexDirection: 'row', alignItems: 'center', gap: 10,
                    backgroundColor: '#fff', borderRadius: 12,
                    paddingHorizontal: 12, paddingVertical: 10, marginBottom: 8,
                    borderWidth: 1, borderColor: '#E2E8F0',
                    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
                  }}
                >
                  <Image
                    source={{ uri: faviconUrl }}
                    style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: '#F3F4F6' }}
                    resizeMode="contain"
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: '#1C2B3A', fontSize: 12, fontWeight: '600', lineHeight: 17 }} numberOfLines={2}>
                      {article.title}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
                      <Text style={{ color: '#94A3B8', fontSize: 10 }} numberOfLines={1}>{domain}</Text>
                      {dateLabel && (
                        <Text style={{ color: '#CBD5E1', fontSize: 10 }}>· {dateLabel}</Text>
                      )}
                    </View>
                  </View>
                  <Text style={{ color: '#CBD5E1', fontSize: 16 }}>›</Text>
                </TouchableOpacity>
              )
            })}
          </View>
        )}

        {/* ── Mga Pwedeng Gawin ── */}
        <Text style={{ color: '#1C2B3A', fontSize: 17, fontWeight: '800', paddingHorizontal: 20, marginTop: 24, marginBottom: 12 }}>
          Mga Pwedeng Gawin:
        </Text>

        <View style={{ paddingHorizontal: 20, gap: 10 }}>
          {(isOvercharged || isHigh) && (
            <TouchableOpacity
              onPress={() => router.push('/erc-complaint')}
              activeOpacity={0.85}
              style={{ backgroundColor: '#1C2B3A', borderRadius: 14, paddingVertical: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 }}
            >
              <Text style={{ fontSize: 18 }}>⚖️</Text>
              <Text style={{ color: '#fff', fontSize: 15, fontWeight: '800' }}>Gumawa ng ERC Complaint</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={() => router.push('/(tabs)/map')}
            activeOpacity={0.85}
            style={{ backgroundColor: '#fff', borderRadius: 14, paddingVertical: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderWidth: 2, borderColor: '#E5E7EB' }}
          >
            <Text style={{ fontSize: 18 }}>🗺️</Text>
            <Text style={{ color: '#1C2B3A', fontSize: 15, fontWeight: '700' }}>Tingnan ang Area Map</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/chat')}
            activeOpacity={0.85}
            style={{ backgroundColor: '#fff', borderRadius: 14, paddingVertical: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderWidth: 2, borderColor: '#E5E7EB' }}
          >
            <Text style={{ fontSize: 18 }}>🤖</Text>
            <Text style={{ color: '#1C2B3A', fontSize: 15, fontWeight: '700' }}>Magtanong sa KoKo AI</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleScanNew}
            activeOpacity={0.7}
            style={{ paddingVertical: 14, alignItems: 'center' }}
          >
            <Text style={{ color: '#9CA3AF', fontSize: 13 }}>📄 I-scan ang Bagong Bill</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  )
}
