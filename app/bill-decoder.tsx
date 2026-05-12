import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { useBillStore } from '@/store/billStore'
import { analyzeBill } from '@/services/billAnalysis'
import type { LineItem } from '@/types/bill'

export default function BillDecoderScreen() {
  const router = useRouter()
  const billInput = useBillStore((s) => s.billInput)
  const setVerdict = useBillStore((s) => s.setVerdict)
  const verdict = useBillStore((s) => s.verdict)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    if (!billInput?.totalAmount || !billInput?.kwh) return
    const result = analyzeBill({
      totalAmount: billInput.totalAmount,
      kwh: billInput.kwh,
      city: billInput.city ?? '',
      ...billInput,
    })
    setVerdict(result)
  }, [billInput])

  if (!billInput || !verdict) {
    return (
      <SafeAreaView className="flex-1 bg-stone-50 items-center justify-center">
        <ActivityIndicator size="large" color="#F97316" />
      </SafeAreaView>
    )
  }

  const overallStatus = verdict.status
  const statusColor =
    overallStatus === 'overcharged'
      ? 'bg-red-500'
      : overallStatus === 'high'
      ? 'bg-yellow-500'
      : 'bg-green-500'
  const statusLabel =
    overallStatus === 'overcharged'
      ? '🚨 Posibleng Na-overcharge!'
      : overallStatus === 'high'
      ? '⚠️ Medyo Mataas'
      : '✅ Mukhang Normal'

  return (
    <ScrollView className="flex-1 bg-stone-50" contentContainerClassName="pb-10">
      {/* Header verdict banner */}
      <View className={`${statusColor} px-6 pt-10 pb-8`}>
        <Text className="text-white text-2xl font-bold text-center">{statusLabel}</Text>
        <Text className="text-white/80 text-sm text-center mt-1">
          ₱{verdict.userRatePerKwh.toFixed(2)}/kWh mo vs ERC max na ₱{verdict.ercMaxRatePerKwh.toFixed(2)}/kWh
        </Text>
        {verdict.overchargeAmount > 0 && (
          <View className="bg-white/20 rounded-2xl px-4 py-3 mt-4">
            <Text className="text-white text-center text-sm">Estimated overcharge</Text>
            <Text className="text-white text-center text-3xl font-bold">
              ₱{verdict.overchargeAmount.toFixed(2)}
            </Text>
          </View>
        )}
      </View>

      {/* Summary row */}
      <View className="flex-row mx-6 mt-4 gap-3">
        <SummaryCard label="Total Bill" value={`₱${billInput.totalAmount?.toFixed(2)}`} />
        <SummaryCard label="Consumption" value={`${billInput.kwh} kWh`} />
        <SummaryCard label="Rate/kWh" value={`₱${verdict.userRatePerKwh.toFixed(2)}`} />
      </View>

      {/* Charge breakdown */}
      <Text className="text-stone-800 text-lg font-bold px-6 mt-6 mb-3">
        Breakdown ng Iyong Bill
      </Text>

      <View className="px-6 gap-3">
        {verdict.lineItems.map((item) => (
          <ChargeCard
            key={item.key}
            item={item}
            isExpanded={expanded === item.key}
            onToggle={() => setExpanded(expanded === item.key ? null : item.key)}
          />
        ))}
      </View>

      {/* CTA buttons */}
      <View className="px-6 mt-8 gap-3">
        <TouchableOpacity
          className="bg-brand-orange rounded-2xl py-4 items-center"
          onPress={() => router.push('/verdict')}
          activeOpacity={0.85}
        >
          <Text className="text-white text-lg font-bold">Tingnan ang Buong Verdict ⚡</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-white border-2 border-stone-200 rounded-2xl py-4 items-center"
          onPress={() => router.back()}
          activeOpacity={0.85}
        >
          <Text className="text-stone-600 text-base font-semibold">Bumalik</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-1 bg-white rounded-2xl p-3 items-center shadow-sm">
      <Text className="text-stone-400 text-xs">{label}</Text>
      <Text className="text-stone-800 text-sm font-bold mt-1" numberOfLines={1}>
        {value}
      </Text>
    </View>
  )
}

function ChargeCard({
  item,
  isExpanded,
  onToggle,
}: {
  item: LineItem
  isExpanded: boolean
  onToggle: () => void
}) {
  const statusIcon =
    item.status === 'overcharged' ? '🚨' : item.status === 'high' ? '⚠️' : '✅'
  const statusBorder =
    item.status === 'overcharged'
      ? 'border-red-400'
      : item.status === 'high'
      ? 'border-yellow-400'
      : 'border-stone-200'
  const amountColor =
    item.amount < 0 ? 'text-green-600' : 'text-stone-800'

  return (
    <TouchableOpacity
      className={`bg-white rounded-2xl border-2 ${statusBorder} p-4`}
      onPress={onToggle}
      activeOpacity={0.85}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2 flex-1">
          <Text className="text-lg">{statusIcon}</Text>
          <Text className="text-stone-800 font-semibold text-sm flex-1">{item.label}</Text>
        </View>
        <View className="items-end">
          <Text className={`font-bold text-base ${amountColor}`}>
            ₱{Math.abs(item.amount).toFixed(2)}
          </Text>
          {item.ratePerKwh !== undefined && (
            <Text className="text-stone-400 text-xs">₱{item.ratePerKwh.toFixed(4)}/kWh</Text>
          )}
        </View>
      </View>

      {isExpanded && (
        <View className="mt-3 pt-3 border-t border-stone-100">
          <Text className="text-stone-600 text-sm leading-5">{item.explanation}</Text>
          {item.status !== 'normal' && (
            <View className="bg-red-50 rounded-xl px-3 py-2 mt-2">
              <Text className="text-red-700 text-xs font-semibold">
                {item.status === 'overcharged'
                  ? 'Lumagpas na sa ERC maximum rate!'
                  : 'Malapit na sa ERC maximum rate.'}
              </Text>
            </View>
          )}
        </View>
      )}

      <Text className="text-stone-400 text-xs mt-2 text-right">
        {isExpanded ? 'Itago ▲' : 'Alamin kung bakit ▼'}
      </Text>
    </TouchableOpacity>
  )
}
