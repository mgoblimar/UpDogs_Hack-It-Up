import { useState } from 'react'
import { View, TouchableOpacity, TextInput } from 'react-native'
import { useRouter } from 'expo-router'
import type { LineItem } from '@/types/bill'
import StatusBadge, { STATUS_MAP } from './StatusBadge'
import MicButton from '@/components/MicButton'
import { useVoiceInput } from '@/hooks/useVoiceInput'
import { Text } from '@/components/CustomText'

export const CHARGE_ICONS: Record<string, string> = {
  generation:    '🏭',
  transmission:  '🔌',
  systemLoss:    '💡',
  distribution:  '🗺️',
  supply:        '📦',
  metering:      '⏱️',
  taxes:         '🏛️',
}

interface ChargeDetail {
  what: string
  who: string
  cap: string | null
  tip: string
}

const CHARGE_DETAILS: Record<string, ChargeDetail> = {
  generationCharge: {
    what: 'Bayad sa power plants (coal, natural gas, hydro, solar) na gumawa ng kuryenteng gamit mo. Ito ang pinakamalaking bahagi ng iyong bill — karaniwang 40–50% ng kabuuan.',
    who: 'WESM (Wholesale Electricity Spot Market) ang nagtatakda ng presyo. Nag-fluctuate ito depende sa supply, demand, at fuel costs.',
    cap: '₱8.7942/kWh (ERC cap, May 2026)',
    tip: 'Kapag tag-araw o may brownout sa Luzon, tumataas ang WESM spot price kaya nagiging mas mahal ang generation charge.',
  },
  transmissionCharge: {
    what: 'Bayad sa NGCP (National Grid Corporation of the Philippines) para sa high-voltage transmission lines na nagdadala ng kuryente mula power plant hanggang sa mga substation malapit sa inyong lugar.',
    who: 'NGCP ang may-ari at nag-ooperate ng national grid. Hindi ito bahagi ng Meralco — hiwalay na kumpanya.',
    cap: '₱0.9007/kWh (ERC cap, May 2026)',
    tip: 'Kahit babaguhin ng Meralco ang kanilang rates, hindi nila kontrolado ang transmission charge — NGCP lang ang makapagbabago nito.',
  },
  systemLossCharge: {
    what: 'Ang kuryente ay nawawala habang dinadala sa mga linya — tinatawag itong "technical losses." Kasama rin ang non-technical losses tulad ng illegal connections at metering errors.',
    who: 'Responsibilidad ng Meralco na panatilihing mababa ang system loss. Sinusubaybayan at limitado ng ERC.',
    cap: '8.5% ng system load / ₱0.78/kWh max',
    tip: 'Sa batas, hindi pwedeng ipasa ng Meralco sa consumer ang system loss na lampas sa 8.5%. Kung lumampas, ilegal na.',
  },
  distributionCharge: {
    what: 'Bayad sa Meralco para sa lokal na distribution network — mga poste, linya, at transformer sa inyong barangay at kalye. Kasama rin ang Supply at Metering services.',
    who: 'Meralco ang nag-ooperate ng distribution system sa Metro Manila, Cavite, Rizal, at ilang bahagi ng Bulacan at Laguna.',
    cap: '₱2.76/kWh (frozen ng ERC mula Agosto 2022)',
    tip: 'I-freeze ng ERC ang distribution rate simula 2022 — ibig sabihin, hindi na ito maaaring dagdagan ng Meralco hanggang sa susunod na rate review.',
  },
  universalCharges: {
    what: 'Mandatoryong bayad na itinakda ng EPIRA Law (Republic Act 9136). Ginagamit para sa rural electrification, missionary electrification sa malalayong isla, at stranded costs ng National Power Corporation (NPC).',
    who: 'Itinatakda ng ERC at DOE (Department of Energy). Pare-pareho ang rate para sa lahat ng consumer.',
    cap: null,
    tip: 'Ang bayad na ito ay napupunta sa pagbibigay ng kuryente sa mga lugar na hindi pa naaabot ng regular na grid — tulad ng mga isla sa Mindanao at Visayas.',
  },
  fitAll: {
    what: 'Feed-in Tariff Allowance — suporta para sa renewable energy producers (solar, wind, biomass, run-of-river hydro). Tinitiyak na kumikita ang mga nagtatayo ng renewable energy plants para mahikayat ang mas maraming investment.',
    who: 'Kinokontrol ng ERC at National Renewable Energy Board (NREB). Bahagi ng Renewable Energy Act of 2008.',
    cap: null,
    tip: 'Maliit lang ito sa iyong bill pero malaking tulong sa pagpapalaki ng renewable energy sa Pilipinas. Mas maraming solar at wind = mas mababang generation charge sa hinaharap.',
  },
  taxes: {
    what: '12% VAT (Value Added Tax) na ipinapataw ng gobyerno sa halos lahat ng electricity charges. Mandatory ng BIR — hindi ito kinokontrol ng Meralco.',
    who: 'Bureau of Internal Revenue (BIR) ang nag-iimpose. Meralco lang ang nangongolekta at nagpapadala sa gobyerno.',
    cap: null,
    tip: 'Walang paraan para maiwasan ang VAT — mandatory ito sa batas. Pero ang Lifeline Rate beneficiaries ay may reduced VAT rate.',
  },
  subsidies: {
    what: 'Bawas sa iyong bill kung ikaw ay Lifeline Rate beneficiary — ibig sabihin, ang iyong household ay gumagamit ng 0–100 kWh bawat buwan at itinuturing na low-income.',
    who: 'Itinatakda ng ERC. Inaprubahan ng Meralco ang applications batay sa consumption history.',
    cap: null,
    tip: 'Kung gumagamit ka ng 0–100 kWh/buwan, pwede kang mag-apply para sa Lifeline Rate. Malaki ang matitipid — hanggang 50% diskwento sa ilang charges.',
  },
}

