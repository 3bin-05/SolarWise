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
  }
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
  yearlyCashFlows: {
    year: number
    withoutSolar: number
    withSolar: number
    cumulativeSavings: number
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
