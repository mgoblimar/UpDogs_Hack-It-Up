import '../global.css'
import { useEffect } from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import * as WebBrowser from 'expo-web-browser'
import * as SplashScreen from 'expo-splash-screen'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { 
  useFonts, 
  Quicksand_300Light, 
  Quicksand_400Regular, 
  Quicksand_500Medium, 
  Quicksand_600SemiBold, 
  Quicksand_700Bold 
} from '@expo-google-fonts/quicksand'

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync()

WebBrowser.maybeCompleteAuthSession()

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Quicksand_300Light,
    Quicksand_400Regular,
    Quicksand_500Medium,
    Quicksand_600SemiBold,
    Quicksand_700Bold,
  })

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync()
    }
  }, [fontsLoaded, fontError])

  useEffect(() => {
    if (!isSupabaseConfigured) return

    // Ensure anonymous session exists for users who skip sign-in
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session && __DEV__) {
        await supabase.auth.signInAnonymously()
      }
    })
  }, [])

  if (!fontsLoaded && !fontError) {
    return null
  }

  return (
    <>
      <StatusBar style="light" backgroundColor="#1C2B3A" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#F8F8F8' },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="home" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="sign-in" options={{ headerShown: false }} />
        <Stack.Screen name="manual-input" options={{ headerShown: false }} />
        <Stack.Screen name="scanner" options={{ headerShown: false }} />
        <Stack.Screen name="bill-decoder" options={{ headerShown: false }} />
        <Stack.Screen name="verdict" options={{ headerShown: false }} />
        <Stack.Screen name="erc-complaint" options={{ headerShown: false }} />
        <Stack.Screen name="lifeline-checker" options={{ headerShown: false }} />
        <Stack.Screen name="dti-report" options={{ headerShown: false }} />
        <Stack.Screen name="chat" options={{ headerShown: false }} />
        <Stack.Screen name="heat-map" options={{ headerShown: false }} />
        <Stack.Screen name="history" options={{ headerShown: false }} />
      </Stack>
    </>
  )
}
