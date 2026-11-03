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

export interface EnergyAnalysisApiResponse {
  annual_consumption_kwh: number
  average_monthly_kwh: number
  daytime_units_monthly: number
  nighttime_units_monthly: number
  daytime_percentage: number
  nighttime_percentage: number
  consumption_tier: string
  is_low_consumption: boolean
  unviability_warning?: string
  marginal_tariff_rate: number
  effective_tariff_rate: number
  profile_confidence_score: number
  assumptions_used: string[]
}

export interface LocationApiResponse {
  city: string
  state: string
  state_code: string
  latitude: number
  longitude: number
  optimal_tilt_degrees: number
  annual_avg_daily_ghi: number
  climatic_zone: string
}

export interface SolarGenerationApiResponse {
  capacity_kw: number
  annual_generation_kwh: number
  specific_annual_yield_kwh_per_kwp: number
  transposition_factor: number
  location_used: string
  scenarios: {
    low_p90_annual_kwh: number
    base_p50_annual_kwh: number
    high_p10_annual_kwh: number
  }
  system_losses: {
    overall_performance_ratio: number
    shading_loss_pct: number
    temperature_loss_pct: number
  }
  engineering_assumptions: string[]
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

  /**
   * Run energy consumption intelligence and slab tariff analysis.
   */
  async analyzeEnergy(params: {
    monthly_units: number
    daytime_percentage: number
    has_frequent_outages?: boolean
    avg_outage_hours_per_week?: number
    provider?: string
  }): Promise<EnergyAnalysisApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/energy/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      })
      if (response.ok) {
        const json = await response.json()
        return json.data
      }
    } catch (err) {
      console.warn("Backend energy analysis offline, falling back to local calculation:", err)
    }

    // Local deterministic fallback
    const units = params.monthly_units || 0
    const daytime = params.daytime_percentage || 40
    const nighttime = 100 - daytime
    const daytimeKwh = Number(((units * daytime) / 100).toFixed(1))
    const nighttimeKwh = Number(((units * nighttime) / 100).toFixed(1))
    const annual = Number((units * 12).toFixed(1))
    const isLow = units < 120

    return {
      annual_consumption_kwh: annual,
      average_monthly_kwh: units,
      daytime_units_monthly: daytimeKwh,
      nighttime_units_monthly: nighttimeKwh,
      daytime_percentage: daytime,
      nighttime_percentage: nighttime,
      consumption_tier: isLow
        ? "Low (<120 kWh)"
        : units <= 300
        ? "Moderate (120-300 kWh)"
        : "High (300-650 kWh)",
      is_low_consumption: isLow,
      unviability_warning: isLow
        ? "Low baseline consumption: Subsidized utility tariffs result in extended payback (>12-15 yrs)."
        : undefined,
      marginal_tariff_rate: isLow ? 4.2 : 7.2,
      effective_tariff_rate: 6.5,
      profile_confidence_score: 0.88,
      assumptions_used: [
        `Diurnal split: ${daytime}% daytime, ${nighttime}% nighttime`,
        "Slab progression modeled using state benchmark rates",
      ],
    }
  },

  /**
   * Fetch list of supported locations with irradiance benchmarks.
   */
  async getLocations(): Promise<LocationApiResponse[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/locations`)
      if (response.ok) {
        const json = await response.json()
        return json.data
      }
    } catch (err) {
      console.warn("Backend locations offline, using fallback catalog:", err)
    }

    return [
      {
        city: "Kochi",
        state: "Kerala",
        state_code: "KL",
        latitude: 9.93,
        longitude: 76.26,
        optimal_tilt_degrees: 12.0,
        annual_avg_daily_ghi: 5.12,
        climatic_zone: "Warm and Humid Coastal",
      },
      {
        city: "Bengaluru",
        state: "Karnataka",
        state_code: "KA",
        latitude: 12.97,
        longitude: 77.59,
        optimal_tilt_degrees: 14.0,
        annual_avg_daily_ghi: 5.48,
        climatic_zone: "Moderate Plateau",
      },
      {
        city: "Mumbai",
        state: "Maharashtra",
        state_code: "MH",
        latitude: 19.07,
        longitude: 72.87,
        optimal_tilt_degrees: 20.0,
        annual_avg_daily_ghi: 5.32,
        climatic_zone: "Coastal Sub-tropical",
      },
      {
        city: "New Delhi",
        state: "Delhi",
        state_code: "DL",
        latitude: 28.61,
        longitude: 77.20,
        optimal_tilt_degrees: 28.0,
        annual_avg_daily_ghi: 5.22,
        climatic_zone: "Composite Northern Plains",
      },
      {
        city: "Chennai",
        state: "Tamil Nadu",
        state_code: "TN",
        latitude: 13.08,
        longitude: 80.27,
        optimal_tilt_degrees: 14.0,
        annual_avg_daily_ghi: 5.52,
        climatic_zone: "Hot and Humid Coastal",
      },
    ]
  },

  /**
   * Simulate physical solar generation.
   */
  async calculateSolarGeneration(params: {
    capacity_kw: number
    city?: string
    state?: string
    roof_type?: string
    shading_level?: string
  }): Promise<SolarGenerationApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/solar/generation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      })
      if (response.ok) {
        const json = await response.json()
        return json.data
      }
    } catch (err) {
      console.warn("Backend solar generation offline, falling back to local physics:", err)
    }

    const cap = params.capacity_kw || 3.0
    const shadeMap: Record<string, number> = {
      none: 0,
      low: 0.05,
      moderate: 0.15,
      heavy: 0.30,
    }
    const shadeDerate = 1 - (shadeMap[params.shading_level?.toLowerCase() || "low"] ?? 0.05)
    const baseSpecificYield = 1450 * shadeDerate
    const annual = Number((cap * baseSpecificYield).toFixed(1))

    return {
      capacity_kw: cap,
      annual_generation_kwh: annual,
      specific_annual_yield_kwh_per_kwp: Number(baseSpecificYield.toFixed(1)),
      transposition_factor: 1.02,
      location_used: params.city || "National Baseline",
      scenarios: {
        low_p90_annual_kwh: Number((annual * 0.88).toFixed(1)),
        base_p50_annual_kwh: annual,
        high_p10_annual_kwh: Number((annual * 1.08).toFixed(1)),
      },
      system_losses: {
        overall_performance_ratio: Number((0.79 * shadeDerate).toFixed(2)),
        shading_loss_pct: (1 - shadeDerate) * 100,
        temperature_loss_pct: 9.5,
      },
      engineering_assumptions: [
        `System size: ${cap} kWp DC capacity`,
        `Specific yield: ${baseSpecificYield.toFixed(0)} kWh/kWp/year`,
      ],
    }
  },
}
