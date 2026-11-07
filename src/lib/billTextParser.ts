/**
 * Client-Side Bill Text Extractor & Deterministic Parser for Indian Utilities.
 * Extracts text directly in the browser from digital PDFs, text files, or pasted bill content.
 * Privacy-first: Zero file uploads, zero cloud storage.
 */

import { BillData } from "../types/assessment"

export interface ParsedBillResult {
  provider: string
  consumerCategory: string
  billingPeriod: string
  billingDays: number
  units: number
  totalBill: number
  energyCharges: number
  fixedCharges: number
  taxesAndAdjustments: number
  meterType: string
  isConfidenceHigh: boolean
  validationWarnings: string[]
  rawSnippet?: string
}

/**
 * Extract text from scanned bill images (PNG/JPG) using in-browser client-side WebAssembly OCR.
 * Zero backend requirement, zero cloud transmission.
 */
export async function extractTextFromImageFile(imageFile: File): Promise<string> {
  if (typeof window === "undefined" || typeof Worker === "undefined") {
    return ""
  }
  try {
    const { recognize } = await import("tesseract.js")
    const result = await recognize(imageFile, "eng")
    return result?.data?.text || ""
  } catch (err) {
    console.warn("Client-side image OCR notice:", err)
    return ""
  }
}

/**
 * Extract selectable text streams from a digital PDF ArrayBuffer directly in browser.
 */
export async function extractTextFromPdfArrayBuffer(arrayBuffer: ArrayBuffer): Promise<string> {
  const bytes = new Uint8Array(arrayBuffer)
  let text = ""

  // Method 1: Decode Latin1/UTF-8 string and search for text objects (BT ... ET)
  const binaryString = new TextDecoder("latin1").decode(bytes)

  // Find text enclosed in BT ... ET blocks
  const btRegex = /BT[\s\S]*?ET/g
  const matches = binaryString.match(btRegex) || []

  for (const block of matches) {
    // Match string literals (text) Tj
    const tjMatches = block.match(/\(([^)]*)\)\s*Tj/g) || []
    for (const tj of tjMatches) {
      const match = tj.match(/\(([^)]*)\)\s*Tj/)
      if (match && match[1]) {
        text += match[1] + " "
      }
    }

    // Match array strings [(t1) 20 (t2)] TJ
    const arrayMatches = block.match(/\[([\s\S]*?)\]\s*TJ/g) || []
    for (const arr of arrayMatches) {
      const inner = arr.match(/\(([^)]*)\)/g) || []
      for (const piece of inner) {
        text += piece.slice(1, -1) + " "
      }
    }
  }

  // If text objects yielded good readable content, return it
  if (text.trim().length > 30) {
    return text.replace(/\s+/g, " ").trim()
  }

  // Fallback: look for readable ASCII words in stream
  const cleanAscii = binaryString
    .replace(/[^\x20-\x7E\n\r]/g, " ")
    .replace(/\s+/g, " ")
    .trim()

  return cleanAscii
}

/**
 * Deterministically parse raw Indian electricity bill text into structured BillData.
 */
