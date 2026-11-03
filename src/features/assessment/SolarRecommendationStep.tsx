import React from "react"
import {
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Layers,
  Cpu,
  ShieldCheck,
} from "lucide-react"
import { SolarRecommendation } from "../../types/assessment"
import { Button } from "../../components/ui/Button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/Card"
import { MetricCard } from "../../components/solar/MetricCard"
import { Badge } from "../../components/ui/Badge"

export interface SolarRecommendationStepProps {
  recommendation: SolarRecommendation
  onContinue: () => void
  onBack: () => void
}

export const SolarRecommendationStep: React.FC<SolarRecommendationStepProps> = ({
  recommendation,
  onContinue,
  onBack,
}) => {
  const panel = recommendation.panelModel
  const inverter = recommendation.inverterModel
  const battery = recommendation.batteryModel
  const constraints = recommendation.technicalConstraints || []

  return (
    <div className="max-w-4xl mx-auto py-4 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-2xl">Recommended System Sizing & Equipment</CardTitle>
              <CardDescription>
                Engineered to maximize self-consumption and prevent uneconomical over-generation.
              </CardDescription>
            </div>
            <Badge variant="default" className="self-start sm:self-auto text-xs py-1 px-3">
              {recommendation.systemType} Architecture
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Key Metric Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              label="System Capacity"
              value={recommendation.recommendedCapacityKw}
              unit="kWp"
              subtext={`${recommendation.panelCount} × ${recommendation.panelWattage}W Panels`}
              variant="highlight"
            />
            <MetricCard
              label="Annual Generation"
              value={recommendation.annualGenerationKwh.toLocaleString()}
              unit="kWh/yr"
              subtext="~4.0 Peak Sun Hours/day"
              variant="default"
            />
            <MetricCard
              label="Estimated Cost Range"
              value={`₹${(recommendation.estimatedCostMin / 1000).toFixed(0)}k–${(
                recommendation.estimatedCostMax / 1000
              ).toFixed(0)}k`}
              subtext="Turnkey system before subsidy"
              variant="default"
            />
            <MetricCard
              label="Inverter Sizing"
              value={`${recommendation.inverterRatingKw} kW`}
              subtext={recommendation.batteryRecommended ? "Hybrid Inverter" : "String Inverter"}
              variant="default"
            />
          </div>

          {/* Detailed Matched Equipment Cards */}
          <div className="space-y-3 pt-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-600 flex items-center gap-2">
              <Cpu className="h-4 w-4 text-emerald-600" /> Matched Hardware Components
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Solar Panels Card */}
              <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/70 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-neutral-500 uppercase">PV Modules</span>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0.5">
                    {recommendation.panelWattage}W Tier-1
                  </Badge>
                </div>
                <div>
                  <h4 className="font-semibold text-neutral-900 text-sm">
                    {panel?.model || `${recommendation.panelCount} × Mono PERC Panels`}
                  </h4>
                  <p className="text-xs text-neutral-500">
                    {panel?.manufacturer || "Tier-1 Domestic Manufacturer"}
                  </p>
                </div>
                <div className="pt-1 text-xs text-neutral-600 space-y-1">
                  <div className="flex justify-between">
                    <span>Array Count:</span>
                    <span className="font-medium text-neutral-900">{recommendation.panelCount} panels</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Efficiency:</span>
                    <span className="font-medium text-neutral-900">
                      {panel?.efficiency_pct ? `${panel.efficiency_pct}%` : "20.9%"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Performance Life:</span>
                    <span className="font-medium text-neutral-900">25 Years Linear</span>
                  </div>
                </div>
              </div>

              {/* Inverter Card */}
              <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/70 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-neutral-500 uppercase">Inverter</span>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0.5">
                    {recommendation.inverterRatingKw} kW Rating
                  </Badge>
                </div>
                <div>
                  <h4 className="font-semibold text-neutral-900 text-sm">
                    {inverter?.model || `${recommendation.inverterRatingKw} kW String Inverter`}
                  </h4>
                  <p className="text-xs text-neutral-500">
                    {inverter?.manufacturer || "Grid-Tied MPPT Inverter"}
                  </p>
                </div>
                <div className="pt-1 text-xs text-neutral-600 space-y-1">
                  <div className="flex justify-between">
                    <span>Phase:</span>
                    <span className="font-medium text-neutral-900">
                      {inverter?.phase === "three-phase" || recommendation.recommendedCapacityKw > 5
                        ? "Three-Phase 415V"
                        : "Single-Phase 230V"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>DC/AC Loading:</span>
                    <span className="font-medium text-neutral-900">
                      {recommendation.dcAcRatio ? `${recommendation.dcAcRatio}x` : "1.18x"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Peak Efficiency:</span>
                    <span className="font-medium text-neutral-900">
                      {inverter?.max_efficiency_pct ? `${inverter.max_efficiency_pct}%` : "98.2%"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Battery Card */}
              <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/70 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-neutral-500 uppercase">Battery Storage</span>
                  <Badge
                    variant={recommendation.batteryRecommended ? "default" : "outline"}
                    className="text-[10px] px-1.5 py-0.5"
                  >
                    {recommendation.batteryRecommended ? "Recommended" : "Not Required"}
                  </Badge>
                </div>
                {recommendation.batteryRecommended ? (
                  <>
                    <div>
                      <h4 className="font-semibold text-neutral-900 text-sm">
                        {battery?.model || `${recommendation.batteryCapacityKwh} kWh LiFePO4`}
                      </h4>
                      <p className="text-xs text-neutral-500">
                        {battery?.manufacturer || "Lithium Iron Phosphate"}
                      </p>
                    </div>
                    <div className="pt-1 text-xs text-neutral-600 space-y-1">
                      <div className="flex justify-between">
                        <span>Nominal Capacity:</span>
                        <span className="font-medium text-neutral-900">
                          {recommendation.batteryCapacityKwh} kWh
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Chemistry:</span>
                        <span className="font-medium text-neutral-900">LiFePO4 (6000 cycles)</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Depth of Discharge:</span>
                        <span className="font-medium text-neutral-900">90% DoD</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <h4 className="font-semibold text-neutral-800 text-sm">Pure Grid-Tied System</h4>
                      <p className="text-xs text-neutral-500">No chemical battery required</p>
                    </div>
                    <p className="text-[11px] text-neutral-500 leading-relaxed pt-1">
                      Low outage frequency makes battery capital expense (₹80k+) unviable. Net metering acts
                      as a virtual battery without maintenance.
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Technical Constraints Verification */}
          {constraints.length > 0 && (
            <div className="p-4 rounded-xl border border-neutral-200 bg-white space-y-3">
              <h4 className="font-bold text-neutral-900 text-sm flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600" /> Engineering & Regulatory Constraint Checks
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {constraints.map((c, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg border text-xs ${
                      c.status === "pass"
                        ? "bg-emerald-50/50 border-emerald-200/80 text-emerald-950"
                        : "bg-amber-50/50 border-amber-200/80 text-amber-950"
                    }`}
                  >
                    <div className="flex items-center justify-between font-semibold mb-1">
                      <span>{c.name}</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                          c.status === "pass" ? "bg-emerald-200 text-emerald-800" : "bg-amber-200 text-amber-800"
                        }`}
                      >
                        {c.status}
                      </span>
                    </div>
                    <p className="font-mono text-[11px] opacity-90 mb-0.5">{c.value}</p>
                    <p className="text-[11px] opacity-80">{c.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Engineering Reasons & Constraints */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="p-5 rounded-xl bg-neutral-50 border border-neutral-200">
              <h4 className="font-bold text-neutral-900 text-sm flex items-center gap-2 mb-3">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Key Engineering Reasons
              </h4>
              <ul className="space-y-2 text-xs text-neutral-600">
                {recommendation.keyReasons.map((reason, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 shrink-0 mt-1.5" />
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-5 rounded-xl bg-neutral-50 border border-neutral-200">
              <h4 className="font-bold text-neutral-900 text-sm flex items-center gap-2 mb-3">
                <AlertCircle className="h-4 w-4 text-amber-600" /> Engineering Trade-Offs
              </h4>
              <ul className="space-y-2 text-xs text-neutral-600">
                {recommendation.tradeOffs.map((tradeoff, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-600 shrink-0 mt-1.5" />
                    <span>{tradeoff}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Alternative System Consideration */}
          <div className="p-4 rounded-xl border border-neutral-200 bg-white">
            <div className="flex items-start gap-3">
              <Layers className="h-5 w-5 text-neutral-500 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Alternative Configuration Evaluated
                </span>
                <p className="text-sm font-semibold text-neutral-900 mt-0.5">
                  {recommendation.alternativeSystem.capacityKw} kW{" "}
                  {recommendation.alternativeSystem.systemType} System
                </p>
                <p className="text-xs text-neutral-600 mt-1">
                  {recommendation.alternativeSystem.reason}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
            <Button variant="outline" size="md" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
            <Button size="md" onClick={onContinue}>
              View Financial Twin & Payback <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
