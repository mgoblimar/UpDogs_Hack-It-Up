import { View, TouchableOpacity, ActivityIndicator, Alert, ScrollView, Image, Modal, Animated, Pressable } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter, useFocusEffect } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'
import { useState, useRef, useCallback } from 'react'
import { CameraView, useCameraPermissions } from 'expo-camera'
import { useBillStore } from '@/store/billStore'
import { extractBillFromImage } from '@/services/ocrService'
import type { BillInput } from '@/types/bill'
import AppHeader from '@/components/AppHeader'
import { Text, TextInput } from '@/components/CustomText'
import { FontAwesome6 } from '@expo/vector-icons'

type ScanState = 'idle' | 'scanning' | 'confirm' | 'error'
type TabMode = 'scan' | 'manual'

export default function ScannerScreen() {
  const router = useRouter()
  const setBillInput = useBillStore((s) => s.setBillInput)

  const [tab, setTab] = useState<TabMode>('scan')
  const [scanState, setScanState] = useState<ScanState>('idle')
  const [extracted, setExtracted] = useState<Partial<BillInput>>({})
  const [errorMsg, setErrorMsg] = useState('')
  const [showCamera, setShowCamera] = useState(false)

  // Set to true only when navigating to bill-decoder via handleConfirm.
  // Guards useFocusEffect from resetting state when the CameraModal closes —
  // Modal close also fires a screen focus event on Android.
  const cameFromBillDecoder = useRef(false)

  async function handleBase64Capture(base64: string) {
    setShowCamera(false)
    setScanState('scanning')
    try {
      const data = await extractBillFromImage(base64)
      const hasValues = data.totalAmount || data.kwh
      if (!hasValues) {
        setErrorMsg('Walang nahanap na datos sa litrato. Siguraduhing malinaw ang bill at tama ang ilaw. Subukan ulit o mag-manual input.')
        setScanState('error')
        return
      }
      setExtracted(data)
      setScanState('confirm')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Hindi ma-scan ang bill. Subukan ang manual input.'
      setErrorMsg(msg)
      setScanState('error')
    }
  }

  async function handleGalleryPick() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      base64: true,
    })
    if (result.canceled || !result.assets[0]?.base64) return
    await handleBase64Capture(result.assets[0].base64)
  }

  // Only resets when returning from bill-decoder — NOT when the CameraModal
  // closes (which also fires a focus event on Android and would kill the scan).
  useFocusEffect(
    useCallback(() => {
      if (cameFromBillDecoder.current) {
        setScanState('idle')
        setExtracted({})
        setShowCamera(false)
        cameFromBillDecoder.current = false
      }
    }, [])
  )

  function handleConfirm() {
    if (!extracted.totalAmount || !extracted.kwh) {
      Alert.alert('Kulang ang datos', 'Ilagay ang Total Amount at kWh bago magpatuloy.')
      return
    }
    setBillInput(extracted)
    cameFromBillDecoder.current = true
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
          <Text style={{ fontSize: 56 }}>📷</Text>
          <Text style={{ color: '#1C2B3A', fontSize: 22, fontWeight: '800', textAlign: 'center' }}>
            Hindi Nakilala ang Bill
          </Text>
          <Text style={{ color: '#6B7280', fontSize: 15, textAlign: 'center', lineHeight: 22 }}>{errorMsg}</Text>
          <TouchableOpacity
            style={{ backgroundColor: '#F5C518', borderRadius: 14, paddingVertical: 16, paddingHorizontal: 32, width: '100%', alignItems: 'center' }}
            onPress={() => { setScanState('idle'); setShowCamera(true) }}
          >
            <Text style={{ color: '#1C2B3A', fontSize: 16, fontWeight: '800' }}>📷 Kumuha ng Bagong Litrato</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ backgroundColor: '#fff', borderRadius: 14, paddingVertical: 16, paddingHorizontal: 32, width: '100%', alignItems: 'center', borderWidth: 1.5, borderColor: '#E5E7EB' }}
            onPress={() => { setScanState('idle'); handleGalleryPick() }}
          >
            <Text style={{ color: '#1C2B3A', fontSize: 16, fontWeight: '600' }}>🖼️ Pumili mula sa Gallery</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ backgroundColor: '#E5E7EB', borderRadius: 14, paddingVertical: 16, paddingHorizontal: 32, width: '100%', alignItems: 'center' }}
            onPress={() => setTab('manual')}
          >
            <Text style={{ color: '#1C2B3A', fontSize: 16, fontWeight: '600' }}>✏️ Manual Input na lang</Text>
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
          onRescan={() => { setScanState('idle'); setExtracted({}); setShowCamera(true) }}

        />
      </View>
    )
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F8F8F8' }}>
      <AppHeader showBack />

      {/* In-app camera modal */}
      <CameraModal
        visible={showCamera}
        onClose={() => setShowCamera(false)}
        onCapture={handleBase64Capture}
      />

      {/* Date row */}
      <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
        <Text style={{ color: '#9CA3AF', fontSize: 11, fontWeight: '600', letterSpacing: 0.5 }}>
          {new Date().toLocaleDateString('fil-PH', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase()}
        </Text>

        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 12 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' }}
          >
            <FontAwesome6 name="arrow-left" size={16} color="#475569" />
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
        <ScanTab onOpenCamera={() => setShowCamera(true)} onGalleryPick={handleGalleryPick} />
      ) : (
        <ManualTab onDone={(input) => { setBillInput(input); router.push('/bill-decoder') }} />
      )}
    </View>
  )
}

