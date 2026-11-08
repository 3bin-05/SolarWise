import React, { useState, useEffect, useRef } from "react"
import { useFocusTrap } from "../../hooks/useFocusTrap"
import {
  X,
  Sliders,
  CheckCircle,
  TrendingUp,
} from "lucide-react"
import { Button } from "../../components/ui/Button"
import { Badge } from "../../components/ui/Badge"
import {
  api,
  ScenarioSimulationResponse,
} from "../../services/api"

export interface ScenarioSimulatorModalProps {
  isOpen: boolean
  onClose: () => void
  baseParams: {
    monthly_consumption_kwh: number
    system_capacity_kw: number
    installed_cost: number
    annual_generation_kwh: number
    provider_id?: string
    consumer_category?: string
    daytime_usage_percentage?: number
    state?: string
    evaluation_horizon_years?: number
  }
  onApplyScenario?: (updated: {
    system_capacity_kw: number
    installed_cost: number
    annual_generation_kwh: number
    battery_kwh: number
    daytime_percentage: number
  }) => void
}

export const ScenarioSimulatorModal: React.FC<ScenarioSimulatorModalProps> = ({
  isOpen,
  onClose,
  baseParams,
  onApplyScenario,
}) => {
  const [capacityKw, setCapacityKw] = useState<number>(baseParams.system_capacity_kw)
  const [batteryKwh, setBatteryKwh] = useState<number>(0)
  const [daytimePercentage, setDaytimePercentage] = useState<number>(
    baseParams.daytime_usage_percentage || 45
  )
  const [tariffEscalation, setTariffEscalation] = useState<number>(3.5)
  const [costMultiplier, setCostMultiplier] = useState<number>(1.0) // 0.8 to 1.2
  const [horizonYears, setHorizonYears] = useState<number>(
    baseParams.evaluation_horizon_years || 25
  )

  const [activeTab, setActiveTab] = useState<"comparison" | "sensitivity">("comparison")
  const [simResult, setSimResult] = useState<ScenarioSimulationResponse | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const modalRef = useRef<HTMLDivElement>(null)
  useFocusTrap(modalRef, isOpen, onClose)

  // Handle Escape key to close modal
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose])

  // Sync state if baseParams change when opened
  useEffect(() => {
    if (isOpen) {
      setCapacityKw(baseParams.system_capacity_kw)
      setDaytimePercentage(baseParams.daytime_usage_percentage || 45)
    }
  }, [isOpen, baseParams])

  useEffect(() => {
    if (!isOpen) return

    let cancelled = false
    const runSim = async () => {
      setLoading(true)
      const baseCost = (baseParams.installed_cost / baseParams.system_capacity_kw) * capacityKw * costMultiplier

      try {
        const res = await api.simulateScenarios({
          base_request: {
            ...baseParams,
            annual_tariff_escalation_pct: tariffEscalation,
            evaluation_horizon_years: horizonYears,
          },
          overrides: {
            system_capacity_kw: capacityKw,
            battery_capacity_kwh: batteryKwh,
            daytime_usage_percentage: daytimePercentage,
            installed_cost: Math.round(baseCost),
            annual_tariff_escalation_pct: tariffEscalation,
            evaluation_horizon_years: horizonYears,
          },
        })
        if (!cancelled) {
          setSimResult(res)
        }
      } catch (err) {
        console.error("Scenario simulation failed:", err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    const timer = setTimeout(runSim, 150)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [
    isOpen,
    baseParams,
    capacityKw,
    batteryKwh,
    daytimePercentage,
    tariffEscalation,
    costMultiplier,
    horizonYears,
  ])

  if (!isOpen) return null

  const simCase = simResult?.simulated_case
  const comparisons = simResult?.comparative_scenarios || []
  const insights = simResult?.simulation_insights || []

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="scenario-modal-title"
        tabIndex={-1}
        className="bg-white border border-neutral-200/90 rounded-2xl w-full max-w-5xl max-h-[94vh] sm:max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 outline-none"
      >
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-neutral-200/80 flex items-center justify-between bg-neutral-50/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 border border-orange-200/80 text-[#FE5A01] flex items-center justify-center shrink-0">
              <Sliders className="w-5 h-5 text-[#FE5A01]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="scenario-modal-title" className="text-lg font-bold text-neutral-900">
                  Scenario Simulator & Sensitivity Engine
                </h3>
                <Badge variant="default" className="text-xs">
                  Real-Time Parametric Twin
                </Badge>
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">
                Stress-test capital costs, battery additions, daytime load shifting & grid inflation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 p-1.5 rounded-lg transition-colors cursor-pointer"
            aria-label="Close Scenario Simulator"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Real-time Result Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-neutral-50/80 border border-neutral-200/80 rounded-xl shadow-2xs">
              <span className="text-xs font-semibold text-neutral-500">Simple Payback</span>
              <p className="text-xl font-bold text-[#c2410c] mt-1">
                {simCase?.simple_payback_years ?? "--"} <span className="text-xs font-normal text-neutral-500">years</span>
              </p>
            </div>
            <div className="p-3.5 bg-neutral-50/80 border border-neutral-200/80 rounded-xl shadow-2xs">
              <span className="text-xs font-semibold text-neutral-500">25-Yr Net Savings</span>
              <p className="text-xl font-bold text-neutral-900 mt-1">
                ₹{simCase ? Math.round(simCase.twenty_five_year_net_savings).toLocaleString() : "--"}
              </p>
            </div>
            <div className="p-3.5 bg-neutral-50/80 border border-neutral-200/80 rounded-xl shadow-2xs">
              <span className="text-xs font-semibold text-neutral-500">Net Initial Outlay</span>
              <p className="text-xl font-bold text-neutral-900 mt-1">
                ₹{simCase ? Math.round(simCase.net_initial_investment).toLocaleString() : "--"}
              </p>
              <span className="text-[10px] text-[#c2410c] font-semibold block mt-0.5">
                Incl. ₹{simCase?.subsidy_amount ? Math.round(simCase.subsidy_amount).toLocaleString() : "0"} subsidy
              </span>
            </div>
            <div className="p-3.5 bg-neutral-50/80 border border-neutral-200/80 rounded-xl shadow-2xs">
              <span className="text-xs font-semibold text-neutral-500">Verdict Category</span>
              <div className="mt-1">
                <Badge
                  variant={
                    simCase?.decision_outcome?.includes("Strongly") || simCase?.decision_outcome?.includes("Attractive")
                      ? "default"
                      : "warning"
                  }
                  className="text-xs font-bold"
                >
                  {simCase?.decision_outcome || "Simulating..."}
                </Badge>
              </div>
            </div>
          </div>

          {/* Interactive Sliders Panel */}
          <div className="p-4 sm:p-5 bg-neutral-50/60 border border-neutral-200 rounded-2xl shadow-2xs space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-700 block">
              Parametric Simulation Controls
            </span>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Capacity Slider */}
              <div className="space-y-1.5 bg-white p-3.5 rounded-xl border border-neutral-200/80 shadow-2xs">
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-700 font-semibold">System Capacity</span>
                  <span className="text-[#FE5A01] font-bold">{capacityKw.toFixed(1)} kWp</span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="12.0"
                  step="0.5"
                  value={capacityKw}
                  onChange={(e) => setCapacityKw(parseFloat(e.target.value))}
                  className="w-full accent-[#FE5A01] cursor-pointer"
                  aria-label="System Capacity in kWp"
                />
                <div className="flex justify-between text-[10px] text-neutral-500 font-medium">
                  <span>1.0 kWp</span>
                  <span>12.0 kWp</span>
                </div>
              </div>

              {/* Battery Storage Selector */}
              <div className="space-y-1.5 bg-white p-3.5 rounded-xl border border-neutral-200/80 shadow-2xs">
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-700 font-semibold">Battery Storage (LFP)</span>
                  <span className="text-sky-700 font-bold">
                    {batteryKwh > 0 ? `${batteryKwh} kWh (+₹${(batteryKwh * 22000).toLocaleString()})` : "None (Grid-Tied)"}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1.5 pt-0.5">
                  {[0, 3, 5, 10].map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setBatteryKwh(b)}
                      className={`py-1.5 text-xs rounded-lg border font-semibold transition-all cursor-pointer ${
                        batteryKwh === b
                          ? "bg-sky-50 border-sky-500 text-sky-800 shadow-2xs"
                          : "bg-white border-neutral-200 hover:border-neutral-300 text-neutral-600 hover:text-neutral-900"
                      }`}
                    >
                      {b === 0 ? "None" : `${b} kWh`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Daytime Usage Fraction */}
              <div className="space-y-1.5 bg-white p-3.5 rounded-xl border border-neutral-200/80 shadow-2xs">
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-700 font-semibold">Daytime Self-Consumption</span>
                  <span className="text-amber-700 font-bold">{daytimePercentage}%</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="85"
                  step="5"
                  value={daytimePercentage}
                  onChange={(e) => setDaytimePercentage(parseInt(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                  aria-label="Daytime Self-Consumption percentage"
                />
                <div className="flex justify-between text-[10px] text-neutral-500 font-medium">
                  <span>15% (Office workers)</span>
                  <span>85% (Work from home)</span>
                </div>
              </div>

              {/* Grid Tariff Escalation */}
              <div className="space-y-1.5 bg-white p-3.5 rounded-xl border border-neutral-200/80 shadow-2xs">
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-700 font-semibold">Tariff Escalation Rate</span>
                  <span className="text-[#FE5A01] font-bold">{tariffEscalation}% / yr</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="8.0"
                  step="0.5"
                  value={tariffEscalation}
                  onChange={(e) => setTariffEscalation(parseFloat(e.target.value))}
                  className="w-full accent-[#FE5A01] cursor-pointer"
                  aria-label="Tariff Escalation Rate percentage per year"
                />
                <div className="flex justify-between text-[10px] text-neutral-500 font-medium">
                  <span>0% (Flat)</span>
                  <span>8% (High inflation)</span>
                </div>
              </div>

              {/* Contractor Pricing Offset */}
              <div className="space-y-1.5 bg-white p-3.5 rounded-xl border border-neutral-200/80 shadow-2xs">
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-700 font-semibold">Contractor Price Offset</span>
                  <span className="text-neutral-900 font-bold">
                    {costMultiplier === 1.0 ? "Standard" : `${((costMultiplier - 1.0) * 100).toFixed(0)}%`}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.8"
                  max="1.2"
                  step="0.05"
                  value={costMultiplier}
                  onChange={(e) => setCostMultiplier(parseFloat(e.target.value))}
                  className="w-full accent-neutral-600 cursor-pointer"
                  aria-label="Contractor Price Offset multiplier"
                />
                <div className="flex justify-between text-[10px] text-neutral-500 font-medium">
                  <span>-20% (Budget quote)</span>
                  <span>+20% (Premium tier)</span>
                </div>
              </div>

              {/* Planning Horizon */}
              <div className="space-y-1.5 bg-white p-3.5 rounded-xl border border-neutral-200/80 shadow-2xs">
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-700 font-semibold">Evaluation Horizon</span>
                  <span className="text-indigo-700 font-bold">{horizonYears} Years</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 pt-0.5">
                  {[15, 20, 25].map((y) => (
                    <button
                      key={y}
                      type="button"
                      onClick={() => setHorizonYears(y)}
                      className={`py-1.5 text-xs rounded-lg border font-semibold transition-all cursor-pointer ${
                        horizonYears === y
                          ? "bg-indigo-50 border-indigo-500 text-indigo-800 shadow-2xs"
                          : "bg-white border-neutral-200 hover:border-neutral-300 text-neutral-600 hover:text-neutral-900"
                      }`}
                    >
                      {y} Years
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Tabs: Comparison vs Sensitivity */}
          <div className="space-y-4">
            <div className="flex border-b border-neutral-200 text-xs font-semibold gap-1">
              <button
                type="button"
                onClick={() => setActiveTab("comparison")}
                className={`py-2 px-4 border-b-2 font-bold transition-colors cursor-pointer ${
                  activeTab === "comparison"
                    ? "border-[#FE5A01] text-[#c2410c]"
                    : "border-transparent text-neutral-500 hover:text-neutral-900"
                }`}
              >
                Multi-Scenario Comparison (4 Cases)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("sensitivity")}
                className={`py-2 px-4 border-b-2 font-bold transition-colors cursor-pointer ${
                  activeTab === "sensitivity"
                    ? "border-[#FE5A01] text-[#c2410c]"
                    : "border-transparent text-neutral-500 hover:text-neutral-900"
                }`}
              >
                Parametric Sensitivity Curves
              </button>
            </div>

            {/* View 1: 4 Comparative Scenario Cards */}
            {activeTab === "comparison" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {comparisons.map((sc, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-white border border-neutral-200/90 rounded-xl space-y-2.5 flex flex-col justify-between shadow-2xs hover:border-[#FE5A01]/60 transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-neutral-900">{sc.name}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded border border-neutral-200 bg-neutral-100 text-neutral-700">
                          {sc.decision_outcome}
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-500 mt-1 leading-snug">{sc.description}</p>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-neutral-100 text-xs">
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Payback:</span>
                        <span className="font-bold text-[#c2410c]">{sc.simple_payback_years} yrs</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-500">25-Yr Net:</span>
                        <span className="font-bold text-neutral-900">₹{Math.round(sc.twenty_five_year_net_savings).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Net Cost:</span>
                        <span className="text-neutral-700 font-semibold">₹{Math.round(sc.net_initial_investment).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-500">LCOE:</span>
                        <span className="text-neutral-700 font-mono">₹{sc.lcoe_per_kwh}/kWh</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* View 2: Sensitivity Curves & Tables */}
            {activeTab === "sensitivity" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Tariff Sweep */}
                <div className="p-4 bg-white border border-neutral-200 rounded-xl space-y-2 shadow-2xs">
                  <span className="text-xs font-bold text-neutral-900 block">
                    Tariff Escalation Sensitivity
                  </span>
                  <div className="space-y-1 text-xs">
                    {(simResult?.sensitivity_tariff_escalation || []).map((p, i) => (
                      <div key={i} className="flex justify-between py-1 border-b border-neutral-100">
                        <span className="text-neutral-600 font-medium">{p.parameter_label}</span>
                        <span className="font-mono text-neutral-800">{p.simple_payback_years} yrs</span>
                        <span className="font-mono text-[#c2410c] font-bold">₹{Math.round(p.npv).toLocaleString()} NPV</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Capital Cost Sweep */}
                <div className="p-4 bg-white border border-neutral-200 rounded-xl space-y-2 shadow-2xs">
                  <span className="text-xs font-bold text-neutral-900 block">
                    Capital Cost Sensitivity
                  </span>
                  <div className="space-y-1 text-xs">
                    {(simResult?.sensitivity_capital_cost || []).map((p, i) => (
                      <div key={i} className="flex justify-between py-1 border-b border-neutral-100">
                        <span className="text-neutral-600 font-medium">{p.parameter_label}</span>
                        <span className="font-mono text-neutral-800">{p.simple_payback_years} yrs</span>
                        <span className="font-mono text-sky-700 font-bold">₹{Math.round(p.npv).toLocaleString()} NPV</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Daytime Usage Sweep */}
                <div className="p-4 bg-white border border-neutral-200 rounded-xl space-y-2 shadow-2xs">
                  <span className="text-xs font-bold text-neutral-900 block">
                    Daytime Usage Sensitivity
                  </span>
                  <div className="space-y-1 text-xs">
                    {(simResult?.sensitivity_daytime_usage || []).map((p, i) => (
                      <div key={i} className="flex justify-between py-1 border-b border-neutral-100">
                        <span className="text-neutral-600 font-medium">{p.parameter_label}</span>
                        <span className="font-mono text-neutral-800">{p.simple_payback_years} yrs</span>
                        <span className="font-mono text-amber-700 font-bold">₹{Math.round(p.twenty_five_year_net_savings).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Simulation Insights Callout */}
          {insights.length > 0 && (
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl space-y-1 text-xs text-neutral-800 shadow-2xs">
              <span className="font-bold text-[#c2410c] flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-[#FE5A01]" /> Deterministic Simulation Takeaways:
              </span>
              <ul className="list-disc list-inside space-y-1 text-neutral-700 text-xs pt-1">
                {insights.map((ins, idx) => (
                  <li key={idx}>{ins}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-200/80 bg-neutral-50/80 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-neutral-600 font-medium">
            Selected configuration: <span className="text-neutral-900 font-bold">{capacityKw} kWp</span>
            {batteryKwh > 0 && <span className="text-sky-700 font-semibold"> + {batteryKwh} kWh Battery</span>}
            {" • "}Payback: <span className="text-[#c2410c] font-bold">{simCase?.simple_payback_years ?? "--"} yrs</span>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button variant="outline" size="sm" onClick={onClose} className="border-neutral-300 text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 text-xs rounded-lg flex-1 sm:flex-initial cursor-pointer">
              Dismiss
            </Button>
            {onApplyScenario && (
              <Button
                variant="primary"
                size="sm"
                isLoading={loading}
                onClick={() => {
                  const baseCost = (baseParams.installed_cost / baseParams.system_capacity_kw) * capacityKw * costMultiplier
                  const annualGen = (baseParams.annual_generation_kwh / baseParams.system_capacity_kw) * capacityKw
                  onApplyScenario({
                    system_capacity_kw: capacityKw,
                    installed_cost: Math.round(baseCost + (batteryKwh * 22000)),
                    annual_generation_kwh: Math.round(annualGen),
                    battery_kwh: batteryKwh,
                    daytime_percentage: daytimePercentage,
                  })
                  onClose()
                }}
                className="bg-[#FE5A01] hover:bg-[#e04f00] text-white text-xs font-bold gap-1.5 flex-1 sm:flex-initial rounded-lg shadow-xs cursor-pointer"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                Apply Scenario to Assessment
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
