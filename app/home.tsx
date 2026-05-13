import { View, TouchableOpacity, ScrollView, Image } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter, Redirect } from 'expo-router'
import { useBillStore } from '@/store/billStore'
import { useHistoryStore } from '@/store/historyStore'
import { useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import type { Session } from '@supabase/supabase-js'
import AppHeader from '@/components/AppHeader'
import KoKoSpeechBubble from '@/components/KoKoSpeechBubble'
import { Text } from '@/components/CustomText'

const DAYS_PH = ['Linggo', 'Lunes', 'Martes', 'Miyerkules', 'Huwebes', 'Biyernes', 'Sabado']
const MONTHS_PH = ['Enero', 'Pebrero', 'Marso', 'Abril', 'Mayo', 'Hunyo', 'Hulyo', 'Agosto', 'Setyembre', 'Oktubre', 'Nobyembre', 'Disyembre']

function getPhDate() {
  const now = new Date()
  const day = DAYS_PH[now.getDay()]
  const month = MONTHS_PH[now.getMonth()]
  return `${month.toUpperCase()} ${now.getDate()}, ${now.getFullYear()} ${day.toUpperCase()}`
}

export default function HomeScreen() {
  const router = useRouter()
  const reset = useBillStore((s) => s.reset)
  const loadHistory = useHistoryStore((s) => s.loadForUser)
  const [session, setSession] = useState<Session | null | undefined>(undefined)

  useEffect(() => {
    reset()

    if (!isSupabaseConfigured) {
      setSession(null)
      return
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      if (data.session?.user?.id) loadHistory(data.session.user.id)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s)
      if (s?.user?.id) loadHistory(s.user.id)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  if (session === undefined) return null
  if (!session) return <Redirect href="/sign-in" />

  const userName = session.user?.email?.split('@')[0] ?? 'Ka-KuryenteKo'
  const displayName = userName.charAt(0).toUpperCase() + userName.slice(1)

  return (
    <View style={{ flex: 1, backgroundColor: '#F8F8F8' }}>
      <AppHeader showMenu showBell />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Date + Greeting */}
        <View style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 4, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#9CA3AF', fontSize: 11, fontWeight: '600', letterSpacing: 0.5 }}>
              {getPhDate()}
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', marginTop: 4 }}>
              <Text style={{ color: '#1C2B3A', fontSize: 18, fontWeight: '600' }}>Magandang araw,  </Text>
              <Text style={{ color: '#F5C518', fontSize: 18, fontWeight: '800' }}>{displayName}!</Text>
            </View>
          </View>
          {/* Avatar circle */}
          <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center', marginLeft: 12 }}>
            <Text style={{ fontSize: 22 }}>👤</Text>
          </View>
        </View>

        {/* Estimated Bill Card (dark navy) */}
        <View style={{ marginHorizontal: 20, marginTop: 16, borderRadius: 20, backgroundColor: '#1C2B3A', padding: 24, overflow: 'hidden' }}>
          {/* KoKo speech bubble */}
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', marginBottom: 16 }}>
            {/* KoKo owl placeholder */}
            <View style={{
              width: 64, height: 64, borderRadius: 32,
              backgroundColor: '#2E4057', alignItems: 'center', justifyContent: 'center',
              marginRight: 12,
            }}>
              <Text style={{ fontSize: 32 }}>🦉</Text>
            </View>
            {/* Speech bubble */}
            <View style={{
              flex: 1, backgroundColor: '#F5C518', borderRadius: 12,
              borderBottomLeftRadius: 4, padding: 10,
            }}>
              <Text style={{ color: '#1C2B3A', fontSize: 12, fontWeight: '600' }}>
                Ako si <Text style={{ fontWeight: '800' }}>KoKo</Text>, ang wais mong kuago! Nandito ako para bantayan ang bill mo.
              </Text>
            </View>
          </View>

          <Text style={{ color: '#9CA3AF', fontSize: 13, textAlign: 'center' }}>Estimatong Bill Ngayong Buwan</Text>
          <Text style={{ color: '#fff', fontSize: 42, fontWeight: '900', textAlign: 'center', marginVertical: 4, letterSpacing: -1 }}>
            ₱ 0,000.00
          </Text>
          <Text style={{ color: '#9CA3AF', fontSize: 13, textAlign: 'center' }}>I-scan ang bill mo para makita ang tunay na halaga</Text>
        </View>

        {/* Check bill CTA section */}
        <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
          <Text style={{ color: '#1C2B3A', fontSize: 15, fontWeight: '700', textAlign: 'center', marginBottom: 14 }}>
            Suriin ang iyong Bill: Siguraduhing Tama ang Singil.
          </Text>

          <View style={{ flexDirection: 'row', gap: 12 }}>
            {/* Scan button — yellow */}
            <TouchableOpacity
              onPress={() => router.push('/scanner')}
              activeOpacity={0.85}
              style={{
                flex: 1, backgroundColor: '#F5C518', borderRadius: 14,
                paddingVertical: 14, alignItems: 'center', justifyContent: 'center',
                flexDirection: 'row', gap: 8,
              }}
            >
              <Text style={{ fontSize: 18 }}>📷</Text>
              <Text style={{ color: '#1C2B3A', fontWeight: '800', fontSize: 13 }}>I-SCAN ANG{'\n'}BAGONG BILL</Text>
            </TouchableOpacity>

            {/* Manual button — gray */}
            <TouchableOpacity
              onPress={() => router.push('/manual-input')}
              activeOpacity={0.85}
              style={{
                flex: 1, backgroundColor: '#E5E7EB', borderRadius: 14,
                paddingVertical: 14, alignItems: 'center', justifyContent: 'center',
                flexDirection: 'row', gap: 8,
              }}
            >
              <Text style={{ fontSize: 18 }}>✏️</Text>
              <Text style={{ color: '#1C2B3A', fontWeight: '700', fontSize: 13 }}>I-MANUAL{'\n'}INPUT</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Komminity Update section */}
        <View style={{ paddingHorizontal: 20, marginTop: 28 }}>
          <Text style={{ color: '#9CA3AF', fontSize: 12, fontWeight: '800', letterSpacing: 1, marginBottom: 12 }}>
            KOMMINITY UPDATE
          </Text>

          <View style={{ flexDirection: 'row', gap: 12 }}>
            {/* Left column — stat cards */}
            <View style={{ flex: 1, gap: 10 }}>
              <View style={{ backgroundColor: '#D4EDDA', borderRadius: 16, padding: 16 }}>
                <Text style={{ color: '#1C2B3A', fontSize: 28, fontWeight: '900' }}>1,200</Text>
                <Text style={{ color: '#4B5563', fontSize: 12, marginTop: 2 }}>Bills na-verify</Text>
              </View>
              <View style={{ backgroundColor: '#FFD6D6', borderRadius: 16, padding: 16 }}>
                <Text style={{ color: '#1C2B3A', fontSize: 28, fontWeight: '900' }}>₱742</Text>
                <Text style={{ color: '#4B5563', fontSize: 12, marginTop: 2 }}>Avg. Overcharge</Text>
              </View>
            </View>

            {/* Right column — Fairness gauge */}
            <View style={{ flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 16, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 }}>
              <Text style={{ color: '#9CA3AF', fontSize: 11, fontWeight: '700', letterSpacing: 0.5, marginBottom: 8 }}>FAIRNESS CHECK</Text>
              {/* Gauge placeholder */}
              <Text style={{ fontSize: 36 }}>⚖️</Text>
              <Text style={{ color: '#1C2B3A', fontWeight: '700', fontSize: 16, marginTop: 6 }}>Fair</Text>
              <Text style={{ color: '#4B5563', fontSize: 12, marginTop: 2 }}>Your Rate:</Text>
              <Text style={{ color: '#1C2B3A', fontWeight: '800', fontSize: 15 }}>₱12.0/kWh</Text>
            </View>
          </View>
        </View>

        {/* Quick links */}
        <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
          <TouchableOpacity
            onPress={() => router.push('/history')}
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12 }}
            activeOpacity={0.7}
          >
            <Text style={{ color: '#9CA3AF', fontSize: 13 }}>📋 Kasaysayan ng Bill</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push('/chat')}
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 8 }}
            activeOpacity={0.7}
          >
            <Text style={{ color: '#9CA3AF', fontSize: 13 }}>🤖 Magtanong kay KoKo</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  )
}
