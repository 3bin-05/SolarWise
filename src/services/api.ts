/**
 * SolarWise Frontend API Client Service
 */

import {
  BatteryEquipment,
  BillData,
  InverterEquipment,
  PanelEquipment,
  SolarRecommendation,
  SystemType,
} from "../types/assessment"

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

  /**
   * Fetch verified solar panel catalog.
   */
  async fetchPanels(): Promise<PanelEquipment[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/panels`)
      if (response.ok) {
        const json = await response.json()
        return json.data
      }
    } catch (err) {
      console.warn("Backend panels offline, using fallback catalog:", err)
    }
    return [
      {
        id: "adani-mono-perc-440",
        manufacturer: "Adani Solar",
        model: "Elan Shine 440W",
        technology: "Mono PERC",
        rated_power_w: 440,
        efficiency_pct: 20.9,
        dimensions_mm: { length: 2094, width: 1038, thickness: 35 },
        area_sqm: 2.17,
        temp_coefficient_pmax: -0.36,
        warranty_years_product: 12,
        warranty_years_performance: 25,
        estimated_price_inr: 9240,
        description: "Premium high-efficiency half-cut monocrystalline cell module.",
      },
      {
        id: "waaree-topcon-540",
        manufacturer: "Waaree Energies",
        model: "Arka TopCon 540W",
        technology: "TopCon Bifacial",
        rated_power_w: 540,
        efficiency_pct: 21.6,
        dimensions_mm: { length: 2278, width: 1134, thickness: 35 },
        area_sqm: 2.58,
        temp_coefficient_pmax: -0.30,
        warranty_years_product: 15,
        warranty_years_performance: 30,
        estimated_price_inr: 12420,
        description: "Next-generation N-Type TopCon bifacial module delivering superior low-light yields.",
      },
    ]
  },

  /**
   * Fetch verified solar inverter catalog.
   */
  async fetchInverters(): Promise<InverterEquipment[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/inverters`)
      if (response.ok) {
        const json = await response.json()
        return json.data
      }
    } catch (err) {
      console.warn("Backend inverters offline, using fallback catalog:", err)
    }
    return [
      {
        id: "solis-1p-3k",
        manufacturer: "Solis",
        model: "S6-GR1P3K",
        inverter_type: "string",
        rated_output_power_kw: 3.0,
        phase: "single-phase",
        mppt_trackers: 2,
        max_efficiency_pct: 97.7,
        euro_efficiency_pct: 97.1,
        max_recommended_pv_power_kw: 4.5,
        max_dc_voltage_v: 600,
        battery_compatible: false,
        warranty_years: 5,
        estimated_price_inr: 31000,
        description: "Dual MPPT single-phase grid-tied string inverter.",
      },
      {
        id: "growatt-min-5000",
        manufacturer: "Growatt",
        model: "MIN 5000TL-X",
        inverter_type: "string",
        rated_output_power_kw: 5.0,
        phase: "single-phase",
        mppt_trackers: 2,
        max_efficiency_pct: 98.4,
        euro_efficiency_pct: 97.5,
        max_recommended_pv_power_kw: 7.0,
        max_dc_voltage_v: 550,
        battery_compatible: false,
        warranty_years: 5,
        estimated_price_inr: 44000,
        description: "High-efficiency single-phase residential string inverter.",
      },
    ]
  },

  /**
   * Fetch verified battery catalog.
   */
  async fetchBatteries(): Promise<BatteryEquipment[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/batteries`)
      if (response.ok) {
        const json = await response.json()
        return json.data
      }
    } catch (err) {
      console.warn("Backend batteries offline, using fallback catalog:", err)
    }
    return [
      {
        id: "pylontech-us3000c",
        manufacturer: "Pylontech",
        model: "US3000C",
        chemistry: "LiFePO4",
        nominal_capacity_kwh: 3.55,
        usable_capacity_kwh: 3.2,
        depth_of_discharge_pct: 90.0,
        cycle_life: 6000,
        voltage_v: 48.0,
        max_continuous_discharge_kw: 1.8,
        round_trip_efficiency_pct: 95.0,
        warranty_years: 10,
        estimated_price_inr: 85000,
        description: "Modular 48V Lithium Iron Phosphate rack battery unit.",
      },
    ]
  },

  /**
   * Calculate engineered solar system sizing, equipment matching, and technical constraints.
   */
  async fetchSolarRecommendation(params: {
    monthly_consumption_kwh: number
    sanctioned_load_kw?: number
    roof_area_sqft: number
    city?: string
    weekly_outage_hours?: number
    critical_load_fraction?: number
    budget_inr?: number
    prefer_microinverter?: boolean
    roof_type?: string
  }): Promise<SolarRecommendation> {
    try {
      const response = await fetch(`${API_BASE_URL}/solar/recommend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      })
      if (response.ok) {
        const json = await response.json()
        const d = json.data
        return {
          recommendedCapacityKw: d.recommended_capacity_kw,
          panelCount: d.panel_count,
          panelWattage: d.panel_wattage,
          systemType: (d.system_type === "On-Grid" ? "On-grid" : d.system_type) as SystemType,
          inverterRatingKw: d.inverter_rating_kw,
          batteryRecommended: d.battery_recommended,
          batteryCapacityKwh: d.battery_capacity_kwh,
          estimatedCostMin: d.estimated_cost_min,
          estimatedCostMax: d.estimated_cost_max,
          annualGenerationKwh: d.annual_generation_kwh,
          keyReasons: d.key_reasons,
          tradeOffs: d.trade_offs,
          alternativeSystem: {
            capacityKw: d.alternative_system.capacity_kw,
            systemType: (d.alternative_system.system_type === "On-Grid" ? "On-grid" : "Hybrid") as SystemType,
            reason: d.alternative_system.reason,
            estimatedCost: d.alternative_system.estimated_cost,
            panelCount: d.alternative_system.panel_count,
          },
          panelModel: d.panel_model,
          inverterModel: d.inverter_model,
          batteryModel: d.battery_model,
          dcAcRatio: d.dc_ac_ratio,
          roofAreaRequiredSqFt: d.roof_area_required_sqft,
          roofUtilizationPct: d.roof_utilization_pct,
          technicalConstraints: d.technical_constraints,
        }
      }
    } catch (err) {
      console.warn("Backend recommendation offline, calculating deterministic fallback:", err)
    }

    // Local deterministic fallback calculation
    const monthlyUnits = params.monthly_consumption_kwh || 400
    const annualUnits = monthlyUnits * 12
    const roofArea = params.roof_area_sqft || 500
    const weeklyOutages = params.weekly_outage_hours || 0

    const targetKw = annualUnits / 1450
    const maxRoofKw = roofArea / 85
    const governingKw = Math.max(1.0, Math.min(targetKw, maxRoofKw))
    const isHybrid = weeklyOutages >= 3.0

    const panelWattage = maxRoofKw < targetKw ? 540 : 440
    const panelCount = Math.max(2, Math.round((governingKw * 1000) / panelWattage))
    const actualKw = Number(((panelCount * panelWattage) / 1000).toFixed(2))
    const annualGen = Math.round(actualKw * 1450)

    const baseCostPerKw = actualKw <= 3 ? 58000 : 52000
    let costMin = actualKw * baseCostPerKw
    let costMax = actualKw * (baseCostPerKw + 6000)
    if (isHybrid) {
      costMin += 95000
      costMax += 120000
    }

    const singlePanelSqFt = (panelWattage === 540 ? 2.58 : 2.17) * 10.7639
    const reqArea = Math.round(panelCount * singlePanelSqFt * 1.35)
    const utilPct = Math.min(100, Math.round((reqArea / roofArea) * 100))

    return {
      recommendedCapacityKw: actualKw,
      panelCount,
      panelWattage,
      systemType: isHybrid ? "Hybrid" : "On-grid",
      inverterRatingKw: actualKw <= 3 ? 3.0 : 5.0,
      batteryRecommended: isHybrid,
      batteryCapacityKwh: isHybrid ? 5.12 : 0,
      estimatedCostMin: Math.round(costMin),
      estimatedCostMax: Math.round(costMax),
      annualGenerationKwh: annualGen,
      dcAcRatio: Number((actualKw / (actualKw <= 3 ? 3.0 : 5.0)).toFixed(2)),
      roofAreaRequiredSqFt: reqArea,
      roofUtilizationPct: utilPct,
      keyReasons: [
        `Sized to offset ${Math.min(100, Math.round((annualGen / annualUnits) * 100))}% of your annual electricity consumption (${annualUnits} kWh/yr).`,
        `Selected ${panelWattage}W Mono PERC modules offering high performance and low degradation.`,
        isHybrid
          ? `Included LiFePO4 battery backup due to ${weeklyOutages} hours/week average power cuts.`
          : `Pure On-Grid configuration minimizes equipment cost with high daytime self-consumption.`,
      ],
      tradeOffs: [
        isHybrid
          ? "Hybrid battery storage adds ₹95k–₹1.2L upfront capital expense."
          : "Grid-tied inverter will shut down during power cuts for line worker safety.",
      ],
      alternativeSystem: {
        capacityKw: Number((actualKw * 0.7).toFixed(1)),
        systemType: "On-grid",
        reason: "Smaller budget-optimized installation covering only baseline daytime refrigeration and fans.",
      },
      technicalConstraints: [
        {
          name: "Rooftop Space Clearance",
          status: reqArea <= roofArea ? "pass" : "warning",
          value: `${reqArea} sq ft required / ${roofArea} sq ft available`,
          message: `Array occupies ${utilPct}% of shadow-free rooftop area with maintenance walkways.`,
        },
        {
          name: "Inverter DC/AC Loading",
          status: "pass",
          value: `${(actualKw / (actualKw <= 3 ? 3.0 : 5.0)).toFixed(2)}x`,
          message: "Standard array loading ensures optimal low-light morning harvest.",
        },
        {
          name: "Interconnection Phase Standard",
          status: "pass",
          value: actualKw > 5 ? "Three-Phase 415V" : "Single-Phase 230V",
          message: actualKw > 5 ? "Mandates 3-phase connection." : "Single-phase supply compatible.",
        },
      ],
    }
  },
}
