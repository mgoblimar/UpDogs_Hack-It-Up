import { View } from 'react-native'
import { Text } from '@/components/CustomText'

export type BillStatus = 'overcharged' | 'high' | 'normal'

const STATUS_MAP: Record<BillStatus, { bg: string; text: string; label: string }> = {
  overcharged: { bg: '#FFE4E4', text: '#DC2626', label: 'Mataas' },
  high:        { bg: '#FEF9C3', text: '#D97706', label: 'Lampas 8.5%' },
  normal:      { bg: '#D1FAE5', text: '#059669', label: 'Normal' },
}

interface StatusBadgeProps {
  status: BillStatus
  /** Optional override label — defaults to the Filipino status label */
  label?: string
}

/**
 * Colored pill badge showing bill charge status.
 * "Mataas" (red), "Lampas 8.5%" (yellow), "Normal" (green)
 */
export default function StatusBadge({ status, label }: StatusBadgeProps) {
  const style = STATUS_MAP[status] ?? STATUS_MAP.normal
  return (
    <View style={{ backgroundColor: style.bg, borderRadius: 50, paddingHorizontal: 10, paddingVertical: 3, alignSelf: 'flex-start' }}>
      <Text style={{ color: style.text, fontSize: 11, fontWeight: '700' }}>
        {label ?? style.label}
      </Text>
    </View>
  )
}

export { STATUS_MAP }
