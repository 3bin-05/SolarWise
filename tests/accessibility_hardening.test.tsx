import { describe, it, expect, vi } from "vitest"
import { render, fireEvent } from "@testing-library/react"
import { FeasibilityReportModal } from "../src/features/assessment/FeasibilityReportModal"
import { ScenarioSimulatorModal } from "../src/features/assessment/ScenarioSimulatorModal"
import { ProviderPolicyModal } from "../src/features/assessment/ProviderPolicyModal"
import { ForecastDemandModal } from "../src/features/assessment/ForecastDemandModal"
import { defaultAttractiveAssessment } from "../src/data/mockAssessment"
import {
  formatCapacity,
  formatCurrency,
  formatEnergy,
  formatPaybackYears,
  formatPercentage,
  safeNumber,
} from "../src/lib/formatters"

describe("SolarWise Accessibility & Hardening", () => {
  describe("Defensive Formatters", () => {
    it("safely handles null, undefined, NaN, and string inputs", () => {
      expect(safeNumber(null)).toBe(0)
      expect(safeNumber(undefined)).toBe(0)
      expect(safeNumber(NaN, 10)).toBe(10)
      expect(safeNumber("150.5")).toBe(150.5)
      expect(safeNumber("invalid", 5)).toBe(5)
    })

    it("formats currency defensively in Indian numbering system", () => {
      expect(formatCurrency(null)).toBe("₹0")
      expect(formatCurrency(undefined)).toBe("₹0")
      expect(formatCurrency(185000)).toMatch(/₹1,?85,?000/)
      expect(formatCurrency(1234.56, "₹", true)).toMatch(/₹1,?234\.56/)
    })

    it("formats energy and capacity numbers defensively", () => {
      expect(formatEnergy(null)).toBe("0 kWh")
      expect(formatEnergy(4500)).toMatch(/4,?500 kWh/)
      expect(formatCapacity(null)).toBe("0.00 kWp")
      expect(formatCapacity(3.3)).toBe("3.30 kWp")
    })

    it("formats percentages and payback periods defensively", () => {
      expect(formatPercentage(null)).toBe("0.0%")
      expect(formatPercentage(24.56)).toBe("24.6%")
      expect(formatPaybackYears(0)).toBe("Immediate")
      expect(formatPaybackYears(3.2)).toBe("3.2 yrs")
      expect(formatPaybackYears(30)).toBe("> 25 yrs")
      expect(formatPaybackYears(null)).toBe("> 25 yrs")
    })
  })

  describe("Keyboard Navigation & Modal Escape Closing", () => {
    it("closes FeasibilityReportModal on Escape keydown", () => {
      const onClose = vi.fn()
      render(
        <FeasibilityReportModal
          isOpen={true}
          onClose={onClose}
          assessment={defaultAttractiveAssessment}
        />
      )

      fireEvent.keyDown(window, { key: "Escape" })
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it("closes ScenarioSimulatorModal on Escape keydown", () => {
      const onClose = vi.fn()
      render(
        <ScenarioSimulatorModal
          isOpen={true}
          onClose={onClose}
          baseParams={{
            monthly_consumption_kwh: 400,
            system_capacity_kw: 3.0,
            installed_cost: 180000,
            annual_generation_kwh: 4200,
            daytime_usage_percentage: 45,
            evaluation_horizon_years: 25,
          }}
        />
      )

      fireEvent.keyDown(window, { key: "Escape" })
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it("closes ProviderPolicyModal on Escape keydown", () => {
      const onClose = vi.fn()
      render(
        <ProviderPolicyModal
          isOpen={true}
          onClose={onClose}
          initialState="Karnataka"
        />
      )

      fireEvent.keyDown(window, { key: "Escape" })
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it("closes ForecastDemandModal on Escape keydown", () => {
      const onClose = vi.fn()
      render(
        <ForecastDemandModal
          isOpen={true}
          onClose={onClose}
          currentMonthlyUnits={400}
        />
      )

      fireEvent.keyDown(window, { key: "Escape" })
      expect(onClose).toHaveBeenCalledTimes(1)
    })
  })
})

