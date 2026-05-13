import { View, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'
import { useState } from 'react'
import { useBillStore } from '@/store/billStore'
import { extractBillFromImage } from '@/services/ocrService'
import { METRO_MANILA_CITIES } from '@/lib/constants'
import type { BillInput } from '@/types/bill'
import AppHeader from '@/components/AppHeader'
import KoKoSpeechBubble from '@/components/KoKoSpeechBubble'
import { PrimaryButton } from '@/components/Buttons'
import { Text, TextInput } from '@/components/CustomText'

type ScanState = 'idle' | 'scanning' | 'confirm' | 'error'
type TabMode = 'scan' | 'manual'

export default function ScannerScreen() {
  const router = useRouter()
  const setBillInput = useBillStore((s) => s.setBillInput)

  const [tab, setTab] = useState<TabMode>('scan')
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
      console.error('[OCR Error]', err)
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
      <View style={{ flex: 1, backgroundColor: '#F8F8F8' }}>
        <AppHeader showBack />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, paddingHorizontal: 24 }}>
          <ActivityIndicator size="large" color="#F5C518" />
          <Text style={{ color: '#1C2B3A', fontSize: 18, fontWeight: '700', textAlign: 'center' }}>
            Binabasa ang bill mo...
          </Text>
          <Text style={{ color: '#9CA3AF', fontSize: 14, textAlign: 'center' }}>
            Hintayin lang, ilang segundo lang ito.
          </Text>
        </View>
      </View>
    )
  }

  if (scanState === 'error') {
    return (
      <View style={{ flex: 1, backgroundColor: '#F8F8F8' }}>
        <AppHeader showBack />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, gap: 20 }}>
          <Text style={{ fontSize: 56 }}>😔</Text>
          <Text style={{ color: '#1C2B3A', fontSize: 22, fontWeight: '800', textAlign: 'center' }}>
            Hindi Na-scan ang Bill
          </Text>
          <Text style={{ color: '#6B7280', fontSize: 15, textAlign: 'center' }}>{errorMsg}</Text>
          <TouchableOpacity
            style={{ backgroundColor: '#F5C518', borderRadius: 14, paddingVertical: 16, paddingHorizontal: 32, width: '100%', alignItems: 'center' }}
            onPress={() => setScanState('idle')}
          >
            <Text style={{ color: '#1C2B3A', fontSize: 16, fontWeight: '800' }}>Subukan Ulit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ backgroundColor: '#E5E7EB', borderRadius: 14, paddingVertical: 16, paddingHorizontal: 32, width: '100%', alignItems: 'center' }}
            onPress={() => setTab('manual')}
          >
            <Text style={{ color: '#1C2B3A', fontSize: 16, fontWeight: '600' }}>Manual Input na lang</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  if (scanState === 'confirm') {
    return (
      <View style={{ flex: 1, backgroundColor: '#F8F8F8' }}>
        <AppHeader showBack />
        <ConfirmScreen
          extracted={extracted}
          onExtractedChange={setExtracted}
          onConfirm={handleConfirm}
          onRescan={() => setScanState('idle')}
        />
      </View>
    )
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F8F8F8' }}>
      <AppHeader showBack />

      {/* Date row */}
      <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
        <Text style={{ color: '#9CA3AF', fontSize: 11, fontWeight: '600', letterSpacing: 0.5 }}>
          {new Date().toLocaleDateString('fil-PH', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase()}
        </Text>

        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 12 }}>
          {/* Back button circle */}
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' }}
          >
            <Text style={{ fontSize: 18 }}>←</Text>
          </TouchableOpacity>
          <View>
            <Text style={{ color: '#1C2B3A', fontSize: 17, fontWeight: '700' }}>Suriin natin ang iyong bill,</Text>
            <Text style={{ color: '#F5C518', fontSize: 17, fontWeight: '800' }}>Ka-KuryenteKo!</Text>
          </View>
        </View>
      </View>

      {/* Tab toggle */}
      <View style={{ marginHorizontal: 20, marginTop: 20, backgroundColor: '#E5E7EB', borderRadius: 50, flexDirection: 'row', padding: 4 }}>
        <TouchableOpacity
          onPress={() => setTab('scan')}
          style={{
            flex: 1, paddingVertical: 12, borderRadius: 50, alignItems: 'center',
            backgroundColor: tab === 'scan' ? '#F5C518' : 'transparent',
          }}
          activeOpacity={0.8}
        >
          <Text style={{ fontWeight: '700', color: tab === 'scan' ? '#1C2B3A' : '#6B7280', fontSize: 14 }}>
            Photo Scan
          </Text>
        </TouchableOpacity>
        <View style={{ width: 1, backgroundColor: '#D1D5DB', marginVertical: 8 }} />
        <TouchableOpacity
          onPress={() => setTab('manual')}
          style={{
            flex: 1, paddingVertical: 12, borderRadius: 50, alignItems: 'center',
            backgroundColor: tab === 'manual' ? '#F5C518' : 'transparent',
          }}
          activeOpacity={0.8}
        >
          <Text style={{ fontWeight: '700', color: tab === 'manual' ? '#1C2B3A' : '#6B7280', fontSize: 14 }}>
            Manual Input
          </Text>
        </TouchableOpacity>
      </View>

      {tab === 'scan' ? (
        <ScanTab onCapture={handleCapture} />
      ) : (
        <ManualTab onDone={(input) => { setBillInput(input); router.push('/bill-decoder') }} />
      )}
    </View>
  )
}

