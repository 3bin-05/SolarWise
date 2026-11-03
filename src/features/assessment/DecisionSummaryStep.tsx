import React from "react"
import { CheckCircle2, AlertTriangle, XCircle, ArrowLeft, Download, RotateCcw, Sparkles } from "lucide-react"
import { DecisionResult, SolarRecommendation, FinancialTwin } from "../../types/assessment"
import { Button } from "../../components/ui/Button"
import { Card, CardContent } from "../../components/ui/Card"
import { DecisionBadge } from "../../components/solar/DecisionBadge"

export interface DecisionSummaryStepProps {
  decision: DecisionResult
  recommendation: SolarRecommendation
  financial: FinancialTwin
  onRestart: () => void
  onExport: () => void
  onBack: () => void
}

export const DecisionSummaryStep: React.FC<DecisionSummaryStepProps> = ({
  decision,
  recommendation,
  financial,
  onRestart,
  onExport,
  onBack,
}) => {
  const isRecommended =
    decision.outcome === "Attractive" || decision.outcome === "Strongly attractive"

  return (
    <div className="max-w-4xl mx-auto py-4 space-y-6">
      <Card className="overflow-hidden border-2">
        {/* Outcome Header Banner */}
        <div
          className={`p-6 sm:p-8 border-b ${
            isRecommended
              ? "bg-emerald-50/70 border-emerald-200"
              : "bg-rose-50/70 border-rose-200"
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <span className="text-xs font-bold tracking-wider uppercase text-neutral-500">
              SolarWise Independent Verdict
            </span>
            <DecisionBadge outcome={decision.outcome} size="lg" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 mb-3 leading-tight">
            {decision.headline}
          </h2>
          <p className="text-sm sm:text-base text-neutral-700 leading-relaxed max-w-3xl">
            {decision.explanation}
          </p>

          <div className="flex items-center gap-2 mt-4 text-xs font-semibold text-neutral-600">
            <span>Assessment Confidence:</span>
            <span className="px-2 py-0.5 rounded bg-white border border-neutral-300 font-mono">
              {decision.confidenceScore}% High Confidence
            </span>
          </div>
        </div>

        <CardContent className="p-6 sm:p-8 space-y-8">
          {/* Key Deciding Factors */}
          <div>
            <h3 className="text-base font-bold text-neutral-950 mb-3">
              Why SolarWise Reached This Conclusion
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {decision.keyFactors.map((factor, idx) => {
                const Icon =
                  factor.impact === "positive"
                    ? CheckCircle2
                    : factor.impact === "negative"
                    ? XCircle
                    : AlertTriangle
                const colorClass =
                  factor.impact === "positive"
                    ? "text-emerald-700 bg-emerald-50/50 border-emerald-200"
                    : factor.impact === "negative"
                    ? "text-rose-700 bg-rose-50/50 border-rose-200"
                    : "text-amber-700 bg-amber-50/50 border-amber-200"

                return (
                  <div key={idx} className={`p-4 rounded-xl border ${colorClass} space-y-1.5`}>
                    <div className="flex items-center gap-2 font-bold text-xs">
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{factor.factor}</span>
                    </div>
                    <p className="text-xs text-neutral-600 leading-normal">
                      {factor.description}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Actionable Recommendations to Improve Outcome */}
          <div className="p-5 rounded-xl bg-neutral-50 border border-neutral-200">
            <h4 className="text-sm font-bold text-neutral-950 flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-emerald-600" /> Actionable Household Guidance
            </h4>
            <ul className="space-y-2 text-xs text-neutral-600 pl-1">
              {decision.actionableImprovements.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 shrink-0 mt-1.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Sizing & Financial Digest */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-white border border-neutral-200 text-center">
            <div>
              <span className="text-[11px] font-semibold text-neutral-500 uppercase block">
                System Size
              </span>
              <span className="text-lg font-bold text-neutral-950">
                {recommendation.recommendedCapacityKw > 0
                  ? `${recommendation.recommendedCapacityKw} kWp`
                  : "0 kW"}
              </span>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-neutral-500 uppercase block">
                Simple Payback
              </span>
              <span
                className={`text-lg font-bold ${
                  financial.simplePaybackYears <= 7 ? "text-emerald-700" : "text-amber-700"
                }`}
              >
                {financial.simplePaybackYears > 20
                  ? "> 20 yrs"
                  : `${financial.simplePaybackYears} yrs`}
              </span>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-neutral-500 uppercase block">
                Annual Benefit
              </span>
              <span className="text-lg font-bold text-neutral-950">
                ₹{financial.annualSavings.toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-neutral-500 uppercase block">
                Net Investment
              </span>
              <span className="text-lg font-bold text-neutral-950">
                ₹{financial.netInitialInvestment.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-neutral-100">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button variant="outline" size="md" onClick={onBack}>
                <ArrowLeft className="h-4 w-4 mr-1" /> Back
              </Button>
              <Button variant="secondary" size="md" onClick={onRestart}>
                <RotateCcw className="h-4 w-4 mr-1" /> New Assessment
              </Button>
            </div>

            <Button size="md" onClick={onExport} className="w-full sm:w-auto">
              <Download className="h-4 w-4 mr-1" /> Export Feasibility Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
