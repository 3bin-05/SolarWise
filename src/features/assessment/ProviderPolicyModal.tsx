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
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4"
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
        className="bg-white border border-neutral-200/90 rounded-2xl w-full max-w-5xl max-h-[94vh] sm:max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 outline-none"
      >
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-neutral-200/80 flex items-center justify-between bg-neutral-50/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 border border-orange-200/80 text-[#FE5A01] flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 text-[#FE5A01]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="provider-modal-title" className="text-lg font-bold text-neutral-900">
                  Verified Installer Directory & Subsidies
                </h3>
                <Badge variant="default" className="text-xs">
                  MNRE & DISCOM Empaneled
                </Badge>
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">
                Non-sponsored directory information & official PM Surya Ghar portal intelligence
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 p-1.5 rounded-lg transition-colors cursor-pointer"
            aria-label="Close Installer Directory"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab & Filter Bar */}
        <div className="px-4 sm:px-6 py-3 border-b border-neutral-200/80 bg-neutral-50/50 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-xl border border-neutral-200/80">
            <button
              type="button"
              onClick={() => setActiveTab("providers")}
              className={`py-1.5 px-3.5 rounded-lg font-bold transition-all cursor-pointer ${
                activeTab === "providers"
                  ? "bg-white text-neutral-900 shadow-2xs border border-neutral-200/60"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              Verified Installers ({providers.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("subsidies")}
              className={`py-1.5 px-3.5 rounded-lg font-bold transition-all cursor-pointer ${
                activeTab === "subsidies"
                  ? "bg-white text-neutral-900 shadow-2xs border border-neutral-200/60"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              Government Subsidies ({subsidies.length})
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-neutral-600 font-semibold">Region:</span>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="bg-white border border-neutral-300 rounded-lg px-2.5 py-1 text-neutral-800 focus:outline-none focus:border-[#FE5A01] text-xs shadow-2xs cursor-pointer"
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
                <span className="text-neutral-600 font-semibold">System:</span>
                <select
                  value={selectedSystemType}
                  onChange={(e) => setSelectedSystemType(e.target.value)}
                  className="bg-white border border-neutral-300 rounded-lg px-2.5 py-1 text-neutral-800 focus:outline-none focus:border-[#FE5A01] text-xs shadow-2xs cursor-pointer"
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
        <div className="mx-4 sm:mx-6 mt-4 p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-900 shrink-0 shadow-2xs">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <span className="font-bold text-amber-950">Independent Public Directory:</span> SolarWise does not receive referral
            commissions, sponsor listings, or guarantee contractor workmanship. Always request multiple itemized quotes
            and ensure your installer uses DCR-compliant modules for PM Surya Ghar subsidy eligibility.
          </p>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {loading && (
            <div className="text-center py-8 text-xs text-neutral-500 animate-pulse font-medium">
              Loading verified records...
            </div>
          )}

          {/* View 1: Installers List */}
          {!loading && activeTab === "providers" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {providers.map((p) => (
                <div
                  key={p.id}
                  className="p-4 bg-white border border-neutral-200 rounded-xl space-y-3 hover:border-orange-300 hover:shadow-xs transition-all flex flex-col justify-between shadow-2xs"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-neutral-900 text-sm">{p.name}</h4>
                        <div className="flex items-center gap-1 text-[11px] text-neutral-500 mt-0.5 font-medium">
                          <MapPin className="w-3 h-3 text-neutral-400" />
                          <span>{p.headquarters} (Est. {p.established_year})</span>
                        </div>
                      </div>
                      {p.mnre_registered && (
                        <span className="border border-orange-200 bg-orange-50 text-[#c2410c] text-[10px] font-bold px-2 py-0.5 rounded-md gap-1 shrink-0 inline-flex items-center">
                          <ShieldCheck className="w-3 h-3 text-[#FE5A01]" /> MNRE Empaneled
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                      {p.system_types_supported.map((st, i) => (
                        <span key={i} className="px-2 py-0.5 bg-neutral-100 text-neutral-700 rounded text-[10px] uppercase font-mono font-medium border border-neutral-200/60">
                          {st.replace("_", " ")}
                        </span>
                      ))}
                      <span className="px-2 py-0.5 bg-neutral-50 text-neutral-600 rounded text-[10px] border border-neutral-200/50">
                        Cap: {p.min_capacity_kw}–{p.max_capacity_kw} kW
                      </span>
                      <span className="px-2 py-0.5 bg-neutral-50 text-neutral-600 rounded text-[10px] border border-neutral-200/50">
                        {p.warranty_workmanship_years} Yr Workmanship
                      </span>
                    </div>

                    <div className="text-[11px] text-neutral-600 mt-2">
                      <span className="text-neutral-400 font-medium">Empaneled DISCOMs:</span>{" "}
                      <span className="text-neutral-800">{p.empanelled_discoms.slice(0, 4).join(", ")}</span>
                      {p.empanelled_discoms.length > 4 && ` +${p.empanelled_discoms.length - 4} more`}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3 text-neutral-600">
                      <span className="flex items-center gap-1 font-mono">
                        <Phone className="w-3 h-3 text-neutral-400" />
                        {p.contact_phone}
                      </span>
                    </div>
                    <a
                      href={p.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[#FE5A01] hover:text-[#e04f00] font-bold hover:underline cursor-pointer"
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
                  className="p-5 bg-white border border-neutral-200 rounded-xl space-y-3 shadow-2xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-100 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-neutral-900 text-base">{sub.scheme_name}</h4>
                        <span className="bg-sky-50 text-sky-700 border border-sky-200 text-[10px] font-bold uppercase px-2 py-0.5 rounded-md">
                          {sub.level}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-500 mt-0.5">Administered by {sub.administering_body}</p>
                    </div>

                    <a
                      href={sub.application_portal_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#FE5A01] hover:bg-[#e04f00] text-white rounded-lg text-xs font-bold shrink-0 transition-colors shadow-2xs cursor-pointer"
                    >
                      Official Government Portal <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  {/* Subsidy Benchmark Grid */}
                  {sub.subsidy_structure && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
                      {sub.subsidy_structure["1_kw_inr"] && (
                        <div className="p-3 bg-neutral-50/80 rounded-xl border border-neutral-200/80 shadow-2xs">
                          <span className="text-neutral-500 block text-[11px] font-medium">1 kW System CFA</span>
                          <span className="font-bold text-[#c2410c] text-sm mt-0.5 block">
                            ₹{sub.subsidy_structure["1_kw_inr"].toLocaleString()}
                          </span>
                        </div>
                      )}
                      {sub.subsidy_structure["2_kw_inr"] && (
                        <div className="p-3 bg-neutral-50/80 rounded-xl border border-neutral-200/80 shadow-2xs">
                          <span className="text-neutral-500 block text-[11px] font-medium">2 kW System CFA</span>
                          <span className="font-bold text-[#c2410c] text-sm mt-0.5 block">
                            ₹{sub.subsidy_structure["2_kw_inr"].toLocaleString()}
                          </span>
                        </div>
                      )}
                      {sub.subsidy_structure["3_kw_and_above_cap_inr"] && (
                        <div className="p-3 bg-neutral-50/80 rounded-xl border border-neutral-200/80 shadow-2xs">
                          <span className="text-neutral-500 block text-[11px] font-medium">3 kW+ Maximum CFA</span>
                          <span className="font-bold text-[#c2410c] text-sm mt-0.5 block">
                            ₹{sub.subsidy_structure["3_kw_and_above_cap_inr"].toLocaleString()} (Cap)
                          </span>
                        </div>
                      )}
                      {sub.subsidy_structure["gbi_rate_per_kwh_inr"] && (
                        <div className="p-3 bg-neutral-50/80 rounded-xl border border-neutral-200/80 shadow-2xs">
                          <span className="text-neutral-500 block text-[11px] font-medium">Generation Incentive (GBI)</span>
                          <span className="font-bold text-sky-700 text-sm mt-0.5 block">
                            ₹{sub.subsidy_structure["gbi_rate_per_kwh_inr"]}/kWh (5 yrs)
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Mandatory Eligibility Criteria */}
                  <div className="space-y-1.5 pt-2">
                    <span className="text-xs font-bold text-neutral-800 block">Mandatory Eligibility Conditions:</span>
                    <ul className="space-y-1.5">
                      {sub.eligibility_criteria.map((crit, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-neutral-700">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#FE5A01] shrink-0 mt-0.5" />
                          <span>{crit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {sub.notes && (
                    <p className="text-[11px] text-neutral-500 italic pt-2 border-t border-neutral-100">
                      *{sub.notes} (Verified {sub.verification_date})
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-200/80 bg-neutral-50/80 flex items-center justify-between shrink-0">
          <div className="text-xs text-neutral-500 font-medium">
            Source: National Portal for Rooftop Solar (<span className="text-neutral-700 font-mono">pmsuryaghar.gov.in</span>) & DISCOM Gazette Orders.
          </div>
          <Button variant="outline" size="sm" onClick={onClose} className="border-neutral-300 text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 text-xs font-semibold rounded-lg cursor-pointer">
            Close Directory
          </Button>
        </div>
      </div>
    </div>
  )
}
