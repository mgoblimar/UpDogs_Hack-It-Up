import '../global.css'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" backgroundColor="#F97316" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#F97316' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
          contentStyle: { backgroundColor: '#FAFAF9' },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="manual-input" options={{ title: 'I-input ang Bill' }} />
        <Stack.Screen name="scanner" options={{ title: 'I-scan ang Bill' }} />
        <Stack.Screen name="bill-decoder" options={{ title: 'Ang Iyong Bill' }} />
        <Stack.Screen name="verdict" options={{ title: 'Resulta', headerBackVisible: false }} />
        <Stack.Screen name="erc-complaint" options={{ title: 'Reklamo sa ERC' }} />
        <Stack.Screen name="lifeline-checker" options={{ title: 'Lifeline Rate' }} />
        <Stack.Screen name="dti-report" options={{ title: 'Report sa DTI' }} />
        <Stack.Screen name="chat" options={{ title: 'Tanungin ang KuryenteKo AI' }} />
      </Stack>
    </>
  )
}
