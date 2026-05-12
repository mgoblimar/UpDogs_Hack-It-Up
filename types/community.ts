export type KwhRange = '0-100' | '101-200' | '201-300' | '300+'
export type AmountRange = '0-2000' | '2001-4000' | '4001-6000' | '6000+'
export type ReportType = 'overcharge' | 'sub_meter' | 'normal'

export interface CommunityReport {
  id: string
  city: string
  barangay?: string
  kwhRange: KwhRange
  amountRange: AmountRange
  reportType: ReportType
  createdAt: string
}

export interface HeatMapPoint {
  city: string
  averageAmount: number
  reportCount: number
  status: 'low' | 'medium' | 'high'
}
