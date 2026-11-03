import React, { useState, useRef } from "react"
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  Shield,
  ArrowRight,
  AlertCircle,
  Sparkles,
} from "lucide-react"
import { Button } from "../../components/ui/Button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/Card"
import { BillData } from "../../types/assessment"
import { api } from "../../services/api"

export interface BillUploadStepProps {
  onExtracted: (bill: BillData) => void
  onManualEntry: () => void
}

export const BillUploadStep: React.FC<BillUploadStepProps> = ({
  onExtracted,
  onManualEntry,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedPresetName, setSelectedPresetName] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedFile(file)
      setSelectedPresetName(null)
      setErrorMessage(null)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      setSelectedFile(file)
      setSelectedPresetName(null)
      setErrorMessage(null)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setErrorMessage("Please select or drop a bill file first, or choose a preset sample below.")
      return
    }

    setIsProcessing(true)
    setErrorMessage(null)

    try {
      const extracted = await api.extractBill(selectedFile)
      setIsProcessing(false)
      onExtracted(extracted)
    } catch (err: any) {
      setIsProcessing(false)
      setErrorMessage(
        err.message ||
          "Could not extract bill values automatically. You can review or enter values manually."
      )
    }
  }

  const handleSelectPreset = (preset: "kseb" | "bescom" | "low_usage") => {
    setErrorMessage(null)
    let bill: BillData
    if (preset === "kseb") {
      setSelectedPresetName("Kerala KSEB Bill (320 kWh)")
      bill = {
        provider: "KSEB (Kerala)",
        consumerCategory: "Domestic LT-1A",
        billingPeriod: "Oct 2026",
        billingDays: 30,
        units: 320,
        totalBill: 2150,
        energyCharges: 1780,
        fixedCharges: 240,
        taxesAndAdjustments: 130,
        meterType: "Single Phase",
        isConfidenceHigh: true,
        validationWarnings: [],
      }
    } else if (preset === "bescom") {
      setSelectedPresetName("Bangalore BESCOM Bill (450 kWh)")
      bill = {
        provider: "BESCOM (Karnataka)",
        consumerCategory: "Domestic LT-2(a)",
        billingPeriod: "Sep 2026",
        billingDays: 30,
        units: 450,
        totalBill: 3420,
        energyCharges: 2850,
        fixedCharges: 360,
        taxesAndAdjustments: 210,
        meterType: "Three Phase",
        isConfidenceHigh: true,
        validationWarnings: [],
      }
    } else {
      setSelectedPresetName("Low Baseline Consumption (85 kWh)")
      bill = {
        provider: "KSEB (Kerala)",
        consumerCategory: "Domestic LT-1A",
        billingPeriod: "Oct 2026",
        billingDays: 30,
        units: 85,
        totalBill: 420,
        energyCharges: 310,
        fixedCharges: 80,
        taxesAndAdjustments: 30,
        meterType: "Single Phase",
        isConfidenceHigh: true,
        validationWarnings: [],
      }
    }

    setIsProcessing(true)
    setTimeout(() => {
      setIsProcessing(false)
      onExtracted(bill)
    }, 400)
  }

  return (
    <div className="max-w-2xl mx-auto py-4">
      <Card>
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl">Upload Electricity Bill</CardTitle>
          <CardDescription>
            SolarWise extracts your tariff, units, and billing slabs with deterministic accuracy.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 pt-4">
          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
              <div>
                <p className="font-semibold">Extraction Notice</p>
                <p className="mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,.png,.jpg,.jpeg,.webp"
            className="hidden"
          />

          {/* Dropzone Container */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-emerald-300 bg-emerald-50/20 hover:bg-emerald-50/40 rounded-xl p-8 text-center cursor-pointer transition-colors"
          >
            <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3">
              <UploadCloud className="h-6 w-6" />
            </div>
            <p className="font-semibold text-neutral-900 text-sm mb-1">
              Drag & drop your bill PDF, PNG, or JPG
            </p>
            <p className="text-xs text-neutral-500 mb-4">
              Supports digital e-bills and scanned invoices up to 15MB. All files are purged immediately.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                fileInputRef.current?.click()
              }}
            >
              Browse Local Files
            </Button>
          </div>

          {/* Selected File Card */}
          {selectedFile && (
            <div className="flex items-center justify-between p-3.5 rounded-lg border border-neutral-200 bg-neutral-50">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-emerald-600" />
                <div>
                  <p className="text-sm font-medium text-neutral-900">{selectedFile.name}</p>
                  <p className="text-xs text-neutral-500">
                    {(selectedFile.size / 1024).toFixed(1)} KB • Ready for extraction
                  </p>
                </div>
              </div>
              <span className="flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-100/70 px-2.5 py-1 rounded-md">
                <CheckCircle2 className="h-3.5 w-3.5" /> Ready
              </span>
            </div>
          )}

          {/* Quick Pre-loaded Verified Samples */}
          <div className="pt-2">
            <p className="text-xs font-semibold text-neutral-700 mb-2 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" /> Or test with verified sample bills:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleSelectPreset("kseb")}
                className="text-left p-2.5 rounded-lg border border-neutral-200 hover:border-emerald-500 hover:bg-emerald-50/30 transition-all text-xs"
              >
                <div className="font-semibold text-neutral-900">KSEB Kerala</div>
                <div className="text-neutral-500 text-[11px]">320 kWh • ₹2,150</div>
              </button>
              <button
                type="button"
                onClick={() => handleSelectPreset("bescom")}
                className="text-left p-2.5 rounded-lg border border-neutral-200 hover:border-emerald-500 hover:bg-emerald-50/30 transition-all text-xs"
              >
                <div className="font-semibold text-neutral-900">BESCOM Bangalore</div>
                <div className="text-neutral-500 text-[11px]">450 kWh • ₹3,420</div>
              </button>
              <button
                type="button"
                onClick={() => handleSelectPreset("low_usage")}
                className="text-left p-2.5 rounded-lg border border-neutral-200 hover:border-emerald-500 hover:bg-emerald-50/30 transition-all text-xs"
              >
                <div className="font-semibold text-neutral-900">Low Consumption</div>
                <div className="text-neutral-500 text-[11px]">85 kWh • ₹420</div>
              </button>
            </div>
          </div>

          {/* Privacy Note */}
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-neutral-100/70 text-xs text-neutral-600">
            <Shield className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-neutral-800">Privacy Guarantee: </span>
              Electricity bills are treated as confidential. Personal names and account IDs are never stored,
              and file uploads are held only in temporary memory during text extraction.
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={onManualEntry}
              className="text-xs font-medium text-neutral-500 hover:text-neutral-800 underline cursor-pointer"
            >
              Or enter bill details manually without uploading
            </button>
            <Button
              size="md"
              onClick={handleAnalyze}
              isLoading={isProcessing}
              disabled={!selectedFile && !selectedPresetName}
              className="w-full sm:w-auto"
            >
              Analyze Bill & Verify <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
