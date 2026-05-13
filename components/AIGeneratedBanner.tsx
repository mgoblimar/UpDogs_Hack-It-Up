import { View } from 'react-native'
import { Text } from '@/components/CustomText'

interface AIGeneratedBannerProps {
  title?: string
  message?: string
}

/**
 * Yellow left-border info banner indicating AI-generated content.
 * Used on the ERC Complaint screen.
 */
export default function AIGeneratedBanner({
  title = 'Auto-generated ng AI',
  message = 'I-review ang form sa ibaba bago i-submit sa ERC portal.',
}: AIGeneratedBannerProps) {
  return (
    <View style={{
      backgroundColor: '#FFFBEA',
      borderLeftWidth: 4,
      borderLeftColor: '#F5C518',
      borderRadius: 14,
      padding: 16,
    }}>
      <Text style={{ color: '#D97706', fontSize: 14, fontWeight: '800', marginBottom: 4 }}>
        {title}
      </Text>
      <Text style={{ color: '#78350F', fontSize: 13, lineHeight: 19 }}>
        {message}
      </Text>
    </View>
  )
}
