import React, { useState, useEffect } from "react"
import {
  X,
  Maximize2,
  Layers,
  Compass,
  Check,
  RotateCw,
} from "lucide-react"
import { Button } from "../../components/ui/Button"
import { api } from "../../services/api"

export interface RoofPlannerModalProps {
  isOpen: boolean
  onClose: () => void
  currentAreaSqFt: number
  onApplyArea: (newAreaSqFt: number, panelCount?: number, capacityKw?: number) => void
}

interface RoofTemplate {
  id: string
  name: string
  areaSqFt: number
  boundary: { x: number; y: number }[]
  obstacles: { id: string; name: string; polygon: { x: number; y: number }[]; setback_meters: number }[]
}

const TEMPLATES: RoofTemplate[] = [
  {
    id: "rect-500",
    name: "Standard Terrace (520 sq ft)",
    areaSqFt: 520,
    boundary: [
      { x: 40, y: 40 },
      { x: 340, y: 40 },
      { x: 340, y: 200 },
      { x: 40, y: 200 },
    ],
    obstacles: [
      {
        id: "tank-1",
        name: "Water Tank",
        polygon: [
          { x: 260, y: 60 },
          { x: 310, y: 60 },
          { x: 310, y: 110 },
          { x: 260, y: 110 },
        ],
        setback_meters: 0.5,
      },
    ],
  },
  {
    id: "l-shape-750",
    name: "L-Shaped Villa Roof (740 sq ft)",
    areaSqFt: 740,
    boundary: [
      { x: 40, y: 40 },
      { x: 360, y: 40 },
      { x: 360, y: 160 },
      { x: 220, y: 160 },
      { x: 220, y: 280 },
      { x: 40, y: 280 },
    ],
    obstacles: [
      {
        id: "staircase-1",
        name: "Staircase Room",
        polygon: [
          { x: 60, y: 60 },
          { x: 130, y: 60 },
          { x: 130, y: 130 },
          { x: 60, y: 130 },
        ],
        setback_meters: 0.5,
      },
    ],
  },
  {
    id: "compact-350",
    name: "Compact Townhome (360 sq ft)",
    areaSqFt: 360,
    boundary: [
      { x: 60, y: 50 },
      { x: 300, y: 50 },
      { x: 300, y: 190 },
      { x: 60, y: 190 },
    ],
    obstacles: [],
  },
]

