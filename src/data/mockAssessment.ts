import { AssessmentState } from "../types/assessment"

/**
 * Standard Attractive Household Scenario (High daytime, sensible sizing)
 */
export const defaultAttractiveAssessment: AssessmentState = {
  currentStep: 0,
  bill: {
    provider: "State Electricity Distribution Corp",
    consumerCategory: "Domestic LT-1",
    billingPeriod: "Oct 2026",
    billingDays: 30,
    units: 420,
    totalBill: 3450,
    energyCharges: 2980,
    fixedCharges: 250,
    taxesAndAdjustments: 220,
    meterType: "Single Phase Bi-directional Capable",
    isConfidenceHigh: true,
    validationWarnings: [],
  },
  usage: {
    monthlyUnits: 420,
    daytimePercentage: 60,
    nighttimePercentage: 40,
    hasFrequentOutages: false,
    avgOutageHoursPerWeek: 1,
    budget: 250000,
  },
  locationRoof: {
    city: "Bengaluru",
    state: "Karnataka",
    postalCode: "560001",
    roofType: "RCC Flat",
    approxAreaSqFt: 650,
    shadingLevel: "Low",
  },
  recommendation: {
    recommendedCapacityKw: 3.3,
    panelCount: 6,
    panelWattage: 550,
    systemType: "On-grid",
    inverterRatingKw: 3.0,
    batteryRecommended: false,
    batteryCapacityKwh: 0,
    estimatedCostMin: 180000,
    estimatedCostMax: 210000,
    annualGenerationKwh: 4800,
    keyReasons: [
      "Matched to offset ~85% of daytime consumption to avoid excessive low-tariff grid export.",
      "High daytime occupancy (60%) allows direct self-consumption at retail avoided rate.",
      "Reliable grid connection eliminates the high capital cost of batteries.",
    ],
    tradeOffs: [
      "No power backup during rare grid outages without battery.",
      "Requires ~320 sq ft of shadow-free rooftop space.",
    ],
    alternativeSystem: {
      capacityKw: 2.2,
      systemType: "On-grid",
      reason: "Lower upfront capital if budget is constrained, though slightly longer payback.",
    },
  },
  financial: {
    currentAnnualCost: 41400,
    estimatedPostSolarAnnualCost: 6800,
    annualSavings: 34600,
    exportBenefit: 6400,
    selfConsumptionSavings: 28200,
    netInitialInvestment: 145000, // after estimated central subsidy
    subsidyAmount: 50000,
    simplePaybackYears: 4.2,
    breakEvenYear: 5,
    twentyFiveYearNetSavings: 685000,
    roiPercentage: 23.8,
    yearlyCashFlows: [
      { year: 1, withoutSolar: 41400, withSolar: 6800, cumulativeSavings: 34600 },
      { year: 3, withoutSolar: 132000, withSolar: 21200, cumulativeSavings: 110800 },
      { year: 5, withoutSolar: 232000, withSolar: 37000, cumulativeSavings: 195000 },
      { year: 10, withoutSolar: 520000, withSolar: 85000, cumulativeSavings: 435000 },
      { year: 15, withoutSolar: 875000, withSolar: 148000, cumulativeSavings: 727000 },
      { year: 20, withoutSolar: 1320000, withSolar: 228000, cumulativeSavings: 1092000 },
      { year: 25, withoutSolar: 1880000, withSolar: 330000, cumulativeSavings: 1550000 },
    ],
  },
  decision: {
    outcome: "Attractive",
    headline: "Solar is highly feasible and financially rewarding for your household.",
    explanation:
      "Your high daytime energy consumption (60%) combined with adequate unshaded roof space results in strong self-consumption savings and a short 4.2-year simple payback.",
    keyFactors: [
      {
        factor: "Daytime Self-Consumption",
        impact: "positive",
        description: "60% daytime usage displaces high retail slab units directly.",
      },
      {
        factor: "Roof Suitability",
        impact: "positive",
        description: "650 sq ft flat RCC roof easily accommodates 6 high-efficiency panels.",
      },
      {
        factor: "Export Rate Disparity",
        impact: "neutral",
        description: "Surplus export rate is modest; sizing correctly avoids unrewarded exports.",
      },
    ],
    actionableImprovements: [
      "Run heavy appliances (washing machine, dishwasher, water pumps) between 10 AM and 3 PM to boost self-consumption further.",
      "Verify eligible rooftop subsidy status before installer contract signing.",
    ],
    confidenceScore: 88,
  },
}

