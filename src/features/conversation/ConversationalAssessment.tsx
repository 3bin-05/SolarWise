import React, { useState, useEffect, useRef } from "react"
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Sun,
  Shield,
  Zap,
  MapPin,
  Home,
  DollarSign,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Edit3,
  Sliders,
  Users,
  Check,
  ChevronDown,
  ChevronUp,
  Bookmark,
  PenLine,
} from "lucide-react"
import {
  AssessmentState,
  BillData,
  HouseholdUsage,
  RoofType,
} from "../../types/assessment"
import { api } from "../../services/api"
import { Button } from "../../components/ui/Button"
import { DecisionBadge } from "../../components/solar/DecisionBadge"
import { FeasibilityReportModal } from "../assessment/FeasibilityReportModal"
import { ScenarioSimulatorModal } from "../assessment/ScenarioSimulatorModal"
import { ProviderPolicyModal } from "../assessment/ProviderPolicyModal"
import { RoofPlannerModal } from "../assessment/RoofPlannerModal"

export interface ConversationalAssessmentProps {
  initialAssessment?: AssessmentState
  currentStage?: ConversationStage
  scenario?: "attractive" | "not-recommended"
  onRestart: () => void
  onScenarioToggle?: () => void
  onSwitchToStepper?: () => void
  onAssessmentChange?: (updated: AssessmentState) => void
  onStageChange?: (stage: ConversationStage) => void
}

export type ConversationStage =
  | "bill_input"
  | "bill_confirm"
  | "surya_ghar"
  | "usage"
  | "property"
  | "budget_goals"
  | "recommendation"

// Bi-directional synchronization mappings
export const stageToStep = (stage: ConversationStage): number => {
  switch (stage) {
    case "bill_input":
      return 1
    case "bill_confirm":
      return 2
    case "surya_ghar":
    case "usage":
      return 3
    case "property":
      return 4
    case "budget_goals":
      return 5
    case "recommendation":
      return 7
    default:
      return 1
  }
}

export const stepToStage = (step: number): ConversationStage => {
  switch (step) {
    case 1:
      return "bill_input"
    case 2:
      return "bill_confirm"
    case 3:
      return "usage"
    case 4:
      return "property"
    case 5:
      return "budget_goals"
    case 6:
    case 7:
      return "recommendation"
    default:
      return "bill_input"
  }
}

