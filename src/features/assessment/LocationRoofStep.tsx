import React, { useState, useEffect } from "react"
import {
  Home,
  ArrowRight,
  ArrowLeft,
  Sun,
  MapPin,
  AlertTriangle,
} from "lucide-react"
import { LocationRoof, RoofType } from "../../types/assessment"
import { Button } from "../../components/ui/Button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/Card"
import { Input } from "../../components/ui/Input"
import { Label } from "../../components/ui/Label"
import { Badge } from "../../components/ui/Badge"
import {
  api,
  LocationApiResponse,
  SolarGenerationApiResponse,
} from "../../services/api"

export interface LocationRoofStepProps {
  initialLocationRoof: LocationRoof
  onConfirm: (updated: LocationRoof) => void
  onBack: () => void
}

export const LocationRoofStep: React.FC<LocationRoofStepProps> = ({
  initialLocationRoof,
  onConfirm,
  onBack,
}) => {
  const [data, setData] = useState<LocationRoof>(initialLocationRoof)
  const [locations, setLocations] = useState<LocationApiResponse[]>([])
  const [generationPreview, setGenerationPreview] = useState<SolarGenerationApiResponse | null>(null)
  const [isLoadingPreview, setIsLoadingPreview] = useState(false)

  const roofTypes: RoofType[] = ["RCC Flat", "Sloped Tiled", "Metal Sheet", "Asbestos / Other"]

  // Load locations on mount
  useEffect(() => {
    let isCancelled = false
    api.getLocations().then((locs) => {
      if (!isCancelled) setLocations(locs)
    })
    return () => {
      isCancelled = true
    }
  }, [])

  // Calculate live solar generation simulation based on location, area, and shading
  useEffect(() => {
    let isCancelled = false
    const runSimulation = async () => {
      setIsLoadingPreview(true)
      // Estimate typical capacity from roof area (capped between 1kW and 10kW for preview)
      const maxPossibleKw = Math.max(1, Math.min(10, Math.floor(data.approxAreaSqFt / 90) || 3))

      const res = await api.calculateSolarGeneration({
        capacity_kw: maxPossibleKw,
        city: data.city,
        state: data.state,
        roof_type: data.roofType,
        shading_level: data.shadingLevel,
      })

      if (!isCancelled) {
        setGenerationPreview(res)
        setIsLoadingPreview(false)
      }
    }

    const timer = setTimeout(runSimulation, 250)
    return () => {
      isCancelled = true
      clearTimeout(timer)
    }
  }, [data.city, data.state, data.approxAreaSqFt, data.roofType, data.shadingLevel])

  const handleCitySelect = (loc: LocationApiResponse) => {
    setData((prev) => ({
      ...prev,
      city: loc.city,
      state: loc.state,
    }))
  }

  const selectedLoc = locations.find(
    (l) => l.city.toLowerCase() === data.city.toLowerCase()
  )

  return (
    <div className="max-w-2xl mx-auto py-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-2xl">Location & Rooftop Characteristics</CardTitle>
              <CardDescription>
                Solar generation depends on your regional solar irradiance, roof orientation, and shading.
              </CardDescription>
            </div>
            {selectedLoc && (
              <Badge variant="success">
                <span className="flex items-center gap-1">
                  <Sun className="h-3.5 w-3.5 text-amber-500" />
                  {selectedLoc.annual_avg_daily_ghi} kWh/m²/day
                </span>
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Quick City Presets */}
          <div>
            <Label className="text-xs text-neutral-600 mb-1.5 flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-emerald-600" /> Popular Solar Zones
            </Label>
            <div className="flex flex-wrap gap-1.5">
              {locations.slice(0, 6).map((loc) => (
                <button
                  key={loc.city}
                  type="button"
                  onClick={() => handleCitySelect(loc)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-all cursor-pointer ${
                    data.city.toLowerCase() === loc.city.toLowerCase()
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "bg-neutral-50 text-neutral-700 border-neutral-200 hover:border-emerald-500"
                  }`}
                >
                  {loc.city}
                </button>
              ))}
            </div>
          </div>

          {/* Location Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <Label required>City / District</Label>
              <Input
                value={data.city}
                onChange={(e) => setData((prev) => ({ ...prev, city: e.target.value }))}
              />
            </div>
            <div>
              <Label required>State</Label>
              <Input
                value={data.state}
                onChange={(e) => setData((prev) => ({ ...prev, state: e.target.value }))}
              />
            </div>
            <div>
              <Label>Postal Code</Label>
              <Input
                value={data.postalCode}
                onChange={(e) => setData((prev) => ({ ...prev, postalCode: e.target.value }))}
              />
            </div>
          </div>

          {/* Roof Type Selection */}
          <div className="space-y-2">
            <Label required>Rooftop Construction Type</Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {roofTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setData((prev) => ({ ...prev, roofType: type }))}
                  className={`p-3 rounded-lg border text-xs font-semibold text-center transition-all cursor-pointer ${
                    data.roofType === type
                      ? "border-emerald-600 bg-emerald-50 text-emerald-900 shadow-xs"
                      : "border-neutral-200 text-neutral-700 hover:bg-neutral-50"
                  }`}
                >
                  <Home className="h-4 w-4 mx-auto mb-1.5 opacity-70" />
                  {type}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-neutral-500">
              RCC Flat rooftops allow elevated South-facing mounts at optimal ~12° tilt for rain runoff.
            </p>
          </div>

          {/* Rooftop Area */}
          <div>
            <Label required>Approximate Shadow-Free Rooftop Area (sq ft)</Label>
            <div className="relative mt-1">
              <Input
                type="number"
                value={data.approxAreaSqFt}
                onChange={(e) =>
                  setData((prev) => ({ ...prev, approxAreaSqFt: Number(e.target.value) || 0 }))
                }
                className="pr-16 font-bold"
              />
              <span className="absolute right-3 top-2.5 text-xs text-neutral-400 font-semibold">
                sq ft
              </span>
            </div>
            <span className="text-[11px] text-neutral-500 mt-1 block">
              Rule of thumb: A typical 1 kW system requires ~90–100 sq ft of unobstructed space.
            </span>
          </div>

          {/* Shading Level */}
          <div className="space-y-2">
            <Label>Estimated Rooftop Shading (Trees, parapet, nearby buildings)</Label>
            <div className="grid grid-cols-4 gap-2 text-xs">
              {(["None", "Low", "Moderate", "Heavy"] as const).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setData((prev) => ({ ...prev, shadingLevel: level }))}
                  className={`py-2 px-3 rounded-lg border text-center font-medium transition-all cursor-pointer ${
                    data.shadingLevel === level
                      ? "border-emerald-600 bg-emerald-50 text-emerald-900"
                      : "border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
            {data.shadingLevel === "Heavy" && (
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2 mt-2">
                <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Heavy shading derates solar output by ~30%. Microinverters or tree trimming are
                  strongly recommended to prevent string bottlenecking.
                </span>
              </div>
            )}
          </div>

          {/* Physical Solar Generation Preview */}
          {generationPreview && (
            <div
              className={`p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/80 space-y-3 transition-opacity ${
                isLoadingPreview ? "opacity-60" : "opacity-100"
              }`}
            >
              <div className="flex items-center justify-between text-xs font-semibold text-emerald-950">
                <span className="flex items-center gap-1.5">
                  <Sun className="h-4 w-4 text-amber-500" />
                  Estimated Generation Potential ({generationPreview.capacity_kw} kW capacity)
                </span>
                <span className="text-emerald-700 font-mono">
                  PR: {(generationPreview.system_losses.overall_performance_ratio * 100).toFixed(0)}%
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div className="bg-white p-2.5 rounded-lg border border-emerald-100">
                  <div className="text-neutral-500 text-[11px]">Annual 1st-Year Yield</div>
                  <div className="font-bold text-neutral-900 text-sm font-mono mt-0.5">
                    {generationPreview.annual_generation_kwh.toLocaleString()} kWh
                  </div>
                </div>

                <div className="bg-white p-2.5 rounded-lg border border-emerald-100">
                  <div className="text-neutral-500 text-[11px]">Specific Yield</div>
                  <div className="font-bold text-emerald-700 text-sm font-mono mt-0.5">
                    {generationPreview.specific_annual_yield_kwh_per_kwp} kWh/kWp
                  </div>
                </div>

                <div className="bg-white p-2.5 rounded-lg border border-emerald-100">
                  <div className="text-neutral-500 text-[11px]">Conservative (P90)</div>
                  <div className="font-bold text-neutral-800 text-sm font-mono mt-0.5">
                    {generationPreview.scenarios.low_p90_annual_kwh.toLocaleString()} kWh
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Bar */}
          <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
            <Button variant="outline" size="md" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Usage
            </Button>
            <Button size="md" onClick={() => onConfirm(data)}>
              Calculate Feasibility & Sizing <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
