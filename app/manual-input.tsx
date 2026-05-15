import { View, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert, Image } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useBillStore } from '@/store/billStore'
import type { BillInput } from '@/types/bill'
import AppHeader from '@/components/AppHeader'
import KoKoSpeechBubble from '@/components/KoKoSpeechBubble'
import { PrimaryButton } from '@/components/Buttons'
import { Text, TextInput } from '@/components/CustomText'

interface ManualFormData {
  totalAmount: string
  kwh: string
  city: string
  generationCharge: string
  transmissionCharge: string
  systemLossCharge: string
  distributionCharge: string
  taxes: string
}

export default function ManualInputScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const setBillInput = useBillStore((s) => s.setBillInput)
  const [advancedOpen, setAdvancedOpen] = useState(false)

  const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm<ManualFormData>({
    defaultValues: {
      totalAmount: '', kwh: '', city: '',
      generationCharge: '', transmissionCharge: '',
      systemLossCharge: '', distributionCharge: '', taxes: '',
    },
  })

  function onSubmit(data: ManualFormData) {
    const totalAmount = parseFloat(data.totalAmount)
    const kwh = parseFloat(data.kwh)

    if (isNaN(totalAmount) || isNaN(kwh) || totalAmount <= 0 || kwh <= 0) {
      Alert.alert('Mali ang input', 'Siguraduhing tama ang mga numero.')
      return
    }

    const parse = (v: string) => { const n = parseFloat(v); return isNaN(n) ? undefined : n }

    const billInput: Partial<BillInput> = {
      totalAmount,
      kwh,
      city: data.city,
      generationCharge: parse(data.generationCharge),
      transmissionCharge: parse(data.transmissionCharge),
      systemLossCharge: parse(data.systemLossCharge),
      distributionCharge: parse(data.distributionCharge),
      taxes: parse(data.taxes),
    }

    setBillInput(billInput)
    router.push('/bill-decoder')
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F8F8F8' }}>
      <AppHeader showBack />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: insets.bottom + 32 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Subtitle */}
          <Text style={{ color: '#6B7280', fontSize: 14, textAlign: 'center', marginBottom: 24 }}>
            3 numero lang ang kailangan para malaman kung tama ang iyong bill.
          </Text>

          {/* Bill Amount */}
          <FieldLabel label="Kabuuang halaga ng bill" required hint />
          <Controller
            control={control}
            name="totalAmount"
            rules={{ required: 'Ilagay ang total amount ng bill.' }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={fieldStyle}
                placeholder="₱ 0.00"
                placeholderTextColor="#D1D5DB"
                keyboardType="decimal-pad"
                value={value}
                onChangeText={onChange}
              />
            )}
          />
          {errors.totalAmount && <FieldError msg={errors.totalAmount.message!} />}

          {/* kWh */}
          <FieldLabel label="Kiloawatts na nagamit (kWh)" required hint />
          <Controller
            control={control}
            name="kwh"
            rules={{ required: 'Ilagay ang kWh consumption.' }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={fieldStyle}
                placeholder="0"
                placeholderTextColor="#D1D5DB"
                keyboardType="number-pad"
                value={value}
                onChangeText={onChange}
              />
            )}
          />
          {errors.kwh && <FieldError msg={errors.kwh.message!} />}
          <Text style={{ color: '#9CA3AF', fontSize: 12, marginBottom: 16, marginTop: -10 }}>
            Makikita ito sa gitna ng iyong bill bilang "kWh Used" o "Consumption"
          </Text>

          {/* City */}
          <FieldLabel label="Lungsod / Bayan" required />
          <Controller
            control={control}
            name="city"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={fieldStyle}
                placeholder="hal. Caloocan, Cebu City, Davao..."
                placeholderTextColor="#D1D5DB"
                value={value}
                onChangeText={onChange}
                autoCapitalize="words"
              />
            )}
          />

          {/* Advanced charges — optional */}
          <TouchableOpacity
            onPress={() => setAdvancedOpen(!advancedOpen)}
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, marginBottom: 8 }}
            activeOpacity={0.7}
          >
            <Text style={{ color: '#6B7280', fontSize: 14, fontWeight: '600' }}>
              📋 May breakdown ng charges? (opsyonal)
            </Text>
            <Text style={{ color: '#9CA3AF', fontSize: 13 }}>{advancedOpen ? '▲ Itago' : '▼ Ipakita'}</Text>
          </TouchableOpacity>

          {advancedOpen && (
            <View style={{ backgroundColor: '#F3F4F6', borderRadius: 16, padding: 16, marginBottom: 20, gap: 12 }}>
              <Text style={{ color: '#9CA3AF', fontSize: 12 }}>
                Makikita sa detalye ng iyong bill. Hindi required — para sa mas tumpak na analysis.
              </Text>
              {[
                { name: 'generationCharge' as const, label: 'Generation Charge' },
                { name: 'transmissionCharge' as const, label: 'Transmission Charge' },
                { name: 'systemLossCharge' as const, label: 'System Loss Charge' },
                { name: 'distributionCharge' as const, label: 'Distribution Charge' },
                { name: 'taxes' as const, label: 'Government Taxes / VAT' },
              ].map(({ name, label }) => (
                <View key={name}>
                  <Text style={{ color: '#374151', fontSize: 13, fontWeight: '600', marginBottom: 6 }}>{label} (₱)</Text>
                  <Controller
                    control={control}
                    name={name}
                    render={({ field: { onChange, value } }) => (
                      <TextInput
                        style={[fieldStyle, { backgroundColor: '#fff', marginBottom: 0 }]}
                        placeholder="0.00"
                        placeholderTextColor="#D1D5DB"
                        keyboardType="decimal-pad"
                        value={value}
                        onChangeText={onChange}
                      />
                    )}
                  />
                </View>
              ))}
            </View>
          )}

          {/* KoKo speech bubble */}
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', marginBottom: 20 }}>
            <Image
              source={require('@/assets/KuryenteKo/figures/OwlWaving.png')}
              style={{ width: 56, height: 56 }}
              resizeMode="contain"
            />
            <View style={{ flex: 1, backgroundColor: '#F5C518', borderRadius: 12, borderBottomLeftRadius: 4, padding: 10, marginLeft: 10 }}>
              <Text style={{ color: '#1C2B3A', fontSize: 12, fontWeight: '600' }}>
                Siguraduhing tama ang mga numero para sa mas accurate na analysis!
              </Text>
            </View>
          </View>

          {/* Submit */}
          <TouchableOpacity
            style={{ backgroundColor: '#1C2B3A', borderRadius: 50, paddingVertical: 18, alignItems: 'center' }}
            onPress={handleSubmit(onSubmit)}
            activeOpacity={0.85}
          >
            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 15, letterSpacing: 1 }}>
              I-ANALYZE ANG BILL KO
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  )
}

const fieldStyle: any = {
  backgroundColor: '#fff',
  borderRadius: 14,
  paddingHorizontal: 16,
  paddingVertical: 14,
  fontSize: 16,
  color: '#1C2B3A',
  marginBottom: 16,
  shadowColor: '#000',
  shadowOpacity: 0.04,
  shadowRadius: 4,
  elevation: 1,
}

function FieldLabel({ label, required, hint }: { label: string; required?: boolean; hint?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
      <Text style={{ color: '#1C2B3A', fontWeight: '700', fontSize: 14 }}>{label}</Text>
      {hint && (
        <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: '#F5C518', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#1C2B3A', fontSize: 11, fontWeight: '800' }}>?</Text>
        </View>
      )}
    </View>
  )
}

function FieldError({ msg }: { msg: string }) {
  return <Text style={{ color: '#EF4444', fontSize: 12, marginTop: -10, marginBottom: 12 }}>{msg}</Text>
}
