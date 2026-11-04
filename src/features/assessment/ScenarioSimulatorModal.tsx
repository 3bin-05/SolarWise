import React, { useState, useEffect } from "react"
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
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">Scenario Simulator & Sensitivity Engine</h3>
                <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 text-xs">
                  Real-Time Parametric Twin
                </Badge>
              </div>
              <p className="text-xs text-slate-400">
                Stress-test capital costs, battery additions, daytime load shifting & grid inflation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Real-time Result Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-800/40 border border-slate-800 rounded-xl">
              <span className="text-xs text-slate-400">Simple Payback</span>
              <p className="text-xl font-bold text-emerald-400 mt-1">
                {simCase?.simple_payback_years ?? "--"} <span className="text-xs font-normal text-slate-400">years</span>
              </p>
            </div>
            <div className="p-3 bg-slate-800/40 border border-slate-800 rounded-xl">
              <span className="text-xs text-slate-400">25-Yr Net Savings</span>
              <p className="text-xl font-bold text-white mt-1">
                ₹{simCase ? Math.round(simCase.twenty_five_year_net_savings).toLocaleString() : "--"}
              </p>
            </div>
            <div className="p-3 bg-slate-800/40 border border-slate-800 rounded-xl">
              <span className="text-xs text-slate-400">Net Initial Outlay</span>
              <p className="text-xl font-bold text-slate-200 mt-1">
                ₹{simCase ? Math.round(simCase.net_initial_investment).toLocaleString() : "--"}
              </p>
              <span className="text-[10px] text-emerald-400">
                Incl. ₹{simCase?.subsidy_amount ? Math.round(simCase.subsidy_amount).toLocaleString() : "0"} subsidy
              </span>
            </div>
            <div className="p-3 bg-slate-800/40 border border-slate-800 rounded-xl">
              <span className="text-xs text-slate-400">Verdict Category</span>
              <div className="mt-1">
                <Badge
                  variant={
                    simCase?.decision_outcome?.includes("Strongly") || simCase?.decision_outcome?.includes("Attractive")
                      ? "default"
                      : "warning"
                  }
                  className="text-xs"
                >
                  {simCase?.decision_outcome || "Simulating..."}
                </Badge>
              </div>
            </div>
          </div>

          {/* Interactive Sliders Panel */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
              Parametric Simulation Controls
            </span>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Capacity Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">System Capacity</span>
                  <span className="text-emerald-400 font-bold">{capacityKw.toFixed(1)} kWp</span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="12.0"
                  step="0.5"
                  value={capacityKw}
                  onChange={(e) => setCapacityKw(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>1.0 kWp</span>
                  <span>12.0 kWp</span>
                </div>
              </div>

              {/* Battery Storage Selector */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Battery Storage (LFP)</span>
                  <span className="text-sky-400 font-bold">
                    {batteryKwh > 0 ? `${batteryKwh} kWh (+₹${(batteryKwh * 22000).toLocaleString()})` : "None (Grid-Tied)"}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1.5 pt-0.5">
                  {[0, 3, 5, 10].map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setBatteryKwh(b)}
                      className={`py-1 text-xs rounded border font-medium transition-colors ${
                        batteryKwh === b
                          ? "bg-sky-500/20 border-sky-500 text-sky-300"
                          : "border-slate-800 hover:border-slate-700 text-slate-400"
                      }`}
                    >
                      {b === 0 ? "None" : `${b} kWh`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Daytime Usage Fraction */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Daytime Self-Consumption</span>
                  <span className="text-amber-400 font-bold">{daytimePercentage}%</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="85"
                  step="5"
                  value={daytimePercentage}
                  onChange={(e) => setDaytimePercentage(parseInt(e.target.value))}
                  className="w-full accent-amber-500"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>15% (Office workers)</span>
                  <span>85% (Work from home)</span>
                </div>
              </div>

              {/* Grid Tariff Escalation */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Tariff Escalation Rate</span>
                  <span className="text-emerald-400 font-bold">{tariffEscalation}% / yr</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="8.0"
                  step="0.5"
                  value={tariffEscalation}
                  onChange={(e) => setTariffEscalation(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>0% (Flat)</span>
                  <span>8% (High inflation)</span>
                </div>
              </div>

              {/* Contractor Pricing Offset */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Contractor Price Offset</span>
                  <span className="text-slate-200 font-bold">
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
                  className="w-full accent-slate-400"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>-20% (Budget quote)</span>
                  <span>+20% (Premium tier)</span>
                </div>
              </div>

              {/* Planning Horizon */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Evaluation Horizon</span>
                  <span className="text-indigo-400 font-bold">{horizonYears} Years</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 pt-0.5">
                  {[15, 20, 25].map((y) => (
                    <button
                      key={y}
                      type="button"
                      onClick={() => setHorizonYears(y)}
                      className={`py-1 text-xs rounded border font-medium transition-colors ${
                        horizonYears === y
                          ? "bg-indigo-500/20 border-indigo-500 text-indigo-300"
                          : "border-slate-800 hover:border-slate-700 text-slate-400"
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
            <div className="flex border-b border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab("comparison")}
                className={`py-2 px-4 border-b-2 font-medium transition-colors ${
                  activeTab === "comparison"
                    ? "border-emerald-500 text-emerald-400"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                Multi-Scenario Comparison (4 Cases)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("sensitivity")}
                className={`py-2 px-4 border-b-2 font-medium transition-colors ${
                  activeTab === "sensitivity"
                    ? "border-emerald-500 text-emerald-400"
                    : "border-transparent text-slate-400 hover:text-slate-200"
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
                    className="p-3.5 bg-slate-800/30 border border-slate-800 rounded-xl space-y-2.5 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-white">{sc.name}</span>
                        <Badge variant="outline" className="text-[10px] border-slate-700">
                          {sc.decision_outcome}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 leading-snug">{sc.description}</p>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-slate-800/80 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Payback:</span>
                        <span className="font-bold text-emerald-400">{sc.simple_payback_years} yrs</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">25-Yr Net:</span>
                        <span className="font-bold text-slate-200">₹{Math.round(sc.twenty_five_year_net_savings).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Net Cost:</span>
                        <span className="text-slate-300">₹{Math.round(sc.net_initial_investment).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">LCOE:</span>
                        <span className="text-slate-300">₹{sc.lcoe_per_kwh}/kWh</span>
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
                <div className="p-3.5 bg-slate-800/30 border border-slate-800 rounded-xl space-y-2">
                  <span className="text-xs font-semibold text-emerald-400 block">
                    Tariff Escalation Sensitivity
                  </span>
                  <div className="space-y-1 text-xs">
                    {(simResult?.sensitivity_tariff_escalation || []).map((p, i) => (
                      <div key={i} className="flex justify-between py-1 border-b border-slate-800/40">
                        <span className="text-slate-400">{p.parameter_label}</span>
                        <span className="font-mono text-slate-200">{p.simple_payback_years} yrs</span>
                        <span className="font-mono text-emerald-400 font-semibold">₹{Math.round(p.npv).toLocaleString()} NPV</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Capital Cost Sweep */}
                <div className="p-3.5 bg-slate-800/30 border border-slate-800 rounded-xl space-y-2">
                  <span className="text-xs font-semibold text-sky-400 block">
                    Capital Cost Sensitivity
                  </span>
                  <div className="space-y-1 text-xs">
                    {(simResult?.sensitivity_capital_cost || []).map((p, i) => (
                      <div key={i} className="flex justify-between py-1 border-b border-slate-800/40">
                        <span className="text-slate-400">{p.parameter_label}</span>
                        <span className="font-mono text-slate-200">{p.simple_payback_years} yrs</span>
                        <span className="font-mono text-sky-400 font-semibold">₹{Math.round(p.npv).toLocaleString()} NPV</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Daytime Usage Sweep */}
                <div className="p-3.5 bg-slate-800/30 border border-slate-800 rounded-xl space-y-2">
                  <span className="text-xs font-semibold text-amber-400 block">
                    Daytime Usage Sensitivity
                  </span>
                  <div className="space-y-1 text-xs">
                    {(simResult?.sensitivity_daytime_usage || []).map((p, i) => (
                      <div key={i} className="flex justify-between py-1 border-b border-slate-800/40">
                        <span className="text-slate-400">{p.parameter_label}</span>
                        <span className="font-mono text-slate-200">{p.simple_payback_years} yrs</span>
                        <span className="font-mono text-amber-400 font-semibold">₹{Math.round(p.twenty_five_year_net_savings).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Simulation Insights Callout */}
          {insights.length > 0 && (
            <div className="p-3.5 bg-emerald-950/30 border border-emerald-500/20 rounded-xl space-y-1 text-xs text-slate-300">
              <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" /> Deterministic Simulation Takeaways:
              </span>
              <ul className="list-disc list-inside space-y-0.5 text-slate-300/90 text-[11px] pt-1">
                {insights.map((ins, idx) => (
                  <li key={idx}>{ins}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/90 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-400">
            Selected configuration: <span className="text-white font-bold">{capacityKw} kWp</span>
            {batteryKwh > 0 && <span className="text-sky-400 font-semibold"> + {batteryKwh} kWh Battery</span>}
            {" • "}Payback: <span className="text-emerald-400 font-bold">{simCase?.simple_payback_years ?? "--"} yrs</span>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button variant="outline" size="sm" onClick={onClose} className="border-slate-700 text-xs flex-1 sm:flex-initial">
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
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs gap-1.5 flex-1 sm:flex-initial"
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
