import { View } from 'react-native'
import { Text } from '@/components/CustomText'

interface ExplanationRowProps {
  icon: string
  title: string
  description: string
  isLast: boolean
  isUp: boolean
}

/**
 * A single explanation item row on the Resulta (Verdict) screen.
 * Shows icon, title with an up/down trend indicator, and a description.
 */
export default function ExplanationRow({
  icon, title, description, isLast, isUp,
}: ExplanationRowProps) {
  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'flex-start',
      padding: 16,
      gap: 12,
      borderBottomWidth: isLast ? 0 : 1,
      borderBottomColor: '#F3F4F6',
    }}>
      <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFF4CC', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 18 }}>{icon}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={{ color: '#1C2B3A', fontWeight: '700', fontSize: 14 }}>{title}</Text>
          <Text style={{ color: isUp ? '#DC2626' : '#059669', fontSize: 14 }}>
            {isUp ? '▲' : '▼'}
          </Text>
        </View>
        <Text style={{ color: '#6B7280', fontSize: 13, lineHeight: 19, marginTop: 2 }}>
          {description}
        </Text>
      </View>
    </View>
  )
}