function ScanTab({ onCapture }: { onCapture: (fromCamera: boolean) => void }) {
  return (
    <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 24 }}>
      {/* Dashed upload zone */}
      <TouchableOpacity
        onPress={() => onCapture(false)}
        activeOpacity={0.8}
        style={{
          borderWidth: 2,
          borderColor: '#F5C518',
          borderStyle: 'dashed',
          borderRadius: 20,
          paddingVertical: 48,
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          backgroundColor: '#FFFBEA',
        }}
      >
        <Text style={{ fontSize: 48, color: '#F5C518' }}>📷</Text>
        <Text style={{ color: '#1C2B3A', fontSize: 16, fontWeight: '700' }}>I-upload ang bill mo</Text>
        <Text style={{ color: '#9CA3AF', fontSize: 13, textAlign: 'center', paddingHorizontal: 20 }}>
          Awtomatikong babasahin ng AI ang mga charges.
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => onCapture(true)}
        style={{ marginTop: 12, paddingVertical: 12, alignItems: 'center' }}
        activeOpacity={0.7}
      >
        <Text style={{ color: '#9CA3AF', fontSize: 13 }}>o kaya, buksan ang camera →</Text>
      </TouchableOpacity>

      {/* KoKo at bottom with analyze button */}
      <View style={{ flex: 1, justifyContent: 'flex-end', paddingBottom: 32, alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', width: '100%' }}>
          <View style={{ flex: 1 }} />
          <Text style={{ fontSize: 56, marginRight: -8, marginBottom: -4 }}>🦉</Text>
        </View>
        <TouchableOpacity
          onPress={() => onCapture(false)}
          style={{
            backgroundColor: '#1C2B3A', borderRadius: 50,
            paddingVertical: 18, width: '100%', alignItems: 'center',
          }}
          activeOpacity={0.85}
        >
          <Text style={{ color: '#fff', fontWeight: '800', fontSize: 15, letterSpacing: 1 }}>
            I-ANANLYZE ANG BILL KO
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

function ManualTab({ onDone }: { onDone: (input: Partial<BillInput>) => void }) {
  const [totalAmount, setTotalAmount] = useState('')
  const [kwh, setKwh] = useState('')
  const [city, setCity] = useState('')
  const [barangay, setBarangay] = useState('')
  const [isSubMeter, setIsSubMeter] = useState(false)
  const [cityOpen, setCityOpen] = useState(false)

  function handleSubmit() {
    const amount = parseFloat(totalAmount)
    const kwhNum = parseFloat(kwh)
    if (isNaN(amount) || isNaN(kwhNum) || amount <= 0 || kwhNum <= 0) {
      Alert.alert('Mali ang input', 'Siguraduhing tama ang mga numero.')
      return
    }
    onDone({ totalAmount: amount, kwh: kwhNum, city })
  }

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 }}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={{ color: '#6B7280', fontSize: 14, textAlign: 'center', marginBottom: 20 }}>
        o kaya naman, i-type mismo ang halaga
      </Text>

      {/* Total bill */}
      <FormField label="Kabuuang halaga ng bill" hint="?" />
      <TextInput
        style={{ backgroundColor: '#fff', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: '#1C2B3A', marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 }}
        placeholder="₱ 0.00"
        placeholderTextColor="#D1D5DB"
        keyboardType="decimal-pad"
        value={totalAmount}
        onChangeText={setTotalAmount}
      />

      <FormField label="Kiloawatts na nagamit (kWh)" hint="?" />
      <TextInput
        style={{ backgroundColor: '#fff', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: '#1C2B3A', marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 }}
        placeholder="0"
        placeholderTextColor="#D1D5DB"
        keyboardType="number-pad"
        value={kwh}
        onChangeText={setKwh}
      />

      <Text style={{ color: '#1C2B3A', fontWeight: '700', fontSize: 14, marginBottom: 8 }}>Lungsod</Text>
      <TextInput
        style={{ backgroundColor: '#fff', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: '#1C2B3A', marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 }}
        placeholder="Caloocan, Quezon City..."
        placeholderTextColor="#D1D5DB"
        value={city}
        onChangeText={setCity}
      />

      <Text style={{ color: '#1C2B3A', fontWeight: '700', fontSize: 14, marginBottom: 8 }}>Barangay</Text>
      <TouchableOpacity
        onPress={() => setCityOpen(!cityOpen)}
        style={{ backgroundColor: '#fff', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, marginBottom: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 }}
      >
        <Text style={{ color: barangay ? '#1C2B3A' : '#D1D5DB', fontSize: 16 }}>
          {barangay || 'Piliin ang barangay...'}
        </Text>
        <Text style={{ color: '#9CA3AF' }}>{cityOpen ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {/* Sub-meter checkbox */}
      <TouchableOpacity
        onPress={() => setIsSubMeter(!isSubMeter)}
        style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 24 }}
        activeOpacity={0.8}
      >
        <View style={{
          width: 22, height: 22, borderRadius: 4, borderWidth: 2,
          borderColor: isSubMeter ? '#F5C518' : '#D1D5DB',
          backgroundColor: isSubMeter ? '#F5C518' : '#fff',
          alignItems: 'center', justifyContent: 'center',
        }}>
          {isSubMeter && <Text style={{ color: '#1C2B3A', fontSize: 14, fontWeight: '900' }}>✓</Text>}
        </View>
        <Text style={{ color: '#1C2B3A', fontSize: 14, fontWeight: '500' }}>Sub-meter ba ang gamit mo?</Text>
      </TouchableOpacity>

      {/* KoKo with speech bubble */}
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', marginBottom: 16 }}>
        <Text style={{ fontSize: 48 }}>🦉</Text>
        <View style={{
          flex: 1, backgroundColor: '#F5C518', borderRadius: 12,
          borderBottomLeftRadius: 4, padding: 10, marginLeft: 10,
        }}>
          <Text style={{ color: '#1C2B3A', fontSize: 12, fontWeight: '600' }}>
            Siguraduhing tama ang mga numero para sa mas accurate na analysis!
          </Text>
        </View>
      </View>

      {/* Analyze button */}
      <TouchableOpacity
        onPress={handleSubmit}
        style={{ backgroundColor: '#1C2B3A', borderRadius: 50, paddingVertical: 18, alignItems: 'center' }}
        activeOpacity={0.85}
      >
        <Text style={{ color: '#fff', fontWeight: '800', fontSize: 15, letterSpacing: 1 }}>
          I-ANALYZE ANG BILL KO
        </Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

