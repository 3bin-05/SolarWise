import React from "react"
import { ShieldCheck, Info } from "lucide-react"

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-neutral-200/80 bg-white py-8 text-neutral-500 text-xs mt-auto">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-neutral-600 font-medium">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span>SolarWise Feasibility Engine</span>
          <span className="text-neutral-400">•</span>
          <span>Zero Paid AI APIs</span>
          <span className="text-neutral-400">•</span>
          <span>Deterministic Engineering Logic</span>
        </div>

        <div className="flex items-center gap-4 text-neutral-500">
          <div className="flex items-center gap-1">
            <Info className="h-3.5 w-3.5 text-neutral-400" />
            <span>Assumptions explicitly stated</span>
          </div>
          <span>•</span>
          <span>Conservative Payback Modeling</span>
        </div>
      </div>
    </footer>
  )
}
