import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  TextInput,
} from 'react-native'
import { useRouter } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'
import { useState } from 'react'
import { useBillStore } from '@/store/billStore'
import { extractBillFromImage } from '@/services/ocrService'
import { METRO_MANILA_CITIES } from '@/lib/constants'
import type { BillInput } from '@/types/bill'

type ScanState = 'idle' | 'scanning' | 'confirm' | 'error'

export default function ScannerScreen() {
  const router = useRouter()
  const setBillInput = useBillStore((s) => s.setBillInput)

  const [scanState, setScanState] = useState<ScanState>('idle')
  const [extracted, setExtracted] = useState<Partial<BillInput>>({})
  const [errorMsg, setErrorMsg] = useState('')

  async function handleCapture(fromCamera: boolean) {
    const result = fromCamera
      ? await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          quality: 0.8,
          base64: true,
        })
      : await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          quality: 0.8,
          base64: true,
        })

    if (result.canceled || !result.assets[0]?.base64) return

    setScanState('scanning')
    try {
      const data = await extractBillFromImage(result.assets[0].base64)
      setExtracted(data)
      setScanState('confirm')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Hindi ma-scan ang bill. Subukan ang manual input.'
      setErrorMsg(msg)
      setScanState('error')
    }
  }

  function handleConfirm() {
    if (!extracted.totalAmount || !extracted.kwh) {
      Alert.alert('Kulang ang datos', 'Ilagay ang Total Amount at kWh bago magpatuloy.')
      return
    }
    setBillInput(extracted)
    router.push('/bill-decoder')
  }

  if (scanState === 'scanning') {
    return (
      <SafeAreaView className="flex-1 bg-stone-50 items-center justify-center gap-4 px-6">
        <ActivityIndicator size="large" color="#F97316" />
        <Text className="text-stone-700 text-lg font-semibold text-center">Binabasa ang bill mo...</Text>
        <Text className="text-stone-400 text-sm text-center">Hintayin lang, ilang segundo lang ito.</Text>
      </SafeAreaView>
    )
  }

  if (scanState === 'error') {
    return (
      <SafeAreaView className="flex-1 bg-stone-50 items-center justify-center px-6 gap-6">
        <Text className="text-5xl">😔</Text>
        <Text className="text-stone-800 text-xl font-bold text-center">Hindi Na-scan ang Bill</Text>
        <Text className="text-stone-500 text-base text-center">{errorMsg}</Text>
        <View className="gap-3 w-full">
          <TouchableOpacity
            className="bg-brand-orange rounded-2xl py-4 items-center"
            onPress={() => setScanState('idle')}
          >
            <Text className="text-white text-lg font-bold">Subukan Ulit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-stone-200 rounded-2xl py-4 items-center"
            onPress={() => router.push('/manual-input')}
          >
            <Text className="text-stone-700 text-lg font-semibold">Manual Input na lang</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  if (scanState === 'confirm') {
    return (
      <ScrollView className="flex-1 bg-stone-50" contentContainerClassName="px-6 py-8">
        <Text className="text-stone-800 text-2xl font-bold mb-1">Tama ba ito?</Text>
        <Text className="text-stone-500 text-sm mb-6">I-edit kung mali ang na-extract mula sa iyong bill.</Text>

        <ConfirmField
          label="Total Bill Amount (₱)"
          value={extracted.totalAmount?.toString() ?? ''}
          prefix="₱"
          onChange={(v) => setExtracted({ ...extracted, totalAmount: parseFloat(v) || 0 })}
        />
        <ConfirmField
          label="kWh Consumed"
          value={extracted.kwh?.toString() ?? ''}
          suffix="kWh"
          onChange={(v) => setExtracted({ ...extracted, kwh: parseFloat(v) || 0 })}
        />
        {extracted.generationCharge !== undefined && (
          <ConfirmField
            label="Generation Charge (₱)"
            value={extracted.generationCharge.toString()}
            prefix="₱"
            onChange={(v) => setExtracted({ ...extracted, generationCharge: parseFloat(v) || 0 })}
          />
        )}
        {extracted.transmissionCharge !== undefined && (
          <ConfirmField
            label="Transmission Charge (₱)"
            value={extracted.transmissionCharge.toString()}
            prefix="₱"
            onChange={(v) => setExtracted({ ...extracted, transmissionCharge: parseFloat(v) || 0 })}
          />
        )}
        {extracted.systemLossCharge !== undefined && (
          <ConfirmField
            label="System Loss Charge (₱)"
            value={extracted.systemLossCharge.toString()}
            prefix="₱"
            onChange={(v) => setExtracted({ ...extracted, systemLossCharge: parseFloat(v) || 0 })}
          />
        )}

        <TouchableOpacity
          className="bg-brand-orange rounded-2xl py-5 items-center mt-4 shadow-sm"
          onPress={handleConfirm}
          activeOpacity={0.85}
        >
          <Text className="text-white text-xl font-bold">Tama Na! I-analyze ⚡</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="py-4 items-center mt-2"
          onPress={() => setScanState('idle')}
        >
          <Text className="text-stone-500 text-base">Mag-scan ulit</Text>
        </TouchableOpacity>
      </ScrollView>
    )
  }

  // Idle state — capture options
  return (
    <SafeAreaView className="flex-1 bg-stone-50">
      <View className="flex-1 items-center justify-center px-6 gap-6">
        <Text className="text-7xl">📄</Text>
        <Text className="text-stone-800 text-2xl font-bold text-center">I-scan ang Iyong Bill</Text>
        <Text className="text-stone-500 text-base text-center">
          Siguraduhing malinaw ang larawan. Iwasang maging malabo o may liwanag na sumasalamin.
        </Text>

        <View className="w-full gap-3 mt-4">
          <TouchableOpacity
            className="bg-brand-orange rounded-2xl py-5 flex-row items-center justify-center gap-3 shadow-sm"
            onPress={() => handleCapture(true)}
            activeOpacity={0.85}
          >
            <Text className="text-2xl">📷</Text>
            <Text className="text-white text-xl font-bold">Buksan ang Camera</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-white border-2 border-stone-200 rounded-2xl py-5 flex-row items-center justify-center gap-3"
            onPress={() => handleCapture(false)}
            activeOpacity={0.85}
          >
            <Text className="text-2xl">🖼️</Text>
            <Text className="text-stone-700 text-xl font-semibold">Piliin mula sa Gallery</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="py-4 items-center"
            onPress={() => router.push('/manual-input')}
          >
            <Text className="text-stone-400 text-base">Manual input na lang →</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  )
}

interface ConfirmFieldProps {
  label: string
  value: string
  prefix?: string
  suffix?: string
  onChange: (v: string) => void
}

function ConfirmField({ label, value, prefix, suffix, onChange }: ConfirmFieldProps) {
  return (
    <View className="mb-4">
      <Text className="text-stone-600 text-sm font-medium mb-1">{label}</Text>
      <View className="flex-row items-center bg-white border-2 border-stone-200 rounded-xl px-4 py-3 gap-2">
        {prefix && <Text className="text-stone-500 font-bold">{prefix}</Text>}
        <TextInput
          className="flex-1 text-stone-900 text-lg font-semibold"
          value={value}
          onChangeText={onChange}
          keyboardType="decimal-pad"
        />
        {suffix && <Text className="text-stone-500 font-bold">{suffix}</Text>}
      </View>
    </View>
  )
}
