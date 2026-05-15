import { View, StyleSheet, Dimensions, ImageBackground, Image } from 'react-native'
import { useState } from 'react'
import { Text } from '@/components/CustomText'
import { PrimaryButton, OutlineButton } from '@/components/Buttons'
import { useRouter } from 'expo-router'
import TextLogo from '@/assets/KuryenteKo/text-logo.svg'

const { width } = Dimensions.get('window')

export default function OnboardingScreen() {
  const router = useRouter()
  const [step, setStep] = useState(0)

  return (
    <ImageBackground 
      source={require('@/assets/KuryenteKo/hero/background.jpg')} 
      style={styles.container}
      resizeMode="cover"
    >
      {/* White transparent overlay */}
      <View style={styles.overlay}>
        {step === 0 && (
          <>
            {/* Step 0 Content */}
            <View style={{ flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center' }}>
              <Image 
                source={require('@/assets/KuryenteKo/figures/GuyThinkingBlue.png')} 
                style={{ width: 220, height: 340 }} 
                resizeMode="contain" 
              />
              <View style={{ marginTop: 30, alignItems: 'center' }}>
                <Text style={[styles.title, { fontSize: 28 }]}>
                  Naguguluhan sa iyong electricity bill?
                </Text>
                <Text style={styles.subtitle}>
                  Wag mag-alala, nandito kami para tumulong.
                </Text>
              </View>
            </View>

            <View style={{ marginTop: 20, marginBottom: 80, width: '100%', gap: 12 }}>
              <PrimaryButton 
                label="Susunod →" 
                onPress={() => setStep(1)} 
              />

            </View>
          </>
        )}

        {step === 1 && (
          <>
            {/* Step 1 Content */}
            <View style={{ flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center' }}>
              <Image 
                source={require('@/assets/KuryenteKo/figures/HeartGirlyellow.png')} 
                style={{ width: 220, height: 340 }} 
                resizeMode="contain" 
              />
              <View style={{ marginTop: 30, alignItems: 'center', paddingHorizontal: 10 }}>
                <Text style={[styles.title, { fontSize: 28 }]}>
                  Alamin ang iyong tunay na binabayaran
                </Text>
                <Text style={styles.subtitle}>
                  Suriin ang iyong bill at simulan ang pagtitipid.
                </Text>
              </View>
            </View>

            <View style={{ marginTop: 20, marginBottom: 80, width: '100%', gap: 12 }}>
              <PrimaryButton 
                label="Susunod →" 
                onPress={() => setStep(2)} 
              />
              <OutlineButton 
                label="Bumalik" 
                onPress={() => setStep(0)} 
              />
            </View>
          </>
        )}

        {step === 2 && (
          <>
            {/* Step 2 Content */}
            {/* Top Hero Banner */}
            <View style={{ marginBottom: -40, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 12, elevation: 6 }}>
              <Image 
                source={require('@/assets/icon.png')} 
                style={{ width: 200, height: 200 }} 
                resizeMode="contain" 
              />
            </View>
            
            <View style={{ marginTop: 20, alignItems: 'center' }}>
              <Text style={styles.title}>Welcome to KuryenteKo!</Text>
              <Text style={styles.subtitle}>
                YOUR BILL'S BEST FRIEND
              </Text>
            </View>
            
            <View style={{ marginTop: 40, marginBottom: 80, width: '100%', gap: 12 }}>
              <PrimaryButton 
                label="Magsimula →" 
                onPress={() => router.replace('/sign-in')} 
              />
              
              <OutlineButton 
                label="Bumalik" 
                onPress={() => setStep(1)} 
              />
            </View>
          </>
        )}
      </View>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.88)', // White transparent overlay
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
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
    fontWeight: '700',
    letterSpacing: 1,
    color: '#F5C518',
    textAlign: 'center',
  },
})
