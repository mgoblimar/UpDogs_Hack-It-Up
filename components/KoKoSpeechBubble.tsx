import { View } from 'react-native'
import { Text } from '@/components/CustomText'

interface KoKoSpeechBubbleProps {
  message?: string
  size?: 'sm' | 'md'
}

/**
 * KoKo the owl mascot with an optional speech bubble.
 * Used on home, scanner, and manual input screens.
 */
export default function KoKoSpeechBubble({
  message = 'Siguraduhing tama ang mga numero para sa mas accurate na analysis!',
  size = 'md',
}: KoKoSpeechBubbleProps) {
  const owlSize = size === 'sm' ? 36 : 48
  const fontSize = size === 'sm' ? 11 : 12

  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 10 }}>
      <Text style={{ fontSize: owlSize }}>🦉</Text>
      <View style={{
        flex: 1,
        backgroundColor: '#F5C518',
        borderRadius: 12,
        borderBottomLeftRadius: 4,
        padding: 10,
      }}>
        <Text style={{ color: '#1C2B3A', fontSize, fontWeight: '600' }}>
          {message}
        </Text>
      </View>
    </View>
  )
}
