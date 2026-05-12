import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useBillStore } from '@/store/billStore'

export default function VerdictScreen() {
  const router = useRouter()
  const verdict = useBillStore((s) => s.verdict)
  const billInput = useBillStore((s) => s.billInput)
  const reset = useBillStore((s) => s.reset)

  if (!verdict || !billInput) {
    router.replace('/')
    return null
  }

  const isOvercharged = verdict.status === 'overcharged'
  const isHigh = verdict.status === 'high'
  const isNormal = verdict.status === 'normal'

  function handleScanNew() {
    reset()
    router.replace('/')
  }

  return (
    <ScrollView className="flex-1 bg-stone-50" contentContainerClassName="pb-12">
      {/* Hero verdict */}
      <View
        className={`px-6 pt-12 pb-10 items-center ${
          isOvercharged ? 'bg-red-500' : isHigh ? 'bg-yellow-500' : 'bg-green-500'
        }`}
      >
        <Text className="text-6xl mb-3">
          {isOvercharged ? '🚨' : isHigh ? '⚠️' : '✅'}
        </Text>
        <Text className="text-white text-3xl font-bold text-center">
          {isOvercharged
            ? 'Na-overcharge Ka!'
            : isHigh
            ? 'Medyo Mataas ang Bill Mo'
            : 'Mukhang Normal ang Bill Mo'}
        </Text>
        <Text className="text-white/80 text-base text-center mt-2">
          {isOvercharged
            ? 'May karapatan kang magreklamo sa ERC.'
            : isHigh
            ? 'Bantayan ang susunod na bill mo.'
            : 'Ang iyong bill ay nasa loob ng ERC limits.'}
        </Text>

        {verdict.overchargeAmount > 0 && (
          <View className="bg-white/25 rounded-3xl px-8 py-5 mt-6 items-center w-full">
            <Text className="text-white/80 text-sm">Tinatayang labis na sinisingil</Text>
            <Text className="text-white text-5xl font-bold mt-1">
              ₱{verdict.overchargeAmount.toFixed(2)}
            </Text>
          </View>
        )}
      </View>

      {/* Rate comparison */}
      <View className="mx-6 mt-6 bg-white rounded-3xl p-5 shadow-sm">
        <Text className="text-stone-800 font-bold text-base mb-4">Rate Comparison</Text>
        <View className="flex-row justify-between mb-3">
          <Text className="text-stone-500 text-sm">Iyong rate</Text>
          <Text
            className={`font-bold text-sm ${
              isOvercharged ? 'text-red-600' : isHigh ? 'text-yellow-600' : 'text-green-600'
            }`}
          >
            ₱{verdict.userRatePerKwh.toFixed(4)}/kWh
          </Text>
        </View>
        <View className="flex-row justify-between mb-3">
          <Text className="text-stone-500 text-sm">ERC maximum</Text>
          <Text className="text-stone-800 font-bold text-sm">
            ₱{verdict.ercMaxRatePerKwh.toFixed(4)}/kWh
          </Text>
        </View>
        <View className="h-px bg-stone-100 my-1" />
        <View className="flex-row justify-between mt-2">
          <Text className="text-stone-500 text-sm">Pagkakaiba</Text>
          <Text
            className={`font-bold text-sm ${
              verdict.userRatePerKwh > verdict.ercMaxRatePerKwh ? 'text-red-600' : 'text-green-600'
            }`}
          >
            {verdict.userRatePerKwh > verdict.ercMaxRatePerKwh ? '+' : ''}
            ₱{(verdict.userRatePerKwh - verdict.ercMaxRatePerKwh).toFixed(4)}/kWh
          </Text>
        </View>
      </View>

      {/* What to do next */}
      <Text className="text-stone-800 text-lg font-bold px-6 mt-6 mb-3">Ano ang Gagawin Mo?</Text>

      <View className="px-6 gap-3">
        {isOvercharged && (
          <>
            <ActionCard
              icon="📋"
              title="Mag-file ng Reklamo sa ERC"
              description="Ang ERC ang nagre-regulate ng electricity rates. Libre ang pag-file ng reklamo."
              onPress={() => router.push('/erc-complaint')}
              highlight
            />
            <ActionCard
              icon="📱"
              title="Tawagan ang Meralco"
              description="Hotline: 16211 — Humingi ng bill explanation o formal dispute."
              onPress={() => {}}
            />
          </>
        )}

        {isHigh && (
          <ActionCard
            icon="👁️"
            title="Bantayan ang Susunod na Bill"
            description="I-scan ulit ang susunod na bill para makita kung patuloy na tumataas."
            onPress={handleScanNew}
          />
        )}

        {isNormal && (
          <ActionCard
            icon="💡"
            title="Tips para Mabawasan ang Bill"
            description="Gamitin ang inverter aircon, LED bulbs, at i-unplug ang hindi ginagamit."
            onPress={() => router.push('/faq')}
          />
        )}

        <ActionCard
          icon="🏘️"
          title="Tingnan ang Community Heat Map"
          description="Alamin kung gaano ka-mataas ang bill sa iyong lungsod kumpara sa ibang lugar."
          onPress={() => router.push('/heat-map')}
        />

        <ActionCard
          icon="🤖"
          title="Magtanong sa AI Assistant"
          description="Hindi pa rin malinaw? Itanong sa aming Taglish AI chatbot."
          onPress={() => router.push('/chat')}
        />
      </View>

      {/* Scan new bill */}
      <TouchableOpacity
        className="mx-6 mt-8 bg-brand-orange rounded-2xl py-4 items-center"
        onPress={handleScanNew}
        activeOpacity={0.85}
      >
        <Text className="text-white text-lg font-bold">I-scan ang Bagong Bill 📄</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

function ActionCard({
  icon,
  title,
  description,
  onPress,
  highlight = false,
}: {
  icon: string
  title: string
  description: string
  onPress: () => void
  highlight?: boolean
}) {
  return (
    <TouchableOpacity
      className={`rounded-2xl p-4 flex-row gap-3 items-start ${
        highlight ? 'bg-red-50 border-2 border-red-200' : 'bg-white border-2 border-stone-100'
      }`}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Text className="text-2xl">{icon}</Text>
      <View className="flex-1">
        <Text className={`font-bold text-sm ${highlight ? 'text-red-700' : 'text-stone-800'}`}>
          {title}
        </Text>
        <Text className="text-stone-500 text-xs mt-1 leading-4">{description}</Text>
      </View>
      <Text className="text-stone-300 text-lg">›</Text>
    </TouchableOpacity>
  )
}
