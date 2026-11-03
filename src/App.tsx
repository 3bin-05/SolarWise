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
import {
  defaultAttractiveAssessment,
  lowConsumptionNotRecommendedAssessment,
} from "./data/mockAssessment"
import { AssessmentState, BillData, HouseholdUsage, LocationRoof } from "./types/assessment"
import { api } from "./services/api"

export const App: React.FC = () => {
  const [scenario, setScenario] = useState<"attractive" | "not-recommended">("attractive")
  const [assessment, setAssessment] = useState<AssessmentState>(defaultAttractiveAssessment)
  const [currentStep, setCurrentStep] = useState<number>(0)
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
        roof_type: updatedRoof.roofType || "RCC Flat",
      })
      .then((rec) => {
        setAssessment((prev) => ({ ...prev, recommendation: rec }))
      })
      .catch((err) => {
        console.warn("Could not enrich solar recommendation:", err)
      })
  }

  const handleExport = () => {
    alert(
      `Solar Feasibility Report (${
        scenario === "attractive" ? "Attractive" : "Not Recommended"
      } Scenario)\n\nSystem: ${assessment.recommendation.recommendedCapacityKw} kW\nVerdict: ${
        assessment.decision.outcome
      }\nSimple Payback: ${assessment.financial.simplePaybackYears} years\nConfidence: ${
        assessment.decision.confidenceScore
      }%\n\nFull PDF report generation will be connected in Phase 12.`
    )
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
    <div className="min-h-screen bg-neutral-50/60 text-neutral-900 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
      <Header
        currentStep={currentStep}
        totalSteps={totalSteps}
        onReset={handleReset}
        onScenarioToggle={currentStep > 0 ? handleToggleScenario : undefined}
        scenarioName={
          scenario === "attractive" ? "Standard Viable (420 kWh)" : "Low Usage (85 kWh)"
        }
      />

      {/* Stepper Progress Bar */}
      {currentStep > 0 && (
        <div className="bg-white border-b border-neutral-200/80 sticky top-16 z-40">
          <div className="max-w-4xl mx-auto px-4 py-2.5">
            <div className="flex items-center justify-between text-xs font-semibold text-neutral-500 mb-1.5">
              <span>
                Step {currentStep} of {totalSteps}: {stepLabels[currentStep]}
              </span>
              <span className="font-mono text-emerald-700">{progressPercentage}% Complete</span>
            </div>
            <Progress value={progressPercentage} className="h-1.5" />
          </div>
        </div>
      )}

      {/* Main Flow Content */}
      <main className="flex-1 max-w-6xl mx-auto px-4 py-6 w-full">
        {currentStep === 0 && (
          <LandingStep
            onStart={() => setCurrentStep(1)}
            onSelectScenario={handleSelectScenario}
          />
        )}

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
            onContinue={() => setCurrentStep(6)}
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
            onRestart={handleReset}
            onExport={handleExport}
            onBack={() => setCurrentStep(6)}
          />
        )}
      </main>

      <Footer />
    </div>
  )
}

export default App
