import { View, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { FontAwesome6 } from '@expo/vector-icons'
import TextLogo from '@/assets/KuryenteKo/text-logo.svg'

interface AppHeaderProps {
  showBack?: boolean
  showBell?: boolean
  showMenu?: boolean
}

/**
 * Shared top navigation bar matching the KuryenteKo design.
 * White bar with the KURYENTEKO logo centered,
 * hamburger icon on the left, bell on the right.
 */
export default function AppHeader({
  showBack = false,
  showBell = true,
  showMenu = true,
}: AppHeaderProps) {
  const router = useRouter()

  return (
    <SafeAreaView edges={['top']} style={{ backgroundColor: '#ffffff' }}>
      <View
        style={{
          backgroundColor: '#ffffff',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 20,
          paddingVertical: 8,
          borderBottomWidth: 1,
          borderBottomColor: '#f8fafc',
          zIndex: 10,
        }}
      >
        {/* Left — hamburger or back */}
        <View style={{ flex: 1, alignItems: 'flex-start' }}>
          {showBack ? (
            <TouchableOpacity
              onPress={() => router.back()}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <FontAwesome6 name="arrow-left" size={20} color="#475569" />
            </TouchableOpacity>
          ) : showMenu ? (
            <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <FontAwesome6 name="bars" size={20} color="#475569" />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Center — Logo wordmark */}
        <View style={{ flex: 2, alignItems: 'center' }}>
          <TextLogo height={44} width={220} />
        </View>

        {/* Right — bell */}
        <View style={{ flex: 1, alignItems: 'flex-end' }}>
          {showBell ? (
            <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <FontAwesome6 name="bell" size={20} color="#64748b" solid={false} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </SafeAreaView>
  )
}
