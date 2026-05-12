import { create } from 'zustand'
import type { BillInput, VerdictResult } from '@/types/bill'

interface BillStore {
  billInput: Partial<BillInput> | null
  verdict: VerdictResult | null
  setBillInput: (input: Partial<BillInput>) => void
  setVerdict: (verdict: VerdictResult) => void
  reset: () => void
}

export const useBillStore = create<BillStore>((set) => ({
  billInput: null,
  verdict: null,
  setBillInput: (input) => set({ billInput: input }),
  setVerdict: (verdict) => set({ verdict }),
  reset: () => set({ billInput: null, verdict: null }),
}))
