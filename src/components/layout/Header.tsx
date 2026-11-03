import React from "react"
import { Sun, RotateCcw } from "lucide-react"
import { Button } from "../ui/Button"

export interface HeaderProps {
  currentStep: number
  totalSteps: number
  onReset: () => void
  onScenarioToggle?: () => void
  scenarioName?: string
}

export const Header: React.FC<HeaderProps> = ({
  currentStep,
  totalSteps,
  onReset,
  onScenarioToggle,
  scenarioName = "Standard Household",
}) => {
  return (
    <header className="border-b border-neutral-200/80 bg-white/95 backdrop-blur sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={onReset}>
          <div className="h-9 w-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-sm shadow-emerald-500/20">
            <Sun className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-neutral-950">SolarWise</span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                Feasibility Engine
              </span>
            </div>
            <p className="text-[11px] text-neutral-500 hidden sm:block">
              Objective Solar & Financial Decision Platform
            </p>
          </div>
        </div>

        {/* Center / Scenario Selector */}
        {onScenarioToggle && (
          <div className="hidden md:flex items-center gap-2 bg-neutral-100 px-3 py-1.5 rounded-lg border border-neutral-200">
            <span className="text-xs text-neutral-500">Scenario:</span>
            <span className="text-xs font-semibold text-neutral-800">{scenarioName}</span>
            <button
              onClick={onScenarioToggle}
              className="text-xs font-medium text-emerald-700 hover:text-emerald-800 underline ml-1 cursor-pointer"
            >
              Switch
            </button>
          </div>
        )}

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {currentStep > 0 && (
            <div className="text-xs font-medium text-neutral-500 hidden sm:block">
              Step {currentStep} of {totalSteps}
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={onReset}
            className="text-xs h-8 text-neutral-600"
            title="Start New Assessment"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
