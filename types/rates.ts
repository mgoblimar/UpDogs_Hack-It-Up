export interface ERCRates {
  generationMax: number
  transmissionMax: number
  systemLossMax: number
  distributionMax: number
  supplyMax: number
  meteringMax: number
  overallMax: number
  updatedAt: string
}

export interface NationalRate {
  id: string
  month: string
  chargeType: string
  rateKwh: number
  maxRate: number
  source: string
}
