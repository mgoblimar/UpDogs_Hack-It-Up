import { View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import { useEffect, useMemo, useState } from 'react'
import { useBillStore } from '@/store/billStore'
import { analyzeBill } from '@/services/billAnalysis'
import AppHeader from '@/components/AppHeader'
import ChargeRow from '@/components/ChargeRow'
import { Text } from '@/components/CustomText'

export default function BillDecoderScreen() {
  const router = useRouter()
  const billInput = useBillStore((s) => s.billInput)
  const setVerdict = useBillStore((s) => s.setVerdict)
  const [expanded, setExpanded] = useState<string | null>(null)

  // Compute synchronously — no useEffect gap, no stale verdict flash
  const verdict = useMemo(() => {
    if (!billInput?.totalAmount || !billInput?.kwh) return null
    try {
      return analyzeBill({
        totalAmount: billInput.totalAmount,
        kwh: billInput.kwh,
        city: billInput.city ?? '',
        ...billInput,
      })
    } catch {
      return null
    }
  }, [billInput])

  // Write to store so verdict.tsx can read it
  useEffect(() => {
    if (verdict) setVerdict(verdict)
  }, [verdict])

  if (!billInput || !verdict) {
    return (
      <View style={{ flex: 1, backgroundColor: '#F8F8F8' }}>
        <AppHeader showBack />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#F5C518" />
        </View>
      </View>
    )
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F8F8F8' }}>
      <AppHeader showBell showMenu />

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

        {/* Progress dots + date + next page */}
        <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6, marginBottom: 12 }}>
            <View style={{ width: 28, height: 7, borderRadius: 4, backgroundColor: '#F5C518' }} />
            <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: '#E5E7EB' }} />
            <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: '#E5E7EB' }} />
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ color: '#9CA3AF', fontSize: 11, fontWeight: '600', letterSpacing: 0.5 }}>
              {new Date().toLocaleDateString('fil-PH', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase()}
            </Text>
            <TouchableOpacity onPress={() => router.push('/verdict')} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={{ color: '#9CA3AF', fontSize: 12, fontWeight: '600', letterSpacing: 0.5 }}>NEXT PAGE</Text>
              <Text style={{ color: '#9CA3AF', fontSize: 14 }}>→</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Title */}
        <Text style={{ color: '#1C2B3A', fontSize: 24, fontWeight: '800', textAlign: 'center', marginTop: 12, marginBottom: 16 }}>
          Bill Decoder
        </Text>

        {/* Key highlights card */}
        <View style={{ marginHorizontal: 20, backgroundColor: '#1C2B3A', borderRadius: 24, padding: 20, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 10, elevation: 4 }}>
          {/* Total bill — hero */}
          <Text style={{ color: '#94A3B8', fontSize: 12, fontWeight: '600', letterSpacing: 0.5, marginBottom: 2 }}>KABUUANG BILL</Text>
          <Text style={{ color: '#fff', fontSize: 42, fontWeight: '900', letterSpacing: -1, marginBottom: 16 }}>
            ₱{billInput.totalAmount?.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>

          {/* Three stat chips in a row */}
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 14, padding: 12 }}>
              <Text style={{ color: '#64748B', fontSize: 10, fontWeight: '700', letterSpacing: 0.4, marginBottom: 4 }}>kWh USED</Text>
              <Text style={{ color: '#F5C518', fontSize: 20, fontWeight: '800' }}>{billInput.kwh}</Text>
              <Text style={{ color: '#64748B', fontSize: 10, marginTop: 1 }}>kilowatt-hour</Text>
            </View>
            <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 14, padding: 12 }}>
              <Text style={{ color: '#64748B', fontSize: 10, fontWeight: '700', letterSpacing: 0.4, marginBottom: 4 }}>RATE/kWh</Text>
              <Text style={{ color: '#F5C518', fontSize: 20, fontWeight: '800' }}>
                ₱{verdict.userRatePerKwh.toFixed(2)}
              </Text>
              <Text style={{ color: '#64748B', fontSize: 10, marginTop: 1 }}>iyong rate</Text>
            </View>
            <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 14, padding: 12 }}>
              <Text style={{ color: '#64748B', fontSize: 10, fontWeight: '700', letterSpacing: 0.4, marginBottom: 4 }}>LUNGSOD</Text>
              <Text style={{ color: '#F5C518', fontSize: 13, fontWeight: '800', marginTop: 3 }} numberOfLines={2}>
                {billInput.city || 'Hindi tinukoy'}
              </Text>
            </View>
          </View>
        </View>

        {/* Saan napunta ang pera mo section */}
        <Text style={{ color: '#1C2B3A', fontSize: 17, fontWeight: '800', paddingHorizontal: 20, marginTop: 24, marginBottom: 8 }}>
          Saan napunta ang pera mo?
        </Text>

        {verdict.lineItems.some((i) => i.isEstimated) && (
          <View style={{ marginHorizontal: 20, marginBottom: 10, backgroundColor: '#FFFBEA', borderRadius: 12, borderWidth: 1, borderColor: '#FDE68A', paddingHorizontal: 14, paddingVertical: 9, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={{ fontSize: 14 }}>💡</Text>
            <Text style={{ color: '#92400E', fontSize: 12, fontWeight: '600', flex: 1, lineHeight: 18 }}>
              Estimated breakdown — batay sa karaniwang proporsyon ng Meralco. I-scan ang detalyadong bill para sa tumpak na datos.
            </Text>
          </View>
        )}

        <View style={{ marginHorizontal: 20, backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 }}>
          {verdict.lineItems.map((item, index) => (
            <ChargeRow
              key={item.key}
              item={item}
              isLast={index === verdict.lineItems.length - 1}
              isExpanded={expanded === item.key}
              onToggle={() => setExpanded(expanded === item.key ? null : item.key)}
            />
          ))}
        </View>

        {/* CTA */}
        <View style={{ paddingHorizontal: 20, marginTop: 28 }}>
          <TouchableOpacity
            style={{ backgroundColor: '#1C2B3A', borderRadius: 50, paddingVertical: 18, alignItems: 'center' }}
            onPress={() => router.push('/verdict')}
            activeOpacity={0.85}
          >
            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 15, letterSpacing: 1 }}>
              TINGNAN ANG RESULTA ⚡
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  )
}

