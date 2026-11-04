import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { api } from "../src/services/api"
import { ScenarioSimulatorModal } from "../src/features/assessment/ScenarioSimulatorModal"

describe("SolarWise Scenario Simulator & Sensitivity Engine", () => {
  const mockBaseParams = {
    monthly_consumption_kwh: 400,
    system_capacity_kw: 3.0,
    installed_cost: 175000,
    annual_generation_kwh: 4350,
    daytime_usage_percentage: 45,
    evaluation_horizon_years: 25,
  }

  it("runs api.simulateScenarios with local fallback when backend is offline", async () => {
    const res = await api.simulateScenarios({
      base_request: mockBaseParams,
      overrides: {
        system_capacity_kw: 4.0,
        battery_capacity_kwh: 5.0,
      },
    })

    expect(res).toBeDefined()
    expect(res.simulated_case).toBeDefined()
    expect(res.simulated_case.simple_payback_years).toBeGreaterThan(0)
    expect(res.comparative_scenarios).toHaveLength(4)

    const names = res.comparative_scenarios.map((s) => s.name)
    expect(names).toContain("Conservative Case")
    expect(names).toContain("Base Recommended")
    expect(names).toContain("Optimistic Case")
    expect(names).toContain("Solar + Battery Storage")

    expect(res.sensitivity_tariff_escalation.length).toBeGreaterThanOrEqual(4)
    expect(res.sensitivity_capital_cost.length).toBeGreaterThanOrEqual(4)
    expect(res.sensitivity_daytime_usage.length).toBeGreaterThanOrEqual(4)
    expect(res.simulation_insights.length).toBeGreaterThan(0)
  })

  it("renders ScenarioSimulatorModal and switches between comparison and sensitivity views", async () => {
    const handleClose = vi.fn()
    const handleApply = vi.fn()

    render(
      <ScenarioSimulatorModal
        isOpen={true}
        onClose={handleClose}
        baseParams={mockBaseParams}
        onApplyScenario={handleApply}
      />
    )

    expect(screen.getByText("Scenario Simulator & Sensitivity Engine")).toBeInTheDocument()
    expect(screen.getByText("Parametric Simulation Controls")).toBeInTheDocument()

    // Wait for simulation to run and comparison cards to appear
    await waitFor(() => {
      expect(screen.getByText("Conservative Case")).toBeInTheDocument()
      expect(screen.getByText("Solar + Battery Storage")).toBeInTheDocument()
    })

    // Switch tab to sensitivity curves
    const sensTab = screen.getByRole("button", { name: /parametric sensitivity curves/i })
    fireEvent.click(sensTab)

    await waitFor(() => {
      expect(screen.getByText("Tariff Escalation Sensitivity")).toBeInTheDocument()
      expect(screen.getByText("Capital Cost Sensitivity")).toBeInTheDocument()
      expect(screen.getByText("Daytime Usage Sensitivity")).toBeInTheDocument()
    })

    // Click Apply button
    const applyBtn = screen.getByRole("button", { name: /apply scenario to assessment/i })
    fireEvent.click(applyBtn)

    expect(handleApply).toHaveBeenCalled()
    expect(handleClose).toHaveBeenCalled()
  })

  it("updates battery capacity in modal when 5 kWh option is selected", async () => {
    render(
      <ScenarioSimulatorModal
        isOpen={true}
        onClose={vi.fn()}
        baseParams={mockBaseParams}
      />
    )

    const battery5Btn = screen.getByRole("button", { name: "5 kWh" })
    fireEvent.click(battery5Btn)

    await waitFor(() => {
      expect(screen.getByText(/5 kWh \(\+₹1,?10,?000\)/i)).toBeInTheDocument()
    })
  })
})
