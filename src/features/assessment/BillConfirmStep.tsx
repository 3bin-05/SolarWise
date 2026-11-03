import React, { useState } from "react"
import { CheckCircle2, AlertTriangle, ArrowRight, ArrowLeft } from "lucide-react"
import { BillData } from "../../types/assessment"
import { Button } from "../../components/ui/Button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/Card"
import { Input } from "../../components/ui/Input"
import { Label } from "../../components/ui/Label"
import { Badge } from "../../components/ui/Badge"

export interface BillConfirmStepProps {
  initialBill: BillData
  onConfirm: (updatedBill: BillData) => void
  onBack: () => void
}

export const BillConfirmStep: React.FC<BillConfirmStepProps> = ({
  initialBill,
  onConfirm,
  onBack,
}) => {
  const [bill, setBill] = useState<BillData>(initialBill)

  const handleChange = (field: keyof BillData, value: string | number) => {
    setBill((prev) => ({
      ...prev,
      [field]: typeof prev[field] === "number" ? Number(value) || 0 : value,
    }))
  }

  return (
    <div className="max-w-3xl mx-auto py-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Confirm Extracted Bill Data</CardTitle>
              <CardDescription>
                Never silently trust OCR. Review the extracted fields and correct any values below.
              </CardDescription>
            </div>
            <Badge variant={bill.isConfidenceHigh ? "success" : "warning"}>
              {bill.isConfidenceHigh ? (
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> High Confidence
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" /> Review Needed
                </span>
              )}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Main Financial Numbers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-neutral-50 border border-neutral-200">
            <div>
              <Label required>Monthly Electricity Units (kWh)</Label>
              <Input
                type="number"
                value={bill.units}
                onChange={(e) => handleChange("units", e.target.value)}
                className="font-bold text-lg"
              />
              <span className="text-[11px] text-neutral-500 mt-1 block">
                Total units consumed in this billing cycle
              </span>
            </div>

            <div>
              <Label required>Total Bill Amount (₹)</Label>
              <Input
                type="number"
                value={bill.totalBill}
                onChange={(e) => handleChange("totalBill", e.target.value)}
                className="font-bold text-lg text-emerald-800"
              />
              <span className="text-[11px] text-neutral-500 mt-1 block">
                Net payable amount including taxes and fixed charges
              </span>
            </div>
          </div>

          {/* Detailed Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label>Energy Charges (₹)</Label>
              <Input
                type="number"
                value={bill.energyCharges}
                onChange={(e) => handleChange("energyCharges", e.target.value)}
              />
            </div>
            <div>
              <Label>Fixed Meter Charges (₹)</Label>
              <Input
                type="number"
                value={bill.fixedCharges}
                onChange={(e) => handleChange("fixedCharges", e.target.value)}
              />
            </div>
            <div>
              <Label>Taxes & Adjustments (₹)</Label>
              <Input
                type="number"
                value={bill.taxesAndAdjustments}
                onChange={(e) => handleChange("taxesAndAdjustments", e.target.value)}
              />
            </div>
          </div>

          {/* Provider and Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Electricity Distribution Company (DISCOM)</Label>
              <Input
                value={bill.provider}
                onChange={(e) => handleChange("provider", e.target.value)}
              />
            </div>
            <div>
              <Label>Consumer Category / Tariff Code</Label>
              <Input
                value={bill.consumerCategory}
                onChange={(e) => handleChange("consumerCategory", e.target.value)}
              />
            </div>
          </div>

          {/* Warnings if any */}
          {bill.validationWarnings.length > 0 && (
            <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
              <span className="font-semibold flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 text-amber-600" /> Validation Notice
              </span>
              <ul className="list-disc pl-5">
                {bill.validationWarnings.map((w, idx) => (
                  <li key={idx}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
            <Button variant="outline" size="md" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
            <Button size="md" onClick={() => onConfirm(bill)}>
              Confirm & Continue <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
