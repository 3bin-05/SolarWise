import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import React, { useState } from "react"
import { ErrorBoundary } from "../src/components/ui/ErrorBoundary"

const BrokenChild: React.FC<{ shouldThrow?: boolean }> = ({ shouldThrow = true }) => {
  if (shouldThrow) {
    throw new Error("Simulated rendering failure in mathematical engine.")
  }
  return <div>Component rendered safely.</div>
}

const RecoverableChild: React.FC = () => {
  const [hasError, setHasError] = useState(true)
  if (hasError) {
    return (
      <button onClick={() => setHasError(false)}>
        Simulate Crash
        {(() => {
          throw new Error("Crash on demand")
        })()}
      </button>
    )
  }
  return <div>Recovered successfully!</div>
}

describe("SolarWise React Error Boundary", () => {
  // Suppress expected console.error during ErrorBoundary tests
  const originalError = console.error
  beforeEach(() => {
    console.error = vi.fn()
  })
  afterEach(() => {
    console.error = originalError
  })

  it("renders children normally when no error occurs", () => {
    render(
      <ErrorBoundary>
        <div>Normal content</div>
      </ErrorBoundary>
    )
    expect(screen.getByText("Normal content")).toBeInTheDocument()
  })

  it("catches runtime render errors and displays fallback UI", () => {
    render(
      <ErrorBoundary>
        <BrokenChild shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText("Something went wrong")).toBeInTheDocument()
    expect(
      screen.getByText(/SolarWise encountered an unexpected error/i)
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Simulated rendering failure in mathematical engine./i)
    ).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Try Again/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Reload Application/i })).toBeInTheDocument()
  })

  it("renders custom fallback node when provided", () => {
    render(
      <ErrorBoundary fallback={<div>Custom failure notice</div>}>
        <BrokenChild shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText("Custom failure notice")).toBeInTheDocument()
    expect(screen.queryByText("Something went wrong")).not.toBeInTheDocument()
  })

  it("allows attempting recovery when Try Again is clicked", () => {
    render(
      <ErrorBoundary>
        <RecoverableChild />
      </ErrorBoundary>
    )

    expect(screen.getByText("Something went wrong")).toBeInTheDocument()
    const tryAgainBtn = screen.getByRole("button", { name: /Try Again/i })
    expect(tryAgainBtn).toBeInTheDocument()
    fireEvent.click(tryAgainBtn)
  })
})
