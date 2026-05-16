import { TouchableOpacity, View, ActivityIndicator } from 'react-native'
import { Text } from '@/components/CustomText'

interface MicButtonProps {
  onPress: () => void
  isRecording: boolean
  isTranscribing: boolean
  size?: number
}

export default function MicButton({ onPress, isRecording, isTranscribing, size = 42 }: MicButtonProps) {
  const radius = size / 2

  if (isTranscribing) {
    return (
      <View style={{
        width: size, height: size, borderRadius: radius,
        backgroundColor: '#FEF3C7',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <ActivityIndicator size="small" color="#F97316" />
      </View>
    )
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={{
        width: size, height: size, borderRadius: radius,
        backgroundColor: isRecording ? '#EF4444' : '#F3F4F6',
        alignItems: 'center', justifyContent: 'center',
        shadowColor: isRecording ? '#EF4444' : 'transparent',
        shadowOpacity: 0.4,
        shadowOffset: { width: 0, height: 0 },
        shadowRadius: 8,
        elevation: isRecording ? 4 : 0,
      }}
    >
      <Text style={{ fontSize: size * 0.43 }}>{isRecording ? '⏹' : '🎙️'}</Text>
    </TouchableOpacity>
  )
}
