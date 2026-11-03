import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import { HouseholdUsageStep } from "../src/features/assessment/HouseholdUsageStep"
import { HouseholdUsage } from "../src/types/assessment"

const mockUsage: HouseholdUsage = {
  monthlyUnits: 320,
  daytimePercentage: 40,
  nighttimePercentage: 60,
  hasFrequentOutages: false,
  avgOutageHoursPerWeek: 0,
  budget: 200000,
}

describe("Energy Usage Intelligence Component", () => {
  it("renders HouseholdUsageStep with diurnal slider and annual projections", () => {
    const handleConfirm = vi.fn()
    const handleBack = vi.fn()

    render(
      <HouseholdUsageStep
        initialUsage={mockUsage}
        providerName="kseb"
        onConfirm={handleConfirm}
        onBack={handleBack}
      />
    )

    expect(screen.getByText("Daytime vs. Nighttime Electricity Usage")).toBeInTheDocument()
    expect(screen.getByText(/Daytime: 40%/i)).toBeInTheDocument()
    expect(screen.getByText(/Nighttime: 60%/i)).toBeInTheDocument()
    expect(screen.getByText("Projected Annual Demand")).toBeInTheDocument()
    expect(screen.getByText("Avoided Marginal Tariff")).toBeInTheDocument()
  })

  it("updates daytime percentage when slider moves", () => {
    const handleConfirm = vi.fn()
    const handleBack = vi.fn()

    render(
      <HouseholdUsageStep
        initialUsage={mockUsage}
        providerName="kseb"
        onConfirm={handleConfirm}
        onBack={handleBack}
      />
    )

    const slider = screen.getByRole("slider")
    fireEvent.change(slider, { target: { value: "65" } })

    expect(screen.getByText(/Daytime: 65%/i)).toBeInTheDocument()
    expect(screen.getByText(/Nighttime: 35%/i)).toBeInTheDocument()
  })

  it("shows low consumption advisory when monthly units are below 120", async () => {
    const handleConfirm = vi.fn()
    const handleBack = vi.fn()

    render(
      <HouseholdUsageStep
        initialUsage={{ ...mockUsage, monthlyUnits: 75 }}
        providerName="kseb"
        onConfirm={handleConfirm}
        onBack={handleBack}
      />
    )

    const continueBtn = screen.getByRole("button", { name: /Continue to Roof & Location/i })
    fireEvent.click(continueBtn)

    expect(handleConfirm).toHaveBeenCalledWith(
      expect.objectContaining({
        monthlyUnits: 75,
      })
    )
  })
})

