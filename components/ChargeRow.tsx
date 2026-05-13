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

interface ChargeRowProps {
  item: LineItem
  isLast: boolean
  isExpanded: boolean
  onToggle: () => void
}

/**
 * Single row in the Bill Decoder charge breakdown list.
 * Shows icon, label, amount, and StatusBadge. Expands to show explanation + inline AI hint.
 */
export default function ChargeRow({ item, isLast, isExpanded, onToggle }: ChargeRowProps) {
  const router = useRouter()
  const statusStyle = STATUS_MAP[item.status] ?? STATUS_MAP.normal
  const icon = CHARGE_ICONS[item.key] ?? '💰'

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
          <Text style={{ color: '#1C2B3A', fontWeight: '700', fontSize: 15 }}>
            ₱{Math.abs(item.amount).toLocaleString('en-PH', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </Text>
          <StatusBadge status={item.status as any} />
        </View>
      </View>

      {/* Expanded explanation panel */}
      {isExpanded && (
        <View style={{ paddingHorizontal: 16, paddingBottom: 16, backgroundColor: '#FAFAFA' }}>
          <Text style={{ color: '#374151', fontSize: 13, lineHeight: 20 }}>{item.explanation}</Text>
          {item.status !== 'normal' && (
            <View style={{ backgroundColor: statusStyle.bg, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, marginTop: 8 }}>
              <Text style={{ color: statusStyle.text, fontSize: 12, fontWeight: '600' }}>
                {item.status === 'overcharged'
                  ? '⚠️ Lumagpas na sa ERC maximum rate!'
                  : '⚠️ Malapit na sa ERC maximum rate.'}
              </Text>
            </View>
          )}
          {/* Inline AI hint */}
          <TouchableOpacity
            onPress={() => router.push('/chat')}
            style={{ backgroundColor: '#1C2B3A', borderRadius: 12, padding: 10, marginTop: 10, flexDirection: 'row', alignItems: 'center', gap: 8 }}
          >
            <Text style={{ color: '#fff', fontSize: 12, flex: 1 }}>
              I-type dito ang iyong katanungan...
            </Text>
            <Text style={{ color: '#F5C518', fontSize: 13, fontWeight: '700' }}>Tanungin →</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  )
}
