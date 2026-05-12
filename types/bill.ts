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
  totalAmount: number       // "Charges for this billing period" (NOT Total Amount Due)
  kwh: number
  city: string
  ratePerKwh?: number       // "Your rate this month ₱X.XX per kWh"
  generationCharge?: number
  transmissionCharge?: number
  systemLossCharge?: number
  distributionCharge?: number
  subsidies?: number
  universalCharges?: number
  fitAll?: number           // FiT-All (Renewable)
  taxes?: number            // Government Taxes (VAT)
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
