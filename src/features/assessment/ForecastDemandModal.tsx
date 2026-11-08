import React, { useState, useEffect, useRef } from "react"
import { useFocusTrap } from "../../hooks/useFocusTrap"
import {
  X,
  TrendingUp,
  CheckCircle,
  Car,
  Wind,
  Flame,
  ShieldCheck,
} from "lucide-react"
import { Button } from "../../components/ui/Button"
import { Badge } from "../../components/ui/Badge"
import {
  api,
  ApplianceAddition,
  ConsumptionForecastResponse,
  ModelCardResponse,
} from "../../services/api"

export interface ForecastDemandModalProps {
  isOpen: boolean
  onClose: () => void
  currentMonthlyUnits: number
  onApplyProjectedUnits?: (newMonthlyUnits: number) => void
}

export const ForecastDemandModal: React.FC<ForecastDemandModalProps> = ({
  isOpen,
  onClose,
  currentMonthlyUnits,
  onApplyProjectedUnits,
}) => {
  const [climateZone, setClimateZone] = useState<string>("composite")
  const [annualGrowthRate, setAnnualGrowthRate] = useState<number>(2.0)
  const [horizonMonths, setHorizonMonths] = useState<number>(12)
  const [showModelCard, setShowModelCard] = useState<boolean>(false)

  // Appliance additions
  const [hasEV, setHasEV] = useState<boolean>(false)
  const [hasExtraAC, setHasExtraAC] = useState<boolean>(false)
  const [hasHeatPump, setHasHeatPump] = useState<boolean>(false)

  const [forecastResult, setForecastResult] = useState<ConsumptionForecastResponse | null>(null)
  const [modelCardData, setModelCardData] = useState<ModelCardResponse | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const modalRef = useRef<HTMLDivElement>(null)
  useFocusTrap(modalRef, isOpen, onClose)

  // Synthesize 12 months history based on current units for demo/initial load
  const syntheticHistory = React.useMemo(() => [
    Math.round(currentMonthlyUnits * 0.75),
    Math.round(currentMonthlyUnits * 0.8),
    Math.round(currentMonthlyUnits * 0.95),
    Math.round(currentMonthlyUnits * 1.3),
    Math.round(currentMonthlyUnits * 1.5),
    Math.round(currentMonthlyUnits * 1.45),
    Math.round(currentMonthlyUnits * 1.25),
    Math.round(currentMonthlyUnits * 1.15),
    Math.round(currentMonthlyUnits * 1.05),
    Math.round(currentMonthlyUnits * 0.88),
    Math.round(currentMonthlyUnits * 0.72),
    Math.round(currentMonthlyUnits * 0.7),
  ], [currentMonthlyUnits])

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

  useEffect(() => {
    if (!isOpen) return

    let cancelled = false
    const fetchForecast = async () => {
      setLoading(true)
      const additions: ApplianceAddition[] = []
      if (hasEV) {
        additions.push({ name: "Electric Vehicle (EV)", monthly_kwh: 200, start_month_index: 3 })
      }
      if (hasExtraAC) {
        additions.push({ name: "1.5T Inverter AC", monthly_kwh: 150, start_month_index: 4 })
      }
      if (hasHeatPump) {
        additions.push({ name: "Induction / Heat Pump", monthly_kwh: 80, start_month_index: 2 })
      }

      try {
        const res = await api.forecastConsumption({
          historical_consumption: syntheticHistory,
          climate_zone: climateZone,
          annual_growth_rate_pct: annualGrowthRate,
          horizon_months: horizonMonths,
          planned_additions: additions,
          confidence_level: 0.9,
        })
        if (!cancelled) {
          setForecastResult(res)
        }
      } catch (err) {
        console.error("Forecasting failed:", err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    const timer = setTimeout(fetchForecast, 150)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [
    isOpen,
    currentMonthlyUnits,
    climateZone,
    annualGrowthRate,
    horizonMonths,
    hasEV,
    hasExtraAC,
    hasHeatPump,
    syntheticHistory,
  ])

  useEffect(() => {
    if (showModelCard && !modelCardData) {
      api.getModelCard().then((card) => setModelCardData(card))
    }
  }, [showModelCard, modelCardData])

  if (!isOpen) return null

  const pts = forecastResult?.forecast || []
  const maxVal = Math.max(
    ...pts.map((p) => p.upper_bound_kwh || p.forecast_kwh),
    currentMonthlyUnits * 1.8,
    100
  )
  const chartHeight = 160
  const chartWidth = 600

  // SVG coordinates generator
  const getX = (idx: number) => {
    if (pts.length <= 1) return 20
    return 30 + (idx / (pts.length - 1)) * (chartWidth - 60)
  }

  const getY = (val: number) => {
    const norm = Math.min(1, Math.max(0, val / maxVal))
    return chartHeight - 20 - norm * (chartHeight - 40)
  }

  const forecastPath = pts
    .map((p, idx) => `${idx === 0 ? "M" : "L"} ${getX(idx)} ${getY(p.forecast_kwh)}`)
    .join(" ")

  const baselinePath = pts
    .map((p, idx) => `${idx === 0 ? "M" : "L"} ${getX(idx)} ${getY(p.baseline_kwh)}`)
    .join(" ")

  // Area path for 90% confidence bands
  const upperPath = pts.map((p, idx) => `${getX(idx)} ${getY(p.upper_bound_kwh)}`)
  const lowerPath = [...pts]
    .reverse()
    .map((p, idx) => `${getX(pts.length - 1 - idx)} ${getY(p.lower_bound_kwh)}`)
  const bandPath = pts.length > 0 ? `M ${upperPath.join(" L ")} L ${lowerPath.join(" L ")} Z` : ""

  const projectedAvgMonthly = forecastResult
    ? Math.round(forecastResult.total_annual_forecast_kwh / 12)
    : currentMonthlyUnits

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
        aria-labelledby="forecast-modal-title"
        tabIndex={-1}
        className="bg-white border border-neutral-200/90 rounded-2xl w-full max-w-4xl max-h-[94vh] sm:max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 outline-none"
      >
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-neutral-200/80 flex items-center justify-between bg-neutral-50/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 border border-orange-200/80 text-[#FE5A01] flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5 text-[#FE5A01]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="forecast-modal-title" className="text-lg font-bold text-neutral-900">
                  Future Demand & Seasonal Forecaster
                </h3>
                <Badge variant="default" className="text-xs">
                  {forecastResult?.method === "holt_winters_seasonal"
                    ? "Holt-Winters Seasonal"
                    : "Empirical Baseline"}
                </Badge>
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">
                12–36 month projection with AC summer cooling surges, appliance growth & 90% confidence bands
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowModelCard(!showModelCard)}
              className="text-xs border-neutral-300 text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 gap-1.5 rounded-lg cursor-pointer font-semibold shadow-2xs"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
              {showModelCard ? "Hide Model Card" : "Model Card & Metrics"}
            </Button>
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 p-1.5 rounded-lg transition-colors cursor-pointer"
              aria-label="Close Forecaster"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Model Card Drawer / Modal Banner */}
          {showModelCard && (
            <div className="p-4 bg-sky-50/60 border border-sky-200 rounded-xl space-y-3 text-sm shadow-2xs">
              <div className="flex items-center justify-between border-b border-sky-200/70 pb-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-sky-600" />
                  <span className="font-bold text-neutral-900">
                    {modelCardData?.model_name || "SolarWise Seasonal Demand Forecaster"} (v{modelCardData?.version || "1.0.0"})
                  </span>
                </div>
                <Badge variant="outline" className="text-xs text-sky-700 border-sky-300 bg-white font-semibold">
                  {modelCardData?.license || "CC-BY-4.0"}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-neutral-700">
                <div>
                  <span className="text-neutral-500 font-medium">Dataset Source:</span>{" "}
                  {modelCardData?.dataset_source || "Prayas Energy Group RECS & BEE National Benchmarks"}
                </div>
                <div>
                  <span className="text-neutral-500 font-medium">Validation Protocol:</span> Zero-leakage chronological split (M1-24 train, M25-36 held-out test)
                </div>
              </div>

              {/* Benchmark Table */}
              <div className="overflow-x-auto pt-1">
                <table className="w-full text-xs text-left">
                  <thead className="bg-sky-100/70 text-neutral-700 font-semibold">
                    <tr>
                      <th className="py-1.5 px-2 rounded-l">Climate Profile</th>
                      <th className="py-1.5 px-2">Naive Baseline MAPE</th>
                      <th className="py-1.5 px-2">Model MAPE</th>
                      <th className="py-1.5 px-2 rounded-r">Error Reduction</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sky-200/60">
                    {(modelCardData?.metrics_summary || []).map((m, i) => (
                      <tr key={i} className="hover:bg-sky-100/40">
                        <td className="py-1.5 px-2 font-medium text-neutral-900">{m.climate_zone}</td>
                        <td className="py-1.5 px-2 text-neutral-500">{m.baseline_mape}%</td>
                        <td className="py-1.5 px-2 text-[#c2410c] font-bold">{m.model_mape}%</td>
                        <td className="py-1.5 px-2 text-sky-700 font-bold">+{m.improvement_pct}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-[11px] text-neutral-500 italic">
                *The model reduces forecast error by 60–76% compared to naive flat estimations by modeling summer cooling degree days.
              </p>
            </div>
          )}

          {/* Top Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-neutral-50/80 border border-neutral-200/80 rounded-xl shadow-2xs">
              <span className="text-xs font-semibold text-neutral-500">Current Monthly Avg</span>
              <p className="text-lg font-bold text-neutral-900 mt-1">{currentMonthlyUnits} <span className="text-xs font-normal text-neutral-500">kWh</span></p>
            </div>
            <div className="p-3.5 bg-neutral-50/80 border border-neutral-200/80 rounded-xl shadow-2xs">
              <span className="text-xs font-semibold text-neutral-500">Forecasted Annual Avg</span>
              <p className="text-lg font-bold text-[#c2410c] mt-1">{projectedAvgMonthly} <span className="text-xs font-normal text-neutral-500">kWh/mo</span></p>
            </div>
            <div className="p-3.5 bg-neutral-50/80 border border-neutral-200/80 rounded-xl shadow-2xs">
              <span className="text-xs font-semibold text-neutral-500">Summer Peak Month</span>
              <p className="text-lg font-bold text-amber-800 mt-1">{forecastResult?.peak_monthly_kwh || 0} <span className="text-xs font-normal text-neutral-500">kWh</span></p>
            </div>
            <div className="p-3.5 bg-neutral-50/80 border border-neutral-200/80 rounded-xl shadow-2xs">
              <span className="text-xs font-semibold text-neutral-500">Model Confidence</span>
              <p className="text-lg font-bold text-sky-800 mt-1">
                {Math.round((forecastResult?.confidence_score || 0.85) * 100)}%
              </p>
            </div>
          </div>

          {/* SVG Visualizer */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-4 sm:p-5 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between text-xs text-neutral-500 font-medium">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-1 bg-[#FE5A01] inline-block rounded"></span>
                  <span className="text-neutral-900 font-semibold">Seasonal Forecast</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-2 bg-orange-500/20 inline-block rounded border border-orange-300"></span>
                  <span>90% Confidence Band</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 border-t border-dashed border-neutral-400 inline-block"></span>
                  <span>Naive Flat Baseline</span>
                </div>
              </div>
              <span className="text-[11px] text-neutral-500 font-semibold">
                Horizon: {horizonMonths} Months
              </span>
            </div>

            <div className="relative w-full overflow-hidden bg-neutral-50/50 p-2 rounded-xl border border-neutral-100">
              <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-44">
                {/* Horizontal grid lines */}
                {[0.25, 0.5, 0.75, 1.0].map((frac, idx) => {
                  const yVal = chartHeight - 20 - frac * (chartHeight - 40)
                  return (
                    <g key={idx}>
                      <line
                        x1="30"
                        y1={yVal}
                        x2={chartWidth - 30}
                        y2={yVal}
                        stroke="#e2e8f0"
                        strokeDasharray="3 3"
                        strokeWidth="1"
                      />
                      <text x="5" y={yVal + 3} fill="#94a3b8" fontSize="8" fontWeight="600">
                        {Math.round(frac * maxVal)}
                      </text>
                    </g>
                  )
                })}

                {/* 90% Confidence Interval Band */}
                {bandPath && <path d={bandPath} fill="#FE5A01" fillOpacity="0.12" />}

                {/* Flat Naive Baseline */}
                {baselinePath && (
                  <path
                    d={baselinePath}
                    fill="none"
                    stroke="#94a3b8"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
                )}

                {/* Forecast Line */}
                {forecastPath && (
                  <path d={forecastPath} fill="none" stroke="#FE5A01" strokeWidth="2.5" />
                )}

                {/* Monthly Points */}
                {pts.map((p, idx) => (
                  <g key={idx}>
                    <circle
                      cx={getX(idx)}
                      cy={getY(p.forecast_kwh)}
                      r="4"
                      fill="#FE5A01"
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                    <text
                      x={getX(idx)}
                      y={chartHeight - 5}
                      fill="#64748b"
                      fontSize="9"
                      fontWeight="600"
                      textAnchor="middle"
                    >
                      {p.month_name}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          </div>

          {/* Scenario Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Climate & Growth */}
            <div className="p-4 sm:p-5 bg-white border border-neutral-200 rounded-2xl space-y-3.5 shadow-2xs">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-700 block">
                Regional Climate & Trend
              </span>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-neutral-700 font-semibold block mb-1">Climatic Zone</label>
                  <select
                    value={climateZone}
                    onChange={(e) => setClimateZone(e.target.value)}
                    className="w-full bg-white border border-neutral-300 rounded-lg px-3 py-1.5 text-xs text-neutral-800 focus:outline-none focus:border-[#FE5A01] shadow-2xs cursor-pointer"
                  >
                    <option value="composite">Composite (Delhi/NCR — Sharp Summer May/Jun)</option>
                    <option value="warm_humid">Warm & Humid (Mumbai/Chennai — Year-round warm)</option>
                    <option value="hot_dry">Hot & Dry (Ahmedabad/Jaipur — High Apr-Jun)</option>
                    <option value="moderate">Moderate (Bengaluru/Pune — Mild cooling)</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-neutral-700 font-semibold">Annual Demand Growth Rate</span>
                    <span className="text-[#c2410c] font-bold">+{annualGrowthRate}%/yr</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="8"
                    step="0.5"
                    value={annualGrowthRate}
                    onChange={(e) => setAnnualGrowthRate(parseFloat(e.target.value))}
                    className="w-full accent-[#FE5A01] cursor-pointer"
                    aria-label="Annual Demand Growth Rate percentage per year"
                  />
                </div>

                <div>
                  <label className="text-xs text-neutral-700 font-semibold block mb-1">Forecast Horizon</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[12, 24, 36].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setHorizonMonths(m)}
                        className={`py-1.5 text-xs rounded-lg border font-semibold transition-all cursor-pointer ${
                          horizonMonths === m
                            ? "bg-orange-50 border-[#FE5A01] text-[#c2410c] shadow-2xs"
                            : "bg-white border-neutral-200 hover:border-neutral-300 text-neutral-600 hover:text-neutral-900"
                        }`}
                      >
                        {m} Months
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Planned Appliance Additions */}
            <div className="p-4 sm:p-5 bg-white border border-neutral-200 rounded-2xl space-y-3.5 shadow-2xs">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-700 block">
                Planned Appliance Additions
              </span>
              <p className="text-xs text-neutral-500">
                Toggle anticipated household electrical additions to proactively size solar:
              </p>

              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={() => setHasEV(!hasEV)}
                  className={`w-full p-2.5 rounded-xl border flex items-center justify-between text-left transition-all cursor-pointer ${
                    hasEV
                      ? "bg-orange-50/80 border-[#FE5A01] text-neutral-900 shadow-2xs"
                      : "bg-neutral-50/60 border-neutral-200 text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Car className={`w-4 h-4 ${hasEV ? "text-[#FE5A01]" : "text-neutral-400"}`} />
                    <div>
                      <div className="text-xs font-bold text-neutral-900">Electric Vehicle (4W / 2W)</div>
                      <div className="text-[11px] text-neutral-500 font-medium">+200 kWh/month charging load</div>
                    </div>
                  </div>
                  <Badge variant={hasEV ? "default" : "outline"} className="text-[10px] font-bold">
                    {hasEV ? "Active" : "+ Add"}
                  </Badge>
                </button>

                <button
                  type="button"
                  onClick={() => setHasExtraAC(!hasExtraAC)}
                  className={`w-full p-2.5 rounded-xl border flex items-center justify-between text-left transition-all cursor-pointer ${
                    hasExtraAC
                      ? "bg-amber-50/80 border-amber-500 text-neutral-900 shadow-2xs"
                      : "bg-neutral-50/60 border-neutral-200 text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Wind className={`w-4 h-4 ${hasExtraAC ? "text-amber-600" : "text-neutral-400"}`} />
                    <div>
                      <div className="text-xs font-bold text-neutral-900">Additional 1.5-Ton Inverter AC</div>
                      <div className="text-[11px] text-neutral-500 font-medium">+150 kWh/month summer cooling</div>
                    </div>
                  </div>
                  <Badge variant={hasExtraAC ? "default" : "outline"} className="text-[10px] font-bold">
                    {hasExtraAC ? "Active" : "+ Add"}
                  </Badge>
                </button>

                <button
                  type="button"
                  onClick={() => setHasHeatPump(!hasHeatPump)}
                  className={`w-full p-2.5 rounded-xl border flex items-center justify-between text-left transition-all cursor-pointer ${
                    hasHeatPump
                      ? "bg-sky-50/80 border-sky-500 text-neutral-900 shadow-2xs"
                      : "bg-neutral-50/60 border-neutral-200 text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Flame className={`w-4 h-4 ${hasHeatPump ? "text-sky-600" : "text-neutral-400"}`} />
                    <div>
                      <div className="text-xs font-bold text-neutral-900">Heat Pump / Induction Range</div>
                      <div className="text-[11px] text-neutral-500 font-medium">+80 kWh/month water heating</div>
                    </div>
                  </div>
                  <Badge variant={hasHeatPump ? "default" : "outline"} className="text-[10px] font-bold">
                    {hasHeatPump ? "Active" : "+ Add"}
                  </Badge>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-200/80 bg-neutral-50/80 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-neutral-600 font-medium">
            Applying future demand will update assessment consumption to{" "}
            <span className="font-bold text-[#c2410c]">{projectedAvgMonthly} kWh/mo</span>.
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button variant="outline" size="sm" onClick={onClose} className="border-neutral-300 text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 text-xs rounded-lg font-semibold flex-1 sm:flex-initial cursor-pointer">
              Dismiss
            </Button>
            {onApplyProjectedUnits && (
              <Button
                variant="primary"
                size="sm"
                isLoading={loading}
                onClick={() => {
                  onApplyProjectedUnits(projectedAvgMonthly)
                  onClose()
                }}
                className="bg-[#FE5A01] hover:bg-[#e04f00] text-white text-xs font-bold gap-1.5 flex-1 sm:flex-initial rounded-lg shadow-xs cursor-pointer"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                Apply {projectedAvgMonthly} kWh/mo to Sizing
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
