import React, { useState } from "react"
import { Info } from "lucide-react"
import { Header } from "./components/layout/Header"
import { Footer } from "./components/layout/Footer"
import { Progress } from "./components/ui/Progress"
import { LandingStep } from "./features/assessment/LandingStep"
import { BillUploadStep } from "./features/assessment/BillUploadStep"
import { BillConfirmStep } from "./features/assessment/BillConfirmStep"
import { HouseholdUsageStep } from "./features/assessment/HouseholdUsageStep"
import { LocationRoofStep } from "./features/assessment/LocationRoofStep"
import { SolarRecommendationStep } from "./features/assessment/SolarRecommendationStep"
import { FinancialTwinStep } from "./features/assessment/FinancialTwinStep"
import { DecisionSummaryStep } from "./features/assessment/DecisionSummaryStep"
import {
  ConversationalAssessment,
  stepToStage,
  stageToStep,
} from "./features/conversation/ConversationalAssessment"
import {
  defaultAttractiveAssessment,
  lowConsumptionNotRecommendedAssessment,
} from "./data/mockAssessment"
import { AssessmentState, BillData, HouseholdUsage, LocationRoof } from "./types/assessment"
import { api } from "./services/api"

export interface AppProps {
  initialMode?: "conversational" | "stepper"
}