function ScanTab({ onOpenCamera, onGalleryPick }: { onOpenCamera: () => void; onGalleryPick: () => void }) {
  return (
    <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 20 }}>

      {/* Primary — Camera (big card) */}
      <TouchableOpacity
        onPress={onOpenCamera}
        activeOpacity={0.88}
        style={{
          backgroundColor: '#1C2B3A',
          borderRadius: 24,
          paddingVertical: 40,
          alignItems: 'center',
          justifyContent: 'center',
          gap: 14,
          marginBottom: 12,
          shadowColor: '#000',
          shadowOpacity: 0.18,
          shadowOffset: { width: 0, height: 4 },
          shadowRadius: 10,
          elevation: 6,
        }}
      >
        <View style={{
          width: 72, height: 72, borderRadius: 36,
          backgroundColor: '#F5C518',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <FontAwesome6 name="camera" size={32} color="#1C2B3A" solid />
        </View>
        <Text style={{ color: '#fff', fontSize: 18, fontWeight: '800', letterSpacing: 0.3 }}>Kunan ng Larawan</Text>
        <Text style={{ color: '#94A3B8', fontSize: 13, textAlign: 'center', paddingHorizontal: 28 }}>
          Gamitin ang camera para i-scan ang iyong bill nang direkta.
        </Text>
      </TouchableOpacity>

      {/* Secondary — Gallery upload (smaller) */}
      <TouchableOpacity
        onPress={onGalleryPick}
        activeOpacity={0.85}
        style={{
          borderWidth: 2,
          borderColor: '#F5C518',
          borderStyle: 'dashed',
          borderRadius: 20,
          paddingVertical: 22,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          gap: 12,
          backgroundColor: '#FFFBEA',
        }}
      >
        <FontAwesome6 name="image" size={22} color="#D97706" solid />
        <View>
          <Text style={{ color: '#1C2B3A', fontSize: 15, fontWeight: '700' }}>I-upload mula sa Gallery</Text>
          <Text style={{ color: '#9CA3AF', fontSize: 12 }}>Pumili ng larawan mula sa iyong phone</Text>
        </View>
      </TouchableOpacity>

      {/* Privacy notice */}
      <View style={{
        flexDirection: 'row', alignItems: 'center', gap: 8,
        backgroundColor: '#F0FDF4', borderRadius: 12,
        paddingHorizontal: 14, paddingVertical: 10, marginTop: 14,
        borderWidth: 1, borderColor: '#BBF7D0',
      }}>
        <Text style={{ fontSize: 16 }}>🔒</Text>
        <Text style={{ flex: 1, color: '#166534', fontSize: 11, lineHeight: 16 }}>
          <Text style={{ fontWeight: '700' }}>Billing numbers lang ang kinukuha.</Text>
          {' '}Ang iyong pangalan, account number, at address ay hindi namin binabasa o sine-save.
        </Text>
      </View>

      {/* KoKo peeking above the analyze button */}
      <View style={{ flex: 1, justifyContent: 'flex-end', paddingBottom: 28 }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', width: '100%', marginBottom: -2 }}>
          <View style={{ flex: 1 }} />
          <Image
            source={require('@/assets/KuryenteKo/figures/OwlWaving.png')}
            style={{ width: 60, height: 60, marginRight: 12, marginBottom: -2 }}
            resizeMode="contain"
          />
        </View>
        <TouchableOpacity
          onPress={onOpenCamera}
          style={{
            backgroundColor: '#1C2B3A', borderRadius: 50,
            paddingVertical: 18, width: '100%', alignItems: 'center',
          }}
          activeOpacity={0.85}
        >
          <Text style={{ color: '#F5C518', fontWeight: '800', fontSize: 15, letterSpacing: 1 }}>
            I-ANALYZE ANG BILL KO ⚡
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

function CameraModal({
  visible,
  onClose,
  onCapture,
}: {
  visible: boolean
  onClose: () => void
  onCapture: (base64: string) => void
}) {
  const [permission, requestPermission] = useCameraPermissions()
  const [capturing, setCapturing] = useState(false)
  const [facing, setFacing] = useState<'back' | 'front'>('back')
  const [torchOn, setTorchOn] = useState(false)
  const [preview, setPreview] = useState<{ uri: string; base64: string } | null>(null)
  const [focusPoint, setFocusPoint] = useState<{ x: number; y: number } | null>(null)
  const focusScale = useRef(new Animated.Value(1.4)).current
  const focusOpacity = useRef(new Animated.Value(0)).current
  const cameraRef = useRef<CameraView>(null)
  const insets = useSafeAreaInsets()

  function handleTapFocus(evt: { nativeEvent: { locationX: number; locationY: number } }) {
    const { locationX: x, locationY: y } = evt.nativeEvent
    setFocusPoint({ x, y })
    // animate focus ring: pop in, hold, fade out
    focusScale.setValue(1.4)
    focusOpacity.setValue(1)
    Animated.parallel([
      Animated.timing(focusScale, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.sequence([
        Animated.delay(600),
        Animated.timing(focusOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]),
    ]).start(() => setFocusPoint(null))
  }

  async function handleShutter() {
    if (!cameraRef.current || capturing) return
    setCapturing(true)
    try {
      const photo = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.8 })
      if (photo?.base64 && photo.uri) {
        setPreview({ uri: photo.uri, base64: photo.base64 })
      }
    } finally {
      setCapturing(false)
    }
  }

  function handleRetake() {
    setPreview(null)
  }

  function handleUsePhoto() {
    if (preview?.base64) onCapture(preview.base64)
  }

  if (!visible) return null

  if (!permission) {
    return (
      <Modal visible={visible} animationType="slide" statusBarTranslucent>
        <View style={{ flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color="#F5C518" />
        </View>
      </Modal>
    )
  }

  if (!permission.granted) {
    return (
      <Modal visible={visible} animationType="slide" statusBarTranslucent>
        <View style={{ flex: 1, backgroundColor: '#1C2B3A', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
          <FontAwesome6 name="camera" size={48} color="#F5C518" solid style={{ marginBottom: 20 }} />
          <Text style={{ color: '#fff', fontSize: 20, fontWeight: '800', textAlign: 'center', marginBottom: 10 }}>
            Kailangan ng Camera Permission
          </Text>
          <Text style={{ color: '#94A3B8', fontSize: 14, textAlign: 'center', marginBottom: 32, lineHeight: 22 }}>
            Para ma-scan ang iyong bill, kailangan naming ma-access ang camera ng iyong telepono.
          </Text>
          <TouchableOpacity
            onPress={requestPermission}
            style={{ backgroundColor: '#F5C518', borderRadius: 50, paddingVertical: 16, paddingHorizontal: 40 }}
          >
            <Text style={{ color: '#1C2B3A', fontWeight: '800', fontSize: 15 }}>Payagan ang Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} style={{ marginTop: 16, paddingVertical: 12 }}>
            <Text style={{ color: '#64748B', fontSize: 14 }}>Bumalik</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    )
  }

  /* ── Preview screen ─────────────────────────────────────── */
  if (preview) {
    return (
      <Modal visible={visible} animationType="fade" statusBarTranslucent>
        <View style={{ flex: 1, backgroundColor: '#000' }}>
          <Image source={{ uri: preview.uri }} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} resizeMode="cover" />

          {/* Dark overlay at top */}
          <View style={{
            position: 'absolute', top: 0, left: 0, right: 0,
            paddingTop: insets.top + 12, paddingHorizontal: 20, paddingBottom: 16,
            backgroundColor: 'rgba(0,0,0,0.55)',
            flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
          }}>
            <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700' }}>Suriin ang larawan</Text>
          </View>

          {/* Bottom action bar */}
          <View style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            paddingBottom: insets.bottom + 24, paddingTop: 20, paddingHorizontal: 28,
            backgroundColor: 'rgba(0,0,0,0.65)',
            flexDirection: 'row', gap: 14, alignItems: 'center',
          }}>
            {/* Retake */}
            <TouchableOpacity
              onPress={handleRetake}
              activeOpacity={0.8}
              style={{
                flex: 1, paddingVertical: 16, borderRadius: 50,
                backgroundColor: 'rgba(255,255,255,0.12)',
                borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.25)',
                alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8,
              }}
            >
              <FontAwesome6 name="rotate-left" size={15} color="#fff" solid />
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>Ulitin</Text>
            </TouchableOpacity>

            {/* Use photo */}
            <TouchableOpacity
              onPress={handleUsePhoto}
              activeOpacity={0.85}
              style={{
                flex: 1.6, paddingVertical: 16, borderRadius: 50,
                backgroundColor: '#F5C518',
                alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8,
              }}
            >
              <FontAwesome6 name="check" size={15} color="#1C2B3A" solid />
              <Text style={{ color: '#1C2B3A', fontWeight: '800', fontSize: 15 }}>Gamitin Ito</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    )
  }

  /* ── Live camera viewfinder ─────────────────────────────── */
  return (
    <Modal visible={visible} animationType="slide" statusBarTranslucent>
      <View style={{ flex: 1, backgroundColor: '#000' }}>
        <CameraView ref={cameraRef} style={{ flex: 1 }} facing={facing} enableTorch={torchOn}>

          {/* Tap-to-focus overlay */}
          <Pressable style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} onPress={handleTapFocus}>
            {focusPoint && (
              <Animated.View style={{
                position: 'absolute',
                left: focusPoint.x - 30,
                top: focusPoint.y - 30,
                width: 60, height: 60,
                borderRadius: 30,
                borderWidth: 2,
                borderColor: '#F5C518',
                opacity: focusOpacity,
                transform: [{ scale: focusScale }],
              }} />
            )}
          </Pressable>

          {/* Top bar */}
          <View style={{
            paddingTop: insets.top + 12,
            paddingHorizontal: 20,
            paddingBottom: 16,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,0.45)',
          }}>
            <TouchableOpacity
              onPress={onClose}
              style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' }}
            >
              <FontAwesome6 name="xmark" size={18} color="#fff" solid />
            </TouchableOpacity>
            <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700' }}>I-scan ang Bill</Text>
            <TouchableOpacity
              onPress={() => setFacing(f => f === 'back' ? 'front' : 'back')}
              style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' }}
            >
              <FontAwesome6 name="rotate" size={16} color="#fff" solid />
            </TouchableOpacity>
          </View>

          {/* Tip banner */}
          <View style={{
            marginHorizontal: 24,
            marginTop: 8,
            backgroundColor: 'rgba(245,197,24,0.18)',
            borderRadius: 12,
            borderWidth: 1,
            borderColor: 'rgba(245,197,24,0.4)',
            paddingHorizontal: 14,
            paddingVertical: 9,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
          }}>
            <FontAwesome6 name="lightbulb" size={14} color="#F5C518" solid />
            <Text style={{ color: '#F5C518', fontSize: 12, fontWeight: '600', flex: 1, lineHeight: 18 }}>
              Pindutin ang screen para mag-focus. Siguraduhing maliwanag at flat ang bill.
            </Text>
          </View>

          {/* Alignment frame */}
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ width: '85%', aspectRatio: 0.7, position: 'relative' }}>

              {/* Dark overlay outside frame — makes the cutout pop */}
              <View style={{ position: 'absolute', top: -2, left: -2, right: -2, bottom: -2, borderRadius: 4, borderWidth: 2000, borderColor: 'rgba(0,0,0,0.45)' }} pointerEvents="none" />

              {/* Corner brackets — bigger, thicker, with glow */}
              {[
                { top: 0, left: 0, borderTopWidth: 5, borderLeftWidth: 5 },
                { top: 0, right: 0, borderTopWidth: 5, borderRightWidth: 5 },
                { bottom: 0, left: 0, borderBottomWidth: 5, borderLeftWidth: 5 },
                { bottom: 0, right: 0, borderBottomWidth: 5, borderRightWidth: 5 },
              ].map((s, i) => (
                <View key={i} style={{
                  position: 'absolute', width: 48, height: 48,
                  borderColor: '#F5C518',
                  shadowColor: '#F5C518', shadowOpacity: 0.9, shadowRadius: 8, shadowOffset: { width: 0, height: 0 },
                  elevation: 8,
                  ...s,
                }} />
              ))}

              {/* Subtle edge lines connecting corners */}
              <View style={{ position: 'absolute', top: 0, left: 48, right: 48, height: 1.5, backgroundColor: 'rgba(245,197,24,0.35)' }} />
              <View style={{ position: 'absolute', bottom: 0, left: 48, right: 48, height: 1.5, backgroundColor: 'rgba(245,197,24,0.35)' }} />
              <View style={{ position: 'absolute', left: 0, top: 48, bottom: 48, width: 1.5, backgroundColor: 'rgba(245,197,24,0.35)' }} />
              <View style={{ position: 'absolute', right: 0, top: 48, bottom: 48, width: 1.5, backgroundColor: 'rgba(245,197,24,0.35)' }} />

              <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
                <View style={{ backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 7, borderWidth: 1, borderColor: 'rgba(245,197,24,0.4)' }}>
                  <Text style={{ color: '#F5C518', fontSize: 12, fontWeight: '700', textAlign: 'center', letterSpacing: 0.5 }}>
                    I-align ang bill dito
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Bottom controls */}
          <View style={{
            paddingBottom: insets.bottom + 24,
            paddingTop: 20,
            paddingHorizontal: 32,
            backgroundColor: 'rgba(0,0,0,0.5)',
            alignItems: 'center',
            gap: 12,
          }}>
            <Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11, letterSpacing: 0.5 }}>
              Pindutin para kumuha ng larawan
            </Text>

            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%' }}>

              {/* Torch toggle */}
              <TouchableOpacity onPress={() => setTorchOn(t => !t)} activeOpacity={0.8} style={{ flex: 1, alignItems: 'center', gap: 4 }}>
                <View style={{
                  width: 44, height: 44, borderRadius: 22,
                  backgroundColor: torchOn ? 'rgba(245,197,24,0.25)' : 'rgba(255,255,255,0.12)',
                  borderWidth: 1.5,
                  borderColor: torchOn ? '#F5C518' : 'rgba(255,255,255,0.2)',
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <FontAwesome6
                    name="bolt"
                    size={18}
                    color={torchOn ? '#F5C518' : 'rgba(255,255,255,0.4)'}
                    solid
                  />
                </View>
                <Text style={{ color: torchOn ? '#F5C518' : 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: '700', letterSpacing: 0.5 }}>
                  {torchOn ? 'ON' : 'OFF'}
                </Text>
              </TouchableOpacity>

              {/* Shutter */}
              <TouchableOpacity
                onPress={handleShutter}
                disabled={capturing}
                activeOpacity={0.8}
                style={{
                  width: 72, height: 72, borderRadius: 36,
                  backgroundColor: capturing ? '#94A3B8' : '#F5C518',
                  alignItems: 'center', justifyContent: 'center',
                  borderWidth: 4, borderColor: '#fff',
                  shadowColor: '#F5C518', shadowOpacity: 0.6,
                  shadowOffset: { width: 0, height: 0 }, shadowRadius: 12, elevation: 8,
                }}
              >
                {capturing
                  ? <ActivityIndicator color="#fff" />
                  : <FontAwesome6 name="camera" size={28} color="#1C2B3A" solid />
                }
              </TouchableOpacity>

              {/* Spacer */}
              <View style={{ flex: 1 }} />
            </View>
          </View>

        </CameraView>
      </View>
    </Modal>
  )
}