function FormField({ label, hint }: { label: string; hint?: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 6 }}>
      <Text style={{ color: '#1C2B3A', fontWeight: '700', fontSize: 14 }}>{label}</Text>
      {hint && (
        <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: '#F5C518', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#1C2B3A', fontSize: 11, fontWeight: '800' }}>?</Text>
        </View>
      )}
    </View>
  )
}

function ConfirmScreen({
  extracted,
  onExtractedChange,
  onConfirm,
  onRescan,
}: {
  extracted: Partial<BillInput>
  onExtractedChange: (v: Partial<BillInput>) => void
  onConfirm: () => void
  onRescan: () => void
}) {
  const [cityOpen, setCityOpen] = useState(false)

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 24 }}>
      <Text style={{ color: '#1C2B3A', fontSize: 22, fontWeight: '800', marginBottom: 4 }}>Tama ba ito?</Text>
      <Text style={{ color: '#9CA3AF', fontSize: 13, marginBottom: 20 }}>
        I-edit kung mali ang na-extract mula sa iyong bill.
      </Text>

      {/* City picker */}
      <Text style={{ color: '#1C2B3A', fontWeight: '700', fontSize: 14, marginBottom: 8 }}>Lungsod / Munisipyo</Text>
      <TouchableOpacity
        style={{ backgroundColor: '#fff', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4, borderWidth: 2, borderColor: extracted.city ? '#F5C518' : '#E5E7EB' }}
        onPress={() => setCityOpen(!cityOpen)}
        activeOpacity={0.8}
      >
        <Text style={{ color: extracted.city ? '#1C2B3A' : '#D1D5DB', fontSize: 16 }}>
          {extracted.city || 'Piliin ang lungsod...'}
        </Text>
        <Text style={{ color: '#9CA3AF' }}>{cityOpen ? '▲' : '▼'}</Text>
      </TouchableOpacity>
      {cityOpen && (
        <View style={{ backgroundColor: '#fff', borderRadius: 14, marginBottom: 12, overflow: 'hidden', maxHeight: 160, borderWidth: 2, borderColor: '#E5E7EB' }}>
          <ScrollView nestedScrollEnabled>
            {METRO_MANILA_CITIES.map((c) => (
              <TouchableOpacity
                key={c}
                style={{ paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6', backgroundColor: extracted.city === c ? '#FFFBEA' : '#fff' }}
                onPress={() => { onExtractedChange({ ...extracted, city: c }); setCityOpen(false) }}
              >
                <Text style={{ color: extracted.city === c ? '#F5C518' : '#374151', fontWeight: extracted.city === c ? '700' : '400', fontSize: 15 }}>{c}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <ConfirmInputField
        label="Total Bill (₱)"
        value={extracted.totalAmount?.toString() ?? ''}
        keyboardType="decimal-pad"
        onChange={(v) => onExtractedChange({ ...extracted, totalAmount: parseFloat(v) || 0 })}
      />
      <ConfirmInputField
        label="kWh Consumed"
        value={extracted.kwh?.toString() ?? ''}
        keyboardType="number-pad"
        onChange={(v) => onExtractedChange({ ...extracted, kwh: parseFloat(v) || 0 })}
      />

      <TouchableOpacity
        style={{ backgroundColor: '#F5C518', borderRadius: 50, paddingVertical: 18, alignItems: 'center', marginTop: 8 }}
        onPress={onConfirm}
        activeOpacity={0.85}
      >
        <Text style={{ color: '#1C2B3A', fontSize: 16, fontWeight: '800', letterSpacing: 0.5 }}>Tama Na! I-analyze ⚡</Text>
      </TouchableOpacity>

      <TouchableOpacity style={{ paddingVertical: 14, alignItems: 'center' }} onPress={onRescan}>
        <Text style={{ color: '#9CA3AF', fontSize: 14 }}>Mag-scan ulit</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

function ConfirmInputField({ label, value, keyboardType, onChange }: {
  label: string; value: string; keyboardType?: any; onChange: (v: string) => void
}) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={{ color: '#1C2B3A', fontWeight: '700', fontSize: 14, marginBottom: 8 }}>{label}</Text>
      <TextInput
        style={{ backgroundColor: '#fff', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: '#1C2B3A', borderWidth: 2, borderColor: '#E5E7EB' }}
        value={value}
        onChangeText={onChange}
        keyboardType={keyboardType ?? 'default'}
      />
    </View>
  )
}
