import { View, Text, TouchableOpacity, Image } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useBillStore } from '@/store/billStore'
import { useEffect } from 'react'

export default function HomeScreen() {
  const router = useRouter()
  const reset = useBillStore((s) => s.reset)

  useEffect(() => {
    reset()
  }, [reset])

  return (
    <SafeAreaView className="flex-1 bg-brand-orange">
      {/* Header */}
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-6xl mb-2">⚡</Text>
        <Text className="text-white text-4xl font-bold tracking-tight">KuryenteKo</Text>
        <Text className="text-orange-100 text-base mt-2 text-center">
          "Know Your Bill. Fight Your Bill."
        </Text>
      </View>

      {/* Main CTA */}
      <View className="px-6 pb-12 gap-4">
        <Text className="text-white text-xl font-semibold text-center mb-2">
          Tama ba ang bill mo?
        </Text>

        {/* Scan button */}
        <TouchableOpacity
          onPress={() => router.push('/scanner')}
          className="bg-white rounded-2xl py-5 px-6 flex-row items-center gap-4 shadow-sm"
          activeOpacity={0.85}
        >
          <Text className="text-3xl">📷</Text>
          <View className="flex-1">
            <Text className="text-brand-dark text-lg font-bold">I-scan ang Bill</Text>
            <Text className="text-stone-500 text-sm">Kumuha ng litrato ng iyong bill</Text>
          </View>
          <Text className="text-stone-400 text-xl">›</Text>
        </TouchableOpacity>

        {/* Manual input button */}
        <TouchableOpacity
          onPress={() => router.push('/manual-input')}
          className="bg-orange-600 rounded-2xl py-5 px-6 flex-row items-center gap-4"
          activeOpacity={0.85}
        >
          <Text className="text-3xl">✏️</Text>
          <View className="flex-1">
            <Text className="text-white text-lg font-bold">Manual Input</Text>
            <Text className="text-orange-200 text-sm">I-type ang tatlong numero lang</Text>
          </View>
          <Text className="text-orange-300 text-xl">›</Text>
        </TouchableOpacity>

        <Text className="text-orange-200 text-xs text-center mt-2">
          Hindi kailangan ng account • Libre • Para sa lahat
        </Text>
      </View>
    </SafeAreaView>
  )
}
