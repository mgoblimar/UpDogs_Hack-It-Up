import { useState } from 'react'
import { View, ScrollView, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useBillStore } from '@/store/billStore'
import { Text } from '@/components/CustomText'

const LIFELINE_BRACKETS = [
  { range: '0–10 kWh', discount: '100%', note: 'Libre ang kuryente' },
  { range: '11–20 kWh', discount: '100%', note: 'Libre ang kuryente' },
  { range: '21–30 kWh', discount: '100%', note: 'Libre ang kuryente' },
  { range: '31–40 kWh', discount: '100%', note: 'Libre ang kuryente' },
  { range: '41–50 kWh', discount: '100%', note: 'Libre ang kuryente' },
  { range: '51–75 kWh', discount: '50%', note: '50% diskwento sa generation charge' },
  { range: '76–100 kWh', discount: '25%', note: '25% diskwento sa generation charge' },
]

const REQUIREMENTS = [
  'Residential account (bahay, hindi negosyo)',
  'Gumagamit ng 0–100 kWh bawat buwan',
  'Pangunahing tirahan (hindi bakante o pangalawang bahay)',
  'Walang ibang koneksyon sa kuryente sa parehong address',
  'Registered sa Meralco bilang residential customer',
]

const HOW_TO_APPLY = [
  {
    step: '1',
    title: 'Pumunta sa Meralco Business Center',
    body: 'Magdala ng valid ID at proof of residency (barangay certificate o utility bill na nasa pangalan mo).',
  },
  {
    step: '2',
    title: 'I-fill out ang Lifeline Rate Application Form',
    body: 'Humingi ng application form sa customer service desk. Libre ang pag-apply.',
  },
  {
    step: '3',
    title: 'I-submit ang mga requirements',
    body: 'Valid ID, proof of residency, at pinirmahang application form. May verification process si Meralco bago ma-approve.',
  },
  {
    step: '4',
    title: 'Hintayin ang approval',
    body: 'Karaniwan ay 1–2 billing cycles bago ma-apply ang diskwento sa iyong bill.',
  },
]

