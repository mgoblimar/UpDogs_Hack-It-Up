import { Tabs } from 'expo-router'
import { FontAwesome6 } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import AppHeader from '@/components/AppHeader'

export default function TabLayout() {
  const insets = useSafeAreaInsets()
  
  return (
    <Tabs
      screenOptions={{
        header: () => <AppHeader />,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#f1f5f9',
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 10,
          height: 60 + insets.bottom,
          paddingBottom: 8 + insets.bottom,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#eab308', // yellow-500
        tabBarInactiveTintColor: '#94a3b8', // slate-400
        tabBarLabelStyle: {
          fontFamily: 'Inter-Bold',
          fontSize: 10,
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <FontAwesome6 name="house" size={20} color={color} solid />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color }) => <FontAwesome6 name="clock-rotate-left" size={20} color={color} solid />,
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'Map',
          tabBarIcon: ({ color }) => <FontAwesome6 name="map-location-dot" size={20} color={color} solid />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <FontAwesome6 name="user" size={20} color={color} solid />,
        }}
      />
    </Tabs>
  )
}
