import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import App from "../src/App"

describe("SolarWise Frontend Assessment Flow", () => {
  it("renders the landing page and value proposition", () => {
    render(<App />)
    expect(screen.getByText("SolarWise")).toBeInTheDocument()
    expect(screen.getByText(/Should Your Household/i)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Start Free Assessment/i })).toBeInTheDocument()
  })

  it("navigates into bill upload step on Start Assessment click", () => {
    render(<App />)
    const startButton = screen.getByRole("button", { name: /Start Free Assessment/i })
    fireEvent.click(startButton)

    expect(screen.getByText(/Upload Electricity Bill/i)).toBeInTheDocument()
    expect(screen.getByText(/Privacy Guarantee/i)).toBeInTheDocument()
  })

  it("can select the unviable low consumption scenario and reach 'Not Recommended' decision", () => {
    render(<App />)
    // Click 'Low Usage / Unviable Case' preset
    const unviablePreset = screen.getByRole("button", { name: /Low Usage \/ Unviable Case/i })
    fireEvent.click(unviablePreset)

    // Should be at step 1
    expect(screen.getByText(/Upload Electricity Bill/i)).toBeInTheDocument()
    // Skip to manual entry or analyze
    const analyzeBtn = screen.getByRole("button", { name: /Or enter bill details manually/i })
    fireEvent.click(analyzeBtn)

    // Step 2: Confirm Bill Data
    expect(screen.getByText(/Confirm Extracted Bill Data/i)).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: /Confirm & Continue/i }))

    // Step 3: Household Usage
    expect(screen.getByText(/Daytime vs\. Nighttime Electricity Usage/i)).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: /Continue to Roof & Location/i }))

    // Step 4: Location & Roof
    expect(screen.getByText(/Location & Rooftop Characteristics/i)).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: /Calculate Feasibility & Sizing/i }))

    // Step 5: Solar Recommendation
    expect(screen.getByText(/Recommended System Sizing & Equipment/i)).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: /View Financial Twin & Payback/i }))

    // Step 6: Financial Twin
    expect(screen.getByText(/Solar Financial Twin/i)).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: /View Final Decision & Recommendations/i }))

    // Step 7: Decision Summary - Verdict must be "Not recommended"
    expect(screen.getByText(/Installing solar is not financially justified/i)).toBeInTheDocument()
    expect(screen.getByText(/Not Recommended/i)).toBeInTheDocument()
  })

  it("can select the viable scenario and reach 'Attractive' decision with 4.2-year payback", () => {
    render(<App />)
    const viablePreset = screen.getByRole("button", { name: /Standard Viable Case/i })
    fireEvent.click(viablePreset)

    // Step 1 -> Step 2
    fireEvent.click(screen.getByRole("button", { name: /Or enter bill details manually/i }))
    // Step 2 -> Step 3
    fireEvent.click(screen.getByRole("button", { name: /Confirm & Continue/i }))
    // Step 3 -> Step 4
    fireEvent.click(screen.getByRole("button", { name: /Continue to Roof & Location/i }))
    // Step 4 -> Step 5
    fireEvent.click(screen.getByRole("button", { name: /Calculate Feasibility & Sizing/i }))
    // Step 5 -> Step 6
    fireEvent.click(screen.getByRole("button", { name: /View Financial Twin & Payback/i }))
    // Step 6 -> Step 7
    fireEvent.click(screen.getByRole("button", { name: /View Final Decision & Recommendations/i }))

    // Step 7: Verdict must be "Attractive"
    expect(screen.getByText(/Solar is highly feasible and financially rewarding/i)).toBeInTheDocument()
    expect(screen.getByText(/Attractive/i)).toBeInTheDocument()
    expect(screen.getByText(/4.2 yrs/i)).toBeInTheDocument()
  })
})
