import { View, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Text } from '@/components/CustomText'

interface AppHeaderProps {
  showBack?: boolean
  showBell?: boolean
  showMenu?: boolean
}

/**
 * Shared top navigation bar matching the KuryenteKo design.
 * Dark navy bar with the KURYENTEKO wordmark centered,
 * hamburger icon on the left, bell on the right.
 */
export default function AppHeader({
  showBack = false,
  showBell = true,
  showMenu = true,
}: AppHeaderProps) {
  const router = useRouter()

  return (
    <SafeAreaView edges={['top']} style={{ backgroundColor: '#1C2B3A' }}>
      <View
        style={{
          backgroundColor: '#1C2B3A',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 20,
          paddingVertical: 12,
        }}
      >
        {/* Left — hamburger or back */}
        {showBack ? (
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={{ color: '#fff', fontSize: 22 }}>←</Text>
          </TouchableOpacity>
        ) : showMenu ? (
          <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <View style={{ gap: 4 }}>
              <View style={{ width: 22, height: 2, backgroundColor: '#fff', borderRadius: 1 }} />
              <View style={{ width: 22, height: 2, backgroundColor: '#fff', borderRadius: 1 }} />
              <View style={{ width: 22, height: 2, backgroundColor: '#fff', borderRadius: 1 }} />
            </View>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 22 }} />
        )}

        {/* Center — Logo wordmark */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 0 }}>
          <Text style={{ color: '#F5C518', fontSize: 18, fontWeight: '900', letterSpacing: 1 }}>
            KUR
          </Text>
          <Text style={{ color: '#1C2B3A', fontSize: 18, fontWeight: '900', backgroundColor: '#F5C518', paddingHorizontal: 2, borderRadius: 2 }}>
            ⚡
          </Text>
          <Text style={{ color: '#F5C518', fontSize: 18, fontWeight: '900', letterSpacing: 1 }}>
            ENTEKO
          </Text>
        </View>

        {/* Right — bell */}
        {showBell ? (
          <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={{ fontSize: 20 }}>🔔</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 22 }} />
        )}
      </View>
    </SafeAreaView>
  )
}