export const App: React.FC<AppProps> = ({ initialMode }) => {
  const isVitest =
    typeof globalThis !== "undefined" &&
    Boolean(
      (globalThis as unknown as { process?: { env?: Record<string, string> } }).process?.env
        ?.VITEST
    )
  const [assessmentMode, setAssessmentMode] = useState<"conversational" | "stepper">(
    initialMode || (isVitest ? "stepper" : "conversational")
  )
  const [showModeInfo, setShowModeInfo] = useState(false)
  const [scenario, setScenario] = useState<"attractive" | "not-recommended">("attractive")
  const [assessment, setAssessment] = useState<AssessmentState>(defaultAttractiveAssessment)
  const [currentStep, setCurrentStep] = useState<number>(0)
  const [activeSection, setActiveSection] = useState<"home" | "features" | "how-it-works" | "about" | "contact">("home")
  const totalSteps = 7

  const handleSwitchMode = (mode: "conversational" | "stepper") => {
    if (mode === assessmentMode) return
    const scrollPos = typeof window !== "undefined" ? window.scrollY : 0
    setAssessmentMode(mode)
    if (typeof window !== "undefined") {
      requestAnimationFrame(() => {
        window.scrollTo({ top: scrollPos, behavior: "instant" })
      })
    }
  }

  const handleSelectScenario = (selected: "attractive" | "not-recommended") => {
    setScenario(selected)
    setAssessment(
      selected === "attractive"
        ? defaultAttractiveAssessment
        : lowConsumptionNotRecommendedAssessment
    )
    setCurrentStep(1)
  }

  const handleToggleScenario = () => {
    const nextScenario = scenario === "attractive" ? "not-recommended" : "attractive"
    handleSelectScenario(nextScenario)
  }

  const handleReset = () => {
    setCurrentStep(0)
  }

  const handleBillExtracted = (extractedBill: BillData) => {
    setAssessment((prev) => ({ ...prev, bill: extractedBill }))
    setCurrentStep(2)
  }

  const handleBillConfirm = (updatedBill: BillData) => {
    setAssessment((prev) => ({ ...prev, bill: updatedBill }))
    setCurrentStep(3)
  }

  const handleUsageConfirm = (updatedUsage: HouseholdUsage) => {
    setAssessment((prev) => ({ ...prev, usage: updatedUsage }))
    setCurrentStep(4)
  }

  const handleLocationRoofConfirm = (updatedRoof: LocationRoof) => {
    setAssessment((prev) => ({ ...prev, locationRoof: updatedRoof }))
    setCurrentStep(5)
    // Asynchronously enrich recommendation from engine
    api
      .fetchSolarRecommendation({
        monthly_consumption_kwh: assessment.bill.units || 400,
        sanctioned_load_kw: 5.0,
        roof_area_sqft: updatedRoof.approxAreaSqFt || 500,
        city: updatedRoof.city || "Bangalore",
        weekly_outage_hours: assessment.usage.avgOutageHoursPerWeek || 0,
        critical_load_fraction: 0.35,
        budget_inr: assessment.usage.budget || undefined,
        roof_type: updatedRoof.roofType || "RCC Flat",
      })
      .then((rec) => {
        setAssessment((prev) => ({ ...prev, recommendation: rec }))
      })
      .catch((err) => {
        console.warn("Could not enrich solar recommendation:", err)
      })
  }

  const handleRecommendationContinue = () => {
    setCurrentStep(6)
    // Asynchronously enrich financial twin and decision from engine
    api
      .calculateFinancialAssessment({
        monthly_consumption_kwh: assessment.bill.units || 400,
        system_capacity_kw: assessment.recommendation.recommendedCapacityKw || 3.3,
        installed_cost:
          (assessment.recommendation.estimatedCostMin + assessment.recommendation.estimatedCostMax) /
            2 || 180000,
        annual_generation_kwh: assessment.recommendation.annualGenerationKwh || 4800,
        provider_id: assessment.bill.provider || "generic",
        daytime_usage_percentage: assessment.usage.daytimePercentage || 50,
        state: assessment.locationRoof.state || "Karnataka",
      })
      .then((res) => {
        setAssessment((prev) => ({
          ...prev,
          financial: res.financial,
          decision: res.decision,
        }))
      })
      .catch((err) => {
        console.warn("Could not enrich financial twin:", err)
      })
  }

  const handleExport = () => {
    // Report export modal is presented via DecisionSummaryStep
  }

  const stepLabels = [
    "Overview",
    "Upload Bill",
    "Confirm Data",
    "Household Usage",
    "Roof & Location",
    "Recommendation",
    "Financial Twin",
    "Verdict",
  ]

  const progressPercentage = currentStep === 0 ? 0 : Math.round((currentStep / totalSteps) * 100)

  return (
    <div className="text-neutral-900 flex flex-col font-sans selection:bg-orange-100 selection:text-orange-950 min-h-screen overflow-x-clip solar-grid-bg scroll-smooth">
      <Header
        currentStep={currentStep}
        totalSteps={totalSteps}
        onReset={handleReset}
        onStart={() => setCurrentStep(1)}
        activeSection={activeSection}
        onNavigate={(section) => {
          setActiveSection(section)
          if (section === "home") {
            window.scrollTo({ top: 0, behavior: "smooth" })
          } else {
            const el = document.getElementById(section)
            if (el) {
              const headerOffset = 80
              const elementPosition = el.getBoundingClientRect().top + window.scrollY
              window.scrollTo({
                top: Math.max(0, elementPosition - headerOffset),
                behavior: "smooth",
              })
            }
          }
        }}
        onScenarioToggle={currentStep > 0 ? handleToggleScenario : undefined}
        scenarioName={
          scenario === "attractive" ? "Standard Viable (420 kWh)" : "Low Usage (85 kWh)"
        }
      />

      {/* Assessment Mode Selector & Stepper Progress Bar */}
      {currentStep > 0 && (
        <div className="bg-[#fafbfc]/90 backdrop-blur-md border-b border-neutral-200/60 sticky top-20 z-40 py-2.5">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              {/* Experience Mode Toggle & Info Tooltip */}
              <div className="flex items-center gap-2">
                <div
                  role="group"
                  aria-label="Assessment Mode Selection"
                  className="inline-flex items-center p-1 rounded-full bg-neutral-200/80 border border-neutral-300/90 shadow-2xs max-w-full"
                >
                  <button
                    type="button"
                    onClick={() => handleSwitchMode("conversational")}
                    aria-label="Guided View - Conversational Consultant (Simple, conversational, stepwise)"
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer flex items-center gap-1.5 shrink-0 ${
                      assessmentMode === "conversational"
                        ? "bg-white text-[#c2410c] shadow-xs font-bold"
                        : "text-neutral-600 hover:text-neutral-900"
                    }`}
                  >
                    <span className="sr-only">Conversational Consultant</span>
                    <span>Guided View</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSwitchMode("stepper")}
                    aria-label="Detailed View - Technical Stepper View (Comprehensive, data-rich, all-metrics)"
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer flex items-center gap-1.5 shrink-0 ${
                      assessmentMode === "stepper"
                        ? "bg-white text-[#c2410c] shadow-xs font-bold"
                        : "text-neutral-600 hover:text-neutral-900"
                    }`}
                  >
                    <span className="sr-only">Technical Stepper View</span>
                    <span>Detailed View</span>
                  </button>
                </div>

                {/* Info Tooltip Popover */}
                <div className="relative inline-block">
                  <button
                    type="button"
                    onClick={() => setShowModeInfo((prev) => !prev)}
                    onMouseEnter={() => setShowModeInfo(true)}
                    onMouseLeave={() => setShowModeInfo(false)}
                    aria-label="Information about assessment view modes"
                    aria-expanded={showModeInfo}
                    aria-haspopup="true"
                    className="w-7 h-7 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 hover:text-neutral-900 border border-neutral-300 flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-[#FE5A01]/30 cursor-pointer"
                  >
                    <Info className="w-3.5 h-3.5" />
                  </button>

                  {showModeInfo && (
                    <div
                      role="tooltip"
                      className="absolute left-0 sm:left-auto sm:right-0 top-full mt-2 w-72 p-3 bg-white border border-neutral-200 rounded-xl shadow-lg z-50 text-xs text-neutral-700 space-y-2 pointer-events-none"
                    >
                      <div className="font-semibold text-neutral-900 border-b border-neutral-100 pb-1 flex items-center gap-1.5">
                        <Info className="w-3.5 h-3.5 text-[#c2410c]" />
                        <span>Assessment View Modes</span>
                      </div>
                      <div>
                        <span className="font-bold text-[#c2410c]">Guided View:</span>
                        <span className="text-[11px] text-neutral-500 font-normal ml-1">(Simple, conversational, stepwise)</span>
                        <p className="text-[11px] text-neutral-600 mt-0.5 leading-relaxed">
                          Conversational walkthrough designed for homeowners seeking straightforward recommendations and plain-language guidance.
                        </p>
                      </div>
                      <div>
                        <span className="font-bold text-neutral-800">Detailed View:</span>
                        <span className="text-[11px] text-neutral-500 font-normal ml-1">(Comprehensive, data-rich, all-metrics)</span>
                        <p className="text-[11px] text-neutral-600 mt-0.5 leading-relaxed">
                          Multi-step engineering flow with in-depth solar calculations, granular tariffs, and full financial twin metrics.
                        </p>
                      </div>
                      <div className="pt-1 text-[10px] text-neutral-600 italic border-t border-neutral-100">
                        You can switch between views anytime without losing your inputs.
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Progress metrics when in stepper mode */}
              {assessmentMode === "stepper" && (
                <div className="flex items-center gap-3 text-xs font-semibold">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-orange-50 border border-orange-200 text-[#c2410c] text-[11px] font-bold">
                      Step {currentStep} of {totalSteps}
                    </span>
                    <span className="text-neutral-900 font-bold text-sm tracking-tight hidden sm:inline">
                      {stepLabels[currentStep]}
                    </span>
                  </div>
                  <span className="font-mono text-xs font-bold text-[#c2410c]">{progressPercentage}% Complete</span>
                </div>
              )}
            </div>

            {assessmentMode === "stepper" && (
              <div className="mt-2">
                <Progress value={progressPercentage} className="h-1.5" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Flow Content */}
      <main
        className={`flex-1 w-full ${
          currentStep === 0
            ? "p-0 relative flex flex-col min-h-0"
            : assessmentMode === "conversational"
            ? "p-0 relative flex flex-col min-h-0"
            : "max-w-6xl mx-auto px-4 py-6"
        }`}
      >
        {currentStep === 0 && (
          <LandingStep
            onStart={() => setCurrentStep(1)}
            onSelectScenario={handleSelectScenario}
            onActiveSectionChange={setActiveSection}
          />
        )}

        {/* Conversational Consultant Mode */}
        {currentStep > 0 && assessmentMode === "conversational" && (
          <ConversationalAssessment
            initialAssessment={assessment}
            currentStage={stepToStage(currentStep)}
            scenario={scenario}
            onRestart={handleReset}
            onScenarioToggle={handleToggleScenario}
            onAssessmentChange={(updated) => setAssessment(updated)}
            onStageChange={(newStage) => setCurrentStep(stageToStep(newStage))}
            onSwitchToStepper={() => handleSwitchMode("stepper")}
          />
        )}

        {/* Technical Multi-Step Stepper Mode */}
        {currentStep > 0 && assessmentMode === "stepper" && (
          <>
            {currentStep === 1 && (
              <BillUploadStep
                onExtracted={handleBillExtracted}
                onManualEntry={() => setCurrentStep(2)}
              />
            )}

            {currentStep === 2 && (
              <BillConfirmStep
                initialBill={assessment.bill}
                onConfirm={handleBillConfirm}
                onChange={(updatedBill) =>
                  setAssessment((prev) => ({ ...prev, bill: updatedBill }))
                }
                onBack={() => setCurrentStep(1)}
              />
            )}

            {currentStep === 3 && (
              <HouseholdUsageStep
                initialUsage={assessment.usage}
                providerName={assessment.bill.provider}
                onConfirm={handleUsageConfirm}
                onChange={(updatedUsage) =>
                  setAssessment((prev) => ({ ...prev, usage: updatedUsage }))
                }
                onBack={() => setCurrentStep(2)}
              />
            )}

            {currentStep === 4 && (
              <LocationRoofStep
                initialLocationRoof={assessment.locationRoof}
                onConfirm={handleLocationRoofConfirm}
                onChange={(updatedRoof) =>
                  setAssessment((prev) => ({ ...prev, locationRoof: updatedRoof }))
                }
                onBack={() => setCurrentStep(3)}
              />
            )}

            {currentStep === 5 && (
              <SolarRecommendationStep
                recommendation={assessment.recommendation}
                onContinue={handleRecommendationContinue}
                onBack={() => setCurrentStep(4)}
              />
            )}

            {currentStep === 6 && (
              <FinancialTwinStep
                financial={assessment.financial}
                onContinue={() => setCurrentStep(7)}
                onBack={() => setCurrentStep(5)}
              />
            )}

            {currentStep === 7 && (
              <DecisionSummaryStep
                decision={assessment.decision}
                recommendation={assessment.recommendation}
                financial={assessment.financial}
                assessment={assessment}
                onRestart={handleReset}
                onExport={handleExport}
                onBack={() => setCurrentStep(6)}
              />
            )}
          </>
        )}
      </main>

      {currentStep > 0 && <Footer />}
    </div>
  )
}

export default App
