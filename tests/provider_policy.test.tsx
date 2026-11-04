import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { api } from "../src/services/api"
import { ProviderPolicyModal } from "../src/features/assessment/ProviderPolicyModal"

describe("SolarWise Provider & Policy Matcher", () => {
  it("runs api.getProviders with local fallback when backend is offline", async () => {
    const res = await api.getProviders({ state: "Karnataka" })
    expect(res).toBeDefined()
    expect(res.total_count).toBeGreaterThan(0)
    expect(res.providers[0]).toHaveProperty("name")
    expect(res.providers[0]).toHaveProperty("website")
    expect(res.disclaimer.toLowerCase()).toContain("non-sponsored")
  })

  it("runs api.getSubsidies with local fallback when backend is offline", async () => {
    const res = await api.getSubsidies({ state: "Delhi" })
    expect(res).toBeDefined()
    expect(res.total_count).toBeGreaterThanOrEqual(1)
    expect(res.schemes.some((s) => s.scheme_name.includes("PM Surya Ghar"))).toBe(true)
  })

  it("renders ProviderPolicyModal and switches between Installers and Subsidies tabs", async () => {
    const handleClose = vi.fn()

    render(
      <ProviderPolicyModal
        isOpen={true}
        onClose={handleClose}
        initialState="Karnataka"
      />
    )

    expect(screen.getByText("Verified Installer Directory & Subsidies")).toBeInTheDocument()
    expect(screen.getByText(/Independent Public Directory/i)).toBeInTheDocument()

    // Wait for installers to load
    await waitFor(() => {
      expect(screen.getByText("Tata Power Solar")).toBeInTheDocument()
    })

    // Switch to Subsidies tab
    const subsidyTab = screen.getByRole("button", { name: /government subsidies/i })
    fireEvent.click(subsidyTab)

    await waitFor(() => {
      expect(screen.getByText(/PM Surya Ghar: Muft Bijli Yojana/i)).toBeInTheDocument()
      expect(screen.getByText(/Official Government Portal/i)).toBeInTheDocument()
    })

    // Close modal
    const closeBtn = screen.getByRole("button", { name: /close directory/i })
    fireEvent.click(closeBtn)
    expect(handleClose).toHaveBeenCalled()
  })

  it("filters providers when selecting a different state", async () => {
    render(
      <ProviderPolicyModal
        isOpen={true}
        onClose={vi.fn()}
        initialState="All"
      />
    )

    // Select Kerala
    const stateSelect = screen.getByDisplayValue("All Regions")
    fireEvent.change(stateSelect, { target: { value: "Kerala" } })

    await waitFor(() => {
      expect(screen.getByText("Kenergy Solar")).toBeInTheDocument()
    })
  })
})

