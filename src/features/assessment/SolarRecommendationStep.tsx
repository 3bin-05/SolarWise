import React from "react"
import { CheckCircle2, AlertCircle, ArrowRight, ArrowLeft, Layers } from "lucide-react"
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
