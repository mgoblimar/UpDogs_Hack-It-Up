import AsyncStorage from '@react-native-async-storage/async-storage'

export async function storageGet<T>(key: string): Promise<T | null> {
  try {
    const value = await AsyncStorage.getItem(key)
    return value ? (JSON.parse(value) as T) : null
  } catch {
    return null
  }
}

export async function storageSet<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value))
}

export async function storageRemove(key: string): Promise<void> {
  await AsyncStorage.removeItem(key)
}

export function isStale(cachedAt: string | null, maxAgeHours = 1): boolean {
  if (!cachedAt) return true
  const age = Date.now() - new Date(cachedAt).getTime()
  return age > maxAgeHours * 60 * 60 * 1000
}
