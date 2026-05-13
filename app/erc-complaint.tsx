import { View, ScrollView, TouchableOpacity, Linking } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useBillStore } from '@/store/billStore'
import { useState } from 'react'
import AppHeader from '@/components/AppHeader'
import AIGeneratedBanner from '@/components/AIGeneratedBanner'
import { YellowButton } from '@/components/Buttons'
import { Text, TextInput } from '@/components/CustomText'

function InfoRow({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' }}>
      <Text style={{ color: '#9CA3AF', fontSize: 14 }}>{label}</Text>
      <Text style={{ color: valueColor ?? '#1C2B3A', fontSize: 14, fontWeight: '700' }}>{value}</Text>
    </View>
  )
}

export default function ERCComplaintScreen() {
  const billInput = useBillStore((s) => s.billInput)
  const verdict = useBillStore((s) => s.verdict)
  const [message, setMessage] = useState('')

  const hasOvercharge = verdict?.status === 'overcharged'

  return (
    <View style={{ flex: 1, backgroundColor: '#F8F8F8' }}>
      <AppHeader showBack />

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Date + title row */}
        <View style={{ paddingHorizontal: 20, paddingTop: 16, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <TouchableOpacity style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 18 }}>←</Text>
          </TouchableOpacity>
          <View>
            <Text style={{ color: '#9CA3AF', fontSize: 11, fontWeight: '600', letterSpacing: 0.5 }}>
              {new Date().toLocaleDateString('fil-PH', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase()}
            </Text>
            <Text style={{ color: '#1C2B3A', fontSize: 18, fontWeight: '800' }}>ERC Complaint</Text>
          </View>
        </View>

        {/* AI Generated banner */}
        <View style={{
          marginHorizontal: 20, marginTop: 20,
          backgroundColor: '#FFFBEA',
          borderLeftWidth: 4, borderLeftColor: '#F5C518',
          borderRadius: 14, padding: 16,
        }}>
          <Text style={{ color: '#D97706', fontSize: 14, fontWeight: '800', marginBottom: 4 }}>
            Auto-generated ng AI
          </Text>
          <Text style={{ color: '#78350F', fontSize: 13, lineHeight: 19 }}>
            I-review ang form sa ibaba bago i-submit sa ERC portal.
          </Text>
        </View>

        {/* Complaint detail card */}
        <View style={{ marginHorizontal: 20, marginTop: 16, backgroundColor: '#fff', borderRadius: 20, padding: 20, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 }}>
          <InfoRow
            label="Pangalan"
            value="Ka-KuryenteKo"
          />
          {billInput && (
            <>
              <InfoRow
                label="Bill Amount / Consumption"
                value={`₱${billInput.totalAmount?.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${billInput.kwh} kWh)`}
              />
              {verdict && verdict.overchargeAmount > 0 && (
                <InfoRow
                  label="Detected Overcharge"
                  value={`₱${verdict.overchargeAmount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                  valueColor="#DC2626"
                />
              )}
            </>
          )}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14 }}>
            <Text style={{ color: '#9CA3AF', fontSize: 14 }}>Legal Basis</Text>
            <Text style={{ color: '#1C2B3A', fontSize: 14, fontWeight: '800' }}>ERC Rule 16, Sec. 4</Text>
          </View>
        </View>

        {/* Mensahe ng Reklamo */}
        <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
          <Text style={{ color: '#1C2B3A', fontSize: 15, fontWeight: '700', marginBottom: 10 }}>
            Mensahe ng Reklamo
          </Text>
          <TextInput
            style={{
              backgroundColor: '#fff',
              borderRadius: 16,
              padding: 16,
              fontSize: 14,
              color: '#1C2B3A',
              minHeight: 120,
              textAlignVertical: 'top',
              borderWidth: 1,
              borderColor: '#E5E7EB',
              lineHeight: 21,
            }}
            placeholder="Ilagay ang iyong mensahe ng reklamo dito..."
            placeholderTextColor="#D1D5DB"
            multiline
            value={message}
            onChangeText={setMessage}
          />
        </View>

        {/* Grounds for complaint info */}
        <View style={{ marginHorizontal: 20, marginTop: 16, backgroundColor: '#fff', borderRadius: 20, padding: 20, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 }}>
          <Text style={{ color: '#1C2B3A', fontWeight: '700', fontSize: 15, marginBottom: 12 }}>Kailan Pwede Magreklamo?</Text>
          {[
            { icon: '⚡', text: 'Rate mo ay mas mataas sa ERC-approved maximum' },
            { icon: '📊', text: 'System loss charge ay higit sa 8.5% ng iyong consumption' },
            { icon: '🔢', text: 'Mali ang meter reading o binabase sa estimated reading' },
            { icon: '💸', text: 'May dagdag na charges na hindi nakalagay sa kontrata' },
          ].map((item) => (
            <View key={item.text} style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start', marginBottom: 10 }}>
              <Text style={{ fontSize: 15 }}>{item.icon}</Text>
              <Text style={{ color: '#374151', fontSize: 13, flex: 1, lineHeight: 19 }}>{item.text}</Text>
            </View>
          ))}
        </View>

        {/* Steps */}
        <View style={{ marginHorizontal: 20, marginTop: 12, backgroundColor: '#fff', borderRadius: 20, padding: 20, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 }}>
          <Text style={{ color: '#1C2B3A', fontWeight: '700', fontSize: 15, marginBottom: 16 }}>Paano Magreklamo sa ERC</Text>
          {[
            { n: '1', title: 'Makipag-ugnayan muna sa Meralco', body: 'Tawagan ang hotline 16211. Humingi ng formal explanation ng iyong bill.' },
            { n: '2', title: 'I-prepare ang mga dokumento', body: 'Kopya ng bill, 6 buwang kasaysayan ng bill, at written response mula sa Meralco.' },
            { n: '3', title: 'Mag-file ng Consumer Complaint sa ERC', body: 'I-email sa consumer_affairs@erc.ph. Libre ang pag-file ng reklamo.' },
            { n: '4', title: 'I-follow up ang iyong kaso', body: 'Ang ERC ay may 30 araw na deadline para mag-respond sa mga reklamo.' },
          ].map((step) => (
            <View key={step.n} style={{ flexDirection: 'row', gap: 14, marginBottom: 16 }}>
              <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: '#F5C518', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Text style={{ color: '#1C2B3A', fontWeight: '800', fontSize: 14 }}>{step.n}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#1C2B3A', fontWeight: '700', fontSize: 14 }}>{step.title}</Text>
                <Text style={{ color: '#6B7280', fontSize: 13, lineHeight: 19, marginTop: 2 }}>{step.body}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Contact info */}
        <View style={{ marginHorizontal: 20, marginTop: 12, backgroundColor: '#fff', borderRadius: 20, padding: 20, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 }}>
          <Text style={{ color: '#1C2B3A', fontWeight: '700', fontSize: 15, marginBottom: 12 }}>Contact Information</Text>
          {[
            { icon: '📞', label: 'ERC Hotline', value: '(02) 8-9129935', url: 'tel:02-8-9129935' },
            { icon: '📧', label: 'ERC Email', value: 'consumer_affairs@erc.ph', url: 'mailto:consumer_affairs@erc.ph' },
            { icon: '📞', label: 'Meralco Hotline', value: '16211', url: 'tel:16211' },
            { icon: '🌐', label: 'ERC Website', value: 'erc.gov.ph', url: 'https://www.erc.gov.ph' },
          ].map((c) => (
            <TouchableOpacity
              key={c.label}
              onPress={() => Linking.openURL(c.url)}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' }}
              activeOpacity={0.7}
            >
              <Text style={{ fontSize: 18 }}>{c.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#9CA3AF', fontSize: 12 }}>{c.label}</Text>
                <Text style={{ color: '#F5C518', fontSize: 13, fontWeight: '600' }}>{c.value}</Text>
              </View>
              <Text style={{ color: '#D1D5DB', fontSize: 16 }}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Submit button */}
        <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
          <TouchableOpacity
            onPress={() => Linking.openURL('https://www.erc.gov.ph')}
            style={{ backgroundColor: '#F5C518', borderRadius: 50, paddingVertical: 18, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 10 }}
            activeOpacity={0.85}
          >
            <Text style={{ fontSize: 18 }}>✈️</Text>
            <Text style={{ color: '#1C2B3A', fontSize: 16, fontWeight: '800' }}>I-Submit sa ERC</Text>
          </TouchableOpacity>
        </View>

        <Text style={{ color: '#D1D5DB', fontSize: 11, textAlign: 'center', marginTop: 16, paddingHorizontal: 24 }}>
          Ang impormasyon ay base sa ERC Consumer Affairs guidelines. Para sa pinaka-updated na proseso, bisitahin ang erc.gov.ph.
        </Text>
      </ScrollView>
    </View>
  )
}