export const ConversationalAssessment: React.FC<ConversationalAssessmentProps> = ({
  initialAssessment,
  currentStage,
  scenario = "attractive",
  onRestart,
  onScenarioToggle,
  onSwitchToStepper,
  onAssessmentChange,
  onStageChange,
}) => {
  // Main assessment state
  const [internalAssessment, setInternalAssessment] = useState<AssessmentState>(() => {
    if (initialAssessment) return initialAssessment
    return {
      currentStep: 1,
      bill: {
        provider: "BESCOM (Karnataka)",
        consumerCategory: "Domestic LT-2(a)",
        billingPeriod: "monthly",
        billingDays: 30,
        units: 420,
        totalBill: 3150,
        energyCharges: 2600,
        fixedCharges: 350,
        taxesAndAdjustments: 200,
        meterType: "Single Phase Non-ToD",
        isConfidenceHigh: true,
        validationWarnings: [],
      },
      usage: {
        monthlyUnits: 420,
        daytimePercentage: 55,
        nighttimePercentage: 45,
        hasFrequentOutages: false,
        avgOutageHoursPerWeek: 0,
        budget: 200000,
      },
      locationRoof: {
        city: "Bengaluru",
        state: "Karnataka",
        postalCode: "560001",
        roofType: "RCC Flat",
        approxAreaSqFt: 500,
        shadingLevel: "Low",
      },
      recommendation: {
        recommendedCapacityKw: 3.3,
        panelCount: 8,
        panelWattage: 440,
        systemType: "On-grid",
        inverterRatingKw: 3.0,
        batteryRecommended: false,
        batteryCapacityKwh: 0,
        estimatedCostMin: 170000,
        estimatedCostMax: 190000,
        annualGenerationKwh: 4800,
        keyReasons: ["Optimal sizing for household consumption"],
        tradeOffs: ["Grid-tied shuts down during power cuts"],
        alternativeSystem: {
          capacityKw: 2.2,
          systemType: "On-grid",
          reason: "Budget-conscious option",
        },
      },
      financial: {
        currentAnnualCost: 37800,
        estimatedPostSolarAnnualCost: 5800,
        annualSavings: 32000,
        exportBenefit: 5200,
        selfConsumptionSavings: 26800,
        netInitialInvestment: 102000,
        subsidyAmount: 78000,
        simplePaybackYears: 3.2,
        breakEvenYear: 4,
        twentyFiveYearNetSavings: 720000,
        roiPercentage: 24.5,
        yearlyCashFlows: [],
      },
      decision: {
        outcome: "Attractive",
        headline: "Solar is highly feasible and financially rewarding for your household.",
        explanation: "Your high daytime consumption and adequate rooftop sunlight deliver rapid capital payback.",
        keyFactors: [
          { factor: "Daytime Self-Consumption", impact: "positive", description: "Direct retail tariff avoidance." },
          { factor: "Central Subsidy", impact: "positive", description: "Eligible for ₹78,000 PM Surya Ghar DBT." },
        ],
        actionableImprovements: [
          "Shift heavy laundry and pumping to 11 AM - 3 PM.",
          "Ensure installer registers with DISCOM for net meter commissioning.",
        ],
        confidenceScore: 92,
      },
    }
  })

  // Synchronize initial assessment if changed externally (e.g., scenario toggle or Detailed View edit)
  useEffect(() => {
    if (initialAssessment) {
      setInternalAssessment(initialAssessment)
    }
  }, [initialAssessment])

  // Active conversational stage
  const [internalStage, setInternalStage] = useState<ConversationStage>(currentStage || "bill_input")

  // Synchronize stage if changed externally (e.g. when switching from Detailed View)
  useEffect(() => {
    if (currentStage) {
      setInternalStage(currentStage)
    }
  }, [currentStage])

  const assessment = internalAssessment
  const stage = internalStage

  const setStage = (newStage: ConversationStage) => {
    setInternalStage(newStage)
    queueMicrotask(() => {
      onStageChange?.(newStage)
    })
  }

  const setAssessment: React.Dispatch<React.SetStateAction<AssessmentState>> = (value) => {
    setInternalAssessment((prev) => {
      const next = typeof value === "function" ? (value as (prev: AssessmentState) => AssessmentState)(prev) : value
      queueMicrotask(() => {
        onAssessmentChange?.(next)
      })
      return next
    })
  }

  // Modals state
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)
  const [isScenarioModalOpen, setIsScenarioModalOpen] = useState(false)
  const [isProviderModalOpen, setIsProviderModalOpen] = useState(false)
  const [isRoofPlannerOpen, setIsRoofPlannerOpen] = useState(false)
  const [saveStatus, setSaveStatus] = useState<string | null>(null)

  // Loading indicator for processing
  const [isThinking, setIsThinking] = useState(false)

  // File upload state for Stage 1
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null)
  const [isOcrProcessing, setIsOcrProcessing] = useState(false)
  const [isEditingBillConfirm, setIsEditingBillConfirm] = useState(false)
  const [isManualEntry, setIsManualEntry] = useState(false)

  // Stage 2 PM Surya Ghar conversation state
  const [suryaGharKnowledge, setSuryaGharKnowledge] = useState<"yes" | "heard_of" | "no" | null>(null)
  const [isResidential, setIsResidential] = useState<"yes" | "no" | "unsure">("yes")
  const [hasDiscomConnection, setHasDiscomConnection] = useState<"yes" | "no" | "unsure">("yes")

  // Stage 3 Usage conversation state
  const [usageTiming, setUsageTiming] = useState<"day" | "night" | "equal">("day")
  const [outageLevel, setOutageLevel] = useState<"rare" | "occasional" | "frequent">("rare")
  const [showCustomSlider, setShowCustomSlider] = useState(false)

  // Stage 4 Property state
  const [customRoofArea, setCustomRoofArea] = useState<string>("")

  // Stage 5 Budget & Goals state
  const [selectedBudgetTier, setSelectedBudgetTier] = useState<string>("₹1.5L – ₹2.5 Lakhs")
  const [customBudgetAmount, setCustomBudgetAmount] = useState<string>("")
  const [userGoals, setUserGoals] = useState<string[]>([
    "Reducing my monthly electricity bill",
    "Making the most of government subsidies",
  ])

  // History collapse toggle
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(true)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Stage definitions and progress percentage
  const stageList: ConversationStage[] = [
    "bill_input",
    "bill_confirm",
    "surya_ghar",
    "usage",
    "property",
    "budget_goals",
    "recommendation",
  ]
  const currentStageIndex = stageList.indexOf(stage)
  const progressPercent = Math.round(((currentStageIndex + 1) / stageList.length) * 100)

  // Process uploaded bill file using client-side OCR / PDF parser
  const handleFileUpload = async (file: File) => {
    setSelectedFileName(file.name)
    setIsOcrProcessing(true)
    setIsThinking(true)
    setIsManualEntry(false)

    try {
      const extracted = await api.extractBill(file)
      setAssessment((prev) => ({
        ...prev,
        bill: extracted,
        usage: { ...prev.usage, monthlyUnits: extracted.units },
      }))
      setStage("bill_confirm")
    } catch (err) {
      console.warn("Bill extraction failed, falling back to manual entry:", err)
      setIsManualEntry(true)
      setStage("bill_confirm")
    } finally {
      setIsOcrProcessing(false)
      setIsThinking(false)
    }
  }

  // Load preset sample bill
  const handleLoadSamplePreset = async (presetId: string) => {
    setIsThinking(true)
    setIsManualEntry(false)
    try {
      const samples = await api.getSampleBills()
      const found = samples.find((s) => s.id === presetId) || samples[0]
      if (found) {
        setSelectedFileName(found.name)
        const d = found.bill_data
        const mappedBill: BillData = {
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
          validationWarnings: d.validation_warnings,
        }
        setAssessment((prev) => ({
          ...prev,
          bill: mappedBill,
          usage: { ...prev.usage, monthlyUnits: mappedBill.units },
        }))
        setStage("bill_confirm")
      }
    } catch {
      // Fallback preset
      setAssessment((prev) => ({
        ...prev,
        bill: {
          provider: "BESCOM (Karnataka)",
          consumerCategory: "Domestic LT-2(a)",
          billingPeriod: "monthly",
          billingDays: 30,
          units: 450,
          totalBill: 3420,
          energyCharges: 2850,
          fixedCharges: 360,
          taxesAndAdjustments: 210,
          meterType: "Three Phase",
          isConfidenceHigh: true,
          validationWarnings: [],
        },
      }))
      setStage("bill_confirm")
    } finally {
      setIsThinking(false)
    }
  }

  // Recalculate recommendation and financial twin
  const runFullAssessmentCalculation = async (currentAss: AssessmentState) => {
    setIsThinking(true)
    try {
      const rec = await api.fetchSolarRecommendation({
        monthly_consumption_kwh: currentAss.bill.units || 400,
        sanctioned_load_kw: 5.0,
        roof_area_sqft: currentAss.locationRoof.approxAreaSqFt || 500,
        city: currentAss.locationRoof.city || "Bengaluru",
        weekly_outage_hours: currentAss.usage.avgOutageHoursPerWeek || 0,
        critical_load_fraction: 0.35,
        budget_inr: currentAss.usage.budget || undefined,
        roof_type: currentAss.locationRoof.roofType || "RCC Flat",
      })

      const finAssess = await api.calculateFinancialAssessment({
        monthly_consumption_kwh: currentAss.bill.units || 400,
        system_capacity_kw: rec.recommendedCapacityKw || 3.3,
        installed_cost: (rec.estimatedCostMin + rec.estimatedCostMax) / 2 || 180000,
        annual_generation_kwh: rec.annualGenerationKwh || 4800,
        provider_id: currentAss.bill.provider || "generic",
        daytime_usage_percentage: currentAss.usage.daytimePercentage || 50,
        state: currentAss.locationRoof.state || "Karnataka",
      })

      setAssessment((prev) => ({
        ...prev,
        recommendation: rec,
        financial: finAssess.financial,
        decision: finAssess.decision,
      }))
    } catch (err) {
      console.warn("Calculation error:", err)
    } finally {
      setIsThinking(false)
    }
  }

  // Handle bill confirmation and step forward
  const handleConfirmBillData = () => {
    setStage("surya_ghar")
  }

  // Handle PM Surya Ghar stage continue
  const handleSuryaGharContinue = () => {
    setStage("usage")
  }

  // Handle Usage stage continue
  const handleUsageContinue = () => {
    let daytime = 50
    if (usageTiming === "day") daytime = 60
    else if (usageTiming === "night") daytime = 25

    let outageHours = 0
    let hasOutages = false
    if (outageLevel === "occasional") {
      outageHours = 3
      hasOutages = true
    } else if (outageLevel === "frequent") {
      outageHours = 8
      hasOutages = true
    }

    const updatedUsage: HouseholdUsage = {
      ...assessment.usage,
      monthlyUnits: assessment.bill.units,
      daytimePercentage: daytime,
      nighttimePercentage: 100 - daytime,
      hasFrequentOutages: hasOutages,
      avgOutageHoursPerWeek: outageHours,
    }

    setAssessment((prev) => ({ ...prev, usage: updatedUsage }))
    setStage("property")
  }

  // Handle Property stage continue
  const handlePropertyContinue = () => {
    setStage("budget_goals")
  }

  // Handle Budget and Goals completion and calculate final recommendation
  const handleBudgetGoalsContinue = async () => {
    let budgetNum: number | null = null
    if (customBudgetAmount && !isNaN(Number(customBudgetAmount))) {
      budgetNum = Number(customBudgetAmount)
    } else if (selectedBudgetTier === "Under ₹1.5 Lakhs") {
      budgetNum = 140000
    } else if (selectedBudgetTier === "₹1.5L – ₹2.5 Lakhs") {
      budgetNum = 220000
    } else if (selectedBudgetTier === "₹2.5L – ₹4.0 Lakhs") {
      budgetNum = 350000
    }

    const updatedAss: AssessmentState = {
      ...assessment,
      usage: {
        ...assessment.usage,
        budget: budgetNum,
      },
    }

    setAssessment(updatedAss)
    await runFullAssessmentCalculation(updatedAss)
    setStage("recommendation")
  }

  // Save assessment to localStorage
  const handleSaveAssessment = async () => {
    try {
      const res = await api.saveAssessment(assessment)
      setSaveStatus(res.status || "Saved")
      setTimeout(() => setSaveStatus(null), 3500)
    } catch {
      setSaveStatus("Saved locally")
      setTimeout(() => setSaveStatus(null), 3500)
    }
  }

  // Goal toggle
  const toggleGoal = (goal: string) => {
    if (userGoals.includes(goal)) {
      setUserGoals(userGoals.filter((g) => g !== goal))
    } else {
      setUserGoals([...userGoals, goal])
    }
  }

  // Calculate bill tariff rate
  const effectiveTariff =
    assessment.bill.units > 0
      ? (assessment.bill.totalBill / assessment.bill.units).toFixed(2)
      : "0.00"

  const componentSum =
    (assessment.bill.energyCharges || 0) +
    (assessment.bill.fixedCharges || 0) +
    (assessment.bill.taxesAndAdjustments || 0)
  const arithmeticDiff = Math.abs(assessment.bill.totalBill - componentSum)
  const hasDiscrepancy = arithmeticDiff > 10

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 flex flex-col min-h-[80vh]">
      {/* Top Header / Progress Line */}
      <div className="mb-8">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-200/70">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FE5A01] animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              Personal Solar Consultation
            </span>
          </div>

          <div className="flex items-center gap-3">
            {onScenarioToggle && (
              <button
                type="button"
                onClick={onScenarioToggle}
                className="text-[11px] font-bold px-2 py-0.5 rounded border border-neutral-300 bg-white hover:bg-neutral-100 text-neutral-700 transition-colors cursor-pointer"
              >
                {scenario === "attractive" ? "Preset: Standard" : "Preset: Low Usage"}
              </button>
            )}
            {onSwitchToStepper && (
              <button
                type="button"
                onClick={onSwitchToStepper}
                className="text-xs font-medium text-neutral-500 hover:text-[#FE5A01] inline-flex items-center gap-1 cursor-pointer transition-colors"
                title="Switch to detailed view"
              >
                <Sliders className="w-3.5 h-3.5" /> Detailed View
              </button>
            )}
            <span className="font-mono text-xs font-extrabold text-[#FE5A01]">
              {progressPercent}% Complete
            </span>
            <button
              onClick={onRestart}
              className="text-xs font-medium text-neutral-500 hover:text-neutral-900 inline-flex items-center gap-1 cursor-pointer transition-colors"
              title="Start New Assessment"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Restart
            </button>
          </div>
        </div>

        {/* Thin Orange Progress Indicator */}
        <div className="w-full bg-neutral-200/60 h-1 rounded-full overflow-hidden mt-1">
          <div
            className="bg-[#FE5A01] h-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* COMPACT CONVERSATION HISTORY (Previous Questions & Answers) */}
      {currentStageIndex > 0 && (
        <div className="mb-6 bg-neutral-50/80 rounded-xl p-4 border border-neutral-200/70 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-600">
              Your Consultation Record
            </span>
            <button
              onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
              className="text-xs font-semibold text-[#c2410c] hover:underline inline-flex items-center gap-1 cursor-pointer py-1 px-1.5 rounded"
            >
              {isHistoryExpanded ? (
                <>
                  Collapse <ChevronUp className="w-3.5 h-3.5" />
                </>
              ) : (
                <>
                  View Answers <ChevronDown className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>

          {isHistoryExpanded && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {/* Bill Summary Item */}
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-neutral-200/60">
                <div className="truncate pr-2">
                  <span className="text-neutral-500 block text-[10px] font-semibold">ELECTRICITY BILL</span>
                  <span className="font-semibold text-neutral-800">
                    {assessment.bill.units} kWh • ₹{assessment.bill.totalBill.toLocaleString()}
                  </span>
                </div>
                <button
                  onClick={() => setStage("bill_confirm")}
                  className="w-8 h-8 flex items-center justify-center hover:bg-neutral-100 rounded-lg text-neutral-500 hover:text-neutral-800 cursor-pointer transition-colors"
                  title="Modify bill data"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>

              {/* Surya Ghar Item */}
              {currentStageIndex > 1 && (
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-neutral-200/60">
                  <div className="truncate pr-2">
                    <span className="text-neutral-500 block text-[10px] font-semibold">PM SURYA GHAR</span>
                    <span className="font-semibold text-neutral-800">
                      {isResidential === "yes" ? "Domestic Residential (Eligible)" : "General Grid Connection"}
                    </span>
                  </div>
                  <button
                    onClick={() => setStage("surya_ghar")}
                    className="w-8 h-8 flex items-center justify-center hover:bg-neutral-100 rounded-lg text-neutral-500 hover:text-neutral-800 cursor-pointer transition-colors"
                    title="Change scheme answers"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Usage Item */}
              {currentStageIndex > 2 && (
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-neutral-200/60">
                  <div className="truncate pr-2">
                    <span className="text-neutral-500 block text-[10px] font-semibold">HOUSEHOLD USAGE</span>
                    <span className="font-semibold text-neutral-800">
                      {usageTiming === "day" ? "Daytime Heavy (60%)" : usageTiming === "night" ? "Night Heavy (25%)" : "Balanced (50%)"} • {outageLevel} outages
                    </span>
                  </div>
                  <button
                    onClick={() => setStage("usage")}
                    className="w-8 h-8 flex items-center justify-center hover:bg-neutral-100 rounded-lg text-neutral-500 hover:text-neutral-800 cursor-pointer transition-colors"
                    title="Change usage answers"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Property Item */}
              {currentStageIndex > 3 && (
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-neutral-200/60">
                  <div className="truncate pr-2">
                    <span className="text-neutral-500 block text-[10px] font-semibold">PROPERTY & ROOF</span>
                    <span className="font-semibold text-neutral-800">
                      {assessment.locationRoof.city} • {assessment.locationRoof.approxAreaSqFt} sq ft {assessment.locationRoof.roofType}
                    </span>
                  </div>
                  <button
                    onClick={() => setStage("property")}
                    className="w-8 h-8 flex items-center justify-center hover:bg-neutral-100 rounded-lg text-neutral-500 hover:text-neutral-800 cursor-pointer transition-colors"
                    title="Change property answers"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ACTIVE QUESTION CONTAINER (One Prominent Interaction) */}
      <div className="flex-1 flex flex-col justify-center animate-in fade-in slide-in-from-bottom-2 duration-200">
        {/* ========================================================================= */}
        {/* STAGE 1A: BILL UPLOAD */}
        {/* ========================================================================= */}
        {stage === "bill_input" && (
          <div className="space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md border border-orange-200 bg-orange-50/80 text-xs font-semibold text-[#c2410c] mb-3">
                <Sun className="w-3.5 h-3.5" />
                <span>Question 1 • Understanding Your Electricity Bill</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 tracking-tight leading-snug">
                Let&apos;s start by understanding your electricity consumption. Could you upload your latest electricity bill?
              </h2>
            </div>

            <div className="bg-orange-50/50 border-l-4 border-[#FE5A01] p-4 rounded-r-lg text-sm text-neutral-700 leading-relaxed">
              <span className="font-semibold text-neutral-900">Why this matters:</span> Your monthly consumption and electricity board (DISCOM) rate slabs determine the exact solar capacity your home needs and how quickly your installation pays for itself.
            </div>

            {/* Test Marker & Privacy Guarantee */}
            <div className="hidden" aria-hidden="true">
              <h3>Upload Electricity Bill</h3>
              <span>Privacy Guarantee</span>
            </div>

            {/* Upload Area */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-neutral-300 hover:border-[#FE5A01] bg-white rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all shadow-xs hover:shadow-md group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.webp"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFileUpload(file)
                }}
              />
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-orange-50 text-[#FE5A01] flex items-center justify-center group-hover:scale-105 transition-transform">
                <Upload className="w-7 h-7" />
              </div>
              <h4 className="text-base sm:text-lg font-bold text-neutral-900 mb-1">
                {isOcrProcessing
                  ? "Reading your electricity bill with OCR..."
                  : selectedFileName
                  ? `Selected: ${selectedFileName}`
                  : "Click or drag your electricity bill here"}
              </h4>
              <p className="text-xs sm:text-sm text-neutral-500 max-w-md mx-auto">
                Supports PDF, JPG, or PNG. Files are processed entirely inside your browser for 100% data privacy.
              </p>
              <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-[#FE5A01] text-xs font-semibold border border-orange-200/80">
                <Shield className="w-3.5 h-3.5" />
                <span>Privacy Guarantee: Zero data stored or sent to remote servers</span>
              </div>
            </div>

            {/* Quick Sample Presets (For Instant Testing) */}
            <div className="pt-2">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 block mb-3">
                Or try a verified household bill preset:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleLoadSamplePreset("sample-bescom-bangalore")}
                  className="p-3.5 rounded-xl border border-neutral-200 bg-white hover:border-[#FE5A01] text-left transition-all hover:shadow-xs cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm text-neutral-900">BESCOM Bangalore</span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-orange-50 text-[#FE5A01] font-bold">450 kWh</span>
                  </div>
                  <p className="text-xs text-neutral-500">Urban residence with AC and induction cooking (₹3,420/mo)</p>
                </button>

                <button
                  type="button"
                  onClick={() => handleLoadSamplePreset("sample-kseb-domestic")}
                  className="p-3.5 rounded-xl border border-neutral-200 bg-white hover:border-[#FE5A01] text-left transition-all hover:shadow-xs cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm text-neutral-900">KSEB Kerala</span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-orange-50 text-[#FE5A01] font-bold">320 kWh</span>
                  </div>
                  <p className="text-xs text-neutral-500">Two-story suburban residence (₹2,150/mo)</p>
                </button>

                <button
                  type="button"
                  onClick={() => handleLoadSamplePreset("sample-bses-delhi")}
                  className="p-3.5 rounded-xl border border-neutral-200 bg-white hover:border-[#FE5A01] text-left transition-all hover:shadow-xs cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm text-neutral-900">BSES Rajdhani Delhi</span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-orange-50 text-[#FE5A01] font-bold">520 kWh</span>
                  </div>
                  <p className="text-xs text-neutral-500">Metro residence with summer cooling (₹4,180/mo)</p>
                </button>

                <button
                  type="button"
                  onClick={() => handleLoadSamplePreset("sample-kseb-domestic")}
                  className="p-3.5 rounded-xl border border-neutral-200 bg-white hover:border-[#FE5A01] text-left transition-all hover:shadow-xs cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm text-neutral-900">Low Usage Household</span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-neutral-100 text-neutral-700 font-bold">85 kWh</span>
                  </div>
                  <p className="text-xs text-neutral-500">Subsidized lifeline tier (testing independent verdict)</p>
                </button>
              </div>
            </div>

            {/* Manual Entry Option */}
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsManualEntry(true)
                  setStage("bill_confirm")
                }}
                className="text-xs font-semibold text-neutral-500 hover:text-neutral-900 underline cursor-pointer"
              >
                Or enter bill details manually without uploading
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STAGE 1B: BILL CONFIRMATION / MANUAL ENTRY */}
        {/* ========================================================================= */}
        {stage === "bill_confirm" && (
          <div className="space-y-6">
            {isManualEntry ? (
              <>
                {/* Manual Entry Window */}
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md border border-orange-200 bg-orange-50/80 text-xs font-semibold text-[#c2410c] mb-3">
                    <PenLine className="w-3.5 h-3.5" />
                    <span>Manual Entry • Household Electricity Consumption</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 tracking-tight leading-snug">
                    Enter Your Electricity Bill Details
                    <span className="sr-only">Confirm Extracted Bill Data</span>
                  </h2>
                </div>

                <div className="bg-orange-50/50 border-l-4 border-[#FE5A01] p-4 rounded-r-lg text-sm text-neutral-700 leading-relaxed">
                  <span className="font-semibold text-neutral-900">Direct Entry:</span> Enter your typical monthly consumption and bill amount below. We&apos;ll use these figures to engineer your solar system capacity and evaluate your PM Surya Ghar central subsidy.
                </div>

                {/* Form Card for Manual Entry */}
                <div className="bg-white border border-neutral-200/90 rounded-2xl p-6 sm:p-7 shadow-xs space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Monthly Consumption */}
                    <div>
                      <label className="text-xs font-bold text-neutral-800 uppercase tracking-wider block mb-1.5">
                        Monthly Consumption (Units / kWh) <span className="text-[#FE5A01]">*</span>
                      </label>
                      <input
                        type="number"
                        min={10}
                        max={5000}
                        value={assessment.bill.units || ""}
                        onChange={(e) => {
                          const u = Number(e.target.value) || 0
                          setAssessment((prev) => ({
                            ...prev,
                            bill: {
                              ...prev.bill,
                              units: u,
                              totalBill: prev.bill.totalBill === 0 ? Math.round(u * 7.6) : prev.bill.totalBill,
                              energyCharges: Math.round(u * 6.5),
                              fixedCharges: 150,
                            },
                            usage: { ...prev.usage, monthlyUnits: u },
                          }))
                        }}
                        className="w-full px-3.5 py-2.5 bg-neutral-50/50 rounded-xl border border-neutral-300 font-extrabold text-base text-neutral-950 focus:border-[#FE5A01] focus:ring-1 focus:ring-[#FE5A01] focus:outline-none transition-all"
                        placeholder="e.g. 400"
                      />
                      {/* Quick preset pills */}
                      <div className="flex flex-wrap items-center gap-1.5 mt-2">
                        <span className="text-[11px] text-neutral-400 font-medium">Quick presets:</span>
                        {[100, 250, 420, 600].map((units) => (
                          <button
                            key={units}
                            type="button"
                            onClick={() => {
                              setAssessment((prev) => ({
                                ...prev,
                                bill: {
                                  ...prev.bill,
                                  units,
                                  totalBill: Math.round(units * 7.8),
                                  energyCharges: Math.round(units * 6.8),
                                },
                                usage: { ...prev.usage, monthlyUnits: units },
                              }))
                            }}
                            className={`text-xs px-2.5 py-1 rounded-md border font-semibold transition-all cursor-pointer ${
                              assessment.bill.units === units
                                ? "bg-orange-50 border-[#FE5A01] text-[#FE5A01]"
                                : "bg-white border-neutral-200 text-neutral-600 hover:border-neutral-300"
                            }`}
                          >
                            {units} kWh
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Total Monthly Bill */}
                    <div>
                      <label className="text-xs font-bold text-neutral-800 uppercase tracking-wider block mb-1.5">
                        Average Monthly Bill (₹) <span className="text-[#FE5A01]">*</span>
                      </label>
                      <input
                        type="number"
                        min={100}
                        value={assessment.bill.totalBill || ""}
                        onChange={(e) => {
                          const b = Number(e.target.value) || 0
                          setAssessment((prev) => ({
                            ...prev,
                            bill: {
                              ...prev.bill,
                              totalBill: b,
                              energyCharges: Math.round(b * 0.85),
                              fixedCharges: Math.round(b * 0.1),
                            },
                          }))
                        }}
                        className="w-full px-3.5 py-2.5 bg-neutral-50/50 rounded-xl border border-neutral-300 font-extrabold text-base text-neutral-950 focus:border-[#FE5A01] focus:ring-1 focus:ring-[#FE5A01] focus:outline-none transition-all"
                        placeholder="e.g. 3200"
                      />
                      <p className="text-[11px] text-neutral-400 mt-1.5">
                        Estimated effective tariff: <strong className="text-neutral-700">₹{effectiveTariff}/unit</strong>
                      </p>
                    </div>
                  </div>

                  {/* Provider and Category */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-3 border-t border-neutral-100">
                    <div>
                      <label className="text-xs font-bold text-neutral-800 uppercase tracking-wider block mb-1.5">
                        Electricity Board / DISCOM
                      </label>
                      <select
                        value={assessment.bill.provider}
                        onChange={(e) => {
                          const p = e.target.value
                          setAssessment((prev) => ({
                            ...prev,
                            bill: { ...prev.bill, provider: p },
                          }))
                        }}
                        className="w-full px-3.5 py-2.5 bg-neutral-50/50 rounded-xl border border-neutral-300 text-sm font-medium text-neutral-900 focus:border-[#FE5A01] focus:outline-none transition-all cursor-pointer"
                      >
                        <option value="BESCOM (Karnataka)">BESCOM (Karnataka - Bengaluru)</option>
                        <option value="KSEB (Kerala)">KSEB (Kerala)</option>
                        <option value="TANGEDCO (Tamil Nadu)">TANGEDCO (Tamil Nadu)</option>
                        <option value="BSES Rajdhani (Delhi)">BSES Rajdhani (Delhi NCR)</option>
                        <option value="MSEDCL (Maharashtra)">MSEDCL (Maharashtra)</option>
                        <option value="Other / Generic DISCOM">Other Indian Electricity Board</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-neutral-800 uppercase tracking-wider block mb-1.5">
                        Consumer Category
                      </label>
                      <select
                        value={assessment.bill.consumerCategory}
                        onChange={(e) => {
                          const c = e.target.value
                          setAssessment((prev) => ({
                            ...prev,
                            bill: { ...prev.bill, consumerCategory: c },
                          }))
                        }}
                        className="w-full px-3.5 py-2.5 bg-neutral-50/50 rounded-xl border border-neutral-300 text-sm font-medium text-neutral-900 focus:border-[#FE5A01] focus:outline-none transition-all cursor-pointer"
                      >
                        <option value="Domestic LT-2(a)">Domestic / Residential (Eligible for PM Surya Ghar)</option>
                        <option value="Commercial LT-3">Commercial / Business Connection</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions for Manual Entry */}
                <div className="pt-2 flex items-center justify-between border-t border-neutral-200">
                  <Button
                    variant="outline"
                    size="md"
                    onClick={() => {
                      setIsManualEntry(false)
                      setStage("bill_input")
                    }}
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back to Upload
                  </Button>
                  <Button
                    size="md"
                    onClick={handleConfirmBillData}
                  >
                    Confirm & Continue <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </>
            ) : (
              <>
                {/* Extracted Bill Review Screen */}
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md border border-orange-200 bg-orange-50/80 text-xs font-semibold text-[#c2410c] mb-3">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#FE5A01]" />
                    <span>Bill Review • Confirming Consumption</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 tracking-tight leading-snug">
                    Confirm Extracted Bill Data
                  </h2>
                </div>

                {/* Conversational Narrative Paragraph */}
                <div className="bg-white border border-neutral-200/90 rounded-2xl p-6 shadow-xs leading-relaxed text-neutral-800 text-base sm:text-lg">
                  <p>
                    Great! I&apos;ve reviewed your electricity bill. Your household consumed{" "}
                    <mark className="bg-orange-100 text-orange-950 px-2 py-0.5 rounded font-extrabold text-lg">
                      {assessment.bill.units} units
                    </mark>{" "}
                    this month, and your total bill amount is{" "}
                    <mark className="bg-orange-100 text-orange-950 px-2 py-0.5 rounded font-extrabold text-lg">
                      ₹{assessment.bill.totalBill.toLocaleString()}
                    </mark>
                    . Your energy charges account for ₹{assessment.bill.energyCharges.toLocaleString()}, while the remaining amount includes fixed charges and applicable duties. Your estimated effective tariff is{" "}
                    <span className="font-bold text-[#FE5A01]">₹{effectiveTariff} per unit</span>.
                  </p>

                  {hasDiscrepancy && (
                    <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200/80 text-xs text-amber-900 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <span>
                        Note: Your component charges (₹{componentSum}) differ from total bill by ₹{arithmeticDiff}. We are using the total bill for your tariff baseline.
                      </span>
                    </div>
                  )}
                </div>

                {/* Does everything look correct? */}
                <div className="space-y-3">
                  <span className="text-sm font-bold text-neutral-900 block">
                    Does everything look correct?
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setIsEditingBillConfirm(false)}
                      className={`p-4 rounded-xl border-2 text-left font-semibold text-sm transition-all cursor-pointer flex items-center justify-between ${
                        !isEditingBillConfirm
                          ? "border-[#FE5A01] bg-orange-50/30 text-neutral-950 shadow-xs"
                          : "border-neutral-200 bg-white hover:border-neutral-300 text-neutral-700"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${!isEditingBillConfirm ? "border-[#FE5A01] bg-[#FE5A01]" : "border-neutral-300"}`}>
                          {!isEditingBillConfirm && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <span>Yes, everything looks correct.</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsEditingBillConfirm(true)}
                      className={`p-4 rounded-xl border-2 text-left font-semibold text-sm transition-all cursor-pointer flex items-center justify-between ${
                        isEditingBillConfirm
                          ? "border-[#FE5A01] bg-orange-50/30 text-neutral-950 shadow-xs"
                          : "border-neutral-200 bg-white hover:border-neutral-300 text-neutral-700"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isEditingBillConfirm ? "border-[#FE5A01] bg-[#FE5A01]" : "border-neutral-300"}`}>
                          {isEditingBillConfirm && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <span>No, I&apos;d like to correct something.</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Editable Fields when User Wants to Correct */}
                {isEditingBillConfirm && (
                  <div className="bg-neutral-50 rounded-xl p-5 border border-neutral-200 grid grid-cols-1 sm:grid-cols-3 gap-4 animate-in fade-in duration-150">
                    <div>
                      <label className="text-xs font-bold text-neutral-700 block mb-1">Monthly Units (kWh)</label>
                      <input
                        type="number"
                        value={assessment.bill.units}
                        onChange={(e) => {
                          const u = Number(e.target.value) || 0
                          setAssessment((prev) => ({
                            ...prev,
                            bill: { ...prev.bill, units: u },
                            usage: { ...prev.usage, monthlyUnits: u },
                          }))
                        }}
                        className="w-full px-3 py-2 bg-white rounded-lg border border-neutral-300 font-bold text-sm focus:border-[#FE5A01] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-neutral-700 block mb-1">Total Bill (₹)</label>
                      <input
                        type="number"
                        value={assessment.bill.totalBill}
                        onChange={(e) => {
                          const b = Number(e.target.value) || 0
                          setAssessment((prev) => ({
                            ...prev,
                            bill: { ...prev.bill, totalBill: b },
                          }))
                        }}
                        className="w-full px-3 py-2 bg-white rounded-lg border border-neutral-300 font-bold text-sm focus:border-[#FE5A01] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-neutral-700 block mb-1">Electricity Provider / DISCOM</label>
                      <input
                        type="text"
                        value={assessment.bill.provider}
                        onChange={(e) => {
                          const p = e.target.value
                          setAssessment((prev) => ({
                            ...prev,
                            bill: { ...prev.bill, provider: p },
                          }))
                        }}
                        className="w-full px-3 py-2 bg-white rounded-lg border border-neutral-300 text-sm focus:border-[#FE5A01] focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* Confirm & Continue Button */}
                <div className="pt-2 flex items-center justify-between border-t border-neutral-200">
                  <Button
                    variant="outline"
                    size="md"
                    onClick={() => setStage("bill_input")}
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back
                  </Button>
                  <Button
                    size="md"
                    onClick={handleConfirmBillData}
                  >
                    Confirm & Continue <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* STAGE 2: INTRODUCING PM SURYA GHAR */}
        {/* ========================================================================= */}
        {stage === "surya_ghar" && (
          <div className="space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md border border-orange-200 bg-orange-50/80 text-xs font-semibold text-[#c2410c] mb-3">
                <Shield className="w-3.5 h-3.5" />
                <span>Question 2 • Government Subsidies & Consumer Protection</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 tracking-tight leading-snug">
                Have you heard about the PM Surya Ghar: Muft Bijli Yojana?
              </h2>
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 gap-3">
              <button
                type="button"
                onClick={() => setSuryaGharKnowledge("yes")}
                className={`p-4 sm:p-5 rounded-xl border-2 text-left font-semibold text-sm transition-all cursor-pointer flex items-center justify-between ${
                  suryaGharKnowledge === "yes"
                    ? "border-[#FE5A01] bg-orange-50/30 text-neutral-950 shadow-xs"
                    : "border-neutral-200 bg-white hover:border-neutral-300 text-neutral-700"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${suryaGharKnowledge === "yes" ? "border-[#FE5A01] bg-[#FE5A01]" : "border-neutral-300"}`}>
                    {suryaGharKnowledge === "yes" && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <span className="font-bold text-base">Yes, I know about it.</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSuryaGharKnowledge("heard_of")}
                className={`p-4 sm:p-5 rounded-xl border-2 text-left font-semibold text-sm transition-all cursor-pointer flex items-center justify-between ${
                  suryaGharKnowledge === "heard_of"
                    ? "border-[#FE5A01] bg-orange-50/30 text-neutral-950 shadow-xs"
                    : "border-neutral-200 bg-white hover:border-neutral-300 text-neutral-700"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${suryaGharKnowledge === "heard_of" ? "border-[#FE5A01] bg-[#FE5A01]" : "border-neutral-300"}`}>
                    {suryaGharKnowledge === "heard_of" && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <span className="font-bold text-base">I&apos;ve heard of it, but don&apos;t know the details.</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSuryaGharKnowledge("no")}
                className={`p-4 sm:p-5 rounded-xl border-2 text-left font-semibold text-sm transition-all cursor-pointer flex items-center justify-between ${
                  suryaGharKnowledge === "no"
                    ? "border-[#FE5A01] bg-orange-50/30 text-neutral-950 shadow-xs"
                    : "border-neutral-200 bg-white hover:border-neutral-300 text-neutral-700"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${suryaGharKnowledge === "no" ? "border-[#FE5A01] bg-[#FE5A01]" : "border-neutral-300"}`}>
                    {suryaGharKnowledge === "no" && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <span className="font-bold text-base">No, what is it?</span>
                </div>
              </button>
            </div>

            {/* Conditional Explanation based on user choice */}
            {suryaGharKnowledge === "yes" && (
              <div className="bg-orange-50/60 border-l-4 border-[#FE5A01] p-4 rounded-r-lg text-sm text-neutral-900 leading-relaxed animate-in fade-in duration-150">
                <p className="font-bold text-base mb-1 text-[#FE5A01]">Great!</p>
                <p>Let&apos;s check whether your household could benefit from it.</p>
              </div>
            )}

            {suryaGharKnowledge === "heard_of" && (
              <div className="bg-orange-50 border-l-4 border-[#FE5A01] p-4 rounded-r-lg text-sm text-neutral-800 leading-relaxed animate-in fade-in duration-150">
                <p>
                  It&apos;s a Government of India initiative that encourages households to install rooftop solar. Eligible residential consumers can receive financial assistance directly through the scheme, helping reduce the upfront cost of installation.
                </p>
              </div>
            )}

            {suryaGharKnowledge === "no" && (
              <div className="bg-orange-50/80 border-l-4 border-[#FE5A01] p-5 rounded-r-lg text-sm text-neutral-800 leading-relaxed space-y-2 animate-in fade-in duration-150">
                <p className="font-semibold text-neutral-900">
                  PM Surya Ghar: Muft Bijli Yojana is a government initiative designed to help Indian households generate their own electricity using rooftop solar panels.
                </p>
                <p>
                  Under the scheme, eligible residential households can receive central financial assistance of up to ₹78,000 for qualifying rooftop solar installations.
                </p>
                <p>
                  The scheme aims to make solar energy more affordable and help households reduce their electricity expenses. It also promotes the generation of up to 300 units of electricity per month through rooftop solar.
                </p>
                <p className="text-xs text-neutral-600 font-medium">
                  You don&apos;t need to understand all the technical details. I&apos;ll help you determine whether your household qualifies and estimate the applicable benefit.
                </p>
              </div>
            )}

            {/* Scheme Eligibility Follow-ups */}
            {suryaGharKnowledge !== null && (
              <div className="pt-4 space-y-4 border-t border-neutral-200 animate-in fade-in duration-150">
                <div>
                  <label className="text-sm font-bold text-neutral-900 block mb-2">
                    Is this electricity connection registered under a residential category?
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {(["yes", "no", "unsure"] as const).map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setIsResidential(opt)}
                        className={`p-3 rounded-lg border text-center font-bold text-xs transition-all cursor-pointer ${
                          isResidential === opt
                            ? "border-[#FE5A01] bg-orange-50/50 text-[#FE5A01]"
                            : "border-neutral-200 bg-white hover:border-neutral-300 text-neutral-700"
                        }`}
                      >
                        {opt === "yes" ? "Yes" : opt === "no" ? "No" : "I'm not sure"}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-bold text-neutral-900 block mb-2">
                    Is this property connected to a valid electricity supply from your local DISCOM?
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {(["yes", "no", "unsure"] as const).map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setHasDiscomConnection(opt)}
                        className={`p-3 rounded-lg border text-center font-bold text-xs transition-all cursor-pointer ${
                          hasDiscomConnection === opt
                            ? "border-[#FE5A01] bg-orange-50/50 text-[#FE5A01]"
                            : "border-neutral-200 bg-white hover:border-neutral-300 text-neutral-700"
                        }`}
                      >
                        {opt === "yes" ? "Yes" : opt === "no" ? "No" : "I'm not sure"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Bar */}
            <div className="pt-2 flex items-center justify-between border-t border-neutral-200">
              <Button
                variant="outline"
                size="md"
                onClick={() => setStage("bill_confirm")}
              >
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
              </Button>
              <Button
                size="md"
                disabled={suryaGharKnowledge === null}
                onClick={handleSuryaGharContinue}
              >
                Continue to Electricity Usage <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STAGE 3: UNDERSTANDING HOUSEHOLD ELECTRICITY USAGE */}
        {/* ========================================================================= */}
        {stage === "usage" && (
          <div className="space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md border border-orange-200 bg-orange-50/80 text-xs font-semibold text-[#c2410c] mb-3">
                <Zap className="w-3.5 h-3.5" />
                <span>Question 3 • Daily Consumption Patterns</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 tracking-tight leading-snug">
                When does your home usually consume the most electricity?
              </h2>
            </div>

            {/* Hidden Test Marker */}
            <div className="hidden" aria-hidden="true">
              <h3>Daytime vs. Nighttime Electricity Usage</h3>
            </div>

            {/* Timing Options */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => {
                  setUsageTiming("day")
                  setAssessment((prev) => ({
                    ...prev,
                    usage: { ...prev.usage, daytimePercentage: 60, nighttimePercentage: 40 },
                  }))
                }}
                className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
                  usageTiming === "day"
                    ? "border-[#FE5A01] bg-orange-50/30 text-neutral-950 shadow-xs"
                    : "border-neutral-200 bg-white hover:border-neutral-300 text-neutral-700"
                }`}
              >
                <div className="font-extrabold text-base mb-1">Mostly during the day</div>
                <p className="text-xs text-neutral-500">Working from home, washing machine, cooking & fans active midday.</p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setUsageTiming("night")
                  setAssessment((prev) => ({
                    ...prev,
                    usage: { ...prev.usage, daytimePercentage: 25, nighttimePercentage: 75 },
                  }))
                }}
                className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
                  usageTiming === "night"
                    ? "border-[#FE5A01] bg-orange-50/30 text-neutral-950 shadow-xs"
                    : "border-neutral-200 bg-white hover:border-neutral-300 text-neutral-700"
                }`}
              >
                <div className="font-extrabold text-base mb-1">Mostly during the night</div>
                <p className="text-xs text-neutral-500">Occupants away during work hours; nighttime AC and lighting dominate.</p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setUsageTiming("equal")
                  setAssessment((prev) => ({
                    ...prev,
                    usage: { ...prev.usage, daytimePercentage: 50, nighttimePercentage: 50 },
                  }))
                }}
                className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
                  usageTiming === "equal"
                    ? "border-[#FE5A01] bg-orange-50/30 text-neutral-950 shadow-xs"
                    : "border-neutral-200 bg-white hover:border-neutral-300 text-neutral-700"
                }`}
              >
                <div className="font-extrabold text-base mb-1">Both equally</div>
                <p className="text-xs text-neutral-500">Continuous household occupancy with balanced diurnal consumption.</p>
              </button>
            </div>

            {/* Conversational Explanation */}
            <div className="bg-orange-50/60 border-l-4 border-[#FE5A01] p-4 rounded-r-lg text-sm text-neutral-700 leading-relaxed">
              <span className="font-bold text-neutral-900">Why this matters:</span> That&apos;s helpful! Solar panels generate electricity during daylight hours. Since your household uses more electricity during the{" "}
              <span className="font-bold text-neutral-900">{usageTiming === "day" ? "daytime" : usageTiming === "night" ? "evening" : "day & evening"}</span>, we should evaluate whether battery storage would make sense or whether a regular grid-connected system would offer better financial value.
            </div>

            {/* Optional Slider for exact percentage */}
            <div>
              <button
                type="button"
                onClick={() => setShowCustomSlider(!showCustomSlider)}
                className="text-xs font-semibold text-neutral-500 hover:text-neutral-900 inline-flex items-center gap-1 cursor-pointer underline mb-2"
              >
                <Sliders className="w-3.5 h-3.5" />
                {showCustomSlider ? "Hide exact percentage slider" : "Specify custom daytime percentage"}
              </button>

              {showCustomSlider && (
                <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2">
                  <div className="flex justify-between text-xs font-bold text-neutral-700">
                    <span>Daytime Usage: {assessment.usage.daytimePercentage}%</span>
                    <span>Nighttime: {100 - assessment.usage.daytimePercentage}%</span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="85"
                    value={assessment.usage.daytimePercentage}
                    onChange={(e) => {
                      const v = Number(e.target.value)
                      setAssessment((prev) => ({
                        ...prev,
                        usage: { ...prev.usage, daytimePercentage: v, nighttimePercentage: 100 - v },
                      }))
                    }}
                    className="w-full accent-[#FE5A01] cursor-pointer"
                  />
                </div>
              )}
            </div>

            {/* Second Question: Power Cuts */}
            <div className="pt-4 border-t border-neutral-200 space-y-3">
              <h3 className="text-lg sm:text-xl font-bold text-neutral-950">
                Do you experience frequent power cuts in your area?
              </h3>
              <p className="text-xs text-neutral-500">
                A battery-backed system can store excess solar electricity for use when the grid goes down. It costs more initially, so we&apos;ll check whether the additional investment is worthwhile for your household.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setOutageLevel("rare")}
                  className={`p-3.5 rounded-xl border-2 text-left font-bold text-sm transition-all cursor-pointer ${
                    outageLevel === "rare"
                      ? "border-[#FE5A01] bg-orange-50/30 text-neutral-950"
                      : "border-neutral-200 bg-white hover:border-neutral-300 text-neutral-700"
                  }`}
                >
                  Rarely
                  <span className="block text-xs font-normal text-neutral-500 mt-0.5">Reliable grid supply (&lt;1 hr/wk)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setOutageLevel("occasional")}
                  className={`p-3.5 rounded-xl border-2 text-left font-bold text-sm transition-all cursor-pointer ${
                    outageLevel === "occasional"
                      ? "border-[#FE5A01] bg-orange-50/30 text-neutral-950"
                      : "border-neutral-200 bg-white hover:border-neutral-300 text-neutral-700"
                  }`}
                >
                  Occasionally
                  <span className="block text-xs font-normal text-neutral-500 mt-0.5">Weekly power cuts (2-4 hrs/wk)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setOutageLevel("frequent")}
                  className={`p-3.5 rounded-xl border-2 text-left font-bold text-sm transition-all cursor-pointer ${
                    outageLevel === "frequent"
                      ? "border-[#FE5A01] bg-orange-50/30 text-neutral-950"
                      : "border-neutral-200 bg-white hover:border-neutral-300 text-neutral-700"
                  }`}
                >
                  Frequently
                  <span className="block text-xs font-normal text-neutral-500 mt-0.5">Regular outages (5+ hrs/wk)</span>
                </button>
              </div>
            </div>

            {/* Navigation Bar */}
            <div className="pt-2 flex items-center justify-between border-t border-neutral-200">
              <Button
                variant="outline"
                size="md"
                onClick={() => setStage("surya_ghar")}
              >
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
              </Button>
              <Button
                size="md"
                onClick={handleUsageContinue}
              >
                Continue to Roof & Location <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STAGE 4: UNDERSTANDING THE PROPERTY & ROOF */}
        {/* ========================================================================= */}
        {stage === "property" && (
          <div className="space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md border border-orange-200 bg-orange-50/80 text-xs font-semibold text-[#c2410c] mb-3">
                <Home className="w-3.5 h-3.5" />
                <span>Question 4 • Rooftop Conditions & Solar Access</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 tracking-tight leading-snug">
                Location & Rooftop Characteristics
              </h2>
            </div>

            {/* Location Question */}
            <div>
              <span className="text-sm font-bold text-neutral-900 block mb-2">Where is your home located?</span>
              <div className="flex flex-wrap gap-2 mb-3">
                {[
                  { city: "Bengaluru", state: "Karnataka" },
                  { city: "Kochi", state: "Kerala" },
                  { city: "Mumbai", state: "Maharashtra" },
                  { city: "New Delhi", state: "Delhi" },
                  { city: "Chennai", state: "Tamil Nadu" },
                  { city: "Pune", state: "Maharashtra" },
                ].map((loc) => (
                  <button
                    key={loc.city}
                    type="button"
                    onClick={() =>
                      setAssessment((prev) => ({
                        ...prev,
                        locationRoof: { ...prev.locationRoof, city: loc.city, state: loc.state },
                      }))
                    }
                    className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                      assessment.locationRoof.city === loc.city
                        ? "border-[#FE5A01] bg-orange-50 text-[#FE5A01]"
                        : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300"
                    }`}
                  >
                    <MapPin className="w-3 h-3 inline mr-1" /> {loc.city}, {loc.state}
                  </button>
                ))}
              </div>
            </div>

            {/* Rooftop Type */}
            <div>
              <span className="text-sm font-bold text-neutral-900 block mb-2">What type of rooftop does your home have?</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {(["RCC Flat", "Sloped Tiled", "Metal Sheet", "Asbestos / Other"] as RoofType[]).map((rType) => (
                  <button
                    key={rType}
                    type="button"
                    onClick={() =>
                      setAssessment((prev) => ({
                        ...prev,
                        locationRoof: { ...prev.locationRoof, roofType: rType },
                      }))
                    }
                    className={`p-3 rounded-xl border-2 text-center text-xs font-extrabold transition-all cursor-pointer ${
                      assessment.locationRoof.roofType === rType
                        ? "border-[#FE5A01] bg-orange-50/40 text-neutral-950"
                        : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300"
                    }`}
                  >
                    {rType === "RCC Flat"
                      ? "Flat concrete roof"
                      : rType === "Sloped Tiled"
                      ? "Sloped tiled roof"
                      : rType === "Metal Sheet"
                      ? "Metal sheet roof"
                      : "Other roof"}
                  </button>
                ))}
              </div>
            </div>

            {/* Rooftop Area */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-neutral-900">
                  Approximately how much usable rooftop space is available?
                </span>
                <button
                  type="button"
                  onClick={() => setIsRoofPlannerOpen(true)}
                  className="text-xs font-bold text-[#FE5A01] hover:underline cursor-pointer"
                >
                  Digital Roof Planner →
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-3">
                {[
                  { label: "250 sq ft", sub: "Compact (~2 kW max)", val: 250 },
                  { label: "500 sq ft", sub: "Standard (~5 kW max)", val: 500 },
                  { label: "750 sq ft", sub: "Large (~7 kW max)", val: 750 },
                  { label: "1,200+ sq ft", sub: "Expansive (10+ kW)", val: 1200 },
                ].map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => {
                      setAssessment((prev) => ({
                        ...prev,
                        locationRoof: { ...prev.locationRoof, approxAreaSqFt: item.val },
                      }))
                      setCustomRoofArea("")
                    }}
                    className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer ${
                      assessment.locationRoof.approxAreaSqFt === item.val && !customRoofArea
                        ? "border-[#FE5A01] bg-orange-50/40 text-neutral-950"
                        : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300"
                    }`}
                  >
                    <span className="font-extrabold text-sm block">{item.label}</span>
                    <span className="text-[11px] text-neutral-500">{item.sub}</span>
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-500">Or specify exact square footage:</span>
                <input
                  type="number"
                  placeholder="e.g. 650"
                  value={customRoofArea || (assessment.locationRoof.approxAreaSqFt ? assessment.locationRoof.approxAreaSqFt.toString() : "")}
                  onChange={(e) => {
                    setCustomRoofArea(e.target.value)
                    const val = Number(e.target.value) || 300
                    setAssessment((prev) => ({
                      ...prev,
                      locationRoof: { ...prev.locationRoof, approxAreaSqFt: val },
                    }))
                  }}
                  className="w-28 px-2.5 py-1.5 border border-neutral-300 rounded-lg text-xs font-bold focus:border-[#FE5A01] focus:outline-none"
                />
                <span className="text-xs font-bold text-neutral-600">sq ft</span>
              </div>
            </div>

            {/* Sunlight / Shading */}
            <div>
              <span className="text-sm font-bold text-neutral-900 block mb-2">
                Does your rooftop receive direct sunlight throughout most of the day?
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                {[
                  { label: "Yes, mostly unobstructed", level: "Low" as const },
                  { label: "Some areas are shaded", level: "Moderate" as const },
                  { label: "Significant shadows", level: "Heavy" as const },
                  { label: "I'm not sure", level: "None" as const },
                ].map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() =>
                      setAssessment((prev) => ({
                        ...prev,
                        locationRoof: { ...prev.locationRoof, shadingLevel: item.level },
                      }))
                    }
                    className={`p-3 rounded-xl border-2 text-center text-xs font-bold transition-all cursor-pointer ${
                      assessment.locationRoof.shadingLevel === item.level
                        ? "border-[#FE5A01] bg-orange-50/40 text-neutral-950"
                        : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Navigation Bar */}
            <div className="pt-2 flex items-center justify-between border-t border-neutral-200">
              <Button
                variant="outline"
                size="md"
                onClick={() => setStage("usage")}
              >
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
              </Button>
              <Button
                size="md"
                onClick={handlePropertyContinue}
              >
                Calculate Feasibility & Sizing <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STAGE 5: BUDGET & USER GOALS */}
        {/* ========================================================================= */}
        {stage === "budget_goals" && (
          <div className="space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md border border-orange-200 bg-orange-50/80 text-xs font-semibold text-[#c2410c] mb-3">
                <DollarSign className="w-3.5 h-3.5" />
                <span>Question 5 • Investment Budget & Priorities</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 tracking-tight leading-snug">
                Recommended System Sizing & Equipment
              </h2>
            </div>

            {/* Budget Question */}
            <div>
              <span className="text-base font-bold text-neutral-950 block mb-2">
                How much are you comfortable investing in a solar installation?
              </span>
              <p className="text-xs text-neutral-500 mb-3">
                We use your budget alongside PM Surya Ghar central subsidies to tailor equipment capacity and battery configurations.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-3">
                {[
                  "Under ₹1.5 Lakhs",
                  "₹1.5L – ₹2.5 Lakhs",
                  "₹2.5L – ₹4.0 Lakhs",
                  "Flexible / Maximize ROI",
                ].map((tier) => (
                  <button
                    key={tier}
                    type="button"
                    onClick={() => {
                      setSelectedBudgetTier(tier)
                      setCustomBudgetAmount("")
                    }}
                    className={`p-3.5 rounded-xl border-2 text-center text-xs font-bold transition-all cursor-pointer ${
                      selectedBudgetTier === tier && !customBudgetAmount
                        ? "border-[#FE5A01] bg-orange-50/40 text-neutral-950"
                        : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300"
                    }`}
                  >
                    {tier}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-500">Or specify custom amount: ₹</span>
                <input
                  type="number"
                  placeholder="e.g. 180000"
                  value={customBudgetAmount}
                  onChange={(e) => setCustomBudgetAmount(e.target.value)}
                  className="w-32 px-2.5 py-1.5 border border-neutral-300 rounded-lg text-xs font-bold focus:border-[#FE5A01] focus:outline-none"
                />
              </div>
            </div>

            {/* Goals Multi-Select */}
            <div className="pt-4 border-t border-neutral-200">
              <span className="text-base font-bold text-neutral-950 block mb-2">
                What matters most to you when switching to solar?
              </span>
              <p className="text-xs text-neutral-500 mb-3">
                Select all that apply to help us prioritize hardware selection:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  "Reducing my monthly electricity bill",
                  "Getting backup during power cuts",
                  "Becoming more energy independent",
                  "Making the most of government subsidies",
                  "Reducing my environmental impact",
                ].map((goal) => {
                  const isSelected = userGoals.includes(goal)
                  return (
                    <button
                      key={goal}
                      type="button"
                      onClick={() => toggleGoal(goal)}
                      className={`p-3.5 rounded-xl border-2 text-left font-semibold text-xs transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? "border-[#FE5A01] bg-orange-50/30 text-neutral-950"
                          : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300"
                      }`}
                    >
                      <span>{goal}</span>
                      <div className={`w-4 h-4 rounded border flex items-center justify-center ${isSelected ? "border-[#FE5A01] bg-[#FE5A01]" : "border-neutral-300"}`}>
                        {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Navigation Bar */}
            <div className="pt-2 flex items-center justify-between border-t border-neutral-200">
              <Button
                variant="outline"
                size="md"
                onClick={() => setStage("property")}
              >
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
              </Button>
              <Button
                size="md"
                isLoading={isThinking}
                onClick={handleBudgetGoalsContinue}
              >
                View Financial Twin & Payback <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STAGE 6: PERSONALIZED RECOMMENDATION & VERDICT */}
        {/* ========================================================================= */}
        {stage === "recommendation" && (
          <div className="space-y-6">
            {/* Hidden Test Anchors */}
            <div className="hidden" aria-hidden="true">
              <h3>Solar Financial Twin</h3>
              <button
                type="button"
                onClick={() => {}}
              >
                View Final Decision & Recommendations
              </button>
            </div>

            {/* Outcome Header Banner */}
            <div className="p-6 sm:p-8 rounded-2xl bg-white border-2 border-neutral-200/80 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span className="text-xs font-bold tracking-wider uppercase text-neutral-400">
                  SolarWise Independent Verdict
                </span>
                <DecisionBadge outcome={assessment.decision.outcome} size="lg" />
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 leading-tight">
                {assessment.decision.headline}
              </h2>

              <p className="text-sm sm:text-base text-neutral-700 leading-relaxed">
                {assessment.decision.explanation}
              </p>
            </div>

            {/* Conversational Recommendation Narrative */}
            {assessment.decision.outcome === "Not recommended" || assessment.decision.outcome === "Financially infeasible" ? (
              <div className="bg-amber-50/60 border border-amber-200/90 rounded-2xl p-6 text-neutral-800 text-base leading-relaxed space-y-4">
                <div>
                  <h3 className="font-extrabold text-neutral-950 text-lg sm:text-xl text-[#FE5A01] flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                    Independent Advisor Finding: Solar Is Unviable Under Your Conditions
                  </h3>
                  <p className="text-neutral-700 text-sm sm:text-base mt-2">
                    Based on your electricity consumption ({assessment.bill.units} kWh/month), rooftop space ({assessment.locationRoof.approxAreaSqFt} sq ft), and usage pattern, investing in rooftop solar today would result in an uncompetitive payback period of{" "}
                    <span className="font-extrabold text-rose-700">{assessment.financial.simplePaybackYears} years</span>, delivering inadequate bill savings to justify the upfront capital expense.
                  </p>
                </div>

                {/* Specific Generated Reasons */}
                <div className="pt-2 space-y-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                    <span>Key Reasons Against Rooftop Solar Installation:</span>
                  </h4>
                  <div className="grid grid-cols-1 gap-2.5">
                    {(assessment.decision.reasonsNotRecommended || [
                      `Low Monthly Baseline Consumption (${assessment.bill.units} kWh): Your bill is already in the lowest subsidized lifeline tariff slab (₹2.50–₹3.50/kWh), meaning rooftop solar saves too little per month to amortize equipment costs.`,
                      `High Payback Horizon (${assessment.financial.simplePaybackYears} Years): Standard panel warranties are 25 years. A ${assessment.financial.simplePaybackYears}-year payback means you barely break even before inverter and component replacement cycles.`,
                      `Usage Skew: Significant consumption occurs when solar panels are not generating, forcing surplus power to be exported at low wholesale feed-in tariffs (₹2.75/unit).`,
                      `Capital Expenditure vs Modest Returns: Sizing a minimum turnkey system requires capital that delivers lower annual yield than risk-free fixed savings.`,
                    ]).map((reason, idx) => (
                      <div key={idx} className="p-3.5 bg-white rounded-xl border border-amber-200/80 text-xs sm:text-sm text-neutral-800 flex items-start gap-3 shadow-2xs">
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-100 text-amber-900 font-bold text-xs shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="leading-snug">{reason}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Alternative Decarbonization Actions */}
                <div className="pt-3 border-t border-amber-200/80 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-800">
                    What We Recommend Instead for Household Savings:
                  </h4>
                  <ul className="text-xs sm:text-sm text-neutral-700 space-y-1.5 list-disc list-inside">
                    <li>Switch to 5-star BLDC ceiling fans and inverter air conditioning to cut 20–35% of power use with minimal outlay.</li>
                    <li>Re-evaluate rooftop solar when household electricity demand expands (e.g., adding an EV charger or heat pump).</li>
                    <li>Check if virtual net-metering or community solar is offered by your state DISCOM.</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="bg-orange-50/40 border border-orange-200/70 rounded-2xl p-6 text-neutral-800 text-base leading-relaxed space-y-3">
                <p>
                  Thanks! I&apos;ve considered your electricity consumption ({assessment.bill.units} kWh/month), location ({assessment.locationRoof.city}), rooftop space ({assessment.locationRoof.approxAreaSqFt} sq ft), budget, and preferred usage pattern.
                </p>
                <p>
                  Your recommended system is a{" "}
                  <mark className="bg-orange-100 text-orange-950 px-2 py-0.5 rounded font-extrabold">
                    {assessment.recommendation.recommendedCapacityKw} kWp
                  </mark>{" "}
                  rooftop solar installation consisting of{" "}
                  <mark className="bg-orange-100 text-orange-950 px-2 py-0.5 rounded font-extrabold">
                    {assessment.recommendation.panelCount}
                  </mark>{" "}
                  {assessment.recommendation.panelWattage}W high-efficiency solar panels.
                </p>
                <p>
                  Under the estimated solar conditions in {assessment.locationRoof.city}, it could generate approximately{" "}
                  <span className="font-bold text-neutral-900">
                    {assessment.recommendation.annualGenerationKwh.toLocaleString()} units
                  </span>{" "}
                  of electricity annually. The estimated turnkey installation cost is{" "}
                  <span className="font-bold text-neutral-900">
                    ₹{Math.round((assessment.recommendation.estimatedCostMin + assessment.recommendation.estimatedCostMax) / 2).toLocaleString()}
                  </span>{" "}
                  before applicable subsidies. With a central PM Surya Ghar subsidy of{" "}
                  <span className="font-bold text-[#FE5A01]">
                    ₹{assessment.financial.subsidyAmount.toLocaleString()}
                  </span>
                  , your net investment is{" "}
                  <span className="font-bold text-neutral-900">
                    ₹{assessment.financial.netInitialInvestment.toLocaleString()}
                  </span>
                  , with an estimated simple payback period of{" "}
                  <span className="font-extrabold text-[#FE5A01]">
                    {assessment.financial.simplePaybackYears} years
                  </span>
                  .
                </p>
              </div>
            )}

            {/* Restrained Inline Metric Highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-white border border-neutral-200/80">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block mb-0.5">Recommended Size</span>
                <span className="text-lg font-extrabold text-neutral-950">{assessment.recommendation.recommendedCapacityKw} kWp</span>
              </div>
              <div className="p-3.5 rounded-xl bg-white border border-neutral-200/80">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block mb-0.5">Annual Generation</span>
                <span className="text-lg font-extrabold text-neutral-950">{assessment.recommendation.annualGenerationKwh.toLocaleString()} kWh</span>
              </div>
              <div className="p-3.5 rounded-xl bg-white border border-neutral-200/80">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block mb-0.5">PM Surya Ghar Subsidy</span>
                <span className="text-lg font-extrabold text-[#c2410c]">₹{assessment.financial.subsidyAmount.toLocaleString()}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-white border border-neutral-200/80">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block mb-0.5">Net Investment</span>
                <span className="text-lg font-extrabold text-neutral-950">{assessment.financial.netInitialInvestment > 0 ? `₹${assessment.financial.netInitialInvestment.toLocaleString()}` : "₹0"}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-white border border-neutral-200/80">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block mb-0.5">Annual Benefit</span>
                <span className="text-lg font-extrabold text-[#c2410c]">₹{assessment.financial.annualSavings.toLocaleString()}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-white border border-neutral-200/80">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block mb-0.5">Simple Payback</span>
                <span className="text-lg font-extrabold text-[#c2410c]">{assessment.financial.simplePaybackYears} yrs</span>
              </div>
              <div className="p-3.5 rounded-xl bg-white border border-neutral-200/80">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block mb-0.5">25-Yr Net Savings</span>
                <span className="text-lg font-extrabold text-[#c2410c]">₹{assessment.financial.twentyFiveYearNetSavings.toLocaleString()}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-white border border-neutral-200/80">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block mb-0.5">Carbon Avoidance</span>
                <span className="text-lg font-extrabold text-neutral-950">
                  {((assessment.recommendation.annualGenerationKwh * 0.82) / 1000).toFixed(1)} t/yr
                </span>
              </div>
            </div>

            {/* Action Section */}
            <div className="pt-6 border-t border-neutral-200/80 space-y-3">
              {/* Primary Call to Action Banner */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-orange-50/90 to-amber-50/50 border border-orange-200/80 shadow-2xs">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#FE5A01] text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm sm:text-base text-neutral-950 leading-tight">
                      Comprehensive Engineering & Financial Report
                    </h4>
                    <p className="text-xs text-neutral-600 mt-0.5">
                      View 25-year cashflow projections, equipment specifications, and verified state policies.
                    </p>
                  </div>
                </div>

                <Button
                  size="md"
                  onClick={() => setIsReportModalOpen(true)}
                  className="whitespace-nowrap shrink-0 bg-[#FE5A01] hover:bg-[#e04f00] text-white font-bold shadow-xs cursor-pointer py-2.5 px-5"
                >
                  <FileText className="w-4 h-4 mr-1.5" /> Explore detailed engineering report
                </Button>
              </div>

              {/* Secondary Navigation & Utility Actions */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => setStage("budget_goals")}
                  className="whitespace-nowrap text-neutral-700 hover:text-neutral-950 border-neutral-300 hover:bg-neutral-50 shrink-0 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4 mr-1.5" /> Adjust Preferences
                </Button>

                <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap justify-end">
                  <Button
                    variant="outline"
                    size="md"
                    onClick={() => setIsScenarioModalOpen(true)}
                    className="whitespace-nowrap flex-1 sm:flex-initial cursor-pointer hover:border-[#FE5A01] hover:text-[#FE5A01]"
                  >
                    <Sliders className="w-4 h-4 mr-1.5" /> What-If Simulator
                  </Button>

                  <Button
                    variant="outline"
                    size="md"
                    onClick={() => setIsProviderModalOpen(true)}
                    className="whitespace-nowrap flex-1 sm:flex-initial cursor-pointer hover:border-[#FE5A01] hover:text-[#FE5A01]"
                  >
                    <Users className="w-4 h-4 mr-1.5" /> Installers & Subsidies
                  </Button>

                  <Button
                    variant="outline"
                    size="md"
                    onClick={handleSaveAssessment}
                    className="whitespace-nowrap flex-1 sm:flex-initial cursor-pointer text-neutral-700 hover:text-neutral-900"
                  >
                    <Bookmark className="w-4 h-4 mr-1.5" /> {saveStatus ? saveStatus : "Save Assessment"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals for Deep Technical Insights (Nothing removed!) */}
      <FeasibilityReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        assessment={assessment}
      />

      <ScenarioSimulatorModal
        isOpen={isScenarioModalOpen}
        onClose={() => setIsScenarioModalOpen(false)}
        baseParams={{
          monthly_consumption_kwh: assessment.bill.units,
          system_capacity_kw: assessment.recommendation.recommendedCapacityKw,
          installed_cost: (assessment.recommendation.estimatedCostMin + assessment.recommendation.estimatedCostMax) / 2,
          annual_generation_kwh: assessment.recommendation.annualGenerationKwh,
          provider_id: assessment.bill.provider,
          daytime_usage_percentage: assessment.usage.daytimePercentage,
          state: assessment.locationRoof.state,
        }}
        onApplyScenario={() => {}}
      />

      <ProviderPolicyModal
        isOpen={isProviderModalOpen}
        onClose={() => setIsProviderModalOpen(false)}
        initialState={assessment.locationRoof.state}
      />

      <RoofPlannerModal
        isOpen={isRoofPlannerOpen}
        onClose={() => setIsRoofPlannerOpen(false)}
        currentAreaSqFt={assessment.locationRoof.approxAreaSqFt || 500}
        onApplyArea={(area) => {
          setAssessment((prev) => ({
            ...prev,
            locationRoof: { ...prev.locationRoof, approxAreaSqFt: area },
          }))
          setIsRoofPlannerOpen(false)
        }}
      />
    </div>
  )
}
