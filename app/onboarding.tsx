import { View, StyleSheet, Dimensions, ImageBackground, Image, ScrollView } from 'react-native'
import { useState } from 'react'
import { Text } from '@/components/CustomText'
import { PrimaryButton, OutlineButton } from '@/components/Buttons'
import { useRouter } from 'expo-router'

const { width, height } = Dimensions.get('window')

const TOTAL_STEPS = 6

export default function OnboardingScreen() {
  const router = useRouter()
  const [step, setStep] = useState(0)

  function next() { setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1)) }
  function back() { setStep((s) => Math.max(s - 1, 0)) }

  return (
    <ImageBackground
      source={require('@/assets/KuryenteKo/hero/background.jpg')}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay}>

        {/* Progress dots */}
        <View style={{ flexDirection: 'row', gap: 6, marginTop: 60, marginBottom: 8 }}>
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <View
              key={i}
              style={{
                width: i === step ? 20 : 7,
                height: 7,
                borderRadius: 4,
                backgroundColor: i === step ? '#F5C518' : '#D1D5DB',
              }}
            />
          ))}
        </View>

        {/* ── Step 0: Guy Thinking Blue ── */}
        {step === 0 && (
          <>
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

            <View style={styles.buttons}>
              <PrimaryButton label="Susunod →" onPress={next} />
            </View>
          </>
        )}

        {/* ── Step 1: Meralco Bill image ── */}
        {step === 1 && (
          <>
            <View style={{ flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center' }}>
              <Text style={[styles.title, { marginBottom: 16 }]}>
                Ganito ang karaniwang Meralco bill
              </Text>
              <ScrollView
                contentContainerStyle={{ alignItems: 'center', paddingBottom: 8 }}
                showsVerticalScrollIndicator={false}
                style={{ maxHeight: height * 0.52 }}
              >
                <Image
                  source={require('@/assets/KuryenteKo/Onboarding/Meralco_Bill.png')}
                  style={{ width: width - 48, height: undefined, aspectRatio: 0.7 }}
                  resizeMode="contain"
                />
              </ScrollView>
              <Text style={[styles.subtitle, { marginTop: 12 }]}>
                Maraming charges — alam mo ba kung ano ang ibig sabihin nito?
              </Text>
            </View>

            <View style={styles.buttons}>
              <PrimaryButton label="Susunod →" onPress={next} />
              <OutlineButton label="Bumalik" onPress={back} />
            </View>
          </>
        )}

        {/* ── Step 2: Full Meralco Bill ── */}
        {step === 2 && (
          <>
            <View style={{ flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center' }}>
              <Text style={[styles.title, { marginBottom: 16 }]}>
                Kunin ang electricity bill
              </Text>
              <Image
                source={require('@/assets/KuryenteKo/Onboarding/Meralco_Bill.png')}
                style={{ width: width - 48, flex: 1 }}
                resizeMode="contain"
              />
            </View>

            <View style={styles.buttons}>
              <PrimaryButton label="Susunod →" onPress={next} />
              <OutlineButton label="Bumalik" onPress={back} />
            </View>
          </>
        )}

        {/* ── Step 3: Meralco Bill Pic ── */}
        {step === 3 && (
          <>
            <View style={{ flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center' }}>
              <Text style={[styles.title, { marginBottom: 16 }]}>
                I-scan lang ang iyong bill
              </Text>
              <Image
                source={require('@/assets/KuryenteKo/Onboarding/Meralco_Bill_Pic.png')}
                style={{ width: width - 48, height: height * 0.48 }}
                resizeMode="contain"
              />
              <Text style={[styles.subtitle, { marginTop: 12, lineHeight: 22 }]}>
                I-align ang front page ng iyong Meralco bill sa loob ng camera frame. Siguraduhing maliwanag ang paligid para mabasa ng KuryenteKo ang iyong charges nang tama.
              </Text>
            </View>

            <View style={styles.buttons}>
              <PrimaryButton label="Susunod →" onPress={next} />
              <OutlineButton label="Bumalik" onPress={back} />
            </View>
          </>
        )}

        {/* ── Step 4: Heart Girl ── */}
        {step === 4 && (
          <>
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

            <View style={styles.buttons}>
              <PrimaryButton label="Susunod →" onPress={next} />
              <OutlineButton label="Bumalik" onPress={back} />
            </View>
          </>
        )}

        {/* ── Step 5: Welcome ── */}
        {step === 5 && (
          <>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <View style={{ marginBottom: 20, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 12, elevation: 6 }}>
                <Image
                  source={require('@/assets/icon.png')}
                  style={{ width: 200, height: 200 }}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.title}>Welcome to KuryenteKo!</Text>
              <Text style={styles.subtitle}>YOUR BILL'S BEST FRIEND</Text>
            </View>

            <View style={styles.buttons}>
              <PrimaryButton label="Magsimula →" onPress={() => router.replace('/sign-in')} />
              <OutlineButton label="Bumalik" onPress={back} />
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
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 24,
  },
  buttons: {
    marginTop: 20,
    marginBottom: 50,
    width: '100%',
    gap: 12,
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
