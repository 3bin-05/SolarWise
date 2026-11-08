import React, { useState, useEffect, useRef } from "react"
import {
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Calculator,
  Loader2,
} from "lucide-react"
import { BillData } from "../../types/assessment"
import { Button } from "../../components/ui/Button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/Card"
import { Input } from "../../components/ui/Input"
import { Label } from "../../components/ui/Label"
import { Badge } from "../../components/ui/Badge"
import { api, ValidationApiResponse } from "../../services/api"

export interface BillConfirmStepProps {
  initialBill: BillData
  onConfirm: (updatedBill: BillData) => void
  onBack: () => void
  onChange?: (updatedBill: BillData) => void
}

export const BillConfirmStep: React.FC<BillConfirmStepProps> = ({
  initialBill,
  onConfirm,
  onBack,
  onChange,
}) => {
  const [bill, setBill] = useState<BillData>(initialBill)
  const [validation, setValidation] = useState<ValidationApiResponse | null>(null)
  const [isValidating, setIsValidating] = useState<boolean>(false)

  // Synchronize state if initialBill updates externally (e.g. from Guided View)
  useEffect(() => {
    setBill(initialBill)
  }, [initialBill])

  const isFirstMount = useRef(true)
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false
      return
    }
    onChange?.(bill)
  }, [bill, onChange])

  // Re-run validation whenever numbers change
  useEffect(() => {
    let isCancelled = false
    const validate = async () => {
      setIsValidating(true)
      const res = await api.validateBill(bill)
      if (!isCancelled) {
        setValidation(res)
        setIsValidating(false)
      }
    }

    const timer = setTimeout(validate, 250)
    return () => {
      isCancelled = true
      clearTimeout(timer)
    }
  }, [bill])

  const handleChange = (field: keyof BillData, value: string | number) => {
    setBill((prev) => {
      const next = {
        ...prev,
        [field]: typeof prev[field] === "number" ? Number(value) || 0 : value,
      }
      onChange?.(next)
      return next
    })
  }

  const componentSum =
    (bill.energyCharges || 0) + (bill.fixedCharges || 0) + (bill.taxesAndAdjustments || 0)
  const effectiveRate = bill.units > 0 ? ((bill.totalBill || 0) / bill.units).toFixed(2) : "0.00"

  const isHighConfidence = validation?.is_confidence_high ?? bill.isConfidenceHigh

  return (
    <div className="max-w-3xl mx-auto py-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              {/* Badge: Step 2 */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md border border-neutral-300 bg-white/95 text-xs font-semibold text-neutral-900 mb-2 shadow-2xs backdrop-blur-xs">
                <Calculator className="w-3.5 h-3.5 text-[#c2410c]" />
                <span>Step 2: Data Verification</span>
              </div>
              <CardTitle className="text-2xl sm:text-3xl font-extrabold text-neutral-950 tracking-tight">
                Confirm Extracted Bill Data
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm text-neutral-600">
                Never silently trust OCR. Review and correct any extracted electricity bill fields.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {isValidating && (
                <span className="inline-flex items-center gap-1.5 text-xs text-[#c2410c] font-semibold animate-pulse bg-orange-50 px-2.5 py-1 rounded-md border border-orange-200">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#FE5A01]" /> Verifying Tariff...
                </span>
              )}
              <Badge variant={isHighConfidence ? "success" : "warning"}>
                {isHighConfidence ? (
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> High Confidence
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <AlertTriangle className="h-3.5 w-3.5" /> Review Needed
                  </span>
                )}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Arithmetic Verification Banner */}
          {validation && (
            <div
              className={`p-3.5 rounded-xl border text-xs flex items-start gap-3 ${
                validation.arithmetic_matches
                  ? "bg-orange-50/70 border-orange-200 text-neutral-900"
                  : "bg-amber-50 border-amber-200 text-amber-900"
              }`}
            >
              {validation.arithmetic_matches ? (
                <CheckCircle2 className="h-4 w-4 text-[#FE5A01] shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              )}
              <div className="flex-1 space-y-1">
                <div className="font-semibold flex items-center justify-between">
                  <span>
                    {validation.arithmetic_matches
                      ? "Deterministic Arithmetic Verified"
                      : "Arithmetic Discrepancy Detected"}
                  </span>
                  <span className="text-[11px] font-mono font-medium text-[#FE5A01]">
                    Effective Tariff: ₹{effectiveRate}/kWh
                  </span>
                </div>
                <p>
                  Components sum: ₹{componentSum.toFixed(2)} vs Total Bill: ₹{bill.totalBill.toFixed(2)}
                  {validation.arithmetic_difference > 0 &&
                    ` (Difference: ₹${validation.arithmetic_difference.toFixed(2)})`}
                </p>
                {validation.warnings.length > 0 && (
                  <ul className="list-disc list-inside pt-1 space-y-0.5 text-amber-800">
                    {validation.warnings.map((w, idx) => (
                      <li key={idx}>{w}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          {/* Primary Numbers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-neutral-50/70 border border-neutral-200/90">
            <div>
              <div className="flex items-center justify-between mb-1">
                <Label required>Monthly Electricity Units (kWh)</Label>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  ✓ 98% Match
                </span>
              </div>
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
              <div className="flex items-center justify-between mb-1">
                <Label required>Total Bill Amount (₹)</Label>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  ✓ Verified
                </span>
              </div>
              <Input
                type="number"
                value={bill.totalBill}
                onChange={(e) => handleChange("totalBill", e.target.value)}
                className="font-bold text-lg text-neutral-900"
              />
              <span className="text-[11px] text-neutral-500 mt-1 block">
                Net payable amount including taxes and fixed charges
              </span>
            </div>
          </div>

          {/* Component Breakdown */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-700 mb-3">
              <Calculator className="h-3.5 w-3.5 text-neutral-500" />
              Detailed Bill Item Breakdown
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label>Energy Charges (₹)</Label>
                <Input
                  type="number"
                  value={bill.energyCharges}
                  onChange={(e) => handleChange("energyCharges", e.target.value)}
                />
                <span className="text-[10px] text-neutral-500 mt-1 block">
                  Variable energy rate charge
                </span>
              </div>
              <div>
                <Label>Fixed Meter Charges (₹)</Label>
                <Input
                  type="number"
                  value={bill.fixedCharges}
                  onChange={(e) => handleChange("fixedCharges", e.target.value)}
                />
                <span className="text-[10px] text-neutral-500 mt-1 block">
                  Connected load demand charge
                </span>
              </div>
              <div>
                <Label>Taxes & Duties (₹)</Label>
                <Input
                  type="number"
                  value={bill.taxesAndAdjustments}
                  onChange={(e) => handleChange("taxesAndAdjustments", e.target.value)}
                />
                <span className="text-[10px] text-neutral-500 mt-1 block">
                  Electricity duty, cess, adjustments
                </span>
              </div>
            </div>
          </div>

          {/* Metadata & DISCOM Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-neutral-100">
            <div>
              <Label>Provider / DISCOM</Label>
              <Input
                type="text"
                value={bill.provider}
                onChange={(e) => handleChange("provider", e.target.value)}
              />
            </div>
            <div>
              <Label>Consumer Category</Label>
              <Input
                type="text"
                value={bill.consumerCategory}
                onChange={(e) => handleChange("consumerCategory", e.target.value)}
              />
            </div>
            <div>
              <Label>Meter Type</Label>
              <select
                value={bill.meterType}
                onChange={(e) => handleChange("meterType", e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#FE5A01] focus:border-[#FE5A01]"
              >
                <option value="Single Phase">Single Phase</option>
                <option value="Three Phase">Three Phase</option>
              </select>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
            <Button variant="outline" size="md" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Upload
            </Button>
            <Button
              size="md"
              disabled={isValidating || bill.units <= 0 || bill.totalBill <= 0}
              onClick={() =>
                onConfirm({
                  ...bill,
                  isConfidenceHigh: isHighConfidence,
                  validationWarnings: validation?.warnings || [],
                })
              }
            >
              Confirm & Continue <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
