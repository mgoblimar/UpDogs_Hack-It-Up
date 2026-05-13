import { View, ScrollView, TouchableOpacity, Linking } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Text } from '@/components/CustomText'

function Step({ number, title, body }: { number: string; title: string; body: string }) {
  return (
    <View className="flex-row gap-4">
      <View className="bg-brand-orange rounded-full w-8 h-8 items-center justify-center shrink-0 mt-0.5">
        <Text className="text-white font-bold text-sm">{number}</Text>
      </View>
      <View className="flex-1">
        <Text className="text-stone-800 font-bold text-sm">{title}</Text>
        <Text className="text-stone-500 text-sm mt-1 leading-5">{body}</Text>
      </View>
    </View>
  )
}

function ContactRow({
  icon, label, value, onPress,
}: {
  icon: string; label: string; value: string; onPress: () => void
}) {
  return (
    <TouchableOpacity onPress={onPress} className="flex-row items-center gap-3 py-2" activeOpacity={0.7}>
      <Text className="text-xl">{icon}</Text>
      <View className="flex-1">
        <Text className="text-stone-400 text-xs">{label}</Text>
        <Text className="text-brand-orange text-sm font-medium">{value}</Text>
      </View>
      <Text className="text-stone-300">›</Text>
    </TouchableOpacity>
  )
}

const VIOLATIONS = [
  {
    icon: '⚡',
    title: 'Sub-meter Abuse',
    body: 'Ang landlord ay nagbebenta ng kuryente sa mas mataas na presyo kaysa sa opisyal na Meralco rate. Ito ay labag sa batas.',
  },
  {
    icon: '📊',
    title: 'Overpriced Electricity Resale',
    body: 'Ang sinumang nagbebenta ng kuryente (kasama ang mga landlord) ay hindi dapat mangisingil ng higit sa Meralco rate bawat kWh.',
  },
  {
    icon: '🔒',
    title: 'Walang Itemized Bill',
    body: 'Dapat makatanggap ka ng malinaw na breakdown ng iyong singil sa kuryente. Kung hindi nagbibigay ng itemized bill ang landlord, ito ay paglabag.',
  },
  {
    icon: '💡',
    title: 'Disconnection bilang Pananakot',
    body: 'Ang pagputol ng kuryente bilang paraan ng pananakot o pagpapalabas sa tenant ay labag sa batas.',
  },
]

