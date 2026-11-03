import React, { useState } from "react"
import { Sun, Moon, ArrowRight, ArrowLeft, Info } from "lucide-react"
import { HouseholdUsage } from "../../types/assessment"
import { Button } from "../../components/ui/Button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/Card"
import { Input } from "../../components/ui/Input"
import { Label } from "../../components/ui/Label"

export interface HouseholdUsageStepProps {
  initialUsage: HouseholdUsage
  onConfirm: (updatedUsage: HouseholdUsage) => void
  onBack: () => void
}

export const HouseholdUsageStep: React.FC<HouseholdUsageStepProps> = ({
  initialUsage,
  onConfirm,
  onBack,
}) => {
  const [usage, setUsage] = useState<HouseholdUsage>(initialUsage)

  const handleDaytimeChange = (newDaytime: number) => {
    setUsage((prev) => ({
      ...prev,
      daytimePercentage: newDaytime,
      nighttimePercentage: 100 - newDaytime,
    }))
  }

  return (
    <div className="max-w-2xl mx-auto py-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Daytime vs. Nighttime Electricity Usage</CardTitle>
          <CardDescription>
            Solar generation peaks from 9 AM to 4 PM. Your daytime consumption determines how much
            solar power you self-consume directly without relying on discounted grid feed-in rates.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Daytime vs Nighttime Slider */}
          <div className="p-5 rounded-xl bg-neutral-50 border border-neutral-200 space-y-4">
            <div className="flex items-center justify-between text-sm font-semibold">
              <span className="flex items-center gap-1.5 text-amber-700">
                <Sun className="h-4 w-4" /> Daytime (6 AM - 6 PM): {usage.daytimePercentage}%
              </span>
              <span className="flex items-center gap-1.5 text-indigo-700">
                <Moon className="h-4 w-4" /> Nighttime (6 PM - 6 AM): {usage.nighttimePercentage}%
              </span>
            </div>

            <input
              type="range"
              min="10"
              max="90"
              step="5"
              value={usage.daytimePercentage}
              onChange={(e) => handleDaytimeChange(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer h-2 bg-neutral-200 rounded-lg"
            />

            <div className="flex items-start gap-2 text-xs text-neutral-500 bg-white p-3 rounded-lg border border-neutral-200/80">
              <Info className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                {usage.daytimePercentage >= 50
                  ? "High daytime usage is optimal: your solar energy directly displaces costly retail tariff units."
                  : "High nighttime usage: unless you install a battery or your utility offers 1:1 net metering, surplus solar is exported at lower compensation."}
              </span>
            </div>
          </div>

          {/* Grid Outages */}
          <div className="space-y-3">
            <Label>Power Cuts & Grid Outages</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setUsage((prev) => ({ ...prev, hasFrequentOutages: false }))}
                className={`p-3 rounded-xl border text-left text-sm transition-all cursor-pointer ${
                  !usage.hasFrequentOutages
                    ? "border-emerald-600 bg-emerald-50/60 font-semibold text-emerald-950"
                    : "border-neutral-200 hover:bg-neutral-50 text-neutral-700"
                }`}
              >
                Rare / Minimal Outages
                <p className="text-xs font-normal text-neutral-500 mt-1">Standard on-grid system recommended</p>
              </button>

              <button
                type="button"
                onClick={() => setUsage((prev) => ({ ...prev, hasFrequentOutages: true }))}
                className={`p-3 rounded-xl border text-left text-sm transition-all cursor-pointer ${
                  usage.hasFrequentOutages
                    ? "border-emerald-600 bg-emerald-50/60 font-semibold text-emerald-950"
                    : "border-neutral-200 hover:bg-neutral-50 text-neutral-700"
                }`}
              >
                Frequent Outages (&gt;3 hrs/wk)
                <p className="text-xs font-normal text-neutral-500 mt-1">
                  Evaluate hybrid inverter with battery backup
                </p>
              </button>
            </div>
          </div>

          {/* Budget */}
          <div>
            <Label>Estimated Budget (Optional, ₹)</Label>
            <Input
              type="number"
              placeholder="e.g. 200000"
              value={usage.budget ?? ""}
              onChange={(e) =>
                setUsage((prev) => ({
                  ...prev,
                  budget: e.target.value ? Number(e.target.value) : null,
                }))
              }
            />
            <span className="text-[11px] text-neutral-500 mt-1 block">
              Leave blank to calculate unconstrained optimal system sizing.
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
            <Button variant="outline" size="md" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
            <Button size="md" onClick={() => onConfirm(usage)}>
              Continue to Roof & Location <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
