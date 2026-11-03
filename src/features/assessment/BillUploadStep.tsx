import React, { useState } from "react"
import { UploadCloud, FileText, CheckCircle2, Shield, ArrowRight } from "lucide-react"
import { Button } from "../../components/ui/Button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/Card"

export interface BillUploadStepProps {
  onContinue: () => void
  onManualEntry: () => void
}

export const BillUploadStep: React.FC<BillUploadStepProps> = ({
  onContinue,
  onManualEntry,
}) => {
  const [selectedFile, setSelectedFile] = useState<string | null>("electricity_bill_oct2026.pdf")
  const [isProcessing, setIsProcessing] = useState(false)

  const handleSimulateUpload = () => {
    setIsProcessing(true)
    setTimeout(() => {
      setIsProcessing(false)
      onContinue()
    }, 700)
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
          {/* Dropzone Container */}
          <div className="border-2 border-dashed border-emerald-300 bg-emerald-50/20 hover:bg-emerald-50/40 rounded-xl p-8 text-center cursor-pointer transition-colors">
            <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3">
              <UploadCloud className="h-6 w-6" />
            </div>
            <p className="font-semibold text-neutral-900 text-sm mb-1">
              Drag & drop your bill PDF, PNG, or JPG
            </p>
            <p className="text-xs text-neutral-500 mb-4">
              Supports scanned bills up to 15MB. All temporary files are deleted after extraction.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedFile("sample_power_bill.pdf")}
            >
              Browse Files
            </Button>
          </div>

          {/* Selected File Card */}
          {selectedFile && (
            <div className="flex items-center justify-between p-3.5 rounded-lg border border-neutral-200 bg-neutral-50">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-emerald-600" />
                <div>
                  <p className="text-sm font-medium text-neutral-900">{selectedFile}</p>
                  <p className="text-xs text-neutral-500">Ready for deterministic OCR parsing</p>
                </div>
              </div>
              <span className="flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-100/70 px-2.5 py-1 rounded-md">
                <CheckCircle2 className="h-3.5 w-3.5" /> Selected
              </span>
            </div>
          )}

          {/* Privacy Note */}
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-neutral-100/70 text-xs text-neutral-600">
            <Shield className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-neutral-800">Privacy Guarantee: </span>
              Electricity bills are treated as sensitive documents. Personal identifiers are never sold,
              and temporary uploads are purged immediately following data extraction.
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
              onClick={handleSimulateUpload}
              isLoading={isProcessing}
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
