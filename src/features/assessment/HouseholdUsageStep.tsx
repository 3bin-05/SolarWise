import React, { useState, useEffect, useRef } from "react"
import {
  Sun,
  Moon,
  ArrowRight,
  ArrowLeft,
  Info,
  AlertTriangle,
  Zap,
  TrendingUp,
} from "lucide-react"
import { HouseholdUsage } from "../../types/assessment"
import { Button } from "../../components/ui/Button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/Card"
import { Input } from "../../components/ui/Input"
import { Label } from "../../components/ui/Label"
import { Badge } from "../../components/ui/Badge"
import { api, EnergyAnalysisApiResponse } from "../../services/api"
import { ForecastDemandModal } from "./ForecastDemandModal"

export interface HouseholdUsageStepProps {
  initialUsage: HouseholdUsage
  providerName?: string
  onConfirm: (updatedUsage: HouseholdUsage) => void
  onBack: () => void
  onChange?: (updatedUsage: HouseholdUsage) => void
}

export const HouseholdUsageStep: React.FC<HouseholdUsageStepProps> = ({
  initialUsage,
  providerName = "generic",
  onConfirm,
  onBack,
  onChange,
}) => {
  const [usage, setUsage] = useState<HouseholdUsage>(initialUsage)
  const [analysis, setAnalysis] = useState<EnergyAnalysisApiResponse | null>(null)
  const [isForecastModalOpen, setIsForecastModalOpen] = useState<boolean>(false)

  // Synchronize state if initialUsage updates externally (e.g. from Guided View)
  useEffect(() => {
    setUsage(initialUsage)
  }, [initialUsage])

  const isFirstMount = useRef(true)
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false
      return
    }
    onChange?.(usage)
  }, [usage, onChange])

  useEffect(() => {
    let isCancelled = false
    const runAnalysis = async () => {
      const res = await api.analyzeEnergy({
        monthly_units: usage.monthlyUnits,
        daytime_percentage: usage.daytimePercentage,
        has_frequent_outages: usage.hasFrequentOutages,
        avg_outage_hours_per_week: usage.avgOutageHoursPerWeek,
        provider: providerName,
      })
      if (!isCancelled) {
        setAnalysis(res)
      }
    }

    const timer = setTimeout(runAnalysis, 200)
    return () => {
      isCancelled = true
      clearTimeout(timer)
    }
  }, [
    usage.monthlyUnits,
    usage.daytimePercentage,
    usage.hasFrequentOutages,
    usage.avgOutageHoursPerWeek,
    providerName,
  ])

  const handleDaytimeChange = (newDaytime: number) => {
    setUsage((prev) => ({
      ...prev,
      daytimePercentage: newDaytime,
      nighttimePercentage: 100 - newDaytime,
    }))
  }

  const daytimeUnits = analysis?.daytime_units_monthly ?? (usage.monthlyUnits * usage.daytimePercentage) / 100
  const nighttimeUnits = analysis?.nighttime_units_monthly ?? (usage.monthlyUnits * usage.nighttimePercentage) / 100
  const annualUnits = analysis?.annual_consumption_kwh ?? usage.monthlyUnits * 12

  return (
    <div className="max-w-2xl mx-auto py-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              {/* Badge: Step 3 */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md border border-neutral-300 bg-white/95 text-xs font-semibold text-neutral-900 mb-2 shadow-2xs backdrop-blur-xs">
                <Sun className="w-3.5 h-3.5 text-[#c2410c]" />
                <span>Step 3: Household Usage</span>
              </div>
              <CardTitle className="text-2xl sm:text-3xl font-extrabold text-neutral-950 tracking-tight">
                Daytime vs. Nighttime Electricity Usage
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm text-neutral-600">
                Solar panels only generate during daylight hours. Your daytime consumption determines
                how much solar electricity offsets high retail tariff slabs directly.
              </CardDescription>
            </div>
            {analysis && (
              <Badge variant={analysis.is_low_consumption ? "warning" : "default"}>
                {analysis.consumption_tier}
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Low Consumption Unviability Alert */}
          {analysis?.unviability_warning && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
              <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Solar Viability Advisory</p>
                <p className="mt-0.5 leading-relaxed">{analysis.unviability_warning}</p>
              </div>
            </div>
          )}

          {/* Monthly Units Quick Override */}
          <div className="p-4 rounded-xl bg-neutral-50/70 border border-neutral-200/90 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Label>Baseline Monthly Consumption</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsForecastModalOpen(true)}
                  className="h-6 px-2 text-[11px] text-[#FE5A01] border-orange-200 hover:bg-orange-50 gap-1"
                >
                  <TrendingUp className="w-3 h-3 text-[#FE5A01]" />
                  Forecast Future (EV / AC)
                </Button>
              </div>
              <div className="text-xs text-neutral-500 mt-0.5">
                Extracted from bill or projected with seasonal cooling surges and appliance additions
              </div>
            </div>
            <div className="w-full sm:w-44">
              <div className="relative">
                <Input
                  type="number"
                  aria-label="Monthly electricity consumption in kilowatt hours"
                  value={usage.monthlyUnits}
                  onChange={(e) =>
                    setUsage((prev) => ({
                      ...prev,
                      monthlyUnits: Math.max(0, Number(e.target.value) || 0),
                    }))
                  }
                  className="font-bold text-base pr-12"
                />
                <span className="absolute right-3 top-2.5 text-xs text-neutral-400 font-semibold">
                  kWh/mo
                </span>
              </div>
            </div>
          </div>

          {/* Daytime vs Nighttime Slider */}
          <div className="p-5 rounded-xl bg-neutral-50/70 border border-neutral-200/90 space-y-4">
            <div className="flex items-center justify-between text-sm font-semibold">
              <span className="flex items-center gap-1.5 text-amber-700">
                <Sun className="h-4 w-4 text-amber-600" /> Daytime: {usage.daytimePercentage}%
                <span className="text-xs font-normal text-neutral-500 font-mono">
                  ({daytimeUnits.toFixed(0)} kWh/mo)
                </span>
              </span>
              <span className="flex items-center gap-1.5 text-indigo-700">
                <Moon className="h-4 w-4 text-indigo-600" /> Nighttime: {usage.nighttimePercentage}%
                <span className="text-xs font-normal text-neutral-500 font-mono">
                  ({nighttimeUnits.toFixed(0)} kWh/mo)
                </span>
              </span>
            </div>

            <input
              type="range"
              min="10"
              max="90"
              step="5"
              aria-label="Daytime electricity usage percentage"
              value={usage.daytimePercentage}
              onChange={(e) => handleDaytimeChange(Number(e.target.value))}
              className="w-full accent-[#FE5A01] cursor-pointer h-2 bg-neutral-200 rounded-lg"
            />

            {/* Dynamic Appliance Translation Guide */}
            <div className="p-3.5 rounded-xl bg-orange-50/60 border border-orange-200/80 text-xs space-y-1.5">
              <div className="flex items-center justify-between font-bold text-neutral-900">
                <span className="flex items-center gap-1.5 text-[#c2410c]">
                  <Zap className="w-3.5 h-3.5 text-[#FE5A01]" />
                  {usage.monthlyUnits <= 120
                    ? "Lifeline / Low Appliance Profile"
                    : usage.monthlyUnits <= 250
                    ? "Moderate 2-BHK Household Profile"
                    : usage.monthlyUnits <= 500
                    ? "Standard 3-BHK Household Profile"
                    : "High-Demand Villa / EV Profile"}
                </span>
                <span className="text-[10px] text-neutral-500 font-mono">
                  {usage.monthlyUnits} kWh/mo
                </span>
              </div>
              <p className="text-neutral-600 leading-relaxed">
                {usage.monthlyUnits <= 120
                  ? "Covers LED lighting, ceiling fans, 1 double-door refrigerator, and TV. Very low daytime cooling."
                  : usage.monthlyUnits <= 250
                  ? "Covers 1 inverter AC (3-4 hrs night), refrigerator, washing machine, TV, and basic electronics."
                  : usage.monthlyUnits <= 500
                  ? `Covers 2 split ACs (${usage.daytimePercentage >= 50 ? "daytime cooling" : "nighttime cooling"}), refrigerator, water heater, washing machine, and microwave.`
                  : "Covers 3+ split ACs running extensively, induction cooking, water pumps, or home EV charging."}
              </p>
            </div>

            <div className="flex items-start gap-2 text-xs text-neutral-600 bg-white p-3 rounded-lg border border-neutral-200/80">
              <Info className="h-4 w-4 text-[#FE5A01] shrink-0 mt-0.5" />
              <span>
                {usage.daytimePercentage >= 50
                  ? "Optimal daytime profile: Air conditioning, fans, and appliances consume power while the sun shines, maximizing avoided retail tariff savings."
                  : "High nighttime usage: Surplus daylight solar will be exported to the grid at lower compensation unless a battery is installed."}
              </span>
            </div>
          </div>

          {/* Energy Summary Pills */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-lg border border-neutral-200 bg-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-[#FE5A01]" />
                <span className="text-neutral-600">Projected Annual Demand</span>
              </div>
              <span className="font-bold text-neutral-900 font-mono">
                {annualUnits.toLocaleString()} kWh/yr
              </span>
            </div>

            <div className="p-3.5 rounded-lg border border-neutral-200 bg-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-[#FE5A01]" />
                <span className="text-neutral-600">Avoided Marginal Tariff</span>
              </div>
              <span className="font-bold text-[#FE5A01] font-mono">
                ₹{analysis?.marginal_tariff_rate.toFixed(2) ?? "7.00"}/kWh
              </span>
            </div>
          </div>

          {/* Grid Outages */}
          <div className="space-y-3">
            <Label>Power Cuts & Grid Outage Frequency</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() =>
                  setUsage((prev) => ({
                    ...prev,
                    hasFrequentOutages: false,
                    avgOutageHoursPerWeek: 0,
                  }))
                }
                className={`p-3 rounded-xl border text-left text-sm transition-all cursor-pointer ${
                  !usage.hasFrequentOutages
                    ? "border-[#FE5A01] bg-orange-50/70 font-semibold text-orange-950 shadow-2xs"
                    : "border-neutral-200 hover:bg-neutral-50 text-neutral-700"
                }`}
              >
                Rare / Minimal Outages
                <p className="text-xs font-normal text-neutral-500 mt-1">Standard on-grid system recommended</p>
              </button>

              <button
                type="button"
                onClick={() =>
                  setUsage((prev) => ({
                    ...prev,
                    hasFrequentOutages: true,
                    avgOutageHoursPerWeek: 6,
                  }))
                }
                className={`p-3 rounded-xl border text-left text-sm transition-all cursor-pointer ${
                  usage.hasFrequentOutages
                    ? "border-[#FE5A01] bg-orange-50/70 font-semibold text-orange-950 shadow-2xs"
                    : "border-neutral-200 hover:bg-neutral-50 text-neutral-700"
                }`}
              >
                Frequent Outages (&gt;3 hrs/wk)
                <p className="text-xs font-normal text-neutral-500 mt-1">Hybrid inverter + battery storage option</p>
              </button>
            </div>
          </div>

          {/* Budget Limit */}
          <div>
            <Label>Capital Budget Limit (Optional)</Label>
            <div className="relative mt-1">
              <Input
                type="number"
                placeholder="e.g. 250000"
                value={usage.budget ?? ""}
                onChange={(e) =>
                  setUsage((prev) => ({
                    ...prev,
                    budget: e.target.value ? Number(e.target.value) : null,
                  }))
                }
                className="pr-12"
              />
              <span className="absolute right-3 top-2.5 text-xs text-neutral-400 font-semibold">
                INR (₹)
              </span>
            </div>
            <span className="text-[11px] text-neutral-500 mt-1 block">
              Leave blank to calculate the optimal engineering size without budget constraints.
            </span>
          </div>

          {/* Navigation Bar */}
          <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
            <Button variant="outline" size="md" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Bill
            </Button>
            <Button size="md" onClick={() => onConfirm(usage)}>
              Continue to Roof & Location <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <ForecastDemandModal
        isOpen={isForecastModalOpen}
        onClose={() => setIsForecastModalOpen(false)}
        currentMonthlyUnits={usage.monthlyUnits}
        onApplyProjectedUnits={(newUnits) =>
          setUsage((prev) => ({
            ...prev,
            monthlyUnits: newUnits,
          }))
        }
      />
    </div>
  )
}