export function parseBillTextClientSide(rawText: string): ParsedBillResult {
  const text = rawText.replace(/\r\n/g, "\n")
  const warnings: string[] = []

  // 1. Detect Utility Provider
  let provider = "Generic Provider"
  let consumerCategory = "Domestic (Residential)"

  if (/BESCOM|Bangalore\s*Electricity/i.test(text)) {
    provider = "BESCOM (Karnataka)"
    consumerCategory = "Domestic LT-2(a)"
  } else if (/KSEB|Kerala\s*State\s*Electricity/i.test(text)) {
    provider = "KSEB (Kerala)"
    consumerCategory = "Domestic LT-1A"
  } else if (/MSEDCL|Mahavitaran|Maharashtra\s*State/i.test(text)) {
    provider = "MSEDCL (Maharashtra)"
    consumerCategory = "Domestic LT-I(B)"
  } else if (/TANGEDCO|Tamil\s*Nadu\s*Generation/i.test(text)) {
    provider = "TANGEDCO (Tamil Nadu)"
    consumerCategory = "Domestic Tariff 1A"
  } else if (/TATA\s*POWER/i.test(text)) {
    provider = "Tata Power (Mumbai/Delhi)"
    consumerCategory = "Domestic LT-1"
  } else if (/ADANI\s*ELECTRICITY/i.test(text)) {
    provider = "Adani Electricity (Mumbai)"
    consumerCategory = "Domestic LT-1"
  } else if (/TORRENT\s*POWER/i.test(text)) {
    provider = "Torrent Power (Gujarat)"
    consumerCategory = "Domestic R-Tariff"
  } else {
    warnings.push("Utility provider not recognized automatically; standard domestic tariff applied.")
  }

  // 2. Extract Units / kWh
  let units = 0
  const unitsPatterns = [
    /(?:Consumed\s*Units|Units\s*Consumed|Billed\s*Units|Total\s*Units|Billed\s*kWh|Consumption|Units|kWh)\s*[:=-]?\s*(\d+(?:\.\d+)?)/i,
    /(\d+(?:\.\d+)?)\s*(?:Units|kWh|Units\s*Billed)/i,
    /(?:Current\s*Reading|Present\s*Reading)[\s\S]*?(?:Previous\s*Reading)[\s\S]*?(?:Net\s*Units|Units)\s*[:=-]?\s*(\d+(?:\.\d+)?)/i,
  ]

  for (const pat of unitsPatterns) {
    const match = text.match(pat)
    if (match && match[1]) {
      const val = parseFloat(match[1])
      if (val > 0 && val < 50000) {
        units = val
        break
      }
    }
  }

  // 3. Extract Total Amount Due / Net Payable
  let totalBill = 0
  const amountPatterns = [
    /(?:Net\s*Amount\s*Payable|Total\s*Amount\s*Due|Amount\s*Payable|Net\s*Payable|Total\s*Bill|Current\s*Bill|Total\s*Payable)\s*[:=-]?\s*(?:Rs\.?|₹|INR)?\s*(\d+(?:,\d+)*(?:\.\d+)?)/i,
    /(?:Bill\s*Amount|Gross\s*Amount)\s*[:=-]?\s*(?:Rs\.?|₹|INR)?\s*(\d+(?:,\d+)*(?:\.\d+)?)/i,
    /(?:Rs\.?|₹)\s*(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:Payable|Due|Total)/i,
  ]

  for (const pat of amountPatterns) {
    const match = text.match(pat)
    if (match && match[1]) {
      const val = parseFloat(match[1].replace(/,/g, ""))
      if (val > 0 && val < 1000000) {
        totalBill = val
        break
      }
    }
  }

  // 4. Extract Energy Charges
  let energyCharges = 0
  const energyMatch = text.match(
    /(?:Energy\s*Charges?|E\.C\.|Electricity\s*Charges?)\s*[:=-]?\s*(?:Rs\.?|₹)?\s*(\d+(?:,\d+)*(?:\.\d+)?)/i
  )
  if (energyMatch && energyMatch[1]) {
    energyCharges = parseFloat(energyMatch[1].replace(/,/g, ""))
  }

  // 5. Extract Fixed Charges
  let fixedCharges = 0
  const fixedMatch = text.match(
    /(?:Fixed\s*Charges?|F\.C\.|Demand\s*Charges?)\s*[:=-]?\s*(?:Rs\.?|₹)?\s*(\d+(?:,\d+)*(?:\.\d+)?)/i
  )
  if (fixedMatch && fixedMatch[1]) {
    fixedCharges = parseFloat(fixedMatch[1].replace(/,/g, ""))
  }

  // 6. Extract Taxes, FPPCA, and Fuel Adjustments
  let taxesAndAdjustments = 0
  const taxMatch = text.match(
    /(?:Electricity\s*Duty|Govt\s*Duty|Tax|Fuel\s*Adjustment|FPPCA|F\.A\.C)\s*[:=-]?\s*(?:Rs\.?|₹)?\s*(\d+(?:,\d+)*(?:\.\d+)?)/i
  )
  if (taxMatch && taxMatch[1]) {
    taxesAndAdjustments = parseFloat(taxMatch[1].replace(/,/g, ""))
  }

  // If subcomponents are missing, estimate them based on standard split
  if (totalBill > 0 && energyCharges === 0) {
    energyCharges = Math.round(totalBill * 0.82)
    fixedCharges = Math.round(totalBill * 0.11)
    taxesAndAdjustments = Math.max(0, totalBill - energyCharges - fixedCharges)
  }

  // 7. Meter Supply Phase
  const meterType = /3\s*Phase|Three\s*Phase|3\s*Ph/i.test(text) ? "Three Phase" : "Single Phase"

  // 8. Confidence Check
  const hasUnits = units > 0
  const hasTotal = totalBill > 0
  const isConfidenceHigh = hasUnits && hasTotal

  if (!hasUnits) {
    warnings.push("Could not clearly locate consumed units (kWh). Please confirm or enter units manually.")
  }
  if (!hasTotal) {
    warnings.push("Could not find net bill amount. Please confirm your total bill.")
  }

  const rawSnippet = text.slice(0, 180).replace(/\s+/g, " ")

  return {
    provider,
    consumerCategory,
    billingPeriod: "Current Cycle",
    billingDays: 30,
    units,
    totalBill,
    energyCharges,
    fixedCharges,
    taxesAndAdjustments,
    meterType,
    isConfidenceHigh,
    validationWarnings: warnings,
    rawSnippet,
  }
}

/**
 * Converts a parsed result into standard BillData.
 */
export function toBillData(parsed: ParsedBillResult): BillData {
  return {
    provider: parsed.provider,
    consumerCategory: parsed.consumerCategory,
    billingPeriod: parsed.billingPeriod,
    billingDays: parsed.billingDays,
    units: parsed.units,
    totalBill: parsed.totalBill,
    energyCharges: parsed.energyCharges,
    fixedCharges: parsed.fixedCharges,
    taxesAndAdjustments: parsed.taxesAndAdjustments,
    meterType: parsed.meterType,
    isConfidenceHigh: parsed.isConfidenceHigh,
    validationWarnings: parsed.validationWarnings,
  }
}

