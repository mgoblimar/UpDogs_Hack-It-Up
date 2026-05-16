import { View, ScrollView, TouchableOpacity, Alert, Animated } from 'react-native'
import { Swipeable } from 'react-native-gesture-handler'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useRef } from 'react'
import { FontAwesome6 } from '@expo/vector-icons'
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

  function handleClearAll() {
    Alert.alert('Burahin Lahat?', 'Mabubura ang lahat ng nakaimbak na bill. Hindi na ito mababawi.', [
      { text: 'Huwag', style: 'cancel' },
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
          onPress={() => router.replace('/(tabs)/home')}
          activeOpacity={0.85}
        >
          <Text className="text-white text-base font-bold">Bumalik sa Home</Text>
        </TouchableOpacity>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-[#f8fafc]">
      <ScrollView contentContainerClassName="px-5 py-4 pb-24">

        {/* Header row — title + Burahin Lahat */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
          <View>
            <Text className="text-2xl font-bold text-slate-800">Bill History</Text>
            <Text className="text-sm text-slate-500 mt-0.5">Tingnan ang iyong mga nakaraang record.</Text>
          </View>
          <TouchableOpacity
            onPress={handleClearAll}
            activeOpacity={0.7}
            style={{ paddingVertical: 6, paddingLeft: 12 }}
          >
            <Text style={{ color: '#EF4444', fontSize: 13, fontWeight: '600' }}>Burahin Lahat</Text>
          </TouchableOpacity>
        </View>

        {/* Swipe hint */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 16, marginTop: 2 }}>
          <Text style={{ color: '#CBD5E1', fontSize: 11 }}>←</Text>
          <Text style={{ color: '#CBD5E1', fontSize: 11 }}>I-swipe pakaliwa para burahin</Text>
        </View>

        <View className="space-y-4">
          {bills.map((record) => (
            <BillCard
              key={record.id}
              record={record}
              onTap={() => handleTap(record)}
              onDelete={() => removeBill(record.id)}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

function DeleteAction({ progress }: { progress: Animated.AnimatedInterpolation<number> }) {
  const scale = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.7, 1],
    extrapolate: 'clamp',
  })
  const opacity = progress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0.8, 1],
    extrapolate: 'clamp',
  })
  return (
    <Animated.View style={{
      backgroundColor: '#EF4444',
      justifyContent: 'center',
      alignItems: 'center',
      width: 80,
      borderRadius: 16,
      marginBottom: 16,
      transform: [{ scale }],
      opacity,
    }}>
      <FontAwesome6 name="trash" size={18} color="#fff" solid />
      <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700', marginTop: 4 }}>Burahin</Text>
    </Animated.View>
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
  const swipeableRef = useRef<Swipeable>(null)
  const { status, overchargeAmount } = record.verdict
  const isOvercharged = status === 'overcharged'
  const isHigh = status === 'high'

  const borderColor = isOvercharged ? 'border-red-200' : isHigh ? 'border-amber-200' : 'border-green-200'
  const leftBarColor = isOvercharged ? 'bg-red-500' : isHigh ? 'bg-amber-400' : 'bg-green-500'
  const badgeBg = isOvercharged ? 'bg-red-100' : isHigh ? 'bg-amber-100' : 'bg-green-100'
  const badgeText = isOvercharged ? 'text-red-700' : isHigh ? 'text-amber-700' : 'text-green-700'
  const badgeLabel = isOvercharged ? 'OVERCHARGED' : isHigh ? 'MEDYO MATAAS' : 'FAIR RATE'
  const badgeIconName = isOvercharged ? 'triangle-exclamation' : isHigh ? 'circle-exclamation' : 'check'
  const badgeIconColor = isOvercharged ? '#b91c1c' : isHigh ? '#b45309' : '#15803d'

  const dateObj = new Date(record.date)
  const formattedDate = dateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).toUpperCase()

  function handleSwipeDelete() {
    swipeableRef.current?.close()
    const month = new Date(record.date).toLocaleDateString('fil-PH', { month: 'long', year: 'numeric' })
    Alert.alert(
      '🗑️ Burahin ang Bill?',
      `${record.city || 'Walang lungsod'} · ${month}\n₱${record.totalAmount.toLocaleString()} · ${record.kwh} kWh\n\nHindi na ito mababawi.`,
      [
        { text: 'Huwag na', style: 'cancel' },
        { text: 'Oo, Burahin', style: 'destructive', onPress: onDelete },
      ]
    )
  }

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={(progress) => <DeleteAction progress={progress} />}
      onSwipeableOpen={handleSwipeDelete}
      rightThreshold={60}
      friction={2}
      overshootRight={false}
    >
      <TouchableOpacity
        className={`bg-white p-4 rounded-2xl border ${borderColor} shadow-sm relative overflow-hidden mb-4`}
        onPress={onTap}
        activeOpacity={0.85}
      >
        <View className={`absolute left-0 top-0 w-1 h-full ${leftBarColor}`} />
        <View className="flex-row justify-between items-center pl-1">
          <View style={{ flex: 1 }}>
            <Text className="text-xs font-bold text-slate-400 mb-1">{formattedDate}</Text>
            <Text className="font-bold text-lg text-slate-800">₱ {record.totalAmount.toFixed(2)}</Text>
            <View className="flex-row items-center mt-1" style={{ gap: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <FontAwesome6 name="bolt" size={10} color="#eab308" solid />
                <Text className="text-xs text-slate-500">{record.kwh} kWh</Text>
              </View>
              {record.city ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <FontAwesome6 name="location-dot" size={10} color="#94A3B8" solid />
                  <Text style={{ color: '#94A3B8', fontSize: 11 }}>{record.city}</Text>
                </View>
              ) : null}
            </View>
          </View>
          <View className="items-end" style={{ gap: 6 }}>
            <View className={`${badgeBg} rounded-full px-3 py-1 flex-row items-center justify-center`}>
              <FontAwesome6 name={badgeIconName} size={10} color={badgeIconColor} solid />
              <Text className={`${badgeText} text-[10px] uppercase font-bold ml-1.5`}>{badgeLabel}</Text>
            </View>
            {isOvercharged && overchargeAmount > 0 && (
              <Text style={{ color: '#EF4444', fontSize: 12, fontWeight: '700' }}>
                +₱{overchargeAmount.toFixed(2)}
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Swipeable>
  )
}
