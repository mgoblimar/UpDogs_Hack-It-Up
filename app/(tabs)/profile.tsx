import { View, ScrollView, TouchableOpacity, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { FontAwesome6 } from '@expo/vector-icons'
import { Text } from '@/components/CustomText'
import { supabase } from '@/lib/supabase'

export default function ProfileScreen() {
  const router = useRouter()

  async function handleLogout() {
    Alert.alert('Mag-Log Out', 'Sigurado ka bang gusto mong mag-log out?', [
      { text: 'Kanselahin', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          await supabase.auth.signOut()
          router.replace('/sign-in')
        },
      },
    ])
  }

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-[#f8fafc]">
      <ScrollView contentContainerClassName="px-5 py-4 pb-24">
        
        {/* Avatar Section */}
        <View className="flex-col items-center mb-8 mt-4">
          <View className="w-24 h-24 bg-yellow-400 rounded-full items-center justify-center shadow-lg border-4 border-white mb-3 relative">
            <FontAwesome6 name="user-astronaut" size={36} color="#1e293b" />
            <View className="absolute bottom-0 right-0 bg-green-500 w-6 h-6 rounded-full border-2 border-white" />
          </View>
          <Text className="text-2xl font-bold text-slate-800">Maria Santos</Text>
          <Text className="text-sm text-slate-500 mt-1">Zone 10BA, Manila City</Text>
        </View>

        {/* Menu Section */}
        <View className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6">
          <MenuButton 
            icon="file-invoice" 
            label="Account Details" 
            iconColor="#eab308" 
          />
          <View className="h-[1px] bg-slate-100 w-full" />
          <MenuButton 
            icon="plug" 
            label="My Sub-meter Info" 
            iconColor="#eab308" 
          />
          <View className="h-[1px] bg-slate-100 w-full" />
          <MenuButton 
            icon="gear" 
            label="Settings" 
            iconColor="#94a3b8" 
          />
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          onPress={handleLogout}
          activeOpacity={0.85}
          className="w-full bg-slate-50 border border-red-100 py-4 rounded-2xl items-center shadow-sm mb-8"
        >
          <Text className="text-red-500 font-bold">Log Out</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  )
}

function MenuButton({ icon, label, iconColor }: { icon: string, label: string, iconColor: string }) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      className="w-full flex-row items-center justify-between p-4"
    >
      <View className="flex-row items-center">
        <View className="w-8 items-center justify-center">
          <FontAwesome6 name={icon} size={18} color={iconColor} />
        </View>
        <Text className="text-slate-700 font-medium ml-2">{label}</Text>
      </View>
      <FontAwesome6 name="chevron-right" size={14} color="#94a3b8" />
    </TouchableOpacity>
  )
}
