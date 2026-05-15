import { View, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import type { LineItem } from '@/types/bill'
import StatusBadge, { STATUS_MAP } from './StatusBadge'
import { Text } from '@/components/CustomText'

export const CHARGE_ICONS: Record<string, string> = {
  generation:   '🏭',
  transmission: '🔌',
  systemLoss:   '💡',
  distribution: '🗺️',
  supply:       '📦',
  metering:     '⏱️',
  taxes:        '🏛️',
}

// Preset questions per charge key — shown as chips when the row is expanded
const CHARGE_QUESTIONS: Record<string, string[]> = {
  generationCharge: [
    'Bakit mataas ang Generation Charge ko?',
    'Paano nakakaapekto ang WESM spot prices sa Generation Charge?',
  ],
  transmissionCharge: [
    'Ano ang Transmission Charge at sino ang kumokontrol?',
    'Bakit may Transmission Charge sa bill ko?',
  ],
  systemLossCharge: [
    'Bakit may System Loss Charge sa aking bill?',
    'Ano ang legal na maximum ng System Loss Charge?',
  ],
  distributionCharge: [
    'Paano kinakalkula ang Distribution Charge ng Meralco?',
    'Pwede bang mag-reklamo sa mataas na Distribution Charge?',
  ],
  universalCharges: [
    'Ano ang Universal Charges at para saan ito?',
    'Bakit kailangan ko pang bayaran ang Universal Charges?',
  ],
  fitAll: [
    'Ano ang FiT-All charge sa aking bill?',
    'Bakit may renewable energy charge sa aking kuryente?',
  ],
  taxes: [
    'Paano kinakalkula ang VAT sa electricity bill?',
    'Mababawasan ba ang taxes sa aking kuryente?',
  ],
  subsidies: [
    'Paano makakakuha ng electricity subsidy?',
    'Sino ang karapat-dapat sa Lifeline Rate subsidy?',
  ],
}

interface ChargeRowProps {
  item: LineItem
  isLast: boolean
  isExpanded: boolean
  onToggle: () => void
}

/**
 * Single row in the Bill Decoder charge breakdown list.
 * Shows icon, label, amount, and StatusBadge. Expands to show explanation
 * + preset question chips that navigate directly to KoKo AI chat.
 */
export default function ChargeRow({ item, isLast, isExpanded, onToggle }: ChargeRowProps) {
  const router = useRouter()
  const statusStyle = STATUS_MAP[item.status] ?? STATUS_MAP.normal
  const icon = CHARGE_ICONS[item.key] ?? '💰'
  const presetQuestions = CHARGE_QUESTIONS[item.key] ?? []

  function askKoKo(question: string) {
    router.push({ pathname: '/chat', params: { q: question } })
  }

  return (
    <TouchableOpacity
      onPress={onToggle}
      activeOpacity={0.85}
      style={{ borderBottomWidth: isLast ? 0 : 1, borderBottomColor: '#F3F4F6' }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 }}>
        {/* Icon circle */}
        <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 20 }}>{icon}</Text>
        </View>

        {/* Label + first sentence of explanation */}
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={{ color: '#1C2B3A', fontWeight: '700', fontSize: 14 }}>{item.label}</Text>
            <Text style={{ color: '#9CA3AF', fontSize: 12 }}>{isExpanded ? '▼' : '▲'}</Text>
          </View>
          <Text style={{ color: '#9CA3AF', fontSize: 12, marginTop: 2 }} numberOfLines={1}>
            {item.explanation?.split('.')[0]}
          </Text>
        </View>

        {/* Amount + status badge */}
        <View style={{ alignItems: 'flex-end', gap: 4 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            {item.isEstimated && (
              <View style={{ backgroundColor: '#F3F4F6', borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1 }}>
                <Text style={{ color: '#9CA3AF', fontSize: 9, fontWeight: '700', letterSpacing: 0.3 }}>EST.</Text>
              </View>
            )}
            <Text style={{ color: '#1C2B3A', fontWeight: '700', fontSize: 15 }}>
              ₱{Math.abs(item.amount).toLocaleString('en-PH', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </Text>
          </View>
          <StatusBadge status={item.status as any} />
        </View>
      </View>

      {/* Expanded panel */}
      {isExpanded && (
        <View style={{ paddingHorizontal: 16, paddingBottom: 16, backgroundColor: '#FAFAFA' }}>
          {/* Full explanation */}
          <Text style={{ color: '#374151', fontSize: 13, lineHeight: 20 }}>{item.explanation}</Text>

          {/* Status warning */}
          {item.status !== 'normal' && (
            <View style={{ backgroundColor: statusStyle.bg, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, marginTop: 8 }}>
              <Text style={{ color: statusStyle.text, fontSize: 12, fontWeight: '600' }}>
                {item.status === 'overcharged'
                  ? '⚠️ Lumagpas na sa ERC maximum rate!'
                  : '⚠️ Malapit na sa ERC maximum rate.'}
              </Text>
            </View>
          )}

          {/* Ask KoKo section */}
          {presetQuestions.length > 0 && (
            <View style={{ marginTop: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <Text style={{ fontSize: 13 }}>🤖</Text>
                <Text style={{ color: '#6B7280', fontSize: 12, fontWeight: '600' }}>Tanungin si KoKo:</Text>
              </View>
              <View style={{ gap: 7 }}>
                {presetQuestions.map((question) => (
                  <TouchableOpacity
                    key={question}
                    onPress={() => askKoKo(question)}
                    activeOpacity={0.8}
                    style={{
                      backgroundColor: '#1C2B3A',
                      borderRadius: 10,
                      paddingVertical: 10,
                      paddingHorizontal: 13,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 8,
                    }}
                  >
                    <Text style={{ color: '#CBD5E1', fontSize: 12, flex: 1, lineHeight: 17 }}>
                      {question}
                    </Text>
                    <Text style={{ color: '#F5C518', fontSize: 13, fontWeight: '800' }}>→</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>
      )}
    </TouchableOpacity>
  )
}
