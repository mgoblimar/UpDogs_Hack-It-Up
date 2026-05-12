import { ERC_RATES, CHARGE_EXPLANATIONS } from '@/lib/constants'
import type { BillInput, VerdictResult, LineItem, VerdictStatus } from '@/types/bill'
import type { ERCRates } from '@/types/rates'

function getStatus(ratePerKwh: number, maxRate: number): VerdictStatus {
  if (ratePerKwh <= maxRate) return 'normal'
  if (ratePerKwh <= maxRate * 1.1) return 'high'
  return 'overcharged'
}

export function analyzeBill(input: BillInput, rates: ERCRates = ERC_RATES): VerdictResult {
  const { kwh, totalAmount } = input
  const userRatePerKwh = input.ratePerKwh ?? totalAmount / kwh

  const lineItems: LineItem[] = []

  if (input.generationCharge !== undefined) {
    const rate = input.generationCharge / kwh
    lineItems.push({
      key: 'generationCharge',
      label: 'Generation Charge',
      amount: input.generationCharge,
      ratePerKwh: rate,
      status: getStatus(rate, rates.generationMax),
      explanation: CHARGE_EXPLANATIONS.generationCharge,
    })
  }

  if (input.transmissionCharge !== undefined) {
    const rate = input.transmissionCharge / kwh
    lineItems.push({
      key: 'transmissionCharge',
      label: 'Transmission Charge',
      amount: input.transmissionCharge,
      ratePerKwh: rate,
      status: getStatus(rate, rates.transmissionMax),
      explanation: CHARGE_EXPLANATIONS.transmissionCharge,
    })
  }

  if (input.systemLossCharge !== undefined) {
    const rate = input.systemLossCharge / kwh
    lineItems.push({
      key: 'systemLossCharge',
      label: 'System Loss Charge',
      amount: input.systemLossCharge,
      ratePerKwh: rate,
      status: getStatus(rate, rates.systemLossMax),
      explanation: CHARGE_EXPLANATIONS.systemLossCharge,
    })
  }

  if (input.distributionCharge !== undefined) {
    const rate = input.distributionCharge / kwh
    lineItems.push({
      key: 'distributionCharge',
      label: 'Distribution Charge',
      amount: input.distributionCharge,
      ratePerKwh: rate,
      status: getStatus(rate, rates.distributionMax),
      explanation: CHARGE_EXPLANATIONS.distributionCharge,
    })
  }

  if (input.subsidies !== undefined && input.subsidies > 0) {
    lineItems.push({
      key: 'subsidies',
      label: 'Subsidies',
      amount: -input.subsidies,
      status: 'normal',
      explanation: CHARGE_EXPLANATIONS.subsidies,
    })
  }

  if (input.universalCharges !== undefined) {
    lineItems.push({
      key: 'universalCharges',
      label: 'Universal Charges',
      amount: input.universalCharges,
      status: 'normal',
      explanation: CHARGE_EXPLANATIONS.universalCharges,
    })
  }

  if (input.fitAll !== undefined) {
    lineItems.push({
      key: 'fitAll',
      label: 'FiT-All (Renewable)',
      amount: input.fitAll,
      status: 'normal',
      explanation: CHARGE_EXPLANATIONS.fitAll,
    })
  }

  if (input.taxes !== undefined) {
    lineItems.push({
      key: 'taxes',
      label: 'Taxes (VAT)',
      amount: input.taxes,
      status: 'normal',
      explanation: CHARGE_EXPLANATIONS.taxes,
    })
  }

  const ercMaxTotal = rates.overallMax * kwh
  const overchargeAmount = Math.max(0, totalAmount - ercMaxTotal)

  let status: VerdictStatus = 'normal'
  if (userRatePerKwh > rates.overallMax * 1.1) {
    status = 'overcharged'
  } else if (userRatePerKwh > rates.overallMax) {
    status = 'high'
  } else if (lineItems.some((item) => item.status === 'overcharged')) {
    status = 'overcharged'
  } else if (lineItems.some((item) => item.status === 'high')) {
    status = 'high'
  }

  return {
    status,
    overchargeAmount,
    userRatePerKwh,
    ercMaxRatePerKwh: rates.overallMax,
    lineItems,
  }
}
