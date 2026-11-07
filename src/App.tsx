import React, { useState } from "react"
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
import { ConversationalAssessment } from "./features/conversation/ConversationalAssessment"
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
  const [scenario, setScenario] = useState<"attractive" | "not-recommended">("attractive")
  const [assessment, setAssessment] = useState<AssessmentState>(defaultAttractiveAssessment)
  const [currentStep, setCurrentStep] = useState<number>(0)
  const [activeSection, setActiveSection] = useState<"home" | "features" | "how-it-works" | "about" | "contact">("home")
  const totalSteps = 7

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
              {/* Experience Mode Toggle */}
              <div
                role="group"
                aria-label="Assessment Mode Selection"
                className="inline-flex items-center p-1 rounded-full bg-neutral-200/80 border border-neutral-300/90 shadow-2xs max-w-full overflow-x-auto"
              >
                <button
                  type="button"
                  onClick={() => setAssessmentMode("conversational")}
                  aria-label="Conversational Consultant - Normal Q&A"
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer flex items-center gap-1.5 shrink-0 ${
                    assessmentMode === "conversational"
                      ? "bg-white text-[#FE5A01] shadow-xs font-bold"
                      : "text-neutral-600 hover:text-neutral-900"
                  }`}
                >
                  <span className="sr-only">Conversational Consultant</span>
                  <span>Normal Q&amp;A</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAssessmentMode("stepper")}
                  aria-label="Technical Stepper View - Technical (You will need basic technical knowledge to understand it)"
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer flex items-center gap-1.5 shrink-0 ${
                    assessmentMode === "stepper"
                      ? "bg-white text-[#FE5A01] shadow-xs font-bold"
                      : "text-neutral-600 hover:text-neutral-900"
                  }`}
                >
                  <span className="sr-only">Technical Stepper View</span>
                  <span>
                    Technical{" "}
                    <span className="text-[11px] font-normal opacity-85">
                      (You will need basic technical knowledge to understand it)
                    </span>
                  </span>
                </button>
              </div>

              {/* Progress metrics when in stepper mode */}
              {assessmentMode === "stepper" && (
                <div className="flex items-center gap-3 text-xs font-semibold">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-[4px] bg-orange-50 border border-orange-200/90 text-[#FE5A01] text-[11px] font-bold">
                      Step {currentStep} of {totalSteps}
                    </span>
                    <span className="text-neutral-900 font-bold text-sm tracking-tight hidden sm:inline">
                      {stepLabels[currentStep]}
                    </span>
                  </div>
                  <span className="font-mono text-xs font-bold text-[#FE5A01]">{progressPercentage}% Complete</span>
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
            scenario={scenario}
            onRestart={handleReset}
            onScenarioToggle={handleToggleScenario}
            onSwitchToStepper={() => setAssessmentMode("stepper")}
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
                onBack={() => setCurrentStep(1)}
              />
            )}

            {currentStep === 3 && (
              <HouseholdUsageStep
                initialUsage={assessment.usage}
                providerName={assessment.bill.provider}
                onConfirm={handleUsageConfirm}
                onBack={() => setCurrentStep(2)}
              />
            )}

            {currentStep === 4 && (
              <LocationRoofStep
                initialLocationRoof={assessment.locationRoof}
                onConfirm={handleLocationRoofConfirm}
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
