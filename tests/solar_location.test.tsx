import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import { LocationRoofStep } from "../src/features/assessment/LocationRoofStep"
import { LocationRoof } from "../src/types/assessment"

const mockLocationRoof: LocationRoof = {
  city: "Kochi",
  state: "Kerala",
  postalCode: "682001",
  roofType: "RCC Flat",
  approxAreaSqFt: 800,
  shadingLevel: "Low",
}

describe("Solar Location & Rooftop Step", () => {
  it("renders LocationRoofStep with roof types and shading options", () => {
    const handleConfirm = vi.fn()
    const handleBack = vi.fn()

    render(
      <LocationRoofStep
        initialLocationRoof={mockLocationRoof}
        onConfirm={handleConfirm}
        onBack={handleBack}
      />
    )

    expect(screen.getByText("Location & Rooftop Characteristics")).toBeInTheDocument()
    expect(screen.getByDisplayValue("Kochi")).toBeInTheDocument()
    expect(screen.getByDisplayValue("Kerala")).toBeInTheDocument()
    expect(screen.getByDisplayValue("800")).toBeInTheDocument()
    expect(screen.getByText("RCC Flat")).toBeInTheDocument()
    expect(screen.getByText("Sloped Tiled")).toBeInTheDocument()
  })

  it("updates roof type and triggers confirm callback", async () => {
    const handleConfirm = vi.fn()
    const handleBack = vi.fn()

    render(
      <LocationRoofStep
        initialLocationRoof={mockLocationRoof}
        onConfirm={handleConfirm}
        onBack={handleBack}
      />
    )

    const metalBtn = screen.getByText("Metal Sheet")
    fireEvent.click(metalBtn)

    const confirmBtn = screen.getByRole("button", { name: /Calculate Feasibility & Sizing/i })
    fireEvent.click(confirmBtn)

    expect(handleConfirm).toHaveBeenCalledWith(
      expect.objectContaining({
        roofType: "Metal Sheet",
      })
    )
  })

  it("shows heavy shading warning when selected", async () => {
    const handleConfirm = vi.fn()
    const handleBack = vi.fn()

    render(
      <LocationRoofStep
        initialLocationRoof={mockLocationRoof}
        onConfirm={handleConfirm}
        onBack={handleBack}
      />
    )

    const heavyShadeBtn = screen.getByText("Heavy")
    fireEvent.click(heavyShadeBtn)

    expect(await screen.findByText(/Heavy shading derates solar output by ~30%/i)).toBeInTheDocument()
  })
})

