import { View, ScrollView, TouchableOpacity, Linking } from 'react-native'
import { useEffect, useRef } from 'react'
import { useRouter } from 'expo-router'
import { useBillStore } from '@/store/billStore'
import { useHistoryStore } from '@/store/historyStore'
import AppHeader from '@/components/AppHeader'
import ExplanationRow from '@/components/ExplanationRow'
import { PrimaryButton, OutlineButton } from '@/components/Buttons'
import { Text } from '@/components/CustomText'

export default function VerdictScreen() {
  const router = useRouter()
  const verdict = useBillStore((s) => s.verdict)
  const billInput = useBillStore((s) => s.billInput)
  const reset = useBillStore((s) => s.reset)
  const addBill = useHistoryStore((s) => s.addBill)
  const savedRef = useRef(false)

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

  if (!verdict || !billInput) return null

  const isOvercharged = verdict.status === 'overcharged'
  const isHigh = verdict.status === 'high'
  const isNormal = verdict.status === 'normal'

  function handleScanNew() {
    reset()
    router.replace('/home')
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

        {/* Main verdict card */}
        <View style={{
          marginHorizontal: 20,
          marginTop: 16,
          borderRadius: 20,
          backgroundColor: isOvercharged ? '#FFF0F0' : isHigh ? '#FFFBEA' : '#F0FFF4',
          borderWidth: 2,
          borderColor: isOvercharged ? '#FECACA' : isHigh ? '#FDE68A' : '#A7F3D0',
          padding: 24,
          alignItems: 'center',
          shadowColor: '#000',
          shadowOpacity: 0.06,
          shadowRadius: 8,
          elevation: 2,
        }}>
          {/* Warning / Check icon */}
          <View style={{
            width: 56, height: 56, borderRadius: 28,
            backgroundColor: 'transparent',
            borderWidth: 2.5,
            borderColor: isOvercharged ? '#DC2626' : isHigh ? '#D97706' : '#059669',
            alignItems: 'center', justifyContent: 'center',
            marginBottom: 12,
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

        {/* Paliwanag section */}
        <Text style={{ color: '#1C2B3A', fontSize: 17, fontWeight: '800', paddingHorizontal: 20, marginTop: 24, marginBottom: 12 }}>
          Paliwanag ng KuryenteKo
        </Text>

        <View style={{ marginHorizontal: 20, backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 }}>
          {/* Rate comparison rows */}
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
              title={`Illegal Sub-meter Rate`}
              description={`Ang charge sa iyo ay ₱${verdict.userRatePerKwh.toFixed(2)}/kWh. Ang legal na rate dapat sa iyong lugar ay ₱${verdict.ercMaxRatePerKwh.toFixed(2)}/kWh lang.`}
              isLast={true}
              isUp={true}
            />
          )}
        </View>

        {/* Rate comparison card */}
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

        {/* Mga Pwedeng Gawin */}
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
            onPress={() => router.push('/heat-map')}
            activeOpacity={0.85}
            style={{ backgroundColor: '#fff', borderRadius: 14, paddingVertical: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderWidth: 2, borderColor: '#E5E7EB' }}
          >
            <Text style={{ fontSize: 18 }}>🗺️</Text>
            <Text style={{ color: '#1C2B3A', fontSize: 15, fontWeight: '700' }}>Tingnan ang Area Map</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/chat')}
            activeOpacity={0.85}
            style={{ backgroundColor: '#fff', borderRadius: 14, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 }}
          >
            <Text style={{ fontSize: 16 }}>🤖</Text>
            <Text style={{ color: '#9CA3AF', fontSize: 14, fontWeight: '600' }}>Magtanong sa KoKo AI</Text>
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