function ManualTab({ onDone }: { onDone: (input: Partial<BillInput>) => void }) {
  const [totalAmount, setTotalAmount] = useState('')
  const [kwh, setKwh] = useState('')
  const [city, setCity] = useState('')
  const [billingMonth, setBillingMonth] = useState('')
  const [ratePerKwh, setRatePerKwh] = useState('')
  const [generationCharge, setGenerationCharge] = useState('')
  const [transmissionCharge, setTransmissionCharge] = useState('')
  const [systemLossCharge, setSystemLossCharge] = useState('')
  const [distributionCharge, setDistributionCharge] = useState('')
  const [universalCharges, setUniversalCharges] = useState('')
  const [fitAll, setFitAll] = useState('')
  const [subsidies, setSubsidies] = useState('')
  const [taxes, setTaxes] = useState('')

  const fieldStyle = {
    backgroundColor: '#fff', borderRadius: 14,
    paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 16, color: '#1C2B3A', marginBottom: 16,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  } as const

  const num = (v: string) => { const n = parseFloat(v); return isNaN(n) ? undefined : n }

  function handleSubmit() {
    const amount = parseFloat(totalAmount)
    const kwhNum = parseFloat(kwh)
    if (isNaN(amount) || isNaN(kwhNum) || amount <= 0 || kwhNum <= 0) {
      Alert.alert('Mali ang input', 'Kailangan ang Total Amount at kWh bago magpatuloy.')
      return
    }
    onDone({
      totalAmount: amount,
      kwh: kwhNum,
      city: city || undefined,
      billingMonth: billingMonth || undefined,
      ratePerKwh: num(ratePerKwh),
      generationCharge: num(generationCharge),
      transmissionCharge: num(transmissionCharge),
      systemLossCharge: num(systemLossCharge),
      distributionCharge: num(distributionCharge),
      universalCharges: num(universalCharges),
      fitAll: num(fitAll),
      subsidies: num(subsidies),
      taxes: num(taxes),
    })
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

      {/* ── Required fields ── */}
      <SectionLabel label="Pangunahing Impormasyon" />

      <FormField label="Charges for this Billing Period (₱)" hint="?" />
      <TextInput style={fieldStyle} placeholder="₱ 0.00" placeholderTextColor="#D1D5DB"
        keyboardType="decimal-pad" inputMode="decimal" value={totalAmount} onChangeText={setTotalAmount} />

      <FormField label="kWh Consumed" hint="?" />
      <TextInput style={fieldStyle} placeholder="0" placeholderTextColor="#D1D5DB"
        keyboardType="number-pad" value={kwh} onChangeText={setKwh} />

      <FormField label="Rate per kWh (₱)" hint="?" />
      <TextInput style={fieldStyle} placeholder="₱ 0.0000" placeholderTextColor="#D1D5DB"
        keyboardType="decimal-pad" inputMode="decimal" value={ratePerKwh} onChangeText={setRatePerKwh} />

      <FormField label="Lungsod / Bayan" />
      <TextInput style={fieldStyle} placeholder="Caloocan, Quezon City..." placeholderTextColor="#D1D5DB"
        value={city} onChangeText={setCity} autoCapitalize="words" />

      <FormField label="Billing Month" />
      <TextInput style={fieldStyle} placeholder="hal. May 2026" placeholderTextColor="#D1D5DB"
        value={billingMonth} onChangeText={setBillingMonth} />

      {/* ── Charge breakdown ── */}
      <SectionLabel label="Breakdown ng Charges" optional />
      <Text style={{ color: '#9CA3AF', fontSize: 12, marginBottom: 12, marginTop: -4 }}>
        Opsyonal — para sa mas detalyadong analysis
      </Text>

      {[
        { label: 'Generation Charge (₱)',    value: generationCharge,    set: setGenerationCharge },
        { label: 'Transmission Charge (₱)',  value: transmissionCharge,  set: setTransmissionCharge },
        { label: 'System Loss Charge (₱)',   value: systemLossCharge,    set: setSystemLossCharge },
        { label: 'Distribution Charge (₱)',  value: distributionCharge,  set: setDistributionCharge },
        { label: 'Universal Charges (₱)',    value: universalCharges,    set: setUniversalCharges },
        { label: 'FiT-All / Renewable (₱)', value: fitAll,              set: setFitAll },
        { label: 'Subsidies (₱)',            value: subsidies,           set: setSubsidies },
        { label: 'Government Taxes / VAT (₱)', value: taxes,            set: setTaxes },
      ].map(({ label, value, set }) => (
        <View key={label}>
          <FormField label={label} />
          <TextInput style={fieldStyle} placeholder="Opsyonal" placeholderTextColor="#D1D5DB"
            keyboardType="decimal-pad" inputMode="decimal" value={value} onChangeText={set} />
        </View>
      ))}

      {/* KoKo speech bubble */}
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', marginBottom: 16 }}>
        <Image source={require('@/assets/KuryenteKo/figures/OwlWaving.png')}
          style={{ width: 56, height: 56 }} resizeMode="contain" />
        <View style={{ flex: 1, backgroundColor: '#F5C518', borderRadius: 12, borderBottomLeftRadius: 4, padding: 10, marginLeft: 10 }}>
          <Text style={{ color: '#1C2B3A', fontSize: 12, fontWeight: '600' }}>
            Mas maraming charges na nai-input = mas accurate ang analysis ng KuryenteKo!
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
  const hasCharges = [
    extracted.generationCharge, extracted.transmissionCharge, extracted.systemLossCharge,
    extracted.distributionCharge, extracted.universalCharges, extracted.fitAll, extracted.taxes,
  ].some((v) => v !== undefined)

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 24 }} keyboardShouldPersistTaps="handled">
      <Text style={{ color: '#1C2B3A', fontSize: 22, fontWeight: '800', marginBottom: 4 }}>Tama ba ito?</Text>
      <Text style={{ color: '#9CA3AF', fontSize: 13, marginBottom: 20 }}>
        I-edit kung mali ang na-extract mula sa iyong bill.
      </Text>

      {/* ── Primary fields ─────────────────────────────── */}
      <SectionLabel label="Pangunahing Impormasyon" />

      {/* City */}
      <ConfirmLabel label="Lungsod / Bayan" />
      <TextInput
        style={{ backgroundColor: '#fff', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: '#1C2B3A', marginBottom: 14, borderWidth: 2, borderColor: extracted.city ? '#F5C518' : '#E5E7EB' }}
        placeholder="hal. Caloocan, Cebu City, Davao..."
        placeholderTextColor="#D1D5DB"
        value={extracted.city ?? ''}
        onChangeText={(v) => onExtractedChange({ ...extracted, city: v })}
        autoCapitalize="words"
      />

      {/* Charges for this billing period (= totalAmount) */}
      <ConfirmInputField
        label="Charges for this Billing Period (₱)"
        hint="Huwag ilagay ang 'Total Amount Due' — ang 'Current Charges' lang"
        value={extracted.totalAmount?.toString() ?? ''}
        keyboardType="decimal-pad"
        onChange={(v) => onExtractedChange({ ...extracted, totalAmount: parseFloat(v) || undefined })}
        highlight
      />

      {/* kWh Consumed */}
      <ConfirmInputField
        label="kWh Consumed"
        value={extracted.kwh?.toString() ?? ''}
        keyboardType="number-pad"
        onChange={(v) => onExtractedChange({ ...extracted, kwh: parseFloat(v) || undefined })}
        highlight
      />

      {/* Rate per kWh */}
      <ConfirmInputField
        label="Rate per kWh (₱)"
        hint="'Your rate this month ₱X.XX per kWh' sa harap ng bill"
        value={extracted.ratePerKwh?.toString() ?? ''}
        keyboardType="decimal-pad"
        onChange={(v) => onExtractedChange({ ...extracted, ratePerKwh: parseFloat(v) || undefined })}
        highlight
      />

      {/* ── Individual charges ──────────────────────────── */}
      <SectionLabel label="Breakdown ng Charges" optional={!hasCharges} />
      {!hasCharges && (
        <Text style={{ color: '#9CA3AF', fontSize: 12, marginBottom: 12, marginTop: -4 }}>
          Hindi na-detect ang itemized charges. Maaaring i-fill in kung makikita sa bill.
        </Text>
      )}

      {[
        { key: 'generationCharge',   label: 'Generation Charge (₱)' },
        { key: 'transmissionCharge', label: 'Transmission Charge (₱)' },
        { key: 'systemLossCharge',   label: 'System Loss Charge (₱)' },
        { key: 'distributionCharge', label: 'Distribution Charge (₱)' },
        { key: 'universalCharges',   label: 'Universal Charges (₱)' },
        { key: 'fitAll',             label: 'FiT-All / Renewable (₱)' },
        { key: 'subsidies',          label: 'Subsidies (₱)' },
        { key: 'taxes',              label: 'Government Taxes / VAT (₱)' },
      ].map(({ key, label }) => (
        <ConfirmInputField
          key={key}
          label={label}
          value={(extracted[key as keyof typeof extracted] as number | undefined)?.toString() ?? ''}
          keyboardType="decimal-pad"
          onChange={(v) => onExtractedChange({ ...extracted, [key]: parseFloat(v) || undefined })}
        />
      ))}

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

