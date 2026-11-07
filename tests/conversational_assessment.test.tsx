import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import { ConversationalAssessment } from "../src/features/conversation/ConversationalAssessment"
import { App } from "../src/App"
import { defaultAttractiveAssessment } from "../src/data/mockAssessment"

describe("SolarWise Conversational Assessment Consultant", () => {
  it("renders Stage 1 opening question and guidance text", () => {
    render(
      <ConversationalAssessment
        initialAssessment={defaultAttractiveAssessment}
        onRestart={vi.fn()}
      />
    )

    // Opening conversational question
    expect(
      screen.getByText(/Let's start by understanding your electricity consumption/i)
    ).toBeInTheDocument()

    // Why it matters guidance
    expect(
      screen.getByText(/Why this matters:/i)
    ).toBeInTheDocument()

    // Upload & Manual entry options
    expect(screen.getByText(/Upload Electricity Bill/i)).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: /Or enter bill details manually without uploading/i })
    ).toBeInTheDocument()
  })

  it("presents extracted bill as a conversational paragraph with confirm and edit options", async () => {
    render(
      <ConversationalAssessment
        initialAssessment={defaultAttractiveAssessment}
        onRestart={vi.fn()}
      />
    )

    // Click sample bill preset to advance to bill_confirm
    const bescomSample = screen.getByRole("button", { name: /BESCOM Bangalore/i })
    fireEvent.click(bescomSample)

    // Stage 2 conversational paragraph
    await waitFor(() => {
      expect(screen.getByText(/Great! I've reviewed your electricity bill/i)).toBeInTheDocument()
    })

    expect(screen.getByText(/Does everything look correct\?/i)).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: /Yes, everything looks correct/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: /No, I'd like to correct something/i })
    ).toBeInTheDocument()
  })

  it("handles PM Surya Ghar educational branching for 'No, what is it?'", async () => {
    render(
      <ConversationalAssessment
        initialAssessment={defaultAttractiveAssessment}
        onRestart={vi.fn()}
      />
    )

    // Advance past bill
    fireEvent.click(screen.getByRole("button", { name: /BESCOM Bangalore/i }))
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Yes, everything looks correct/i })).toBeInTheDocument()
    })
    fireEvent.click(screen.getByRole("button", { name: /Yes, everything looks correct/i }))
    fireEvent.click(screen.getByRole("button", { name: /Confirm & Continue/i }))

    // Stage 3: PM Surya Ghar question
    expect(
      screen.getByText(/Have you heard about the PM Surya Ghar: Muft Bijli Yojana\?/i)
    ).toBeInTheDocument()

    // Click "No, what is it?"
    const noBtn = screen.getByRole("button", { name: /No, what is it\?/i })
    fireEvent.click(noBtn)

    // Expect educational explanation with ₹78,000 subsidy and 300 free units details
    expect(
      screen.getByText(/central financial assistance of up to ₹78,000/i)
    ).toBeInTheDocument()
    expect(
      screen.getByText(/generation of up to 300 units of electricity per month/i)
    ).toBeInTheDocument()

    // Check residential eligibility answer
    const yesButtons = screen.getAllByRole("button", { name: /^Yes$/i })
    fireEvent.click(yesButtons[0])

    // Continue to next question
    const continueBtn = screen.getByRole("button", { name: /Continue to Electricity Usage/i })
    fireEvent.click(continueBtn)

    // Next stage: Household usage timing
    expect(
      screen.getByText(/When does your home usually consume the most electricity\?/i)
    ).toBeInTheDocument()
  })

  it("navigates through household usage, property, and reaches honest recommendation verdict", async () => {
    render(
      <ConversationalAssessment
        initialAssessment={defaultAttractiveAssessment}
        scenario="attractive"
        onRestart={vi.fn()}
      />
    )

    // Step 1 -> Step 2
    fireEvent.click(screen.getByRole("button", { name: /BESCOM Bangalore/i }))
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Yes, everything looks correct/i })).toBeInTheDocument()
    })

    // Step 2 -> Step 3
    fireEvent.click(screen.getByRole("button", { name: /Yes, everything looks correct/i }))
    fireEvent.click(screen.getByRole("button", { name: /Confirm & Continue/i }))

    // Step 3 (Surya Ghar: Yes) -> Step 4
    fireEvent.click(screen.getByRole("button", { name: /Yes, I know about it/i }))
    const yesButtons = screen.getAllByRole("button", { name: /^Yes$/i })
    fireEvent.click(yesButtons[0])
    fireEvent.click(screen.getByRole("button", { name: /Continue to Electricity Usage/i }))

    // Step 4: Usage
    expect(screen.getByText(/When does your home usually consume the most electricity\?/i)).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: /Mostly during the day/i }))
    fireEvent.click(screen.getByRole("button", { name: /Rarely/i }))
    fireEvent.click(screen.getByRole("button", { name: /Continue to Roof & Location/i }))

    // Step 5: Property
    expect(screen.getByText(/Where is your home located\?/i)).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: /Calculate Feasibility & Sizing/i }))

    // Step 6: Budget & Goals
    expect(screen.getByText(/How much are you comfortable investing in a solar installation\?/i)).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: /View Financial Twin & Payback/i }))

    // Step 7: Personalized Recommendation Narrative & Verdict Badge
    await waitFor(() => {
      expect(screen.getByText(/Your recommended system is a/i)).toBeInTheDocument()
    })

    // Verdict Badge
    expect(screen.getByText(/Strongly attractive|Attractive/i)).toBeInTheDocument()

    // 8-Metric Summary Grid
    expect(screen.getByText(/Recommended Size/i)).toBeInTheDocument()
    expect(screen.getAllByText(/Net Investment/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Simple Payback/i).length).toBeGreaterThan(0)

    // Engineering Report Modal trigger
    const reportBtn = screen.getByRole("button", { name: /Explore detailed engineering report/i })
    expect(reportBtn).toBeInTheDocument()
    fireEvent.click(reportBtn)

    // Feasibility report modal should be open
    await waitFor(() => {
      expect(screen.getByText(/Solar Feasibility & Engineering Docket/i)).toBeInTheDocument()
    })
  })

  it("supports mode switching between Conversational Consultant and Technical Stepper in App", async () => {
    render(<App initialMode="conversational" />)

    // Start assessment from landing
    const startButton = screen.getByRole("button", { name: /Start Free Assessment/i })
    fireEvent.click(startButton)

    // Should render Conversational Consultant
    expect(
      screen.getByText(/Let's start by understanding your electricity consumption/i)
    ).toBeInTheDocument()

    // Switch to Technical Stepper View
    const stepperToggle = screen.getByRole("button", { name: /Technical Stepper View/i })
    fireEvent.click(stepperToggle)

    // Should now show Stepper elements
    expect(screen.getByText(/Upload Electricity Bill/i)).toBeInTheDocument()
    expect(screen.getAllByText(/Step 1 of 7/i).length).toBeGreaterThan(0)

    // Switch back to Conversational Consultant
    const convToggle = screen.getByRole("button", { name: /Conversational Consultant/i })
    fireEvent.click(convToggle)

    // Should return to conversational prompt
    expect(
      screen.getByText(/Let's start by understanding your electricity consumption/i)
    ).toBeInTheDocument()
  })

  it("shows mode tooltip and guarantees two-way step and data synchronization between Guided View and Detailed View", async () => {
    render(<App initialMode="conversational" />)

    // Start assessment
    fireEvent.click(screen.getByRole("button", { name: /Start Free Assessment/i }))

    // Verify Guided View and Detailed View buttons are present in the mode toggle
    expect(screen.getByRole("button", { name: /Guided View/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Detailed View - Technical Stepper View/i })).toBeInTheDocument()

    // Test info tooltip button
    const infoBtn = screen.getByRole("button", { name: /Information about assessment view modes/i })
    expect(infoBtn).toBeInTheDocument()
    fireEvent.click(infoBtn)
    expect(screen.getByRole("tooltip")).toBeInTheDocument()
    expect(screen.getByText(/Assessment View Modes/i)).toBeInTheDocument()

    // In Guided View (Stage 1), select a bill preset to advance to Stage 2
    fireEvent.click(screen.getByRole("button", { name: /BESCOM Bangalore/i }))
    await waitFor(() => {
      expect(screen.getByText(/Great! I've reviewed your electricity bill/i)).toBeInTheDocument()
    })

    // Now switch to Detailed View (Stepper)
    const detailedToggle = screen.getByRole("button", { name: /Detailed View - Technical Stepper View/i })
    fireEvent.click(detailedToggle)

    // Detailed View must automatically be at Step 2 (Confirm Data) without resetting to Step 1!
    expect(screen.getAllByText(/Step 2 of 7/i).length).toBeGreaterThan(0)
    expect(screen.getByText(/Confirm Extracted Bill Data/i)).toBeInTheDocument()
    // Verify extracted bill data is retained in Step 2 inputs
    expect(screen.getByDisplayValue("450")).toBeInTheDocument()

    // Switch back to Guided View
    const guidedToggle = screen.getByRole("button", { name: /Guided View - Conversational Consultant/i })
    fireEvent.click(guidedToggle)

    // Guided View should remain at Stage 2 without resetting!
    expect(screen.getByText(/Great! I've reviewed your electricity bill/i)).toBeInTheDocument()
  })
})
