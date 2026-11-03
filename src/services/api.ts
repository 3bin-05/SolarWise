/**
 * SolarWise Frontend API Client Service
 */

import { BillData } from "../types/assessment"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1"

export interface ExtractedBillApiResponse {
  provider: string
  consumer_category: string
  billing_period: string
  billing_days: number
  units: number
  total_bill: number
  energy_charges: number
  fixed_charges: number
  taxes_and_adjustments: number
  meter_type: string
  source_document_type: string
  extraction_confidence: number
  is_confidence_high: boolean
  validation_warnings: string[]
  raw_text_snippet?: string
}

export interface ValidationApiResponse {
  is_valid: boolean
  arithmetic_matches: boolean
  arithmetic_difference: number
  calculated_effective_rate: number
  warnings: string[]
  confidence_score: number
  is_confidence_high: boolean
}

export interface SamplePresetApiResponse {
  id: string
  name: string
  provider: string
  description: string
  bill_data: ExtractedBillApiResponse
}

export const api = {
  /**
   * Upload an electricity bill file (PDF, PNG, JPG) to the Smart Bill Analyzer.
   */
  async extractBill(file: File): Promise<BillData> {
    const formData = new FormData()
    formData.append("file", file)

    const response = await fetch(`${API_BASE_URL}/bills/extract`, {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(err.message || `Bill extraction failed with status ${response.status}`)
    }

    const json = await response.json()
    const d: ExtractedBillApiResponse = json.data

    return {
      provider: d.provider,
      consumerCategory: d.consumer_category,
      billingPeriod: d.billing_period,
      billingDays: d.billing_days,
      units: d.units,
      totalBill: d.total_bill,
      energyCharges: d.energy_charges,
      fixedCharges: d.fixed_charges,
      taxesAndAdjustments: d.taxes_and_adjustments,
      meterType: d.meter_type,
      isConfidenceHigh: d.is_confidence_high,
      validationWarnings: d.validation_warnings || [],
    }
  },

  /**
   * Perform deterministic mathematical validation on bill numbers.
   */
  async validateBill(bill: BillData): Promise<ValidationApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/bills/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: bill.provider,
          consumer_category: bill.consumerCategory,
          billing_period: bill.billingPeriod,
          billing_days: bill.billingDays,
          units: bill.units,
          total_bill: bill.totalBill,
          energy_charges: bill.energyCharges,
          fixed_charges: bill.fixedCharges,
          taxes_and_adjustments: bill.taxesAndAdjustments,
          meter_type: bill.meterType,
        }),
      })

      if (response.ok) {
        const json = await response.json()
        return json.data
      }
    } catch (err) {
      console.warn("Backend validation offline, falling back to local verification:", err)
    }

    // Local deterministic fallback
    const sum = (bill.energyCharges || 0) + (bill.fixedCharges || 0) + (bill.taxesAndAdjustments || 0)
    const diff = Math.abs((bill.totalBill || 0) - sum)
    const hasComponents = (bill.energyCharges || 0) > 0 || (bill.fixedCharges || 0) > 0
    const matches = !hasComponents || diff <= Math.max(10, (bill.totalBill || 0) * 0.05)
    const warnings: string[] = []

    if (hasComponents && !matches) {
      warnings.push(`Component sum (₹${sum.toFixed(2)}) differs from total bill by ₹${diff.toFixed(2)}`)
    }
    if (bill.units <= 0) warnings.push("Monthly units consumed is 0")
    if (bill.totalBill <= 0) warnings.push("Total bill amount is 0")

    const rate = bill.units > 0 ? (bill.totalBill || 0) / bill.units : 0

    return {
      is_valid: bill.units > 0 && bill.totalBill > 0,
      arithmetic_matches: matches,
      arithmetic_difference: diff,
      calculated_effective_rate: Number(rate.toFixed(2)),
      warnings,
      confidence_score: matches && bill.units > 0 ? 0.9 : 0.4,
      is_confidence_high: matches && warnings.length === 0,
    }
  },

  /**
   * Fetch pre-configured sample bills for quick evaluation and testing.
   */
  async getSampleBills(): Promise<SamplePresetApiResponse[]> {
    const response = await fetch(`${API_BASE_URL}/bills/sample`)
    if (!response.ok) {
      throw new Error("Failed to load sample bills")
    }
    const json = await response.json()
    return json.data
  },
}
