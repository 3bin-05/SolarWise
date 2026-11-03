import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import { SolarRecommendationStep } from "../src/features/assessment/SolarRecommendationStep"
import { defaultAttractiveAssessment } from "../src/data/mockAssessment"
import { api } from "../src/services/api"
import { SolarRecommendation } from "../src/types/assessment"

describe("Solar Recommendation & Sizing Step", () => {
  const baseRecommendation = defaultAttractiveAssessment.recommendation

  it("renders system sizing metrics and equipment highlights", () => {
    const handleContinue = vi.fn()
    const handleBack = vi.fn()

    render(
      <SolarRecommendationStep
        recommendation={baseRecommendation}
        onContinue={handleContinue}
        onBack={handleBack}
      />
    )

    expect(screen.getByText("Recommended System Sizing & Equipment")).toBeInTheDocument()
    expect(screen.getByText(/On-grid Architecture/i)).toBeInTheDocument()
    expect(screen.getByText("System Capacity")).toBeInTheDocument()
    expect(screen.getByText("Annual Generation")).toBeInTheDocument()
    expect(screen.getByText("Estimated Cost Range")).toBeInTheDocument()
    expect(screen.getByText("Inverter Sizing")).toBeInTheDocument()
    expect(screen.getByText("Matched Hardware Components")).toBeInTheDocument()
  })

  it("displays matched hardware details and technical constraints when present", () => {
    const enrichedRec: SolarRecommendation = {
      ...baseRecommendation,
      panelModel: {
        id: "adani-mono-perc-440",
        manufacturer: "Adani Solar",
        model: "Elan Shine 440W",
        technology: "Mono PERC",
        rated_power_w: 440,
        efficiency_pct: 20.9,
        dimensions_mm: { length: 2094, width: 1038, thickness: 35 },
        area_sqm: 2.17,
        temp_coefficient_pmax: -0.36,
        warranty_years_product: 12,
        warranty_years_performance: 25,
        estimated_price_inr: 9240,
        description: "Premium half-cut mono PERC module.",
      },
      inverterModel: {
        id: "solis-1p-3k",
        manufacturer: "Solis",
        model: "S6-GR1P3K",
        inverter_type: "string",
        rated_output_power_kw: 3.0,
        phase: "single-phase",
        mppt_trackers: 2,
        max_efficiency_pct: 97.7,
        euro_efficiency_pct: 97.1,
        max_recommended_pv_power_kw: 4.5,
        max_dc_voltage_v: 600,
        battery_compatible: false,
        warranty_years: 5,
        estimated_price_inr: 31000,
        description: "Dual MPPT single-phase grid-tied string inverter.",
      },
      technicalConstraints: [
        {
          name: "Rooftop Space Clearance",
          status: "pass",
          value: "350 sq ft / 650 sq ft available",
          message: "Array fits comfortably within roof boundaries.",
        },
        {
          name: "Grid Interconnection Sanctioned Load",
          status: "pass",
          value: "3.52 kWp ≤ 5.0 kW sanctioned",
          message: "Complies with net-metering limit.",
        },
      ],
    }

    render(
      <SolarRecommendationStep
        recommendation={enrichedRec}
        onContinue={vi.fn()}
        onBack={vi.fn()}
      />
    )

    expect(screen.getByText("Elan Shine 440W")).toBeInTheDocument()
    expect(screen.getByText("Adani Solar")).toBeInTheDocument()
    expect(screen.getByText("S6-GR1P3K")).toBeInTheDocument()
    expect(screen.getByText("Rooftop Space Clearance")).toBeInTheDocument()
    expect(screen.getByText("Grid Interconnection Sanctioned Load")).toBeInTheDocument()
  })

  it("handles user navigation button clicks", () => {
    const handleContinue = vi.fn()
    const handleBack = vi.fn()

    render(
      <SolarRecommendationStep
        recommendation={baseRecommendation}
        onContinue={handleContinue}
        onBack={handleBack}
      />
    )

    const continueBtn = screen.getByRole("button", { name: /View Financial Twin & Payback/i })
    fireEvent.click(continueBtn)
    expect(handleContinue).toHaveBeenCalledTimes(1)

    const backBtn = screen.getByRole("button", { name: /^Back$/i })
    fireEvent.click(backBtn)
    expect(handleBack).toHaveBeenCalledTimes(1)
  })

  it("calculates realistic recommendation with API service fallback", async () => {
    const result = await api.fetchSolarRecommendation({
      monthly_consumption_kwh: 420,
      roof_area_sqft: 500,
      weekly_outage_hours: 0,
      city: "Bangalore",
    })

    expect(result.recommendedCapacityKw).toBeGreaterThan(2.5)
    expect(result.panelCount).toBeGreaterThanOrEqual(6)
    expect(result.annualGenerationKwh).toBeGreaterThan(3500)
    expect(result.systemType).toBe("On-grid")
    expect(result.batteryRecommended).toBe(false)
  })

  it("triggers hybrid and battery storage when weekly outages exceed threshold", async () => {
    const result = await api.fetchSolarRecommendation({
      monthly_consumption_kwh: 450,
      roof_area_sqft: 500,
      weekly_outage_hours: 5.0,
      city: "Kochi",
    })

    expect(result.systemType).toBe("Hybrid")
    expect(result.batteryRecommended).toBe(true)
    expect(result.batteryCapacityKwh).toBeGreaterThanOrEqual(3.5)
  })
})