export default function DTIReportScreen() {
  return (
    <SafeAreaView className="flex-1 bg-stone-50" edges={['bottom']}>
      <ScrollView className="flex-1" contentContainerClassName="pb-10">

        {/* Header */}
        <View className="bg-brand-orange px-6 pt-6 pb-8">
          <Text className="text-white text-2xl font-bold">Report sa DTI 🏛️</Text>
          <Text className="text-white/80 text-sm mt-1">
            Ang DTI (Department of Trade and Industry) ang nagpoprotekta sa mga consumer laban sa sub-meter abuse at illegal na resale ng kuryente.
          </Text>
        </View>

        {/* What is sub-meter abuse */}
        <View className="mx-6 -mt-4 bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-4 shadow-sm">
          <Text className="text-yellow-800 font-bold text-sm mb-2">⚠️ Ano ang Sub-meter Abuse?</Text>
          <Text className="text-yellow-700 text-sm leading-5">
            Kapag ang iyong landlord ay gumagamit ng sub-meter at nagsisingil sa iyo ng mas mataas kaysa sa opisyal na Meralco rate bawat kWh, iyon ay sub-meter abuse. Halimbawa: Meralco rate ay ₱14.35/kWh pero sinisingil kang ₱20/kWh — ilegal iyon.
          </Text>
        </View>

        {/* Violations */}
        <View className="mx-6 mt-4 bg-white rounded-2xl p-5 shadow-sm">
          <Text className="text-stone-800 font-bold text-base mb-3">Mga Paglabag na Pwede I-report sa DTI</Text>
          <View className="gap-4">
            {VIOLATIONS.map((v) => (
              <View key={v.title} className="flex-row gap-3 items-start">
                <Text className="text-xl">{v.icon}</Text>
                <View className="flex-1">
                  <Text className="text-stone-800 font-bold text-sm">{v.title}</Text>
                  <Text className="text-stone-500 text-sm mt-1 leading-5">{v.body}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* How to check */}
        <View className="mx-6 mt-4 bg-white rounded-2xl p-5 shadow-sm">
          <Text className="text-stone-800 font-bold text-base mb-3">Paano Malaman kung Na-abuse Ka?</Text>
          <View className="gap-3">
            {[
              'Tingnan ang opisyal na Meralco rate para sa iyong area (nasa likod ng iyong bill)',
              'I-compare sa rate na sinisingil ng iyong landlord bawat kWh',
              'Kung mas mataas ang landlord rate → sub-meter abuse',
              'I-screenshot o i-document ang lahat ng ebidensya',
            ].map((item, i) => (
              <View key={i} className="flex-row gap-3 items-start">
                <View className="bg-brand-orange/20 rounded-full w-5 h-5 items-center justify-center shrink-0 mt-0.5">
                  <Text className="text-brand-orange text-xs font-bold">{i + 1}</Text>
                </View>
                <Text className="text-stone-600 text-sm flex-1 leading-5">{item}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Steps to report */}
        <View className="mx-6 mt-4 bg-white rounded-2xl p-5 shadow-sm">
          <Text className="text-stone-800 font-bold text-base mb-4">Paano Mag-report sa DTI</Text>
          <View className="gap-5">
            <Step
              number="1"
              title="I-document ang ebidensya"
              body="Kolektahin ang: mga resibo ng bayad, photos ng meter readings, screenshots ng bills na ibinigay ng landlord, at ang opisyal na Meralco rate para sa iyong area."
            />
            <Step
              number="2"
              title="Subukan muna ang mediasyon"
              body="Makipag-usap sa landlord at ipakita ang opisyal na Meralco rate. Minsan nasosolusyunan ito nang hindi kailangang pumunta sa DTI."
            />
            <Step
              number="3"
              title="Mag-file ng reklamo sa DTI"
              body="Pumunta sa pinakamalapit na DTI provincial/city office o mag-file online sa dtidiskwento.dti.gov.ph. Dalhin ang lahat ng ebidensya."
            />
            <Step
              number="4"
              title="DTI mediation process"
              body="Magtatawag ng mediasyon ang DTI sa pagitan mo at ng landlord. Kung hindi maayos, maaaring mag-file ng formal complaint na may kaukulang parusa sa landlord."
            />
          </View>
        </View>

        {/* Penalties */}
        <View className="mx-6 mt-4 bg-red-50 border border-red-200 rounded-2xl p-4">
          <Text className="text-red-700 font-bold text-sm mb-2">⚖️ Mga Parusa sa Sub-meter Abuse</Text>
          <Text className="text-red-600 text-sm leading-5">
            Ayon sa Republic Act 7832 (Anti-Electricity Pilferage Act) at DTI regulations, ang mga landlord na nagbebenta ng kuryente nang labag sa batas ay maaaring maparusahan ng multa mula ₱10,000 hanggang ₱200,000 at/o pagkabilanggo.
          </Text>
        </View>

        {/* Contact */}
        <View className="mx-6 mt-4 bg-white rounded-2xl p-5 shadow-sm">
          <Text className="text-stone-800 font-bold text-base mb-3">Contact Information</Text>
          <View className="gap-3">
            <ContactRow
              icon="📞"
              label="DTI Hotline"
              value="1-800-10-DTI-DOST (1-800-10-384-3678)"
              onPress={() => Linking.openURL('tel:180010384')}
            />
            <ContactRow
              icon="📧"
              label="DTI Email"
              value="consumers@dti.gov.ph"
              onPress={() => Linking.openURL('mailto:consumers@dti.gov.ph')}
            />
            <ContactRow
              icon="🌐"
              label="DTI Online Complaint"
              value="dtidiskwento.dti.gov.ph"
              onPress={() => Linking.openURL('https://www.dti.gov.ph')}
            />
          </View>
        </View>

        <Text className="text-stone-300 text-xs text-center mt-6 px-6">
          Base sa Republic Act 7832, DTI Department Administrative Order, at consumer protection guidelines.
        </Text>
      </ScrollView>
    </SafeAreaView>
  )
}
