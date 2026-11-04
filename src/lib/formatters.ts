/**
 * Safe formatting utilities defensively handling null, undefined, NaN, and Infinity.
 */

export function safeNumber(val: unknown, fallback: number = 0): number {
  if (typeof val === "number" && Number.isFinite(val)) {
    return val
  }
  if (typeof val === "string") {
    const parsed = parseFloat(val)
    if (Number.isFinite(parsed)) {
      return parsed
    }
  }
  return fallback
}

export function formatCurrency(
  val: unknown,
  currencySymbol: string = "₹",
  showDecimals: boolean = false
): string {
  const num = safeNumber(val, 0)
  const formatted = num.toLocaleString("en-IN", {
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  })
  return `${currencySymbol}${formatted}`
}

export function formatEnergy(val: unknown, decimals: number = 0): string {
  const num = safeNumber(val, 0)
  return `${num.toLocaleString("en-IN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })} kWh`
}

export function formatCapacity(val: unknown, decimals: number = 2): string {
  const num = safeNumber(val, 0)
  return `${num.toFixed(decimals)} kWp`
}

export function formatPercentage(val: unknown, decimals: number = 1): string {
  const num = safeNumber(val, 0)
  return `${num.toFixed(decimals)}%`
}

export function formatPaybackYears(val: unknown): string {
  const num = safeNumber(val, 99)
  if (num <= 0) return "Immediate"
  if (num > 25) return "> 25 yrs"
  return `${num.toFixed(1)} yrs`
}
