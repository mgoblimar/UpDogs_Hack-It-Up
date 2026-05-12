import { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

type Mode = 'signin' | 'signup'

export default function SignInScreen() {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSignIn() {
    if (!email.trim() || !password.trim()) {
      setError('Ilagay ang email at password.')
      return
    }
    setLoading(true)
    setError(null)

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    })

    setLoading(false)

    if (signInError) {
      if (signInError.message.includes('Email not confirmed')) {
        setError('Hindi pa na-confirm ang email mo. Tingnan ang iyong inbox at i-click ang confirmation link.')
      } else if (signInError.message.includes('Invalid login credentials')) {
        setError('Mali ang email o password. Subukan ulit.')
      } else {
        setError('Hindi makapag-sign in. Subukan ulit.')
      }
      console.error('[Auth] Sign in error:', signInError)
      return
    }

    router.replace('/')
  }

  async function handleSignUp() {
    if (!email.trim() || !password.trim()) {
      setError('Ilagay ang email at password.')
      return
    }
    if (password.length < 6) {
      setError('Dapat ay 6 characters man lang ang password.')
      return
    }
    setLoading(true)
    setError(null)

    const { error: signUpError } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
    })

    setLoading(false)

    if (signUpError) {
      if (signUpError.message.includes('already registered')) {
        setError('May account na ang email na ito. Mag-sign in na lang.')
        setMode('signin')
      } else {
        setError('Hindi makapag-sign up. Subukan ulit.')
      }
      console.error('[Auth] Sign up error:', signUpError)
      return
    }

    router.replace('/')
  }

  async function handleSkip() {
    if (isSupabaseConfigured) {
      await supabase.auth.signInAnonymously()
    }
    router.replace('/')
  }

  return (
    <SafeAreaView className="flex-1 bg-stone-50">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          className="flex-1"
          contentContainerClassName="flex-grow px-6 items-center justify-center py-10"
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo */}
          <View className="bg-brand-orange rounded-3xl w-20 h-20 items-center justify-center mb-6 shadow-lg">
            <Text className="text-4xl">⚡</Text>
          </View>

          <Text className="text-stone-800 text-3xl font-bold text-center">KuryenteKo</Text>
          <Text className="text-stone-500 text-base text-center mt-2 mb-10">
            I-analyze ang iyong electricity bill at alamin kung na-overcharge ka.
          </Text>

          <>
              <Text className="text-stone-800 text-xl font-bold w-full mb-6">
                {mode === 'signin' ? 'Mag-sign in' : 'Gumawa ng Account'}
              </Text>

              {error && (
                <View className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 w-full mb-4">
                  <Text className="text-red-600 text-sm text-center">{error}</Text>
                </View>
              )}

              <TextInput
                className="bg-white border-2 border-stone-200 rounded-2xl px-4 py-4 w-full text-stone-800 text-base mb-3"
                placeholder="Email"
                placeholderTextColor="#A8A29E"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />

              <TextInput
                className="bg-white border-2 border-stone-200 rounded-2xl px-4 py-4 w-full text-stone-800 text-base mb-4"
                placeholder="Password (min. 6 characters)"
                placeholderTextColor="#A8A29E"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />

              <TouchableOpacity
                onPress={mode === 'signin' ? handleSignIn : handleSignUp}
                disabled={loading}
                className="bg-brand-orange rounded-2xl py-4 w-full items-center"
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white font-bold text-base">
                    {mode === 'signin' ? 'Mag-sign in' : 'Gumawa ng Account'}
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(null) }}
                className="mt-2 py-2"
                activeOpacity={0.7}
              >
                <Text className="text-brand-orange text-sm text-center font-medium">
                  {mode === 'signin' ? 'Wala pang account? Mag-sign up →' : 'May account na? Mag-sign in →'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleSkip} className="mt-2 py-3" activeOpacity={0.7}>
                <Text className="text-stone-400 text-sm text-center">
                  Gamitin nang walang account →
                </Text>
              </TouchableOpacity>
            </>
        </ScrollView>
      </KeyboardAvoidingView>

      <Text className="text-stone-300 text-xs text-center pb-6 px-6">
        Walang personal na impormasyon ang ibinabahagi. Ligtas ang iyong datos.
      </Text>
    </SafeAreaView>
  )
}
