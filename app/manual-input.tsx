import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useBillStore } from '@/store/billStore'
import { METRO_MANILA_CITIES } from '@/lib/constants'
import type { BillInput } from '@/types/bill'

interface ManualFormData {
  totalAmount: string
  kwh: string
  city: string
}

export default function ManualInputScreen() {
  const router = useRouter()
  const setBillInput = useBillStore((s) => s.setBillInput)
  const [cityPickerOpen, setCityPickerOpen] = useState(false)

  const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm<ManualFormData>({
    defaultValues: { totalAmount: '', kwh: '', city: '' },
  })

  const selectedCity = watch('city')

  function onSubmit(data: ManualFormData) {
    const totalAmount = parseFloat(data.totalAmount)
    const kwh = parseFloat(data.kwh)

    if (isNaN(totalAmount) || isNaN(kwh) || totalAmount <= 0 || kwh <= 0) {
      Alert.alert('Mali ang input', 'Siguraduhing tama ang mga numero.')
      return
    }

    const billInput: Partial<BillInput> = {
      totalAmount,
      kwh,
      city: data.city,
    }

    setBillInput(billInput)
    router.push('/bill-decoder')
  }

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView className="flex-1 bg-stone-50" contentContainerClassName="px-6 py-8">

        <Text className="text-stone-500 text-base mb-8 text-center">
          3 numero lang ang kailangan para malaman kung tama ang iyong bill.
        </Text>

        {/* Bill Amount */}
        <View className="mb-6">
          <Text className="text-stone-800 font-semibold text-base mb-2">
            Magkano ang iyong bill? *
          </Text>
          <Controller
            control={control}
            name="totalAmount"
            rules={{ required: 'Ilagay ang total amount ng bill.' }}
            render={({ field: { onChange, value } }) => (
              <View className="flex-row items-center bg-white border-2 border-stone-200 rounded-xl px-4 py-3 gap-2">
                <Text className="text-stone-500 text-lg font-bold">₱</Text>
                <TextInput
                  className="flex-1 text-stone-900 text-xl font-semibold"
                  placeholder="0.00"
                  placeholderTextColor="#A8A29E"
                  keyboardType="decimal-pad"
                  value={value}
                  onChangeText={onChange}
                />
              </View>
            )}
          />
          {errors.totalAmount && (
            <Text className="text-red-500 text-sm mt-1">{errors.totalAmount.message}</Text>
          )}
        </View>

        {/* kWh */}
        <View className="mb-6">
          <Text className="text-stone-800 font-semibold text-base mb-2">
            Ilang kWh ang ginamit mo? *
          </Text>
          <Controller
            control={control}
            name="kwh"
            rules={{ required: 'Ilagay ang kWh consumption.' }}
            render={({ field: { onChange, value } }) => (
              <View className="flex-row items-center bg-white border-2 border-stone-200 rounded-xl px-4 py-3 gap-2">
                <TextInput
                  className="flex-1 text-stone-900 text-xl font-semibold"
                  placeholder="0"
                  placeholderTextColor="#A8A29E"
                  keyboardType="number-pad"
                  value={value}
                  onChangeText={onChange}
                />
                <Text className="text-stone-500 text-lg font-bold">kWh</Text>
              </View>
            )}
          />
          {errors.kwh && (
            <Text className="text-red-500 text-sm mt-1">{errors.kwh.message}</Text>
          )}
          <Text className="text-stone-400 text-xs mt-1">
            Makikita ito sa gitna ng iyong bill bilang "kWh Used" o "Consumption"
          </Text>
        </View>

        {/* City */}
        <View className="mb-8">
          <Text className="text-stone-800 font-semibold text-base mb-2">
            Saang lungsod ka nakatira? *
          </Text>
          <TouchableOpacity
            className="bg-white border-2 border-stone-200 rounded-xl px-4 py-3 flex-row items-center justify-between"
            onPress={() => setCityPickerOpen(!cityPickerOpen)}
            activeOpacity={0.8}
          >
            <Text className={selectedCity ? 'text-stone-900 text-lg' : 'text-stone-400 text-lg'}>
              {selectedCity || 'Piliin ang lungsod...'}
            </Text>
            <Text className="text-stone-400">{cityPickerOpen ? '▲' : '▼'}</Text>
          </TouchableOpacity>

          {cityPickerOpen && (
            <View className="bg-white border-2 border-stone-200 rounded-xl mt-1 overflow-hidden shadow-sm">
              {METRO_MANILA_CITIES.map((city) => (
                <TouchableOpacity
                  key={city}
                  className={`px-4 py-3 border-b border-stone-100 ${selectedCity === city ? 'bg-orange-50' : ''}`}
                  onPress={() => {
                    setValue('city', city)
                    setCityPickerOpen(false)
                  }}
                >
                  <Text className={`text-base ${selectedCity === city ? 'text-brand-orange font-semibold' : 'text-stone-700'}`}>
                    {city}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Submit */}
        <TouchableOpacity
          className="bg-brand-orange rounded-2xl py-5 items-center shadow-sm"
          onPress={handleSubmit(onSubmit)}
          activeOpacity={0.85}
        >
          <Text className="text-white text-xl font-bold">I-CHECK NGAYON ⚡</Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  )
}
