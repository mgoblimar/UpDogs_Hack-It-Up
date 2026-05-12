export type VerdictStatus = 'normal' | 'high' | 'overcharged'

export interface LineItem {
  key: string
  label: string
  amount: number
  ratePerKwh?: number
  status: VerdictStatus
  explanation: string
}

export interface BillInput {
  totalAmount: number
  kwh: number
  city: string
  generationCharge?: number
  transmissionCharge?: number
  systemLossCharge?: number
  distributionCharge?: number
  supplyCharge?: number
  meteringCharge?: number
  subsidies?: number
  taxes?: number
  billingMonth?: string
}

export interface VerdictResult {
  status: VerdictStatus
  overchargeAmount: number
  userRatePerKwh: number
  ercMaxRatePerKwh: number
  cityAverageAmount?: number
  lineItems: LineItem[]
}
