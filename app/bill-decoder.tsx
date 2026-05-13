import { View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { useBillStore } from '@/store/billStore'
import { analyzeBill } from '@/services/billAnalysis'
import type { LineItem } from '@/types/bill'
import AppHeader from '@/components/AppHeader'
import ChargeRow from '@/components/ChargeRow'
import { Text } from '@/components/CustomText'



export default function BillDecoderScreen() {
  const router = useRouter()
  const billInput = useBillStore((s) => s.billInput)
  const setVerdict = useBillStore((s) => s.setVerdict)
  const verdict = useBillStore((s) => s.verdict)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    if (!billInput?.totalAmount || !billInput?.kwh) return
    const result = analyzeBill({
      totalAmount: billInput.totalAmount,
      kwh: billInput.kwh,
      city: billInput.city ?? '',
      ...billInput,
    })
    setVerdict(result)
  }, [billInput])

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

        {/* Na-scan na Halaga card */}
        <View style={{ marginHorizontal: 20, backgroundColor: '#fff', borderRadius: 20, padding: 24, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 }}>
          <Text style={{ color: '#6B7280', fontSize: 14, marginBottom: 6 }}>Na-scan na Halaga</Text>
          <Text style={{ color: '#1C2B3A', fontSize: 44, fontWeight: '900', letterSpacing: -1 }}>
            ₱{billInput.totalAmount?.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
          <View style={{ backgroundColor: '#F3F4F6', borderRadius: 50, paddingHorizontal: 16, paddingVertical: 8, marginTop: 10 }}>
            <Text style={{ color: '#374151', fontSize: 14, fontWeight: '600' }}>
              {billInput.kwh} kWh • {billInput.city || 'Metro Manila'}
            </Text>
          </View>
        </View>

        {/* Saan napunta ang pera mo section */}
        <Text style={{ color: '#1C2B3A', fontSize: 17, fontWeight: '800', paddingHorizontal: 20, marginTop: 24, marginBottom: 12 }}>
          Saan napunta ang pera mo?
        </Text>

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

