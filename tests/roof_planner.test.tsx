import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import { RoofPlannerModal } from "../src/features/assessment/RoofPlannerModal"
import { LocationRoofStep } from "../src/features/assessment/LocationRoofStep"
import { defaultAttractiveAssessment } from "../src/data/mockAssessment"
import { api } from "../src/services/api"

describe("Solar Roof Digital Planner", () => {
  it("renders modal when open and displays controls", () => {
    const handleClose = vi.fn()
    const handleApply = vi.fn()

    render(
      <RoofPlannerModal
        isOpen={true}
        onClose={handleClose}
        currentAreaSqFt={500}
        onApplyArea={handleApply}
      />
    )

    expect(screen.getByText("Solar Roof Digital Planner")).toBeInTheDocument()
    expect(screen.getByText("Roof Template")).toBeInTheDocument()
    expect(screen.getByText("Array Orientation")).toBeInTheDocument()
    expect(screen.getByText("PV Module Type")).toBeInTheDocument()
    expect(screen.getByText("Portrait (Standard)")).toBeInTheDocument()
    expect(screen.getByText("Landscape (Wide)")).toBeInTheDocument()
    expect(screen.getByText(/Apply/i)).toBeInTheDocument()
  })

  it("toggles orientation and module types on click", async () => {
    render(
      <RoofPlannerModal
        isOpen={true}
        onClose={vi.fn()}
        currentAreaSqFt={500}
        onApplyArea={vi.fn()}
      />
    )

    const landscapeBtn = screen.getByRole("button", { name: "Landscape (Wide)" })
    fireEvent.click(landscapeBtn)
    expect(landscapeBtn).toHaveClass("bg-emerald-600")

    const topconBtn = screen.getByRole("button", { name: "540W TopCon" })
    fireEvent.click(topconBtn)
    expect(topconBtn).toHaveClass("bg-emerald-600")
  })

  it("applies selected area and closes modal", async () => {
    const handleApply = vi.fn()
    const handleClose = vi.fn()

    render(
      <RoofPlannerModal
        isOpen={true}
        onClose={handleClose}
        currentAreaSqFt={500}
        onApplyArea={handleApply}
      />
    )

    const applyBtn = screen.getByRole("button", { name: /Apply.*to Assessment/i })
    fireEvent.click(applyBtn)

    expect(handleApply).toHaveBeenCalled()
    expect(handleClose).toHaveBeenCalled()
  })

  it("launches planner modal from LocationRoofStep button", () => {
    render(
      <LocationRoofStep
        initialLocationRoof={defaultAttractiveAssessment.locationRoof}
        onConfirm={vi.fn()}
        onBack={vi.fn()}
      />
    )

    const launchBtn = screen.getByRole("button", { name: /2D Digital Roof Planner/i })
    expect(launchBtn).toBeInTheDocument()

    fireEvent.click(launchBtn)
    expect(screen.getByText("Solar Roof Digital Planner")).toBeInTheDocument()
  })

  it("runs api.generateRoofLayout with local fallback", async () => {
    const res = await api.generateRoofLayout({
      boundary: [
        { x: 0, y: 0 },
        { x: 200, y: 0 },
        { x: 200, y: 150 },
        { x: 0, y: 150 },
      ],
      scale_pixels_per_meter: 20.0,
      orientation: "portrait",
    })

    expect(res.panel_count).toBeGreaterThan(0)
    expect(res.total_dc_capacity_kw).toBeGreaterThan(0)
    expect(res.panels.length).toEqual(res.panel_count)
    expect(res.comparison_summary.length).toBe(2)
  })
})
