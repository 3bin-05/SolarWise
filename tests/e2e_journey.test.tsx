import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import App from "../src/App"

describe("SolarWise End-to-End User Journeys", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    localStorage.clear()
  })

  it("completes the full viable assessment journey to Attractive verdict and feasibility report", async () => {
    render(<App />)

    // Step 0: Landing
    expect(screen.getByText("SolarWise")).toBeInTheDocument()
    const startAttractiveBtn = screen.getByRole("button", {
      name: /Standard Viable Case/i,
    })
    fireEvent.click(startAttractiveBtn)

    // Step 1: Bill Upload
    expect(screen.getByText("Upload Electricity Bill")).toBeInTheDocument()
    const bescomPreset = screen.getByText("BESCOM Bangalore")
    fireEvent.click(bescomPreset)

    // Step 2: Confirm Bill Data
    await waitFor(() => {
      expect(screen.getByText("Confirm Extracted Bill Data")).toBeInTheDocument()
    })
    const confirmBillBtn = screen.getByRole("button", { name: /Confirm & Continue/i })
    fireEvent.click(confirmBillBtn)

    // Step 3: Household Usage
    await waitFor(() => {
      expect(screen.getByText("Daytime vs. Nighttime Electricity Usage")).toBeInTheDocument()
    })
    const confirmUsageBtn = screen.getByRole("button", { name: /Continue to Roof & Location/i })
    fireEvent.click(confirmUsageBtn)

    // Step 4: Location & Roof
    await waitFor(() => {
      expect(screen.getByText("Location & Rooftop Characteristics")).toBeInTheDocument()
    })
    const confirmRoofBtn = screen.getByRole("button", { name: /Calculate Feasibility & Sizing/i })
    fireEvent.click(confirmRoofBtn)

    // Step 5: Solar Recommendation
    await waitFor(() => {
      expect(screen.getByText("Recommended System Sizing & Equipment")).toBeInTheDocument()
    })
    const viewTwinBtn = screen.getByRole("button", { name: /View Financial Twin & Payback/i })
    fireEvent.click(viewTwinBtn)

    // Step 6: Financial Twin
    await waitFor(() => {
      expect(screen.getByText("Solar Financial Twin")).toBeInTheDocument()
    })
    const viewDecisionBtn = screen.getByRole("button", { name: /View Final Decision & Recommendations/i })
    fireEvent.click(viewDecisionBtn)

    // Step 7: Decision Summary
    await waitFor(() => {
      expect(screen.getByText("SolarWise Independent Verdict")).toBeInTheDocument()
    })
    expect(screen.getByText(/Solar is highly feasible and financially rewarding/i)).toBeInTheDocument()

    // Open Feasibility Report Modal
    const exportBtn = screen.getByRole("button", { name: /Export Feasibility Report/i })
    fireEvent.click(exportBtn)

    await waitFor(
      () => {
        expect(screen.getByText("Recommended PV")).toBeInTheDocument()
      },
      { timeout: 3000 }
    )

    // Verify docket components
    expect(screen.getAllByText("Simple Payback").length).toBeGreaterThan(0)
    expect(screen.getAllByText("Net Outlay").length).toBeGreaterThan(0)

    // Test Save Assessment
    const saveBtn = screen.getByRole("button", { name: /Save Assessment/i })
    fireEvent.click(saveBtn)
    await waitFor(() => {
      expect(screen.getAllByText(/Saved/i).length).toBeGreaterThan(0)
    })
  })

  it("completes the unviable low-consumption journey and verifies 'Not Recommended' decision", async () => {
    render(<App />)

    // Select Low Consumption scenario from landing page
    const unviableBtn = screen.getByRole("button", {
      name: /Low Usage \/ Unviable Case/i,
    })
    fireEvent.click(unviableBtn)

    // Step 1: Upload step with low usage preset
    expect(screen.getByText("Upload Electricity Bill")).toBeInTheDocument()
    const lowUsagePreset = screen.getByText("Low Consumption")
    fireEvent.click(lowUsagePreset)

    // Step 2: Confirm Bill
    await waitFor(() => {
      expect(screen.getByText("Confirm Extracted Bill Data")).toBeInTheDocument()
    })
    fireEvent.click(screen.getByRole("button", { name: /Confirm & Continue/i }))

    // Step 3: Usage
    await waitFor(() => {
      expect(screen.getByText("Daytime vs. Nighttime Electricity Usage")).toBeInTheDocument()
    })
    fireEvent.click(screen.getByRole("button", { name: /Continue to Roof & Location/i }))

    // Step 4: Roof
    await waitFor(() => {
      expect(screen.getByText("Location & Rooftop Characteristics")).toBeInTheDocument()
    })
    fireEvent.click(screen.getByRole("button", { name: /Calculate Feasibility & Sizing/i }))

    // Step 5: Recommendation
    await waitFor(() => {
      expect(screen.getByText("Recommended System Sizing & Equipment")).toBeInTheDocument()
    })
    fireEvent.click(screen.getByRole("button", { name: /View Financial Twin & Payback/i }))

    // Step 6: Financial Twin
    await waitFor(() => {
      expect(screen.getByText("Solar Financial Twin")).toBeInTheDocument()
    })
    fireEvent.click(screen.getByRole("button", { name: /View Final Decision & Recommendations/i }))

    // Step 7: Decision Summary - MUST recommend against solar!
    await waitFor(() => {
      expect(screen.getByText("SolarWise Independent Verdict")).toBeInTheDocument()
    })
    expect(screen.getByText(/Installing solar is not financially justified/i)).toBeInTheDocument()
    expect(screen.getByText(/Not Recommended/i)).toBeInTheDocument()
    expect(
      screen.getByText(/Why SolarWise Reached This Conclusion/i)
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Actionable Household Guidance/i)
    ).toBeInTheDocument()
  })
})
