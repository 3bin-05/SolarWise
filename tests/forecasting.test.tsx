import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { api } from "../src/services/api"
import { ForecastDemandModal } from "../src/features/assessment/ForecastDemandModal"

describe("SolarWise ML Forecasting & Demand Model", () => {
  it("runs api.forecastConsumption with local fallback when backend is offline", async () => {
    const res = await api.forecastConsumption({
      historical_consumption: [300, 320, 400, 550, 640, 600, 520, 490, 450, 360, 290, 280],
      climate_zone: "composite",
      annual_growth_rate_pct: 2.0,
      horizon_months: 12,
    })

    expect(res).toBeDefined()
    expect(res.forecast).toHaveLength(12)
    expect(res.total_annual_forecast_kwh).toBeGreaterThan(0)
    expect(res.peak_monthly_kwh).toBeGreaterThan(res.min_monthly_kwh)
    expect(res.confidence_score).toBeGreaterThan(0.5)

    // Check prediction interval monotonicity: lower <= forecast <= upper
    for (const pt of res.forecast) {
      expect(pt.lower_bound_kwh).toBeLessThanOrEqual(pt.forecast_kwh)
      expect(pt.forecast_kwh).toBeLessThanOrEqual(pt.upper_bound_kwh)
    }
  })

  it("applies appliance addition loads correctly in api.forecastConsumption", async () => {
    const resBase = await api.forecastConsumption({
      historical_consumption: [350, 350, 350, 350, 350, 350, 350, 350, 350, 350, 350, 350],
      horizon_months: 12,
    })

    const resEV = await api.forecastConsumption({
      historical_consumption: [350, 350, 350, 350, 350, 350, 350, 350, 350, 350, 350, 350],
      horizon_months: 12,
      planned_additions: [
        { name: "EV", monthly_kwh: 200, start_month_index: 3 },
      ],
    })

    expect(resEV.total_annual_forecast_kwh).toBeGreaterThan(resBase.total_annual_forecast_kwh)
    // Month index 1 (Jan) should have no EV load; Month index 3 (Mar) should have EV load
    const m1Diff = resEV.forecast[0].forecast_kwh - resBase.forecast[0].forecast_kwh
    const m3Diff = resEV.forecast[2].forecast_kwh - resBase.forecast[2].forecast_kwh
    expect(m1Diff).toBeLessThan(50)
    expect(m3Diff).toBeGreaterThanOrEqual(180)
  })

  it("retrieves model card with empirical benchmark citations", async () => {
    const card = await api.getModelCard()
    expect(card.model_name).toContain("SolarWise Seasonal Demand Forecaster")
    expect(card.dataset_source).toContain("Prayas")
    expect(card.metrics_summary.length).toBeGreaterThanOrEqual(4)
    expect(card.metrics_summary[0].improvement_pct).toBeGreaterThan(50)
  })

  it("renders ForecastDemandModal with seasonal chart and appliance controls", async () => {
    const handleClose = vi.fn()
    const handleApply = vi.fn()

    render(
      <ForecastDemandModal
        isOpen={true}
        onClose={handleClose}
        currentMonthlyUnits={400}
        onApplyProjectedUnits={handleApply}
      />
    )

    expect(screen.getByText("Future Demand & Seasonal Forecaster")).toBeInTheDocument()
    expect(screen.getByText("Electric Vehicle (4W / 2W)")).toBeInTheDocument()
    expect(screen.getByText("Additional 1.5-Ton Inverter AC")).toBeInTheDocument()

    // Open Model Card
    const modelCardBtn = screen.getByRole("button", { name: /model card/i })
    fireEvent.click(modelCardBtn)

    await waitFor(() => {
      expect(screen.getByText(/Validation Protocol:/i)).toBeInTheDocument()
      expect(screen.getByText(/Composite \(Delhi\)/i)).toBeInTheDocument()
    })

    // Click Apply button
    const applyBtn = screen.getByRole("button", { name: /apply .* to sizing/i })
    fireEvent.click(applyBtn)
    expect(handleApply).toHaveBeenCalled()
    expect(handleClose).toHaveBeenCalled()
  })
})
