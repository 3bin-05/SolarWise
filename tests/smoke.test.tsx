import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import App from "../src/App"

describe("SolarWise Frontend Smoke Test", () => {
  it("renders the SolarWise application title and branding", () => {
    render(<App />)
    expect(screen.getByText("SolarWise")).toBeInTheDocument()
    expect(screen.getByText(/Transparent Solar Feasibility/i)).toBeInTheDocument()
  })

  it("displays the architecture foundation status", () => {
    render(<App />)
    expect(screen.getByText("Architecture Foundation")).toBeInTheDocument()
    expect(screen.getByText("Phase 0 Foundation")).toBeInTheDocument()
  })
})

