import { View, StyleSheet } from 'react-native'
import { Text } from '@/components/CustomText'
import { PrimaryButton } from '@/components/Buttons'
import { useRouter } from 'expo-router'

export default function OnboardingScreen() {
  const router = useRouter()

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to KuryenteKo!</Text>
      <Text style={styles.subtitle}>
        This is a placeholder for the onboarding flow.
      </Text>
      
      <View style={{ marginTop: 40, width: '100%' }}>
        <PrimaryButton 
          label="Magsimula →" 
          onPress={() => router.replace('/sign-in')} 
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1C2B3A',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
  },
})
