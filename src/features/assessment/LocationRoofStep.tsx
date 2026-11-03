import React, { useState } from "react"
import { Home, ArrowRight, ArrowLeft } from "lucide-react"
import { LocationRoof, RoofType } from "../../types/assessment"
import { Button } from "../../components/ui/Button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/Card"
import { Input } from "../../components/ui/Input"
import { Label } from "../../components/ui/Label"

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

  const roofTypes: RoofType[] = ["RCC Flat", "Sloped Tiled", "Metal Sheet", "Asbestos / Other"]

  return (
    <div className="max-w-2xl mx-auto py-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Location & Rooftop Characteristics</CardTitle>
          <CardDescription>
            Solar generation depends on your regional solar irradiance, roof orientation, and shading.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Location Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <Label required>City</Label>
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
            <Label required>Rooftop Type</Label>
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
          </div>

          {/* Rooftop Area */}
          <div>
            <Label required>Approximate Shadow-Free Rooftop Area (sq ft)</Label>
            <Input
              type="number"
              value={data.approxAreaSqFt}
              onChange={(e) =>
                setData((prev) => ({ ...prev, approxAreaSqFt: Number(e.target.value) || 0 }))
              }
            />
            <span className="text-[11px] text-neutral-500 mt-1 block">
              Rule of thumb: A typical 1 kW system requires ~90–100 sq ft of unobstructed space.
            </span>
          </div>

          {/* Shading Level */}
          <div className="space-y-2">
            <Label>Estimated Rooftop Shading (Trees, nearby buildings)</Label>
            <div className="grid grid-cols-4 gap-2 text-xs">
              {(["None", "Low", "Moderate", "Heavy"] as const).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setData((prev) => ({ ...prev, shadingLevel: level }))}
                  className={`p-2.5 rounded-lg border font-semibold text-center transition-all cursor-pointer ${
                    data.shadingLevel === level
                      ? "border-emerald-600 bg-emerald-50 text-emerald-900"
                      : "border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
            <Button variant="outline" size="md" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
            <Button size="md" onClick={() => onConfirm(data)}>
              Calculate Feasibility & Sizing <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
