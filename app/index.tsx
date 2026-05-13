import { View, ImageBackground, StyleSheet, Dimensions } from 'react-native'
import { useRouter } from 'expo-router'
import { useEffect } from 'react'
import { StatusBar } from 'expo-status-bar'

// Import the SVG logo directly (enabled by react-native-svg-transformer)
import TextLogo from '@/assets/KuryenteKo/text-logo.svg'

const { width, height } = Dimensions.get('window')

export default function SplashScreen() {
  const router = useRouter()

  useEffect(() => {
    // Navigate to onboarding after 5 seconds
    const timer = setTimeout(() => {
      router.replace('/onboarding')
    }, 5000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ImageBackground
        source={require('@/assets/KuryenteKo/hero/background.jpg')}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          {/* SVG Logo */}
          <TextLogo width={width * 0.95} height={180} />
        </View>
      </ImageBackground>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(28, 43, 58, 0.4)', // Navy overlay just in case the text needs contrast
    alignItems: 'center',
    justifyContent: 'center',
  },
})
