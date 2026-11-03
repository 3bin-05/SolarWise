import React from "react"
import { Info, AlertCircle, Check } from "lucide-react"
import { cn } from "../../lib/utils"

export interface AssumptionPillProps {
  label: string
  value: string
  status?: "verified" | "estimate" | "warning"
  tooltip?: string
}

export const AssumptionPill: React.FC<AssumptionPillProps> = ({
  label,
  value,
  status = "estimate",
  tooltip,
}) => {
  const statusStyles = {
    verified: "bg-emerald-50 text-emerald-800 border-emerald-200",
    estimate: "bg-neutral-100 text-neutral-800 border-neutral-200",
    warning: "bg-amber-50 text-amber-800 border-amber-200",
  }[status]

  const StatusIcon = {
    verified: Check,
    estimate: Info,
    warning: AlertCircle,
  }[status]

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs border font-medium",
        statusStyles
      )}
      title={tooltip}
    >
      <StatusIcon className="h-3 w-3 opacity-70 shrink-0" />
      <span className="text-neutral-500 font-normal">{label}:</span>
      <span className="font-semibold">{value}</span>
    </div>
  )
}

