/**
 * SolarWise Assessment Domain Types
 */

export type DecisionOutcome =
  | "Strongly attractive"
  | "Attractive"
  | "Borderline"
  | "Not recommended"
  | "Financially infeasible"
  | "Insufficient data"

export type SystemType = "On-grid" | "Hybrid" | "Off-grid"

export type RoofType = "RCC Flat" | "Sloped Tiled" | "Metal Sheet" | "Asbestos / Other"

export interface BillData {
  provider: string
  consumerCategory: string
  billingPeriod: string
  billingDays: number
  units: number
  totalBill: number
  energyCharges: number
  fixedCharges: number
  taxesAndAdjustments: number
  meterType: string
  isConfidenceHigh: boolean
  validationWarnings: string[]
}

export interface HouseholdUsage {
  monthlyUnits: number
  daytimePercentage: number
  nighttimePercentage: number
  hasFrequentOutages: boolean
  avgOutageHoursPerWeek: number
  budget: number | null
}

export interface LocationRoof {
  city: string
  state: string
  postalCode: string
  roofType: RoofType
  approxAreaSqFt: number
  shadingLevel: "None" | "Low" | "Moderate" | "Heavy"
}

export interface ConstraintCheck {
  name: string
  status: "pass" | "warning" | "fail"
  message: string
  value: string
}

export interface PanelEquipment {
  id: string
  manufacturer: string
  model: string
  technology: string
  rated_power_w: number
  efficiency_pct: number
  dimensions_mm: {
    length: number
    width: number
    thickness: number
  }
  area_sqm: number
  temp_coefficient_pmax: number
  warranty_years_product: number
  warranty_years_performance: number
  estimated_price_inr: number
  description: string
}

export interface InverterEquipment {
  id: string
  manufacturer: string
  model: string
  inverter_type: "string" | "microinverter" | "hybrid"
  rated_output_power_kw: number
  phase: "single-phase" | "three-phase"
  mppt_trackers: number
  max_efficiency_pct: number
  euro_efficiency_pct: number
  max_recommended_pv_power_kw: number
  max_dc_voltage_v: number
  battery_compatible: boolean
  warranty_years: number
  estimated_price_inr: number
  description: string
}

export interface BatteryEquipment {
  id: string
  manufacturer: string
  model: string
  chemistry: string
  nominal_capacity_kwh: number
  usable_capacity_kwh: number
  depth_of_discharge_pct: number
  cycle_life: number
  voltage_v: number
  max_continuous_discharge_kw: number
  round_trip_efficiency_pct: number
  warranty_years: number
  estimated_price_inr: number
  description: string
}

export interface SolarRecommendation {
  recommendedCapacityKw: number
  panelCount: number
  panelWattage: number
  systemType: SystemType
  inverterRatingKw: number
  batteryRecommended: boolean
  batteryCapacityKwh: number
  estimatedCostMin: number
  estimatedCostMax: number
  annualGenerationKwh: number
  keyReasons: string[]
  tradeOffs: string[]
  alternativeSystem: {
    capacityKw: number
    systemType: SystemType
    reason: string
    estimatedCost?: number
    panelCount?: number
  }
  // Enriched equipment specifications
  panelModel?: PanelEquipment
  inverterModel?: InverterEquipment
  batteryModel?: BatteryEquipment | null
  dcAcRatio?: number
  roofAreaRequiredSqFt?: number
  roofUtilizationPct?: number
  technicalConstraints?: ConstraintCheck[]
}

export interface FinancialTwin {
  currentAnnualCost: number
  estimatedPostSolarAnnualCost: number
  annualSavings: number
  exportBenefit: number
  selfConsumptionSavings: number
  netInitialInvestment: number
  subsidyAmount: number
  simplePaybackYears: number
  breakEvenYear: number
  twentyFiveYearNetSavings: number
  roiPercentage: number
  npv?: number
  lcoePerKwh?: number
  yearlyCashFlows: {
    year: number
    withoutSolar: number
    withSolar: number
    cumulativeSavings: number
    discountedCashFlow?: number
    generationKwh?: number
  }[]
}

export interface DecisionResult {
  outcome: DecisionOutcome
  headline: string
  explanation: string
  keyFactors: {
    factor: string
    impact: "positive" | "neutral" | "negative"
    description: string
  }[]
  actionableImprovements: string[]
  confidenceScore: number
}

export interface AssessmentState {
  currentStep: number
  bill: BillData
  usage: HouseholdUsage
  locationRoof: LocationRoof
  recommendation: SolarRecommendation
  financial: FinancialTwin
  decision: DecisionResult
}
