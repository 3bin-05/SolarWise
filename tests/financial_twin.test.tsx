import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import { FinancialTwinStep } from "../src/features/assessment/FinancialTwinStep"
import { defaultAttractiveAssessment } from "../src/data/mockAssessment"
import { api } from "../src/services/api"

describe("Solar Financial Twin Step", () => {
  const financial = defaultAttractiveAssessment.financial

  it("renders key financial metrics and annual savings", () => {
    const handleContinue = vi.fn()
    const handleBack = vi.fn()

    render(
      <FinancialTwinStep
        financial={financial}
        onContinue={handleContinue}
        onBack={handleBack}
      />
    )

    expect(screen.getByText("Solar Financial Twin")).toBeInTheDocument()
    expect(screen.getByText("Annual Savings")).toBeInTheDocument()
    expect(screen.getByText("Simple Payback")).toBeInTheDocument()
    expect(screen.getByText("Net Investment")).toBeInTheDocument()
    expect(screen.getByText("25-Year Net Benefit")).toBeInTheDocument()
    expect(screen.getByText("Self-Consumption Savings")).toBeInTheDocument()
    expect(screen.getByText("Export Feed-in Benefit")).toBeInTheDocument()
    expect(screen.getByText("Cumulative Savings Horizon")).toBeInTheDocument()
  })

  it("triggers onContinue and onBack callbacks correctly", () => {
    const handleContinue = vi.fn()
    const handleBack = vi.fn()

    render(
      <FinancialTwinStep
        financial={financial}
        onContinue={handleContinue}
        onBack={handleBack}
      />
    )

    const continueBtn = screen.getByRole("button", { name: /View Final Decision & Recommendations/i })
    fireEvent.click(continueBtn)
    expect(handleContinue).toHaveBeenCalledTimes(1)

    const backBtn = screen.getByRole("button", { name: /^Back$/i })
    fireEvent.click(backBtn)
    expect(handleBack).toHaveBeenCalledTimes(1)
  })

  it("computes realistic financial twin with API fallback", async () => {
    const result = await api.calculateFinancialAssessment({
      monthly_consumption_kwh: 420,
      system_capacity_kw: 3.5,
      installed_cost: 190000,
      annual_generation_kwh: 5000,
    })

    expect(result.financial.annualSavings).toBeGreaterThan(20000)
    expect(result.financial.selfConsumptionSavings).toBeGreaterThan(0)
    expect(result.financial.subsidyAmount).toBe(78000)
    expect(result.financial.netInitialInvestment).toBeLessThan(190000)
    expect(result.financial.simplePaybackYears).toBeLessThan(8.5)
    expect(["Strongly attractive", "Attractive"]).toContain(result.decision.outcome)
  })
})
