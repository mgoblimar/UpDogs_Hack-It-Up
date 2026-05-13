import { View, TouchableOpacity } from 'react-native'
import { Text } from '@/components/CustomText'

interface PrimaryButtonProps {
  label: string
  onPress: () => void
  disabled?: boolean
}

interface SecondaryButtonProps {
  label: string
  onPress: () => void
}

/**
 * Full-width navy pill button — primary CTA across all screens.
 */
export function PrimaryButton({ label, onPress, disabled }: PrimaryButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.85}
      style={{
        backgroundColor: disabled ? '#9CA3AF' : '#1C2B3A',
        borderRadius: 9999,
        paddingVertical: 18,
        alignItems: 'center',
      }}
    >
      <Text style={{ color: '#fff', fontWeight: '800', fontSize: 15, letterSpacing: 1 }}>
        {label}
      </Text>
    </TouchableOpacity>
  )
}

/**
 * Full-width yellow pill button — used for accent CTAs (e.g. ERC Submit).
 */
export function YellowButton({ label, onPress, disabled }: PrimaryButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.85}
      style={{
        backgroundColor: disabled ? '#D1D5DB' : '#F5C518',
        borderRadius: 9999,
        paddingVertical: 18,
        alignItems: 'center',
      }}
    >
      <Text style={{ color: '#1C2B3A', fontWeight: '800', fontSize: 15, letterSpacing: 1 }}>
        {label}
      </Text>
    </TouchableOpacity>
  )
}

/**
 * Full-width outlined pill button — secondary action (e.g. "Tingnan ang Area Map").
 */
export function OutlineButton({ label, onPress }: SecondaryButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={{
        borderWidth: 2,
        borderColor: '#E5E7EB',
        borderRadius: 9999,
        paddingVertical: 18,
        alignItems: 'center',
      }}
    >
      <Text style={{ color: '#1C2B3A', fontWeight: '700', fontSize: 15 }}>
        {label}
      </Text>
    </TouchableOpacity>
  )
}
