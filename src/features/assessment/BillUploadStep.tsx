import React, { useState, useRef } from "react"
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  Shield,
  ArrowRight,
  AlertCircle,
  Sparkles,
  ClipboardList,
  Zap,
} from "lucide-react"
import { Button } from "../../components/ui/Button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/Card"
import { Input } from "../../components/ui/Input"
import { Label } from "../../components/ui/Label"
import { BillData } from "../../types/assessment"
import { api } from "../../services/api"
import {
  parseBillTextClientSide,
  toBillData,
  extractTextFromPdfArrayBuffer,
  extractTextFromImageFile,
} from "../../lib/billTextParser"

export interface BillUploadStepProps {
  onExtracted: (bill: BillData) => void
  onManualEntry: () => void
}

export const BillUploadStep: React.FC<BillUploadStepProps> = ({
  onExtracted,
  onManualEntry,
}) => {
  const [mode, setMode] = useState<"upload" | "paste">("upload")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedPresetName, setSelectedPresetName] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isOcrLoading, setIsOcrLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [extractedPreview, setExtractedPreview] = useState<BillData | null>(null)

  // Direct paste text state
  const [pastedText, setPastedText] = useState("")

  // Quick fallback inputs for images/scans
  const [manualUnits, setManualUnits] = useState<string>("")
  const [manualBill, setManualBill] = useState<string>("")
  const [manualProvider, setManualProvider] = useState<string>("BESCOM (Karnataka)")

  const fileInputRef = useRef<HTMLInputElement>(null)

  const processFileClientSide = async (file: File) => {
    setSelectedFile(file)
    setSelectedPresetName(null)
    setErrorMessage(null)
    setExtractedPreview(null)

    const fileName = file.name.toLowerCase()

    if (fileName.endsWith(".pdf")) {
      try {
        const buffer = await file.arrayBuffer()
        const text = await extractTextFromPdfArrayBuffer(buffer)
        if (text && text.length > 30) {
          const parsed = parseBillTextClientSide(text)
          if (parsed.units > 0 || parsed.totalBill > 0) {
            const data = toBillData(parsed)
            setExtractedPreview(data)
            if (data.units > 0) setManualUnits(String(data.units))
            if (data.totalBill > 0) setManualBill(String(data.totalBill))
            if (data.provider) setManualProvider(data.provider)
            return
          }
        }
      } catch (err) {
        console.warn("Client-side PDF parse notice:", err)
      }
    } else if (fileName.endsWith(".txt") || fileName.endsWith(".csv")) {
      try {
        const text = await file.text()
        const parsed = parseBillTextClientSide(text)
        const data = toBillData(parsed)
        setExtractedPreview(data)
        if (data.units > 0) setManualUnits(String(data.units))
        if (data.totalBill > 0) setManualBill(String(data.totalBill))
        return
      } catch (err) {
        console.warn("Client-side text parse notice:", err)
      }
    } else if (
      fileName.endsWith(".png") ||
      fileName.endsWith(".jpg") ||
      fileName.endsWith(".jpeg") ||
      fileName.endsWith(".webp")
    ) {
      // In-browser client-side WebAssembly OCR for images
      setIsOcrLoading(true)
      try {
        const text = await extractTextFromImageFile(file)
        if (text && text.length > 15) {
          const parsed = parseBillTextClientSide(text)
          if (parsed.units > 0 || parsed.totalBill > 0) {
            const data = toBillData(parsed)
            setExtractedPreview(data)
            if (data.units > 0) setManualUnits(String(data.units))
            if (data.totalBill > 0) setManualBill(String(data.totalBill))
            if (data.provider) setManualProvider(data.provider)
            setIsOcrLoading(false)
            return
          }
        }
      } catch (err) {
        console.warn("Client-side image OCR notice:", err)
      }
      setIsOcrLoading(false)
    }

    // For images or scanned PDFs without text
    setExtractedPreview(null)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFileClientSide(e.target.files[0])
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFileClientSide(e.dataTransfer.files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const handlePasteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value
    setPastedText(val)
    if (val.trim().length > 15) {
      const parsed = parseBillTextClientSide(val)
      setExtractedPreview(toBillData(parsed))
      if (parsed.units > 0) setManualUnits(String(parsed.units))
      if (parsed.totalBill > 0) setManualBill(String(parsed.totalBill))
      if (parsed.provider) setManualProvider(parsed.provider)
    } else {
      setExtractedPreview(null)
    }
  }

  const handleAnalyze = async () => {
    setIsProcessing(true)
    setErrorMessage(null)

    try {
      // 1. If user used paste mode or client-side preview was verified
      if (mode === "paste" && pastedText.trim()) {
        const result = await api.extractBillText(pastedText)
        setIsProcessing(false)
        onExtracted(result)
        return
      }

      // 2. If client-side extracted numbers exist from PDF or quick entries
      if (extractedPreview && extractedPreview.units > 0 && extractedPreview.totalBill > 0) {
        setIsProcessing(false)
        onExtracted(extractedPreview)
        return
      }

      // 3. If manual quick entries were filled for an image
      const inputUnits = parseFloat(manualUnits)
      const inputBill = parseFloat(manualBill)
      if (inputUnits > 0 && inputBill > 0) {
        const energyCharges = Math.round(inputBill * 0.82)
        const fixedCharges = Math.round(inputBill * 0.11)
        const taxes = Math.max(0, inputBill - energyCharges - fixedCharges)
        const quickBill: BillData = {
          provider: manualProvider || "Domestic Electricity Utility",
          consumerCategory: "Domestic (Residential)",
          billingPeriod: "Monthly Cycle",
          billingDays: 30,
          units: inputUnits,
          totalBill: inputBill,
          energyCharges,
          fixedCharges,
          taxesAndAdjustments: taxes,
          meterType: "Single Phase",
          isConfidenceHigh: true,
          validationWarnings: [],
        }
        setIsProcessing(false)
        onExtracted(quickBill)
        return
      }

      // 4. Fallback to API extractBill (processes in memory)
      if (selectedFile) {
        const extracted = await api.extractBill(selectedFile)
        setIsProcessing(false)
        onExtracted(extracted)
        return
      }

      setIsProcessing(false)
      setErrorMessage("Please select a file, paste bill text, or choose a preset sample.")
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
    }, 300)
  }

  return (
    <div className="max-w-2xl mx-auto py-4">
      <Card>
        <CardHeader className="text-center pb-2">
          {/* Badge: Step 1 */}
          <div className="flex justify-center mb-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[4px] border border-neutral-300 bg-white/95 text-xs font-semibold text-neutral-900 shadow-2xs backdrop-blur-xs">
              <Zap className="w-3.5 h-3.5 text-[#FE5A01] fill-[#FE5A01]/20" />
              <span>Step 1: Bill Upload</span>
            </div>
          </div>

          <CardTitle className="text-2xl sm:text-3xl font-extrabold text-neutral-950 tracking-tight">
            Upload Electricity Bill
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm text-neutral-600 max-w-lg mx-auto">
            SolarWise extracts your tariff, units, and billing slabs with deterministic accuracy.
          </CardDescription>

          {/* Mode Tabs */}
          <div className="flex items-center justify-center gap-2 pt-3">
            <button
              type="button"
              onClick={() => {
                setMode("upload")
                setErrorMessage(null)
              }}
              className={`text-xs font-semibold px-4 py-1.5 rounded-[4px] transition-all flex items-center gap-1.5 cursor-pointer ${
                mode === "upload"
                  ? "bg-[#FE5A01] text-white shadow-2xs"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              }`}
            >
              <UploadCloud className="h-3.5 w-3.5" /> Upload Document / Image
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("paste")
                setErrorMessage(null)
              }}
              className={`text-xs font-semibold px-4 py-1.5 rounded-[4px] transition-all flex items-center gap-1.5 cursor-pointer ${
                mode === "paste"
                  ? "bg-[#FE5A01] text-white shadow-2xs"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              }`}
            >
              <ClipboardList className="h-3.5 w-3.5" /> Paste Bill Text / E-Bill
            </button>
          </div>
        </CardHeader>

        <CardContent className="space-y-5 pt-3">
          {/* Error Notice */}
          {errorMessage && (
            <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
              <div>
                <p className="font-semibold">Extraction Notice</p>
                <p className="mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Mode 1: File Upload */}
          {mode === "upload" && (
            <>
              {/* Hidden File Input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,.png,.jpg,.jpeg,.webp,.txt"
                className="hidden"
              />

              {/* Dropzone Container */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-orange-300/80 bg-orange-50/20 hover:bg-orange-50/40 rounded-xl p-7 text-center cursor-pointer transition-colors"
              >
                <div className="h-11 w-11 rounded-full bg-orange-100 text-[#FE5A01] flex items-center justify-center mx-auto mb-2.5">
                  <UploadCloud className="h-5 w-5" />
                </div>
                <p className="font-semibold text-neutral-900 text-sm mb-1">
                  Drag & drop your bill PDF, PNG, or JPG
                </p>
                <p className="text-xs text-neutral-500 mb-3">
                  Digital PDF text is extracted instantly in-browser. All processing is strictly in memory.
                </p>
                <div className="flex items-center justify-center gap-2">
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

                <div className="pt-3 text-[11px] text-neutral-500 flex items-center justify-center gap-2">
                  <span>Need a test file?</span>
                  <a
                    href="/test_bills/sample_bescom_bill.pdf"
                    download="sample_bescom_bill.pdf"
                    onClick={(e) => e.stopPropagation()}
                    className="text-[#FE5A01] underline font-medium hover:text-[#d44800]"
                  >
                    Sample PDF (450 kWh)
                  </a>
                  <span>•</span>
                  <a
                    href="/test_bills/sample_bescom_bill.png"
                    download="sample_bescom_bill.png"
                    onClick={(e) => e.stopPropagation()}
                    className="text-[#FE5A01] underline font-medium hover:text-[#d44800]"
                  >
                    Sample Image (PNG)
                  </a>
                </div>
              </div>

              {/* Selected File Details */}
              {selectedFile && (
                <div className="p-3.5 rounded-lg border border-neutral-200 bg-neutral-50 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <FileText className="h-5 w-5 text-[#FE5A01]" />
                      <div>
                        <p className="text-sm font-medium text-neutral-900">{selectedFile.name}</p>
                        <p className="text-xs text-neutral-500">
                          {(selectedFile.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    <span className="flex items-center gap-1 text-xs font-semibold text-[#FE5A01] bg-orange-100/70 px-2.5 py-1 rounded-[4px] border border-orange-200">
                      <CheckCircle2 className="h-3.5 w-3.5" /> File Loaded
                    </span>
                  </div>

                  {/* Extracted Preview Badge (if PDF had digital text) */}
                  {extractedPreview && (
                    <div className="p-2.5 rounded-md bg-orange-50/90 border border-orange-200 text-xs text-orange-950 flex flex-wrap items-center justify-between gap-2">
                      <span className="font-semibold flex items-center gap-1 text-[#FE5A01]">
                        <Zap className="h-3.5 w-3.5" /> Extracted from Document:
                      </span>
                      <div className="flex items-center gap-3 font-mono font-medium">
                        <span>Units: {extractedPreview.units} kWh</span>
                        <span>Total: ₹{extractedPreview.totalBill.toLocaleString()}</span>
                        <span>Provider: {extractedPreview.provider}</span>
                      </div>
                    </div>
                  )}

                  {/* Quick Value Form if image/scanned or text was unreadable */}
                  {!extractedPreview && (
                    <div className="pt-2 border-t border-neutral-200 text-xs space-y-2">
                      <p className="font-semibold text-neutral-800">
                        Quick Value Verification (From your bill photo/scan):
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div>
                          <Label className="text-[11px] text-neutral-600">Consumed Units (kWh)</Label>
                          <Input
                            type="number"
                            placeholder="e.g. 420"
                            value={manualUnits}
                            onChange={(e) => setManualUnits(e.target.value)}
                            className="h-8 text-xs font-mono"
                          />
                        </div>
                        <div>
                          <Label className="text-[11px] text-neutral-600">Total Bill Amount (₹)</Label>
                          <Input
                            type="number"
                            placeholder="e.g. 3100"
                            value={manualBill}
                            onChange={(e) => setManualBill(e.target.value)}
                            className="h-8 text-xs font-mono"
                          />
                        </div>
                        <div>
                          <Label className="text-[11px] text-neutral-600">Utility Provider</Label>
                          <Input
                            type="text"
                            placeholder="e.g. BESCOM / KSEB"
                            value={manualProvider}
                            onChange={(e) => setManualProvider(e.target.value)}
                            className="h-8 text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Mode 2: Direct Bill Text Paste */}
          {mode === "paste" && (
            <div className="space-y-3">
              <Label className="text-xs font-semibold text-neutral-700">
                Paste Bill Text, Email Statement, or Bill SMS:
              </Label>
              <textarea
                rows={5}
                value={pastedText}
                onChange={handlePasteChange}
                placeholder="Example: BESCOM Bill. Consumed Units: 450 kWh. Net Amount Payable: Rs 3420. Tariff: LT-2(a). Meter: Three Phase..."
                className="w-full text-xs font-mono p-3 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#FE5A01] bg-white"
              />

              {extractedPreview && (
                <div className="p-3 rounded-lg bg-orange-50 border border-orange-200 text-xs text-orange-950 flex flex-wrap items-center justify-between gap-2">
                  <span className="font-semibold flex items-center gap-1 text-[#FE5A01]">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Recognized Values:
                  </span>
                  <div className="flex items-center gap-3 font-mono font-medium">
                    <span>Units: {extractedPreview.units} kWh</span>
                    <span>Total: ₹{extractedPreview.totalBill.toLocaleString()}</span>
                    <span>Provider: {extractedPreview.provider}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quick Pre-loaded Verified Samples */}
          <div className="pt-1">
            <p className="text-xs font-semibold text-neutral-700 mb-2 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" /> Or test with verified sample bills:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleSelectPreset("kseb")}
                className="text-left p-2.5 rounded-lg border border-neutral-200 hover:border-[#FE5A01] hover:bg-orange-50/30 transition-all text-xs cursor-pointer"
              >
                <div className="font-semibold text-neutral-900">KSEB Kerala</div>
                <div className="text-neutral-500 text-[11px]">320 kWh • ₹2,150</div>
              </button>
              <button
                type="button"
                onClick={() => handleSelectPreset("bescom")}
                className="text-left p-2.5 rounded-lg border border-neutral-200 hover:border-[#FE5A01] hover:bg-orange-50/30 transition-all text-xs cursor-pointer"
              >
                <div className="font-semibold text-neutral-900">BESCOM Bangalore</div>
                <div className="text-neutral-500 text-[11px]">450 kWh • ₹3,420</div>
              </button>
              <button
                type="button"
                onClick={() => handleSelectPreset("low_usage")}
                className="text-left p-2.5 rounded-lg border border-neutral-200 hover:border-[#FE5A01] hover:bg-orange-50/30 transition-all text-xs cursor-pointer"
              >
                <div className="font-semibold text-neutral-900">Low Consumption</div>
                <div className="text-neutral-500 text-[11px]">85 kWh • ₹420</div>
              </button>
            </div>
          </div>

          {/* Privacy Note */}
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-neutral-100/70 text-xs text-neutral-600">
            <Shield className="h-4 w-4 text-[#FE5A01] shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-neutral-800">Privacy Guarantee: </span>
              Your bill document or image is processed purely in memory to extract consumption numbers and is never stored on any server or cloud storage.
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-neutral-100">
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
              isLoading={isProcessing || isOcrLoading}
              disabled={
                isOcrLoading ||
                (mode === "upload"
                  ? !selectedFile && !selectedPresetName && (!manualUnits || !manualBill)
                  : !pastedText.trim())
              }
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
