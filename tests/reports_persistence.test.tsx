import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { api, ReportExportRequest } from "../src/services/api"
import { FeasibilityReportModal } from "../src/features/assessment/FeasibilityReportModal"
import { DecisionSummaryStep } from "../src/features/assessment/DecisionSummaryStep"
import { defaultAttractiveAssessment } from "../src/data/mockAssessment"

describe("SolarWise Persistence & Feasibility Reports", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    localStorage.clear()
  })

  it("exports feasibility report with complete technical and financial docket", async () => {
    const payload: ReportExportRequest = {
      title: "SolarWise Household Feasibility Docket",
      bill_data: { units: 450, provider: "BESCOM" },
      recommendation_data: {
        recommendedCapacityKw: 3.5,
        panelWattage: 550,
        panelCount: 7,
      },
      financial_twin_data: {
        netInitialInvestment: 110000,
        annualSavings: 34000,
        simplePaybackYears: 3.2,
      },
      decision_data: {
        outcome: "Attractive",
        headline: "Highly Viable",
        confidenceScore: 94,
      },
    }

    const report = await api.exportReport(payload)
    expect(report).toBeDefined()
    expect(report.report_id).toMatch(/^SW-REP-/)
    expect(report.summary.verdict_outcome).toBe("Attractive")
    expect(report.technical.capacity_kw).toBeGreaterThan(0)
    expect(report.financial.simple_payback_years).toBeGreaterThan(0)
    expect(report.policy_sources.length).toBeGreaterThan(0)
    expect(report.matched_providers.length).toBeGreaterThan(0)
  })

  it("generates standalone printable HTML docket", async () => {
    const payload: ReportExportRequest = {
      title: "Test Feasibility Docket",
      bill_data: { units: 400 },
      financial_twin_data: { netInitialInvestment: 100000, annualSavings: 30000 },
    }

    const html = await api.getReportHtml(payload)
    expect(html).toContain("<!DOCTYPE html>")
    expect(html).toContain("SolarWise")
    expect(html).toContain("@media print")
  })

  it("saves assessment locally when backend is offline and stores in localStorage", async () => {
    const result = await api.saveAssessment(defaultAttractiveAssessment)
    expect(result.id).toBeDefined()
    expect(result.status).toBe("saved_locally")

    const stored = localStorage.getItem(`solarwise_assessment_${result.id}`)
    expect(stored).not.toBeNull()
    const parsed = JSON.parse(stored!)
    expect(parsed.bill.units).toBe(defaultAttractiveAssessment.bill.units)
  })

  it("renders FeasibilityReportModal with metrics and allows switching tabs", async () => {
    render(
      <FeasibilityReportModal
        isOpen={true}
        onClose={vi.fn()}
        assessment={defaultAttractiveAssessment}
      />
    )

    // Wait for report compilation
    await waitFor(() => {
      expect(screen.getByText("Recommended PV")).toBeInTheDocument()
    })

    // Check key metric cards
    expect(screen.getByText("Simple Payback")).toBeInTheDocument()
    expect(screen.getByText("Net Outlay")).toBeInTheDocument()

    // Switch to Technical Specs tab
    const techTab = screen.getByRole("button", { name: /Technical Specs/i })
    fireEvent.click(techTab)
    expect(screen.getByText("Engineered Hardware Architecture")).toBeInTheDocument()
    expect(screen.getByText(/Photovoltaic Modules/i)).toBeInTheDocument()

    // Switch to Financial Twin tab
    const finTab = screen.getByRole("button", { name: /Financial Twin/i })
    fireEvent.click(finTab)
    expect(screen.getByText("25-Year Lifecycle Financial Twin")).toBeInTheDocument()
    expect(screen.getByText(/Turnkey Capital Cost/i)).toBeInTheDocument()

    // Switch to Policy & Providers tab
    const provTab = screen.getByRole("button", { name: /Policy & Providers/i })
    fireEvent.click(provTab)
    expect(screen.getByText(/Applicable Subsidy Schemes/i)).toBeInTheDocument()
    expect(screen.getByText(/Empaneled Solar Installers/i)).toBeInTheDocument()
  })

  it("triggers report modal when Export button is clicked in DecisionSummaryStep", async () => {
    const onExportMock = vi.fn()
    render(
      <DecisionSummaryStep
        decision={defaultAttractiveAssessment.decision}
        recommendation={defaultAttractiveAssessment.recommendation}
        financial={defaultAttractiveAssessment.financial}
        assessment={defaultAttractiveAssessment}
        onRestart={vi.fn()}
        onExport={onExportMock}
        onBack={vi.fn()}
      />
    )

    const exportBtn = screen.getByRole("button", { name: /Export Feasibility Report/i })
    fireEvent.click(exportBtn)

    expect(onExportMock).toHaveBeenCalledTimes(1)
    await waitFor(() => {
      expect(screen.getByText("Solar Feasibility & Engineering Docket")).toBeInTheDocument()
    })
  })
})
