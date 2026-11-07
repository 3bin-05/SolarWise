import React, { useState, useEffect } from "react"
import {
  X,
  Printer,
  Download,
  Save,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Copy,
  ExternalLink,
  ShieldCheck,
  Building,
  Award,
} from "lucide-react"
import {
  api,
  FeasibilityReportResponse,
  ReportExportRequest,
} from "../../services/api"
import { AssessmentState } from "../../types/assessment"
import { Button } from "../../components/ui/Button"
import { Card } from "../../components/ui/Card"

interface FeasibilityReportModalProps {
  isOpen: boolean
  onClose: () => void
  assessment: AssessmentState
}

export const FeasibilityReportModal: React.FC<FeasibilityReportModalProps> = ({
  isOpen,
  onClose,
  assessment,
}) => {
  const [report, setReport] = useState<FeasibilityReportResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"overview" | "technical" | "financial" | "providers">("overview")
  const [savedId, setSavedId] = useState<string | null>(null)
  const [saveStatus, setSaveStatus] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

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

    setLoading(true)
    const exportRequest: ReportExportRequest = {
      title: "SolarWise Household Feasibility & Engineering Docket",
      bill_data: assessment.bill,
      usage_data: assessment.usage,
      location_roof_data: assessment.locationRoof,
      recommendation_data: assessment.recommendation,
      financial_twin_data: assessment.financial,
      decision_data: assessment.decision,
    }

    api
      .exportReport(exportRequest)
      .then((rep) => {
        setReport(rep)
      })
      .catch((err) => {
        console.error("Failed to generate report:", err)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [isOpen, assessment])

  if (!isOpen) return null

  const handlePrint = async () => {
    if (!report) return
    const exportRequest: ReportExportRequest = {
      assessment_id: savedId || report.assessment_id,
      bill_data: assessment.bill,
      usage_data: assessment.usage,
      location_roof_data: assessment.locationRoof,
      recommendation_data: assessment.recommendation,
      financial_twin_data: assessment.financial,
      decision_data: assessment.decision,
    }

    const html = await api.getReportHtml(exportRequest, savedId || undefined)
    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(html)
      printWindow.document.close()
      printWindow.focus()
      setTimeout(() => {
        printWindow.print()
      }, 300)
    }
  }

  const handleDownloadJson = () => {
    if (!report) return
    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: "application/json",
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `SolarWise-Feasibility-Docket-${report.report_id}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleSaveAssessment = async () => {
    setSaveStatus("saving")
    try {
      const res = await api.saveAssessment(assessment)
      setSavedId(res.id)
      setSaveStatus("saved")
      if (report) {
        setReport({ ...report, assessment_id: res.id })
      }
    } catch {
      setSaveStatus("error")
    }
  }

  const handleCopyId = () => {
    const idToCopy = savedId || report?.report_id || ""
    navigator.clipboard.writeText(idToCopy)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const isRecommended =
    report?.summary.verdict_outcome === "Attractive" ||
    report?.summary.verdict_outcome === "Strongly attractive"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <Card className="w-full max-w-4xl bg-white border border-slate-200 shadow-2xl rounded-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-orange-100 text-[#FE5A01]">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 leading-tight">
                Solar Feasibility & Engineering Docket
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-500 font-mono mt-0.5">
                <span>{report?.report_id || "Generating..."}</span>
                {savedId && (
                  <>
                    <span>•</span>
                    <span className="text-[#FE5A01] font-semibold">Saved: {savedId}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveAssessment}
              disabled={saveStatus === "saving" || saveStatus === "saved"}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${
                saveStatus === "saved"
                  ? "bg-orange-50 text-[#FE5A01] border-orange-300"
                  : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-sm"
              }`}
            >
              {saveStatus === "saved" ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#FE5A01]" /> Saved
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5 text-slate-600" />
                  {saveStatus === "saving" ? "Saving..." : "Save Assessment"}
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="py-20 text-center space-y-3">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#FE5A01] border-t-transparent" />
              <p className="text-sm font-semibold text-slate-600">
                Compiling technical parameters, yield models, and verified installer registry...
              </p>
            </div>
          ) : report ? (
            <>
              {/* Verdict Summary Box */}
              <div
                className={`p-5 rounded-2xl border ${
                  isRecommended
                    ? "bg-orange-50/80 border-orange-200 text-neutral-950"
                    : "bg-rose-50/80 border-rose-200 text-rose-950"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                      isRecommended
                        ? "bg-orange-100 text-[#FE5A01] border border-orange-200"
                        : "bg-rose-200 text-rose-900"
                    }`}
                  >
                    {report.summary.verdict_outcome}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    Engineered Feasibility Confidence: {report.summary.confidence_score}%
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-1.5">{report.summary.headline}</h3>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {report.summary.explanation}
                </p>
              </div>

              {/* 4 Key Metric Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                    Recommended PV
                  </span>
                  <span className="text-xl font-extrabold text-slate-900 block mt-1">
                    {report.technical.capacity_kw} kWp
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {report.technical.panel_count} Modules ({report.technical.panel_wattage}W)
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                    Simple Payback
                  </span>
                  <span className="text-xl font-extrabold text-[#FE5A01] block mt-1">
                    {report.financial.simple_payback_years} Yrs
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Break-even: Year {report.financial.break_even_year || "N/A"}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                    Net Outlay
                  </span>
                  <span className="text-xl font-extrabold text-slate-900 block mt-1">
                    ₹{report.financial.net_initial_investment_inr.toLocaleString()}
                  </span>
                  <span className="text-[11px] text-[#FE5A01] font-semibold">
                    Incl. ₹{report.financial.pm_surya_ghar_subsidy_inr.toLocaleString()} CFA
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                    25-Yr Net Savings
                  </span>
                  <span className="text-xl font-extrabold text-[#FE5A01] block mt-1">
                    ₹{report.financial.twenty_five_year_net_savings_inr.toLocaleString()}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    NPV: ₹{report.financial.npv_inr.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex border-b border-slate-200 gap-4 text-xs font-bold uppercase tracking-wider">
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`pb-2.5 transition border-b-2 cursor-pointer ${
                    activeTab === "overview"
                      ? "border-[#FE5A01] text-[#FE5A01]"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Overview & Actions
                </button>
                <button
                  onClick={() => setActiveTab("technical")}
                  className={`pb-2.5 transition border-b-2 cursor-pointer ${
                    activeTab === "technical"
                      ? "border-[#FE5A01] text-[#FE5A01]"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Technical Specs
                </button>
                <button
                  onClick={() => setActiveTab("financial")}
                  className={`pb-2.5 transition border-b-2 cursor-pointer ${
                    activeTab === "financial"
                      ? "border-[#FE5A01] text-[#FE5A01]"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Financial Twin
                </button>
                <button
                  onClick={() => setActiveTab("providers")}
                  className={`pb-2.5 transition border-b-2 cursor-pointer ${
                    activeTab === "providers"
                      ? "border-[#FE5A01] text-[#FE5A01]"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Policy & Providers
                </button>
              </div>

              {/* Tab 1: Overview */}
              {activeTab === "overview" && (
                <div className="space-y-4">
                  {!isRecommended && (
                    <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/60 space-y-2.5">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                        Key Engineering Reasons Why Solar Is Unviable:
                      </h4>
                      <ul className="space-y-2 text-xs text-neutral-800">
                        {(assessment?.decision.reasonsNotRecommended || [
                          `Low Monthly Baseline Consumption (${assessment?.bill.units || 85} kWh): Billed under heavily subsidized lower slabs, meaning solar capital yields low monthly bill savings.`,
                          `Extended Payback Horizon (${assessment?.financial.simplePaybackYears || 24} Years): Payback duration approaches or exceeds panel and component warranties.`,
                          `Nighttime Usage Skew: Majority of consumption occurs when solar is not generating, resulting in low-tariff exports unless costly battery storage is installed.`,
                        ]).map((reason, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-600 shrink-0 mt-1.5" />
                            <span>{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                      Independent Action Guidance
                    </h4>
                    <ul className="space-y-2 text-xs text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200">
                      {report.summary.actionable_guidance.map((step, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-[#FE5A01] shrink-0 mt-0.5" />
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border border-slate-200 bg-white">
                      <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                        Location & Solar Resource
                      </h5>
                      <div className="space-y-1.5 text-xs text-slate-700">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Location:</span>
                          <span className="font-semibold">{report.location.city}, {report.location.state}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Global Horizontal Irradiance:</span>
                          <span className="font-semibold">{report.location.annual_avg_daily_ghi} kWh/m²/day</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Optimal Tilt Angle:</span>
                          <span className="font-semibold">{report.location.optimal_tilt_degrees}° South</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Climatic Zone:</span>
                          <span className="font-semibold">{report.location.climatic_zone}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl border border-slate-200 bg-white">
                      <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                        Consumption & Grid Tariff
                      </h5>
                      <div className="space-y-1.5 text-xs text-slate-700">
                        <div className="flex justify-between">
                          <span className="text-slate-500">DISCOM Provider:</span>
                          <span className="font-semibold">{report.consumption.provider_name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Average Consumption:</span>
                          <span className="font-semibold">{report.consumption.monthly_kwh} kWh/mo</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Annual Grid Bill:</span>
                          <span className="font-semibold">₹{report.consumption.current_annual_cost_inr.toLocaleString()}/yr</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Day / Night Split:</span>
                          <span className="font-semibold">
                            {report.consumption.daytime_percentage}% / {report.consumption.nighttime_percentage}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Technical */}
              {activeTab === "technical" && (
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Engineered Hardware Architecture
                  </h4>
                  <table className="w-full text-xs">
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="py-2 text-slate-500">Recommended Array Capacity</td>
                        <td className="py-2 text-right font-bold text-slate-900">{report.technical.capacity_kw} kWp</td>
                      </tr>
                      <tr>
                        <td className="py-2 text-slate-500">Photovoltaic Modules</td>
                        <td className="py-2 text-right font-medium text-slate-800">
                          {report.technical.panel_count}x {report.technical.panel_model} ({report.technical.panel_wattage}W)
                        </td>
                      </tr>
                      {report.technical.brand_tier && (
                        <tr>
                          <td className="py-2 text-slate-500">Hardware Ecosystem Tier</td>
                          <td className="py-2 text-right font-semibold text-[#FE5A01]">
                            {report.technical.brand_tier}
                          </td>
                        </tr>
                      )}
                      {report.technical.almm_compliance && (
                        <tr>
                          <td className="py-2 text-slate-500">ALMM / DCR Status</td>
                          <td className="py-2 text-right font-medium text-slate-800">
                            {report.technical.almm_compliance}
                          </td>
                        </tr>
                      )}
                      <tr>
                        <td className="py-2 text-slate-500">Inverter Technology</td>
                        <td className="py-2 text-right font-medium text-slate-800">{report.technical.inverter_model}</td>
                      </tr>
                      <tr>
                        <td className="py-2 text-slate-500">Energy Storage (Battery)</td>
                        <td className="py-2 text-right font-medium text-slate-800">
                          {report.technical.battery_storage_kwh > 0
                            ? `${report.technical.battery_storage_kwh} kWh LiFePO4 Storage`
                            : "Grid-Tied (No Battery)"}
                        </td>
                      </tr>
                      {report.technical.bms_compatibility && (
                        <tr>
                          <td className="py-2 text-slate-500">System Handshake</td>
                          <td className="py-2 text-right text-[11px] text-slate-600">
                            {report.technical.bms_compatibility}
                          </td>
                        </tr>
                      )}
                      <tr>
                        <td className="py-2 text-slate-500">Year 1 Expected PV Yield</td>
                        <td className="py-2 text-right font-bold text-[#FE5A01]">
                          {report.technical.first_year_generation_kwh.toLocaleString()} kWh/year
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 text-slate-500">Performance Ratio (PR)</td>
                        <td className="py-2 text-right font-medium text-slate-800">
                          {(report.technical.performance_ratio * 100).toFixed(1)}%
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 text-slate-500">Usable Roof Area Required</td>
                        <td className="py-2 text-right font-medium text-slate-800">
                          {report.technical.usable_roof_area_sqft} sq.ft
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {/* Tab 3: Financial */}
              {activeTab === "financial" && (
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    25-Year Lifecycle Financial Twin
                  </h4>
                  <table className="w-full text-xs">
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="py-2 text-slate-500">Turnkey Capital Cost (Capex)</td>
                        <td className="py-2 text-right font-semibold text-slate-800">
                          ₹{report.financial.installed_turnkey_cost_inr.toLocaleString()}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 text-slate-500">PM Surya Ghar Central Subsidy (CFA)</td>
                        <td className="py-2 text-right font-bold text-[#FE5A01]">
                          -₹{report.financial.pm_surya_ghar_subsidy_inr.toLocaleString()}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 text-slate-500 font-semibold">Net Initial Outlay</td>
                        <td className="py-2 text-right font-extrabold text-slate-900">
                          ₹{report.financial.net_initial_investment_inr.toLocaleString()}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 text-slate-500">First-Year Grid Bill Savings</td>
                        <td className="py-2 text-right font-bold text-[#FE5A01]">
                          ₹{report.financial.first_year_savings_inr.toLocaleString()} / yr
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 text-slate-500">Simple Payback Period</td>
                        <td className="py-2 text-right font-bold text-[#FE5A01]">
                          {report.financial.simple_payback_years} Years
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 text-slate-500">Net Present Value (NPV @ 8%)</td>
                        <td className="py-2 text-right font-semibold text-slate-800">
                          ₹{report.financial.npv_inr.toLocaleString()}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 text-slate-500">Internal Rate of Return (ROI)</td>
                        <td className="py-2 text-right font-semibold text-slate-800">
                          {report.financial.roi_percentage.toFixed(1)}%
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 text-slate-500">Levelized Cost of Electricity (LCOE)</td>
                        <td className="py-2 text-right font-bold text-[#FE5A01]">
                          ₹{report.financial.lcoe_per_kwh.toFixed(2)} / kWh
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {/* Tab 4: Providers & Policy */}
              {activeTab === "providers" && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl border border-slate-200 bg-white">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                      <Award className="h-4 w-4 text-[#FE5A01]" /> Applicable Subsidy Schemes
                    </h5>
                    <div className="space-y-2">
                      {report.policy_sources.map((pol, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 text-xs">
                          <div>
                            <div className="font-bold text-slate-900">{pol.scheme_name}</div>
                            <div className="text-[11px] text-slate-500">{pol.administering_body}</div>
                          </div>
                          {pol.portal_url && (
                            <a
                              href={pol.portal_url}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-1 text-[#FE5A01] hover:text-[#d44800] font-semibold"
                            >
                              Portal <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 bg-white">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                      <Building className="h-4 w-4 text-slate-600" /> Empaneled Solar Installers
                    </h5>
                    <div className="space-y-2">
                      {report.matched_providers.map((inst, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 text-xs">
                          <div>
                            <div className="font-bold text-slate-900">{inst.company_name}</div>
                            <div className="text-[11px] text-slate-500">HQ: {inst.headquarters}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-slate-700">{inst.contact_phone}</div>
                            {inst.website && (
                              <a
                                href={inst.website}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[11px] text-[#FE5A01] hover:underline"
                              >
                                Website
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Disclaimer footer */}
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-500 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Independent Consumer Protection:</strong> SolarWise provides non-biased engineering analysis and does not take commissions from solar manufacturers or EPC installers.
                </span>
              </div>
            </>
          ) : (
            <div className="py-12 text-center text-sm text-slate-500">
              Failed to load report docket.
            </div>
          )}
        </div>

        {/* Footer toolbar */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/70 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyId}
              disabled={!report}
              className="text-xs gap-1"
            >
              <Copy className="h-3.5 w-3.5" />
              {copied ? "Copied ID!" : "Copy Report ID"}
            </Button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadJson}
              disabled={!report}
              className="text-xs gap-1.5 flex-1 sm:flex-initial"
            >
              <Download className="h-3.5 w-3.5" />
              Download JSON Docket
            </Button>

            <Button
              size="sm"
              onClick={handlePrint}
              disabled={!report}
              className="text-xs gap-1.5 bg-[#FE5A01] hover:bg-[#e04f00] text-white flex-1 sm:flex-initial"
            >
              <Printer className="h-3.5 w-3.5" />
              Print / Save as PDF
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