/**
 * Low Consumption / Uneconomical Scenario:
 * Proves SolarWise DOES NOT blindly sell solar.
 */
export const lowConsumptionNotRecommendedAssessment: AssessmentState = {
  currentStep: 0,
  bill: {
    provider: "State Electricity Distribution Corp",
    consumerCategory: "Domestic LT-1",
    billingPeriod: "Oct 2026",
    billingDays: 30,
    units: 85,
    totalBill: 460,
    energyCharges: 280,
    fixedCharges: 140,
    taxesAndAdjustments: 40,
    meterType: "Single Phase Electromechanical",
    isConfidenceHigh: true,
    validationWarnings: [],
  },
  usage: {
    monthlyUnits: 85,
    daytimePercentage: 25,
    nighttimePercentage: 75,
    hasFrequentOutages: false,
    avgOutageHoursPerWeek: 0,
    budget: 120000,
  },
  locationRoof: {
    city: "Pune",
    state: "Maharashtra",
    postalCode: "411001",
    roofType: "Sloped Tiled",
    approxAreaSqFt: 250,
    shadingLevel: "Moderate",
  },
  recommendation: {
    recommendedCapacityKw: 1.0,
    panelCount: 2,
    panelWattage: 550,
    systemType: "On-grid",
    inverterRatingKw: 1.0,
    batteryRecommended: false,
    batteryCapacityKwh: 0,
    estimatedCostMin: 75000,
    estimatedCostMax: 95000,
    annualGenerationKwh: 1400,
    keyReasons: [
      "Household consumption is very low (85 units/month).",
      "Most usage occurs at night (75%), requiring energy to be exported at a discounted feed-in rate.",
      "Fixed connection fees and minimum installer overhead make payback excessively long.",
    ],
    tradeOffs: [
      "Even a small 1 kW system produces surplus power that receives lower compensation than retail import cost.",
    ],
    alternativeSystem: {
      capacityKw: 0,
      systemType: "On-grid",
      reason: "Remain on grid without capital expenditure until household consumption increases.",
    },
  },
  financial: {
    currentAnnualCost: 5520,
    estimatedPostSolarAnnualCost: 2400,
    annualSavings: 3120,
    exportBenefit: 1400,
    selfConsumptionSavings: 1720,
    netInitialInvestment: 75000,
    subsidyAmount: 0, // Not eligible or below minimum threshold
    simplePaybackYears: 24.0,
    breakEvenYear: 24,
    twentyFiveYearNetSavings: 2800,
    roiPercentage: 3.8,
    yearlyCashFlows: [
      { year: 1, withoutSolar: 5520, withSolar: 2400, cumulativeSavings: 3120 },
      { year: 5, withoutSolar: 29000, withSolar: 13000, cumulativeSavings: 16000 },
      { year: 10, withoutSolar: 64000, withSolar: 29000, cumulativeSavings: 35000 },
      { year: 15, withoutSolar: 107000, withSolar: 50000, cumulativeSavings: 57000 },
      { year: 20, withoutSolar: 160000, withSolar: 78000, cumulativeSavings: 82000 },
      { year: 25, withoutSolar: 228000, withSolar: 114000, cumulativeSavings: 114000 },
    ],
  },
  decision: {
    outcome: "Not recommended",
    headline: "Installing solar is not financially justified for your current usage.",
    explanation:
      "Your monthly consumption of 85 units is already in the lowest subsidized slab. Because 75% of your consumption is at night and rooftop solar would export most generated power at low feed-in tariffs, your simple payback would exceed 24 years.",
    keyFactors: [
      {
        factor: "Very Low Base Consumption",
        impact: "negative",
        description: "Your annual power bill is only ₹5,520; minimum system overhead cannot be recouped quickly.",
      },
      {
        factor: "Nighttime Skew (75%)",
        impact: "negative",
        description: "Without expensive battery storage, generated solar power cannot offset nighttime consumption.",
      },
      {
        factor: "Long Payback Period",
        impact: "negative",
        description: "24-year payback equals or exceeds the typical warranty lifespan of inverters and balance of system.",
      },
    ],
    actionableImprovements: [
      "Re-evaluate if you purchase an Electric Vehicle (EV) or add daytime climate control in the future.",
      "Focus on low-cost home energy efficiency rather than capital-intensive solar installation.",
      "Recheck if local community solar or virtual net metering becomes available.",
    ],
    confidenceScore: 92,
  },
}
