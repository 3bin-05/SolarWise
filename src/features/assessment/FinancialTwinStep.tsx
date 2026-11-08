import React, { useState } from "react"
import { ArrowRight, ArrowLeft, ShieldCheck, Info, Sliders } from "lucide-react"
import { FinancialTwin } from "../../types/assessment"
import { Button } from "../../components/ui/Button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/Card"
import { MetricCard } from "../../components/solar/MetricCard"
import { AssumptionPill } from "../../components/solar/AssumptionPill"
import { ScenarioSimulatorModal } from "./ScenarioSimulatorModal"
import { JargonTooltip } from "../../components/ui/JargonTooltip"

export interface FinancialTwinStepProps {
  financial: FinancialTwin
  onContinue: () => void
  onBack: () => void
  baseParams?: {
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

export const FinancialTwinStep: React.FC<FinancialTwinStepProps> = ({
  financial,
  onContinue,
  onBack,
  baseParams,
  onApplyScenario,
}) => {
  const [isScenarioModalOpen, setIsScenarioModalOpen] = useState(false)

  const fallbackParams = baseParams || {
    monthly_consumption_kwh: 400,
    system_capacity_kw: 3.0,
    installed_cost: financial.netInitialInvestment + financial.subsidyAmount,
    annual_generation_kwh: 4350,
    daytime_usage_percentage: 45,
    evaluation_horizon_years: 25,
  }

  return (
    <div className="max-w-4xl mx-auto py-4 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              {/* Badge: Step 6 */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md border border-neutral-300 bg-white/95 text-xs font-semibold text-neutral-900 mb-2 shadow-2xs backdrop-blur-xs">
                <Sliders className="w-3.5 h-3.5 text-[#c2410c]" />
                <span>Step 6: Financial Twin</span>
              </div>
              <CardTitle className="text-2xl sm:text-3xl font-extrabold text-neutral-950 tracking-tight">
                Solar Financial Twin
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm text-neutral-600">
                Calculates the precise financial gap between your current electricity trajectory and
                post-solar cash flows.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsScenarioModalOpen(true)}
                title="Simulate rate inflation, panel degradation, battery storage, and 25-yr financial sensitivity"
                aria-label="Open What-If Scenario Simulator"
                className="gap-2 border-orange-200/90 bg-white hover:border-[#FE5A01] hover:bg-orange-50/60 text-neutral-800 hover:text-[#c2410c] text-xs font-semibold rounded-lg shadow-2xs hover:shadow-xs transition-all active:scale-[0.98] group cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5 text-[#FE5A01] shrink-0 group-hover:scale-110 transition-transform duration-200" />
                <span>Scenario Simulator</span>
              </Button>
              <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-[#c2410c] bg-orange-100/70 px-3 py-1 rounded-md border border-orange-200">
                <ShieldCheck className="h-4 w-4" /> Verified Marginal Model
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Main Financial Twin Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              label="Annual Savings"
              value={`₹${financial.annualSavings.toLocaleString()}`}
              unit="/yr"
              subtext="Self-consumption + Export"
              variant="highlight"
            />
            <MetricCard
              label="Simple Payback"
              value={financial.simplePaybackYears > 20 ? "> 20" : financial.simplePaybackYears}
              unit="Years"
              subtext={financial.simplePaybackYears <= 7 ? "Favorable Return" : "Extended Recovery"}
              variant={financial.simplePaybackYears <= 7 ? "success" : "warning"}
            />
            <MetricCard
              label="Net Investment"
              value={`₹${financial.netInitialInvestment.toLocaleString()}`}
              subtext={`After ₹${financial.subsidyAmount.toLocaleString()} Subsidy`}
              variant="default"
            />
            <MetricCard
              label="25-Year Net Benefit"
              value={`₹${(financial.twentyFiveYearNetSavings / 100000).toFixed(1)}L`}
              unit="Net"
              subtext={`ROI ~${financial.roiPercentage}%`}
              variant="default"
            />
          </div>

          {/* Savings Decomposition: Avoided Retail vs Export Compensation */}
          <div className="p-5 rounded-xl bg-neutral-50 border border-neutral-200 space-y-4">
            <h4 className="font-bold text-neutral-900 text-sm">
              Anatomy of Annual Savings (Deterministic Formula)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg border border-neutral-200">
                <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
                  <JargonTooltip
                    term="Self-Consumption"
                    definition="Solar units generated and consumed directly inside your home, offsetting high retail electricity tariff slabs directly."
                  >
                    <span>Self-Consumption Savings</span>
                  </JargonTooltip>
                  <span className="font-bold text-[#FE5A01]">Highest Value</span>
                </div>
                <div className="text-xl font-extrabold text-neutral-950">
                  ₹{financial.selfConsumptionSavings.toLocaleString()}
                </div>
                <p className="text-[11px] text-neutral-500 mt-1">
                  Generated solar units consumed directly at home, displacing retail slab tariffs.
                </p>
              </div>

              <div className="bg-white p-4 rounded-lg border border-neutral-200">
                <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
                  <JargonTooltip
                    term="Export Feed-in"
                    definition="The rate credited by your DISCOM (typically ₹2.50–₹3.50/unit) for surplus electricity exported into the grid."
                  >
                    <span>Export Feed-in Benefit</span>
                  </JargonTooltip>
                  <span className="font-bold text-amber-700">Discounted Tariff</span>
                </div>
                <div className="text-xl font-extrabold text-neutral-950">
                  ₹{financial.exportBenefit.toLocaleString()}
                </div>
                <p className="text-[11px] text-neutral-500 mt-1">
                  Surplus units injected back to DISCOM grid at the official feed-in / APPC rate.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2 text-xs text-neutral-500 pt-1">
              <Info className="h-4 w-4 text-[#FE5A01] shrink-0 mt-0.5" />
              <span>
                <strong>SolarWise Principle:</strong> We do NOT assume exported power receives retail
                rates. Over-sizing an installation to export energy usually degrades financial ROI.
              </span>
            </div>
          </div>

          {/* Cashflow Progression Table / Cumulative Bars */}
          <div className="space-y-3">
            <h4 className="font-bold text-neutral-900 text-sm">Cumulative Savings Horizon</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-neutral-200 text-neutral-500 uppercase font-semibold">
                    <th className="py-2 px-3">Horizon</th>
                    <th className="py-2 px-3">Cost Without Solar</th>
                    <th className="py-2 px-3">Cost With Solar</th>
                    <th className="py-2 px-3 text-right">Cumulative Net Savings</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {financial.yearlyCashFlows.map((row) => (
                    <tr key={row.year} className="hover:bg-neutral-50/60">
                      <td className="py-2.5 px-3 font-semibold text-neutral-800">
                        Year {row.year}
                      </td>
                      <td className="py-2.5 px-3 text-neutral-600">
                        ₹{row.withoutSolar.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-neutral-600">
                        ₹{row.withSolar.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-[#FE5A01]">
                        ₹{row.cumulativeSavings.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Active Assumptions Provenance */}
          <div className="space-y-2 pt-2 border-t border-neutral-100">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block">
              Explicit Model Assumptions
            </span>
            <div className="flex flex-wrap gap-2">
              <AssumptionPill label="Degradation" value="0.5% / year" status="verified" />
              <AssumptionPill label="Inverter Lifespan" value="12 Years" status="verified" />
              <AssumptionPill label="Tariff Escalation" value="3.0% / year" status="estimate" />
              <AssumptionPill label="Remaining Fixed Charges" value="Retained in bill" status="verified" />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
            <Button variant="outline" size="md" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
            <Button size="md" onClick={onContinue}>
              View Final Decision & Recommendations <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <ScenarioSimulatorModal
        isOpen={isScenarioModalOpen}
        onClose={() => setIsScenarioModalOpen(false)}
        baseParams={fallbackParams}
        onApplyScenario={onApplyScenario}
      />
    </div>
  )
}