interface ChargeRowProps {
  item: LineItem
  isLast: boolean
  isExpanded: boolean
  onToggle: () => void
}

export default function ChargeRow({ item, isLast, isExpanded, onToggle }: ChargeRowProps) {
  const router = useRouter()
  const statusStyle = STATUS_MAP[item.status] ?? STATUS_MAP.normal
  const icon = CHARGE_ICONS[item.key] ?? '💰'
  const detail = CHARGE_DETAILS[item.key] ?? null
  const [askText, setAskText] = useState('')
  const { toggle: toggleVoice, isRecording, isTranscribing } = useVoiceInput((text) => {
    setAskText((prev) => (prev.trim() ? `${prev} ${text}` : text))
  })

  function sendToKoKo() {
    const q = askText.trim()
    if (!q) return
    setAskText('')
    router.push({ pathname: '/chat', params: { q } })
  }

  return (
    <View style={{ borderBottomWidth: isLast ? 0 : 1, borderBottomColor: '#F3F4F6' }}>

      {/* Tappable header row only */}
      <TouchableOpacity onPress={onToggle} activeOpacity={0.85}>
        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 }}>
          {/* Icon circle */}
          <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 20 }}>{icon}</Text>
          </View>

          {/* Label + first sentence */}
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={{ color: '#1C2B3A', fontWeight: '700', fontSize: 14 }}>{item.label}</Text>
              <Text style={{ color: '#9CA3AF', fontSize: 12 }}>{isExpanded ? '▼' : '▲'}</Text>
            </View>
            <Text style={{ color: '#9CA3AF', fontSize: 12, marginTop: 2 }} numberOfLines={1}>
              {detail?.what.split('.')[0] ?? item.explanation?.split('.')[0]}
            </Text>
          </View>

          {/* Amount + badge */}
          <View style={{ alignItems: 'flex-end', gap: 4 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              {item.isEstimated && (
                <View style={{ backgroundColor: '#F3F4F6', borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1 }}>
                  <Text style={{ color: '#9CA3AF', fontSize: 9, fontWeight: '700', letterSpacing: 0.3 }}>EST.</Text>
                </View>
              )}
              <Text style={{ color: '#1C2B3A', fontWeight: '700', fontSize: 15 }}>
                ₱{Math.abs(item.amount).toLocaleString('en-PH', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </Text>
            </View>
            <StatusBadge status={item.status as any} />
          </View>
        </View>
      </TouchableOpacity>

      {/* Expanded definition panel — outside TouchableOpacity so TextInput works */}
      {isExpanded && (
        <View style={{ paddingHorizontal: 16, paddingBottom: 20, backgroundColor: '#FAFAFA' }}>

          {/* Status warning */}
          {item.status !== 'normal' && (
            <View style={{ backgroundColor: statusStyle.bg, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 12 }}>
              <Text style={{ color: statusStyle.text, fontSize: 12, fontWeight: '600' }}>
                {item.status === 'overcharged'
                  ? '⚠️ Lumagpas na sa ERC maximum rate!'
                  : '⚠️ Malapit na sa ERC maximum rate.'}
              </Text>
            </View>
          )}

          {detail ? (
            <>
              {/* Ano ito */}
              <View style={{ marginBottom: 12 }}>
                <Text style={{ color: '#6B7280', fontSize: 10, fontWeight: '700', letterSpacing: 0.5, marginBottom: 4 }}>ANO ITO?</Text>
                <Text style={{ color: '#374151', fontSize: 13, lineHeight: 20 }}>{detail.what}</Text>
              </View>

              {/* Sino ang nag-kontrol */}
              <View style={{ backgroundColor: '#F1F5F9', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 8 }}>
                <Text style={{ color: '#6B7280', fontSize: 10, fontWeight: '700', letterSpacing: 0.5, marginBottom: 3 }}>SINO ANG KUMOKONTROL?</Text>
                <Text style={{ color: '#374151', fontSize: 12, lineHeight: 18 }}>{detail.who}</Text>
              </View>

              {/* ERC cap */}
              {detail.cap && (
                <View style={{ backgroundColor: '#EFF6FF', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={{ fontSize: 14 }}>📊</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: '#1D4ED8', fontSize: 10, fontWeight: '700', letterSpacing: 0.5 }}>ERC MAXIMUM RATE</Text>
                    <Text style={{ color: '#1E40AF', fontSize: 13, fontWeight: '700', marginTop: 1 }}>{detail.cap}</Text>
                  </View>
                </View>
              )}

              {/* Tip */}
              <View style={{ backgroundColor: '#FFFBEA', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 16, flexDirection: 'row', gap: 8 }}>
                <Text style={{ fontSize: 14 }}>💡</Text>
                <Text style={{ color: '#92400E', fontSize: 12, lineHeight: 18, flex: 1 }}>{detail.tip}</Text>
              </View>
            </>
          ) : (
            <Text style={{ color: '#374151', fontSize: 13, lineHeight: 20, marginBottom: 16 }}>
              {item.explanation}
            </Text>
          )}

          {/* Ask KoKo free-text input */}
          <View style={{ borderTopWidth: 1, borderTopColor: '#E5E7EB', paddingTop: 12 }}>
            <Text style={{ color: '#6B7280', fontSize: 11, fontWeight: '600', marginBottom: 8 }}>
              🤖  May tanong pa tungkol sa {item.label}?
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <MicButton
                onPress={toggleVoice}
                isRecording={isRecording}
                isTranscribing={isTranscribing}
                size={36}
              />
              <TextInput
                style={{
                  flex: 1,
                  backgroundColor: isRecording ? '#FFF0F0' : '#fff',
                  borderWidth: 1.5,
                  borderColor: isRecording ? '#EF4444' : '#E5E7EB',
                  borderRadius: 50,
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  fontSize: 13,
                  color: '#1C2B3A',
                }}
                placeholder={isRecording ? '🎙️ Nakinikinig...' : `Tanungin si KoKo tungkol sa ${item.label}...`}
                placeholderTextColor={isRecording ? '#EF4444' : '#9CA3AF'}
                value={askText}
                onChangeText={setAskText}
                returnKeyType="send"
                onSubmitEditing={sendToKoKo}
                blurOnSubmit={false}
              />
              <TouchableOpacity
                onPress={sendToKoKo}
                disabled={!askText.trim()}
                activeOpacity={0.8}
                style={{
                  width: 36, height: 36, borderRadius: 18,
                  backgroundColor: askText.trim() ? '#1C2B3A' : '#E5E7EB',
                  alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Text style={{ color: '#F5C518', fontSize: 15, fontWeight: '800' }}>→</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}
