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

  // When no individual charges were scanned/entered, estimate the breakdown
  // using standard Meralco proportional distribution against the user's actual total.
  if (lineItems.length === 0) {
    const t = totalAmount
    const estimated: Array<{ key: string; label: string; ratio: number; maxRate: number | null; expKey: string }> = [
      { key: 'generationCharge',   label: 'Generation Charge',     ratio: rates.generationMax / rates.overallMax,   maxRate: rates.generationMax,   expKey: 'generationCharge' },
      { key: 'transmissionCharge', label: 'Transmission Charge',   ratio: rates.transmissionMax / rates.overallMax, maxRate: rates.transmissionMax, expKey: 'transmissionCharge' },
      { key: 'systemLossCharge',   label: 'System Loss Charge',    ratio: rates.systemLossMax / rates.overallMax,   maxRate: rates.systemLossMax,   expKey: 'systemLossCharge' },
      { key: 'distributionCharge', label: 'Distribution Charge',   ratio: rates.distributionMax / rates.overallMax, maxRate: rates.distributionMax, expKey: 'distributionCharge' },
      { key: 'universalCharges',   label: 'Universal Charges',     ratio: 0.014,                                    maxRate: null,                  expKey: 'universalCharges' },
      { key: 'fitAll',             label: 'FiT-All (Renewable)',   ratio: 0.010,                                    maxRate: null,                  expKey: 'fitAll' },
      { key: 'taxes',              label: 'Taxes (VAT)',            ratio: 0.12,                                     maxRate: null,                  expKey: 'taxes' },
    ]
    for (const { key, label, ratio, maxRate, expKey } of estimated) {
      const amount = parseFloat((t * ratio).toFixed(2))
      const rate = amount / kwh
      lineItems.push({
        key,
        label,
        amount,
        ratePerKwh: rate,
        status: maxRate !== null ? getStatus(rate, maxRate) : 'normal',
        explanation: CHARGE_EXPLANATIONS[expKey] ?? '',
        isEstimated: true,
      })
    }
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
