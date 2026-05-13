import { View, ScrollView, TouchableOpacity, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useHistoryStore } from '@/store/historyStore'
import { useBillStore } from '@/store/billStore'
import type { BillRecord } from '@/types/bill'
import { Text } from '@/components/CustomText'

export default function HistoryScreen() {
  const router = useRouter()
  const bills = useHistoryStore((s) => s.bills)
  const removeBill = useHistoryStore((s) => s.removeBill)
  const clearHistory = useHistoryStore((s) => s.clearHistory)
  const setBillInput = useBillStore((s) => s.setBillInput)
  const setVerdict = useBillStore((s) => s.setVerdict)

  function handleTap(record: BillRecord) {
    setBillInput({
      totalAmount: record.totalAmount,
      kwh: record.kwh,
      city: record.city,
      ratePerKwh: record.ratePerKwh,
    })
    setVerdict({
      status: record.verdict.status,
      overchargeAmount: record.verdict.overchargeAmount,
      userRatePerKwh: record.verdict.userRatePerKwh,
      ercMaxRatePerKwh: record.verdict.ercMaxRatePerKwh,
      lineItems: [],
    })
    router.push('/verdict')
  }

  function handleDelete(id: string) {
    Alert.alert('Burahin?', 'Aalisin ang bill na ito sa kasaysayan.', [
      { text: 'Hindi', style: 'cancel' },
      { text: 'Burahin', style: 'destructive', onPress: () => removeBill(id) },
    ])
  }

  function handleClearAll() {
    Alert.alert('Burahin Lahat?', 'Mabubura ang lahat ng nakaimbak na bill.', [
      { text: 'Hindi', style: 'cancel' },
      { text: 'Burahin Lahat', style: 'destructive', onPress: clearHistory },
    ])
  }

  if (bills.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-stone-50 items-center justify-center px-6 gap-4">
        <Text className="text-5xl">📋</Text>
        <Text className="text-stone-800 text-xl font-bold text-center">Walang Kasaysayan</Text>
        <Text className="text-stone-500 text-base text-center">
          Wala pang na-scan na bill. I-scan ang iyong bill ngayon!
        </Text>
        <TouchableOpacity
          className="bg-brand-orange rounded-2xl py-4 px-8 mt-4"
          onPress={() => router.replace('/')}
          activeOpacity={0.85}
        >
          <Text className="text-white text-base font-bold">Bumalik sa Home</Text>
        </TouchableOpacity>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-stone-50">
      <ScrollView contentContainerClassName="px-5 py-4 pb-12">
        <Text className="text-stone-500 text-sm mb-4">
          {bills.length} na bill • Pinakabago muna
        </Text>

        <View className="gap-3">
          {bills.map((record) => (
            <BillCard
              key={record.id}
              record={record}
              onTap={() => handleTap(record)}
              onDelete={() => handleDelete(record.id)}
            />
          ))}
        </View>

        <TouchableOpacity
          className="mt-8 py-4 items-center border-2 border-red-200 rounded-2xl"
          onPress={handleClearAll}
          activeOpacity={0.85}
        >
          <Text className="text-red-500 font-semibold">Burahin Lahat</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

function BillCard({
  record,
  onTap,
  onDelete,
}: {
  record: BillRecord
  onTap: () => void
  onDelete: () => void
}) {
  const { status, overchargeAmount } = record.verdict
  const isOvercharged = status === 'overcharged'
  const isHigh = status === 'high'

  const badge = isOvercharged ? '🚨' : isHigh ? '⚠️' : '✅'
  const badgeBg = isOvercharged ? 'bg-red-100' : isHigh ? 'bg-yellow-100' : 'bg-green-100'
  const badgeText = isOvercharged ? 'text-red-700' : isHigh ? 'text-yellow-700' : 'text-green-700'
  const badgeLabel = isOvercharged ? 'Na-overcharge' : isHigh ? 'Medyo Mataas' : 'Normal'

  const dateObj = new Date(record.date)
  const formatted = dateObj.toLocaleDateString('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <TouchableOpacity
      className="bg-white rounded-2xl p-4 border-2 border-stone-100"
      onPress={onTap}
      onLongPress={onDelete}
      activeOpacity={0.85}
    >
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-1">
          <Text className="text-stone-800 font-bold text-base">
            {record.city || 'Hindi tinukoy'}
          </Text>
          <Text className="text-stone-400 text-xs mt-0.5">{formatted}</Text>
        </View>
        <View className={`${badgeBg} rounded-xl px-3 py-1 flex-row items-center gap-1`}>
          <Text className="text-sm">{badge}</Text>
          <Text className={`${badgeText} text-xs font-semibold`}>{badgeLabel}</Text>
        </View>
      </View>

      <View className="flex-row gap-4">
        <View className="flex-1">
          <Text className="text-stone-400 text-xs">Kabuuang Bill</Text>
          <Text className="text-stone-800 font-bold text-lg">
            ₱{record.totalAmount.toFixed(2)}
          </Text>
        </View>
        <View className="flex-1">
          <Text className="text-stone-400 text-xs">Consumption</Text>
          <Text className="text-stone-800 font-bold text-lg">{record.kwh} kWh</Text>
        </View>
        <View className="flex-1">
          <Text className="text-stone-400 text-xs">Rate/kWh</Text>
          <Text className="text-stone-800 font-bold text-lg">
            ₱{record.ratePerKwh.toFixed(2)}
          </Text>
        </View>
      </View>

      {isOvercharged && overchargeAmount > 0 && (
        <View className="mt-3 bg-red-50 rounded-xl px-3 py-2">
          <Text className="text-red-600 text-xs font-semibold">
            Tinatayang labis: ₱{overchargeAmount.toFixed(2)}
          </Text>
        </View>
      )}

      <Text className="text-stone-300 text-xs text-right mt-2">
        Pindutin nang matagal para burahin
      </Text>
    </TouchableOpacity>
  )
}
