import React from "react"
import { Sun, ShieldAlert, ArrowRight, CheckCircle2, TrendingUp, DollarSign } from "lucide-react"
import { Button } from "../../components/ui/Button"
import { Card } from "../../components/ui/Card"

export interface LandingStepProps {
  onStart: () => void
  onSelectScenario: (scenario: "attractive" | "not-recommended") => void
}

export const LandingStep: React.FC<LandingStepProps> = ({
  onStart,
  onSelectScenario,
}) => {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Hero Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-xs font-semibold text-emerald-800 mb-5 shadow-xs">
          <Sun className="h-4 w-4 text-emerald-600" />
          <span>Independent Household Solar Feasibility Platform</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-neutral-950 tracking-tight mb-4 leading-tight">
          Should Your Household <span className="text-emerald-700">Install Solar?</span>
        </h1>
        <p className="text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed">
          Not all homes benefit from solar. SolarWise uses deterministic physics, verified tariffs,
          and actual self-consumption rates to determine if solar is genuinely worth your investment—or
          if you should wait.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="lg" onClick={onStart} className="w-full sm:w-auto text-base h-12 px-8">
            Start Free Assessment <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>

      {/* Philosophy Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Card className="p-6">
          <div className="h-10 w-10 rounded-lg bg-emerald-100/80 text-emerald-700 flex items-center justify-center mb-4">
            <DollarSign className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-neutral-900 mb-2">Marginal Tariff Reality</h3>
          <p className="text-sm text-neutral-600 leading-relaxed">
            We don&apos;t assume all solar energy offsets retail rates. Exported surplus gets lower feed-in
            tariffs, and fixed meter charges always remain.
          </p>
        </Card>

        <Card className="p-6">
          <div className="h-10 w-10 rounded-lg bg-emerald-100/80 text-emerald-700 flex items-center justify-center mb-4">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-neutral-900 mb-2">Willing to Say No</h3>
          <p className="text-sm text-neutral-600 leading-relaxed">
            If your consumption is low, payback exceeds 10 years, or shading is severe, SolarWise will
            explicitly advise against installation.
          </p>
        </Card>

        <Card className="p-6">
          <div className="h-10 w-10 rounded-lg bg-emerald-100/80 text-emerald-700 flex items-center justify-center mb-4">
            <TrendingUp className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-neutral-900 mb-2">Self-Consumption Matching</h3>
          <p className="text-sm text-neutral-600 leading-relaxed">
            We model daytime vs. nighttime power usage to prevent installers from selling you an
            oversized, uneconomical system.
          </p>
        </Card>
      </div>

      {/* Interactive Scenario Testers */}
      <div className="rounded-xl border border-neutral-200 bg-neutral-50/80 p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-neutral-950 text-sm">
              Explore How SolarWise Reasons Across Different Households
            </h4>
            <p className="text-xs text-neutral-500 mt-0.5">
              Load realistic preset profiles to immediately evaluate explainable decision outcomes.
            </p>
          </div>
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSelectScenario("attractive")}
              className="text-xs flex-1 sm:flex-initial"
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 mr-1" />
              Standard Viable Case
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSelectScenario("not-recommended")}
              className="text-xs flex-1 sm:flex-initial"
            >
              <ShieldAlert className="h-3.5 w-3.5 text-rose-600 mr-1" />
              Low Usage / Unviable Case
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
