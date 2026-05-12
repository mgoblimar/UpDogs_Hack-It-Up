import { View, Text, ScrollView, TouchableOpacity, Linking } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useBillStore } from '@/store/billStore'

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

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between py-2 border-b border-stone-100">
      <Text className="text-stone-500 text-sm">{label}</Text>
      <Text className="text-stone-800 text-sm font-medium">{value}</Text>
    </View>
  )
}

export default function ERCComplaintScreen() {
  const billInput = useBillStore((s) => s.billInput)
  const verdict = useBillStore((s) => s.verdict)

  const hasOvercharge = verdict?.status === 'overcharged'

  return (
    <SafeAreaView className="flex-1 bg-stone-50" edges={['bottom']}>
      <ScrollView className="flex-1" contentContainerClassName="pb-10">

        {/* Header */}
        <View className="bg-brand-orange px-6 pt-6 pb-8">
          <Text className="text-white text-2xl font-bold">Reklamo sa ERC 📋</Text>
          <Text className="text-white/80 text-sm mt-1">
            Ang ERC (Energy Regulatory Commission) ang nagpoprotekta sa mga consumer mula sa overcharging.
          </Text>
        </View>

        {/* Bill summary if available */}
        {hasOvercharge && billInput && verdict && (
          <View className="mx-6 -mt-4 bg-red-50 border-2 border-red-200 rounded-2xl p-4 shadow-sm">
            <Text className="text-red-700 font-bold text-sm mb-3">🚨 Iyong Bill — May Overcharge</Text>
            <InfoCard label="Lungsod" value={billInput.city ?? '—'} />
            <InfoCard label="Iyong rate" value={`₱${verdict.userRatePerKwh.toFixed(4)}/kWh`} />
            <InfoCard label="ERC maximum" value={`₱${verdict.ercMaxRatePerKwh.toFixed(4)}/kWh`} />
            <InfoCard label="Tinatayang labis" value={`₱${verdict.overchargeAmount.toFixed(2)}`} />
          </View>
        )}

        {/* Grounds for complaint */}
        <View className="mx-6 mt-5 bg-white rounded-2xl p-5 shadow-sm">
          <Text className="text-stone-800 font-bold text-base mb-3">Kailan Pwede Magreklamo?</Text>
          <View className="gap-3">
            {[
              { icon: '⚡', text: 'Rate mo ay mas mataas sa ERC-approved maximum' },
              { icon: '📊', text: 'System loss charge ay higit sa 8.5% ng iyong consumption' },
              { icon: '🔢', text: 'Mali ang meter reading o binabase sa estimated reading' },
              { icon: '💸', text: 'May dagdag na charges na hindi nakalagay sa kontrata' },
              { icon: '📅', text: 'Binilled ka para sa panahon na wala kang koneksyon' },
            ].map((item) => (
              <View key={item.text} className="flex-row gap-3 items-start">
                <Text className="text-base">{item.icon}</Text>
                <Text className="text-stone-600 text-sm flex-1 leading-5">{item.text}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Steps */}
        <View className="mx-6 mt-4 bg-white rounded-2xl p-5 shadow-sm">
          <Text className="text-stone-800 font-bold text-base mb-4">Paano Magreklamo sa ERC</Text>
          <View className="gap-5">
            <Step
              number="1"
              title="Makipag-ugnayan muna sa Meralco"
              body="Tawagan ang hotline 16211 o pumunta sa pinakamalapit na Meralco business center. Humingi ng formal explanation ng iyong bill. I-document ang lahat ng conversation."
            />
            <Step
              number="2"
              title="I-prepare ang mga dokumento"
              body="Kolektahin ang: (1) kopya ng bill na pinagrereklamo, (2) lahat ng nakaraang bill sa nakaraang 6 buwan, (3) written response mula sa Meralco (kung meron)."
            />
            <Step
              number="3"
              title="Mag-file ng Consumer Complaint sa ERC"
              body="Pumunta sa ERC office (ICTSI Building, Bonifacio Global City, Taguig) o i-email sa consumer_affairs@erc.ph. Libre ang pag-file ng reklamo."
            />
            <Step
              number="4"
              title="I-follow up ang iyong kaso"
              body="Ang ERC ay may 30 araw na deadline para mag-respond sa mga reklamo. Mag-follow up sa (02) 8-9129935 kung walang update pagkatapos ng 2 linggo."
            />
          </View>
        </View>

        {/* Contact info */}
        <View className="mx-6 mt-4 bg-white rounded-2xl p-5 shadow-sm">
          <Text className="text-stone-800 font-bold text-base mb-3">Contact Information</Text>
          <View className="gap-3">
            <ContactRow
              icon="📞"
              label="ERC Hotline"
              value="(02) 8-9129935"
              onPress={() => Linking.openURL('tel:02-8-9129935')}
            />
            <ContactRow
              icon="📧"
              label="ERC Email"
              value="consumer_affairs@erc.ph"
              onPress={() => Linking.openURL('mailto:consumer_affairs@erc.ph')}
            />
            <ContactRow
              icon="📞"
              label="Meralco Hotline"
              value="16211"
              onPress={() => Linking.openURL('tel:16211')}
            />
            <ContactRow
              icon="🌐"
              label="ERC Website"
              value="erc.gov.ph"
              onPress={() => Linking.openURL('https://www.erc.gov.ph')}
            />
          </View>
        </View>

        <Text className="text-stone-300 text-xs text-center mt-6 px-6">
          Ang impormasyon ay base sa ERC Consumer Affairs guidelines. Para sa pinaka-updated na proseso, bisitahin ang erc.gov.ph.
        </Text>
      </ScrollView>
    </SafeAreaView>
  )
}

function ContactRow({
  icon, label, value, onPress,
}: {
  icon: string; label: string; value: string; onPress: () => void
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center gap-3 py-2"
      activeOpacity={0.7}
    >
      <Text className="text-xl">{icon}</Text>
      <View className="flex-1">
        <Text className="text-stone-400 text-xs">{label}</Text>
        <Text className="text-brand-orange text-sm font-medium">{value}</Text>
      </View>
      <Text className="text-stone-300">›</Text>
    </TouchableOpacity>
  )
}
