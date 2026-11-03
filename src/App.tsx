import React from "react"
import { Sun, CheckCircle2, ShieldCheck, Zap } from "lucide-react"

export const App: React.FC = () => {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1"
  const appEnv = import.meta.env.VITE_APP_ENV || "development"

  return (
    <div className="min-h-screen bg-neutral-50/50 text-neutral-900 flex flex-col font-sans">
      {/* Top Navigation */}
      <header className="border-b border-neutral-200/80 bg-white/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-sm shadow-emerald-500/20">
              <Sun className="h-5 w-5" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-neutral-950">SolarWise</span>
              <span className="ml-2 text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200/60">
                Phase 0 Foundation
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-neutral-600">
            <span className="flex items-center gap-1.5 font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200/50">
              <CheckCircle2 className="h-4 w-4" /> System Ready
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto px-4 py-12 w-full">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 mb-4">
            <Zap className="h-3.5 w-3.5 text-emerald-600" />
            Objective Solar Feasibility Assessment
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-neutral-950 mb-4 leading-tight">
            Transparent Solar Feasibility & Financial Intelligence
          </h1>
          <p className="text-lg text-neutral-600 leading-relaxed">
            SolarWise determines whether installing solar is technically feasible and financially
            justified for your household—without optimistic sales biases or hidden assumptions.
          </p>
        </div>

        {/* Status & Diagnostic Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-xl border border-neutral-200/80 shadow-sm">
            <div className="h-10 w-10 rounded-lg bg-emerald-100/80 text-emerald-700 flex items-center justify-center mb-4">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-neutral-900 mb-1">Architecture Foundation</h3>
            <p className="text-sm text-neutral-600 mb-3">
              Two independent repositories with separated Git histories and deployment targets.
            </p>
            <div className="text-xs font-mono text-neutral-500 bg-neutral-100 p-2 rounded border border-neutral-200">
              Vercel (Frontend) + Render (Backend)
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-neutral-200/80 shadow-sm">
            <div className="h-10 w-10 rounded-lg bg-emerald-100/80 text-emerald-700 flex items-center justify-center mb-4">
              <Zap className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-neutral-900 mb-1">API Integration</h3>
            <p className="text-sm text-neutral-600 mb-3">
              FastAPI backend running with strict Pydantic v2 schemas and health probes.
            </p>
            <div className="text-xs font-mono text-neutral-500 bg-neutral-100 p-2 rounded border border-neutral-200 break-all">
              Endpoint: {apiBaseUrl}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-neutral-200/80 shadow-sm">
            <div className="h-10 w-10 rounded-lg bg-emerald-100/80 text-emerald-700 flex items-center justify-center mb-4">
              <Sun className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-neutral-900 mb-1">Environment</h3>
            <p className="text-sm text-neutral-600 mb-3">
              Isolated frontend build with zero leaked server-side secrets or tokens.
            </p>
            <div className="text-xs font-mono text-neutral-500 bg-neutral-100 p-2 rounded border border-neutral-200">
              Mode: {appEnv}
            </div>
          </div>
        </div>

        {/* Phase Roadmap Preview */}
        <div className="bg-white rounded-xl border border-neutral-200/80 p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-neutral-100">
            <div>
              <h2 className="text-xl font-bold text-neutral-950">Implementation Journey</h2>
              <p className="text-sm text-neutral-500">Phased, verifiable milestone plan</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-neutral-100 text-neutral-700 rounded-md">
              Phase 0 Complete
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div className="p-3.5 rounded-lg bg-emerald-50/60 border border-emerald-200/70">
              <div className="font-semibold text-emerald-900 mb-1">Phase 0: Foundation</div>
              <p className="text-xs text-emerald-700">Repositories, tooling, CI, and health checks</p>
            </div>
            <div className="p-3.5 rounded-lg bg-neutral-50 border border-neutral-200">
              <div className="font-semibold text-neutral-800 mb-1">Phase 1: UI Shell</div>
              <p className="text-xs text-neutral-500">Design system, assessment flow skeleton</p>
            </div>
            <div className="p-3.5 rounded-lg bg-neutral-50 border border-neutral-200">
              <div className="font-semibold text-neutral-800 mb-1">Phase 2: Backend DB</div>
              <p className="text-xs text-neutral-500">Database models, migrations, & schemas</p>
            </div>
            <div className="p-3.5 rounded-lg bg-neutral-50 border border-neutral-200">
              <div className="font-semibold text-neutral-800 mb-1">Phase 3: Bill OCR</div>
              <p className="text-xs text-neutral-500">Tesseract OCR & deterministic parser</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-200/80 bg-white py-6 text-center text-xs text-neutral-500">
        <p>SolarWise — Explainable Household Solar Feasibility Platform</p>
      </footer>
    </div>
  )
}

export default App
