import { create } from 'zustand'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { BillRecord } from '@/types/bill'

const key = (userId: string) => `bill-history-${userId}`

interface HistoryStore {
  bills: BillRecord[]
  userId: string | null
  loadForUser: (userId: string) => Promise<void>
  addBill: (record: BillRecord) => void
  removeBill: (id: string) => void
  clearHistory: () => void
}

export const useHistoryStore = create<HistoryStore>((set, get) => ({
  bills: [],
  userId: null,

  loadForUser: async (userId) => {
    set({ userId, bills: [] })
    try {
      const raw = await AsyncStorage.getItem(key(userId))
      if (raw) set({ bills: JSON.parse(raw) })
    } catch {}
  },

  addBill: (record) => {
    const { bills, userId } = get()
    if (!userId) return
    const filtered = bills.filter((b) => b.id !== record.id)
    const next = [record, ...filtered].slice(0, 20)
    set({ bills: next })
    AsyncStorage.setItem(key(userId), JSON.stringify(next))
  },

  removeBill: (id) => {
    const { bills, userId } = get()
    if (!userId) return
    const next = bills.filter((b) => b.id !== id)
    set({ bills: next })
    AsyncStorage.setItem(key(userId), JSON.stringify(next))
  },

  clearHistory: () => {
    const { userId } = get()
    if (!userId) return
    set({ bills: [] })
    AsyncStorage.removeItem(key(userId))
  },
}))
