import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import { DecisionSummaryStep } from "../src/features/assessment/DecisionSummaryStep"
import {
  defaultAttractiveAssessment,
  lowConsumptionNotRecommendedAssessment,
} from "../src/data/mockAssessment"

describe("Decision Summary Step", () => {
  it("renders attractive verdict with positive factors and high confidence", () => {
    const handleRestart = vi.fn()
    const handleExport = vi.fn()
    const handleBack = vi.fn()

    render(
      <DecisionSummaryStep
        decision={defaultAttractiveAssessment.decision}
        recommendation={defaultAttractiveAssessment.recommendation}
        financial={defaultAttractiveAssessment.financial}
        onRestart={handleRestart}
        onExport={handleExport}
        onBack={handleBack}
      />
    )

    expect(screen.getByText("SolarWise Independent Verdict")).toBeInTheDocument()
    expect(screen.getByText("Attractive")).toBeInTheDocument()
    expect(screen.getByText(defaultAttractiveAssessment.decision.headline)).toBeInTheDocument()
    expect(screen.getByText("Why SolarWise Reached This Conclusion")).toBeInTheDocument()
    expect(screen.getByText("Actionable Household Guidance")).toBeInTheDocument()
  })

  it("renders not recommended verdict for low consumption scenario", () => {
    render(
      <DecisionSummaryStep
        decision={lowConsumptionNotRecommendedAssessment.decision}
        recommendation={lowConsumptionNotRecommendedAssessment.recommendation}
        financial={lowConsumptionNotRecommendedAssessment.financial}
        onRestart={vi.fn()}
        onExport={vi.fn()}
        onBack={vi.fn()}
      />
    )

    expect(screen.getByText("Not Recommended")).toBeInTheDocument()
    expect(
      screen.getByText(lowConsumptionNotRecommendedAssessment.decision.headline)
    ).toBeInTheDocument()
  })

  it("fires action button events on click", () => {
    const handleRestart = vi.fn()
    const handleExport = vi.fn()
    const handleBack = vi.fn()

    render(
      <DecisionSummaryStep
        decision={defaultAttractiveAssessment.decision}
        recommendation={defaultAttractiveAssessment.recommendation}
        financial={defaultAttractiveAssessment.financial}
        onRestart={handleRestart}
        onExport={handleExport}
        onBack={handleBack}
      />
    )

    fireEvent.click(screen.getByRole("button", { name: /Export Feasibility Report/i }))
    expect(handleExport).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByRole("button", { name: /New Assessment/i }))
    expect(handleRestart).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByRole("button", { name: /^Back$/i }))
    expect(handleBack).toHaveBeenCalledTimes(1)
  })
})