export default function LifelineCheckerScreen() {
  const billInput = useBillStore((s) => s.billInput)
  const [checked, setChecked] = useState<Record<string, boolean>>({})

  const kwh = billInput?.kwh ?? null
  const isQualified = kwh !== null && kwh <= 100
  const bracket = kwh !== null ? LIFELINE_BRACKETS.find((b, i) => {
    const max = (i + 1) * 10 <= 50 ? (i + 1) * 10 : i < 6 ? 75 : 100
    const min = i === 0 ? 0 : i < 6 ? (i * 10) + 1 : 76
    return kwh >= min && kwh <= max
  }) : null

  const allChecked = REQUIREMENTS.every((_, i) => checked[i])

  return (
    <SafeAreaView className="flex-1 bg-stone-50" edges={['bottom']}>
      <ScrollView className="flex-1" contentContainerClassName="pb-10">

        {/* Header */}
        <View className="bg-brand-orange px-6 pt-6 pb-8">
          <Text className="text-white text-2xl font-bold">Lifeline Rate Checker ⚡</Text>
          <Text className="text-white/80 text-sm mt-1">
            Ang Lifeline Rate ay isang diskwento ng gobyerno para sa mga low-income household na gumagamit ng 100 kWh o mas mababa bawat buwan.
          </Text>
        </View>

        {/* Result card if bill is loaded */}
        {kwh !== null && (
          <View className={`mx-6 -mt-4 rounded-2xl p-5 shadow-sm border-2 ${isQualified ? 'bg-green-50 border-green-300' : 'bg-stone-50 border-stone-200'}`}>
            <Text className={`font-bold text-base mb-1 ${isQualified ? 'text-green-700' : 'text-stone-700'}`}>
              {isQualified ? '✅ Qualified ka sa Lifeline Rate!' : '❌ Hindi Qualified'}
            </Text>
            <Text className={`text-sm ${isQualified ? 'text-green-600' : 'text-stone-500'}`}>
              Ang iyong consumption ay <Text className="font-bold">{kwh} kWh</Text>
              {isQualified
                ? ' — nasa loob ng 100 kWh limit.'
                : ' — higit sa 100 kWh limit para sa Lifeline Rate.'}
            </Text>
            {isQualified && bracket && (
              <View className="mt-3 bg-green-100 rounded-xl px-4 py-3">
                <Text className="text-green-700 text-sm font-bold">{bracket.discount} diskwento</Text>
                <Text className="text-green-600 text-xs mt-0.5">{bracket.note}</Text>
              </View>
            )}
          </View>
        )}

        {/* Discount table */}
        <View className="mx-6 mt-4 bg-white rounded-2xl p-5 shadow-sm">
          <Text className="text-stone-800 font-bold text-base mb-3">Lifeline Rate Brackets</Text>
          <View className="gap-0">
            {LIFELINE_BRACKETS.map((b, i) => {
              const isActive = kwh !== null && (() => {
                const max = i === 4 ? 50 : i === 5 ? 75 : i === 6 ? 100 : (i + 1) * 10
                const min = i === 0 ? 0 : i <= 4 ? (i * 10) + 1 : i === 5 ? 51 : 76
                return kwh >= min && kwh <= max
              })()
              return (
                <View
                  key={b.range}
                  className={`flex-row items-center justify-between py-3 border-b border-stone-50 ${isActive ? 'bg-green-50 -mx-2 px-2 rounded-xl' : ''}`}
                >
                  <Text className={`text-sm ${isActive ? 'text-green-700 font-bold' : 'text-stone-600'}`}>
                    {b.range} {isActive ? '← ikaw' : ''}
                  </Text>
                  <View className="items-end">
                    <Text className={`font-bold text-sm ${isActive ? 'text-green-700' : 'text-stone-800'}`}>
                      {b.discount}
                    </Text>
                    <Text className="text-stone-400 text-xs">{b.note}</Text>
                  </View>
                </View>
              )
            })}
          </View>
        </View>

        {/* Requirements checklist */}
        <View className="mx-6 mt-4 bg-white rounded-2xl p-5 shadow-sm">
          <Text className="text-stone-800 font-bold text-base mb-3">Mga Kinakailangan</Text>
          <Text className="text-stone-400 text-xs mb-3">I-check ang lahat para malaman kung qualified ka:</Text>
          <View className="gap-3">
            {REQUIREMENTS.map((req, i) => (
              <TouchableOpacity
                key={req}
                onPress={() => setChecked((prev) => ({ ...prev, [i]: !prev[i] }))}
                className="flex-row gap-3 items-start"
                activeOpacity={0.7}
              >
                <View className={`w-5 h-5 rounded border-2 items-center justify-center shrink-0 mt-0.5 ${checked[i] ? 'bg-brand-orange border-brand-orange' : 'border-stone-300'}`}>
                  {checked[i] && <Text className="text-white text-xs">✓</Text>}
                </View>
                <Text className={`text-sm flex-1 leading-5 ${checked[i] ? 'text-stone-800' : 'text-stone-500'}`}>
                  {req}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {allChecked && (
            <View className="mt-4 bg-green-50 border border-green-200 rounded-xl p-3">
              <Text className="text-green-700 text-sm font-medium text-center">
                ✅ Mukhang qualified ka! Mag-apply na sa Meralco.
              </Text>
            </View>
          )}
        </View>

        {/* How to apply */}
        <View className="mx-6 mt-4 bg-white rounded-2xl p-5 shadow-sm">
          <Text className="text-stone-800 font-bold text-base mb-4">Paano Mag-apply</Text>
          <View className="gap-5">
            {HOW_TO_APPLY.map((item) => (
              <View key={item.step} className="flex-row gap-4">
                <View className="bg-brand-orange rounded-full w-8 h-8 items-center justify-center shrink-0 mt-0.5">
                  <Text className="text-white font-bold text-sm">{item.step}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-stone-800 font-bold text-sm">{item.title}</Text>
                  <Text className="text-stone-500 text-sm mt-1 leading-5">{item.body}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <Text className="text-stone-300 text-xs text-center mt-6 px-6">
          Base sa ERC Resolution No. 09 Series of 2006 at mga susunod na amendments. Para sa pinaka-updated na impormasyon, makipag-ugnayan sa Meralco.
        </Text>
      </ScrollView>
    </SafeAreaView>
  )
}
