import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import { BillUploadStep } from "../src/features/assessment/BillUploadStep"
import { BillConfirmStep } from "../src/features/assessment/BillConfirmStep"
import { BillData } from "../src/types/assessment"

const mockBill: BillData = {
  provider: "KSEB (Kerala)",
  consumerCategory: "Domestic LT-1A",
  billingPeriod: "Oct 2026",
  billingDays: 30,
  units: 320,
  totalBill: 2150,
  energyCharges: 1780,
  fixedCharges: 240,
  taxesAndAdjustments: 130,
  meterType: "Single Phase",
  isConfidenceHigh: true,
  validationWarnings: [],
}

describe("Smart Bill Analyzer Components", () => {
  it("renders BillUploadStep with dropzone and verified sample presets", () => {
    const handleExtracted = vi.fn()
    const handleManual = vi.fn()

    render(<BillUploadStep onExtracted={handleExtracted} onManualEntry={handleManual} />)

    expect(screen.getByText("Upload Electricity Bill")).toBeInTheDocument()
    expect(screen.getByText("KSEB Kerala")).toBeInTheDocument()
    expect(screen.getByText("BESCOM Bangalore")).toBeInTheDocument()
    expect(screen.getByText("Low Consumption")).toBeInTheDocument()
  })

  it("loads sample preset on click in BillUploadStep", async () => {
    const handleExtracted = vi.fn()
    const handleManual = vi.fn()

    render(<BillUploadStep onExtracted={handleExtracted} onManualEntry={handleManual} />)

    const ksebPresetBtn = screen.getByText("KSEB Kerala")
    fireEvent.click(ksebPresetBtn)

    await waitFor(() => {
      expect(handleExtracted).toHaveBeenCalledWith(
        expect.objectContaining({
          provider: "KSEB (Kerala)",
          units: 320,
          totalBill: 2150,
        })
      )
    })
  })

  it("renders BillConfirmStep with arithmetic verification and inputs", () => {
    const handleConfirm = vi.fn()
    const handleBack = vi.fn()

    render(
      <BillConfirmStep
        initialBill={mockBill}
        onConfirm={handleConfirm}
        onBack={handleBack}
      />
    )

    expect(screen.getByText("Confirm Extracted Bill Data")).toBeInTheDocument()
    expect(screen.getByDisplayValue("320")).toBeInTheDocument()
    expect(screen.getByDisplayValue("2150")).toBeInTheDocument()
    expect(screen.getByText("High Confidence")).toBeInTheDocument()
  })

  it("detects and flags arithmetic discrepancy on edited values", async () => {
    const handleConfirm = vi.fn()
    const handleBack = vi.fn()

    render(
      <BillConfirmStep
        initialBill={mockBill}
        onConfirm={handleConfirm}
        onBack={handleBack}
      />
    )

    // Edit Total Bill to an arbitrary mismatching value (e.g. 5000)
    const totalBillInput = screen.getByDisplayValue("2150")
    fireEvent.change(totalBillInput, { target: { value: "5000" } })

    await waitFor(() => {
      expect(screen.getByText(/Arithmetic Discrepancy Detected/i)).toBeInTheDocument()
    })
  })
})