export const RoofPlannerModal: React.FC<RoofPlannerModalProps> = ({
  isOpen,
  onClose,
  currentAreaSqFt,
  onApplyArea,
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<RoofTemplate>(TEMPLATES[0])
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait")
  const [panelWattage, setPanelWattage] = useState<440 | 540>(440)
  const [enableObstacles, setEnableObstacles] = useState(true)
  const [layoutResult, setLayoutResult] = useState<any>(null)
  const [isCalculating, setIsCalculating] = useState(false)

  // Compute 2D layout whenever template, orientation, or panel changes
  useEffect(() => {
    if (!isOpen) return

    let isCancelled = false
    setIsCalculating(true)

    const activeObstacles = enableObstacles ? selectedTemplate.obstacles : []
    const dim =
      panelWattage === 540
        ? { length_m: 2.278, width_m: 1.134, rated_power_w: 540, model_name: "Waaree TopCon 540W" }
        : { length_m: 2.094, width_m: 1.038, rated_power_w: 440, model_name: "Adani Mono PERC 440W" }

    api
      .generateRoofLayout({
        boundary: selectedTemplate.boundary,
        obstacles: activeObstacles,
        scale_pixels_per_meter: 18.0,
        orientation,
        panel_dimension: dim,
        inter_row_pitch_meters: 0.35,
        boundary_setback_meters: 0.5,
      })
      .then((res) => {
        if (!isCancelled) {
          setLayoutResult(res)
          setIsCalculating(false)
        }
      })
      .catch((err) => {
        console.warn("Error running roof layout engine:", err)
        if (!isCancelled) setIsCalculating(false)
      })

    return () => {
      isCancelled = true
    }
  }, [isOpen, selectedTemplate, orientation, panelWattage, enableObstacles])

  if (!isOpen) return null

  const handleApply = () => {
    const areaToApply = layoutResult?.gross_roof_area_sqft || selectedTemplate.areaSqFt
    const count = layoutResult?.panel_count
    const cap = layoutResult?.total_dc_capacity_kw
    onApplyArea(Math.round(areaToApply), count, cap)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-neutral-200 max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/80">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
              <Maximize2 className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-bold text-neutral-900 text-lg">Solar Roof Digital Planner</h3>
              <p className="text-xs text-neutral-500">
                2D Rooftop geometric layout & panel optimization (Current: {currentAreaSqFt} sq ft)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200/50 flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Controls Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Template Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-600 uppercase">Roof Template</label>
              <select
                value={selectedTemplate.id}
                onChange={(e) => {
                  const t = TEMPLATES.find((tpl) => tpl.id === e.target.value)
                  if (t) setSelectedTemplate(t)
                }}
                className="w-full text-xs font-medium bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {TEMPLATES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Orientation Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-600 uppercase">Array Orientation</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setOrientation("portrait")}
                  className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                    orientation === "portrait"
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                      : "bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50"
                  }`}
                >
                  Portrait (Standard)
                </button>
                <button
                  type="button"
                  onClick={() => setOrientation("landscape")}
                  className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                    orientation === "landscape"
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                      : "bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50"
                  }`}
                >
                  Landscape (Wide)
                </button>
              </div>
            </div>

            {/* Module Tech Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-600 uppercase">PV Module Type</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPanelWattage(440)}
                  className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                    panelWattage === 440
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                      : "bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50"
                  }`}
                >
                  440W Mono PERC
                </button>
                <button
                  type="button"
                  onClick={() => setPanelWattage(540)}
                  className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                    panelWattage === 540
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                      : "bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50"
                  }`}
                >
                  540W TopCon
                </button>
              </div>
            </div>
          </div>

          {/* 2D Canvas SVG Visualization */}
          <div className="relative rounded-xl border border-neutral-200 bg-neutral-900 overflow-hidden shadow-inner flex items-center justify-center min-h-[320px]">
            {/* Grid Pattern Background */}
            <svg
              className={`w-full h-80 transition-opacity ${isCalculating ? "opacity-60" : "opacity-100"}`}
              viewBox="0 0 400 320"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#262626" strokeWidth="0.8" />
                </pattern>
                <pattern id="stripe" width="8" height="8" patternUnits="userSpaceOnUse">
                  <path d="M 0 0 L 8 8 M 0 8 L 8 0" stroke="#b91c1c" strokeWidth="1.2" opacity="0.6" />
                </pattern>
              </defs>

              {/* Grid Background */}
              <rect width="100%" height="100%" fill="url(#grid)" />

              {/* Roof Boundary Polygon */}
              {selectedTemplate.boundary.length >= 3 && (
                <polygon
                  points={selectedTemplate.boundary.map((p) => `${p.x},${p.y}`).join(" ")}
                  fill="#172554"
                  fillOpacity="0.45"
                  stroke="#3b82f6"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                />
              )}

              {/* Obstacles with Buffer Warning */}
              {enableObstacles &&
                selectedTemplate.obstacles.map((obs) => (
                  <g key={obs.id}>
                    <polygon
                      points={obs.polygon.map((p) => `${p.x},${p.y}`).join(" ")}
                      fill="url(#stripe)"
                      stroke="#ef4444"
                      strokeWidth="2"
                    />
                    <text
                      x={obs.polygon[0].x + 4}
                      y={obs.polygon[0].y + 16}
                      fill="#fca5a5"
                      fontSize="9"
                      fontWeight="bold"
                    >
                      {obs.name}
                    </text>
                  </g>
                ))}

              {/* Placed Solar Panels */}
              {layoutResult?.panels?.map((p: any) => (
                <g key={p.id}>
                  <rect
                    x={p.x}
                    y={p.y}
                    width={p.corners[1].x - p.corners[0].x}
                    height={p.corners[2].y - p.corners[1].y}
                    fill="#059669"
                    stroke="#10b981"
                    strokeWidth="1.2"
                    rx="1.5"
                  />
                  {/* Subtle solar busbar line */}
                  <line
                    x1={p.x + (p.corners[1].x - p.corners[0].x) / 2}
                    y1={p.y}
                    x2={p.x + (p.corners[1].x - p.corners[0].x) / 2}
                    y2={p.corners[2].y}
                    stroke="#047857"
                    strokeWidth="0.8"
                  />
                </g>
              ))}
            </svg>

            {/* Compass Indicator */}
            <div className="absolute top-3 right-3 bg-neutral-800/90 border border-neutral-700/80 px-2.5 py-1 rounded-lg text-white text-[11px] font-mono flex items-center gap-1.5 backdrop-blur-xs">
              <Compass className="h-3.5 w-3.5 text-amber-400" />
              <span>South Facing (180°)</span>
            </div>

            {/* Legend / Status Overlay */}
            <div className="absolute bottom-3 left-3 bg-neutral-800/90 border border-neutral-700/80 px-3 py-1.5 rounded-lg text-white text-[11px] flex items-center gap-3 backdrop-blur-xs">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded bg-emerald-500 inline-block" />
                <span>PV Modules</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded bg-blue-500/50 border border-blue-400 inline-block" />
                <span>Roof Boundary</span>
              </div>
              {selectedTemplate.obstacles.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded bg-red-500/50 border border-red-400 inline-block" />
                  <span>Obstacle Zone</span>
                </div>
              )}
            </div>
          </div>

          {/* Sizing & Metrics Bar */}
          {layoutResult && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-neutral-50 border border-neutral-200">
              <div>
                <span className="text-[10px] font-bold text-neutral-500 uppercase block">
                  Fitted Array
                </span>
                <span className="text-base font-extrabold text-neutral-900">
                  {layoutResult.panel_count} Panels
                </span>
                <span className="text-[11px] text-neutral-500 block">
                  {layoutResult.orientation === "portrait" ? "Portrait Grid" : "Landscape Grid"}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-neutral-500 uppercase block">
                  Fitted Capacity
                </span>
                <span className="text-base font-extrabold text-emerald-700 font-mono">
                  {layoutResult.total_dc_capacity_kw} kWp
                </span>
                <span className="text-[11px] text-neutral-500 block">
                  @{panelWattage}W per module
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-neutral-500 uppercase block">
                  Roof Utilization
                </span>
                <span className="text-base font-extrabold text-neutral-900">
                  {layoutResult.roof_utilization_pct}%
                </span>
                <span className="text-[11px] text-neutral-500 block">
                  {layoutResult.panel_area_sqft} sq ft active
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-neutral-500 uppercase block">
                  Gross Area
                </span>
                <span className="text-base font-extrabold text-neutral-900">
                  {layoutResult.gross_roof_area_sqft} sq ft
                </span>
                <span className="text-[11px] text-neutral-500 block">
                  ~{(layoutResult.gross_roof_area_sqft / 10.7639).toFixed(0)} m² surface
                </span>
              </div>
            </div>
          )}

          {/* Orientation Density Comparison */}
          {layoutResult?.comparison_summary && (
            <div className="p-3.5 rounded-xl border border-neutral-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-neutral-700 font-medium">
                <Layers className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>Orientation Benchmark:</strong> Portrait yields{" "}
                  <strong>{layoutResult.comparison_summary[0].total_capacity_kw} kWp</strong> ({layoutResult.comparison_summary[0].panel_count} panels) vs Landscape{" "}
                  <strong>{layoutResult.comparison_summary[1].total_capacity_kw} kWp</strong> ({layoutResult.comparison_summary[1].panel_count} panels).
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEnableObstacles((prev) => !prev)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer shrink-0 transition-all ${
                    enableObstacles
                      ? "bg-red-50 text-red-800 border-red-200 hover:bg-red-100"
                      : "bg-neutral-50 text-neutral-600 border-neutral-300 hover:bg-neutral-100"
                  }`}
                >
                  Obstacles: {enableObstacles ? "Active" : "Ignored"}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setOrientation((prev) => (prev === "portrait" ? "landscape" : "portrait"))
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-300 bg-neutral-50 hover:bg-neutral-100 text-neutral-700 font-semibold cursor-pointer shrink-0"
                >
                  <RotateCw className="h-3.5 w-3.5" /> Toggle Orientation
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 border-t border-neutral-200 flex items-center justify-between bg-neutral-50/80">
          <Button variant="outline" size="md" onClick={onClose}>
            Cancel
          </Button>

          <Button size="md" onClick={handleApply}>
            <Check className="h-4 w-4 mr-1.5" />
            Apply {layoutResult?.gross_roof_area_sqft || selectedTemplate.areaSqFt} sq ft to Assessment
          </Button>
        </div>
      </div>
    </div>
  )
}
