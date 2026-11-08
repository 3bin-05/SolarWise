import React, { useState, useEffect, useRef } from "react"
import { useFocusTrap } from "../../hooks/useFocusTrap"
import {
  X,
  Users,
  ShieldCheck,
  ExternalLink,
  Phone,
  MapPin,
  AlertCircle,
  CheckCircle2,
} from "lucide-react"
import { Button } from "../../components/ui/Button"
import { Badge } from "../../components/ui/Badge"
import {
  api,
  ProviderRecord,
  SubsidyPolicyRecord,
} from "../../services/api"

export interface ProviderPolicyModalProps {
  isOpen: boolean
  onClose: () => void
  initialState?: string
}

export const ProviderPolicyModal: React.FC<ProviderPolicyModalProps> = ({
  isOpen,
  onClose,
  initialState = "Karnataka",
}) => {
  const [activeTab, setActiveTab] = useState<"providers" | "subsidies">("providers")
  const [selectedState, setSelectedState] = useState<string>(initialState)
  const [selectedSystemType, setSelectedSystemType] = useState<string>("all")

  const [providers, setProviders] = useState<ProviderRecord[]>([])
  const [subsidies, setSubsidies] = useState<SubsidyPolicyRecord[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const modalRef = useRef<HTMLDivElement>(null)
  useFocusTrap(modalRef, isOpen, onClose)

  useEffect(() => {
    if (initialState) setSelectedState(initialState)
  }, [initialState])

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
    setLoading(true)

    const stateParam = selectedState === "All" ? undefined : selectedState
    const typeParam = selectedSystemType === "all" ? undefined : selectedSystemType

    Promise.all([
      api.getProviders({ state: stateParam, system_type: typeParam }),
      api.getSubsidies({ state: stateParam }),
    ])
      .then(([provRes, subRes]) => {
        if (!cancelled) {
          setProviders(provRes.providers || [])
          setSubsidies(subRes.schemes || [])
        }
      })
      .catch((err) => console.error("Failed to load providers or subsidies:", err))
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [isOpen, selectedState, selectedSystemType])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="provider-modal-title"
        tabIndex={-1}
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl max-h-[94vh] sm:max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 outline-none"
      >
        {/* Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/10 text-orange-400 rounded-lg">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="provider-modal-title" className="text-lg font-bold text-white">Verified Installer Directory & Subsidies</h3>
                <Badge variant="outline" className="border-orange-500/30 text-orange-400 text-xs">
                  MNRE & DISCOM Empaneled
                </Badge>
              </div>
              <p className="text-xs text-slate-400">
                Non-sponsored directory information & official PM Surya Ghar portal intelligence
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

        {/* Tab & Filter Bar */}
        <div className="px-6 py-3 border-b border-slate-800 bg-slate-950/60 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
            <button
              type="button"
              onClick={() => setActiveTab("providers")}
              className={`py-1.5 px-3 rounded-md font-medium transition-colors ${
                activeTab === "providers"
                  ? "bg-[#FE5A01] text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Verified Installers ({providers.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("subsidies")}
              className={`py-1.5 px-3 rounded-md font-medium transition-colors ${
                activeTab === "subsidies"
                  ? "bg-[#FE5A01] text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Government Subsidies ({subsidies.length})
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Region:</span>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 focus:outline-none focus:border-orange-500 text-xs"
              >
                <option value="All">All Regions</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Delhi">Delhi</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Gujarat">Gujarat</option>
                <option value="Telangana">Telangana</option>
                <option value="Tamil Nadu">Tamil Nadu</option>
                <option value="Kerala">Kerala</option>
              </select>
            </div>

            {activeTab === "providers" && (
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">System:</span>
                <select
                  value={selectedSystemType}
                  onChange={(e) => setSelectedSystemType(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 focus:outline-none focus:border-orange-500 text-xs"
                >
                  <option value="all">All Systems</option>
                  <option value="grid_tied">Grid-Tied</option>
                  <option value="hybrid">Hybrid (Storage)</option>
                  <option value="off_grid">Off-Grid</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Anti-Endorsement Advisory Banner */}
        <div className="mx-6 mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-2.5 text-xs text-amber-300">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <span className="font-semibold">Independent Public Directory:</span> SolarWise does not receive referral
            commissions, sponsor listings, or guarantee contractor workmanship. Always request multiple itemized quotes
            and ensure your installer uses DCR-compliant modules for PM Surya Ghar subsidy eligibility.
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {loading && (
            <div className="text-center py-8 text-xs text-slate-400 animate-pulse">
              Loading verified records...
            </div>
          )}

          {/* View 1: Installers List */}
          {!loading && activeTab === "providers" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {providers.map((p) => (
                <div
                  key={p.id}
                  className="p-4 bg-slate-850 bg-slate-900/50 border border-slate-800 rounded-xl space-y-3 hover:border-slate-700 transition-colors flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-white text-sm">{p.name}</h4>
                        <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          <span>{p.headquarters} (Est. {p.established_year})</span>
                        </div>
                      </div>
                      {p.mnre_registered && (
                        <Badge variant="outline" className="border-orange-500/30 text-orange-400 text-[10px] gap-1 shrink-0">
                          <ShieldCheck className="w-3 h-3 text-orange-400" /> MNRE Empaneled
                        </Badge>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                      {p.system_types_supported.map((st, i) => (
                        <span key={i} className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded text-[10px] uppercase font-mono">
                          {st.replace("_", " ")}
                        </span>
                      ))}
                      <span className="px-2 py-0.5 bg-slate-800/80 text-slate-400 rounded text-[10px]">
                        Cap: {p.min_capacity_kw}–{p.max_capacity_kw} kW
                      </span>
                      <span className="px-2 py-0.5 bg-slate-800/80 text-slate-400 rounded text-[10px]">
                        {p.warranty_workmanship_years} Yr Workmanship
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400 mt-2">
                      <span className="text-slate-500">Empaneled DISCOMs:</span>{" "}
                      {p.empanelled_discoms.slice(0, 4).join(", ")}
                      {p.empanelled_discoms.length > 4 && ` +${p.empanelled_discoms.length - 4} more`}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3 text-slate-400">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-500" />
                        {p.contact_phone}
                      </span>
                    </div>
                    <a
                      href={p.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-orange-400 hover:text-orange-300 font-semibold"
                    >
                      Website <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* View 2: Subsidies & Policies */}
          {!loading && activeTab === "subsidies" && (
            <div className="space-y-4">
              {subsidies.map((sub) => (
                <div
                  key={sub.id}
                  className="p-5 bg-slate-900/50 border border-slate-800 rounded-xl space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white text-base">{sub.scheme_name}</h4>
                        <Badge variant="outline" className="border-sky-500/30 text-sky-400 text-[10px] uppercase">
                          {sub.level}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">Administered by {sub.administering_body}</p>
                    </div>

                    <a
                      href={sub.application_portal_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FE5A01] hover:bg-[#e04f00] text-white rounded-lg text-xs font-semibold shrink-0 transition-colors"
                    >
                      Official Government Portal <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  {/* Subsidy Benchmark Grid */}
                  {sub.subsidy_structure && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
                      {sub.subsidy_structure["1_kw_inr"] && (
                        <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                          <span className="text-slate-400 block text-[11px]">1 kW System CFA</span>
                          <span className="font-bold text-orange-400 text-sm">
                            ₹{sub.subsidy_structure["1_kw_inr"].toLocaleString()}
                          </span>
                        </div>
                      )}
                      {sub.subsidy_structure["2_kw_inr"] && (
                        <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                          <span className="text-slate-400 block text-[11px]">2 kW System CFA</span>
                          <span className="font-bold text-orange-400 text-sm">
                            ₹{sub.subsidy_structure["2_kw_inr"].toLocaleString()}
                          </span>
                        </div>
                      )}
                      {sub.subsidy_structure["3_kw_and_above_cap_inr"] && (
                        <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                          <span className="text-slate-400 block text-[11px]">3 kW+ Maximum CFA</span>
                          <span className="font-bold text-orange-400 text-sm">
                            ₹{sub.subsidy_structure["3_kw_and_above_cap_inr"].toLocaleString()} (Cap)
                          </span>
                        </div>
                      )}
                      {sub.subsidy_structure["gbi_rate_per_kwh_inr"] && (
                        <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                          <span className="text-slate-400 block text-[11px]">Generation Incentive (GBI)</span>
                          <span className="font-bold text-sky-400 text-sm">
                            ₹{sub.subsidy_structure["gbi_rate_per_kwh_inr"]}/kWh (5 yrs)
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Mandatory Eligibility Criteria */}
                  <div className="space-y-1 pt-2">
                    <span className="text-xs font-semibold text-slate-300 block">Mandatory Eligibility Conditions:</span>
                    <ul className="space-y-1">
                      {sub.eligibility_criteria.map((crit, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-orange-400 shrink-0 mt-0.5" />
                          <span>{crit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {sub.notes && (
                    <p className="text-[11px] text-slate-400 italic pt-1 border-t border-slate-800/60">
                      *{sub.notes} (Verified {sub.verification_date})
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            Source: National Portal for Rooftop Solar (<span className="text-slate-300 font-mono">pmsuryaghar.gov.in</span>) & DISCOM Gazette Orders.
          </div>
          <Button variant="outline" size="sm" onClick={onClose} className="border-slate-700 text-xs">
            Close Directory
          </Button>
        </div>
      </div>
    </div>
  )
}