function SectionLabel({ label, optional }: { label: string; optional?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, marginTop: 4, gap: 8 }}>
      <Text style={{ color: '#1C2B3A', fontWeight: '800', fontSize: 13, letterSpacing: 0.4, textTransform: 'uppercase' }}>{label}</Text>
      {optional && (
        <View style={{ backgroundColor: '#F3F4F6', borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 }}>
          <Text style={{ color: '#9CA3AF', fontSize: 10, fontWeight: '700' }}>OPSYONAL</Text>
        </View>
      )}
    </View>
  )
}

function ConfirmLabel({ label }: { label: string }) {
  return <Text style={{ color: '#1C2B3A', fontWeight: '700', fontSize: 14, marginBottom: 8 }}>{label}</Text>
}

function ConfirmInputField({ label, hint, value, keyboardType, onChange, highlight }: {
  label: string
  hint?: string
  value: string
  keyboardType?: 'default' | 'decimal-pad' | 'number-pad'
  onChange: (v: string) => void
  highlight?: boolean
}) {
  // Local state so the user can type freely (decimals mid-type, empty field, etc.)
  // without the parent's parseFloat conversion resetting the display value.
  const [local, setLocal] = useState(value)

  function handleChange(text: string) {
    setLocal(text)
    onChange(text)
  }

  const hasValue = local.trim().length > 0 && local !== '0'

  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={{ color: '#1C2B3A', fontWeight: '700', fontSize: 14, marginBottom: hint ? 3 : 8 }}>{label}</Text>
      {hint && <Text style={{ color: '#9CA3AF', fontSize: 11, marginBottom: 7, lineHeight: 16 }}>{hint}</Text>}
      <TextInput
        style={{
          backgroundColor: '#fff',
          borderRadius: 14,
          paddingHorizontal: 16,
          paddingVertical: 14,
          fontSize: 16,
          color: '#1C2B3A',
          borderWidth: 2,
          borderColor: highlight && hasValue ? '#F5C518' : '#E5E7EB',
        }}
        value={local}
        onChangeText={handleChange}
        keyboardType={keyboardType ?? 'default'}
        inputMode={keyboardType === 'decimal-pad' ? 'decimal' : keyboardType === 'number-pad' ? 'numeric' : 'text'}
        placeholder={highlight ? 'Kailangan' : 'Opsyonal'}
        placeholderTextColor="#D1D5DB"
      />
    </View>
  )
}
