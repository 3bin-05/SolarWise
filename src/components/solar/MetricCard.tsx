import React from "react"
import { LucideIcon } from "lucide-react"
import { Card } from "../ui/Card"
import { cn } from "../../lib/utils"

export interface MetricCardProps {
  label: string
  value: string | number
  unit?: string
  subtext?: string
  provenance?: "Calculated" | "Estimated" | "Verified" | "User Input"
  icon?: LucideIcon
  variant?: "default" | "success" | "warning" | "highlight"
  className?: string
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  unit,
  subtext,
  provenance = "Calculated",
  icon: Icon,
  variant = "default",
  className,
}) => {
  const variantStyles = {
    default: "bg-white border-neutral-200/90 shadow-2xs",
    success: "bg-orange-50/40 border-orange-200",
    warning: "bg-amber-50/40 border-amber-200",
    highlight: "bg-gradient-to-br from-[#FE5A01] to-[#e04f00] text-white border-transparent shadow-sm",
  }[variant]

  const isHighlight = variant === "highlight"

  return (
    <Card className={cn("p-5 border transition-all", variantStyles, className)}>
      <div className="flex items-start justify-between mb-2">
        <span
          className={cn(
            "text-xs font-semibold uppercase tracking-wider",
            isHighlight ? "text-orange-100" : "text-neutral-500"
          )}
        >
          {label}
        </span>
        {Icon && (
          <div
            className={cn(
              "p-1.5 rounded-lg",
              isHighlight ? "bg-white/20 text-white" : "bg-neutral-100 text-neutral-600"
            )}
          >
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-1.5 mb-1.5">
        <span
          className={cn(
            "text-2xl sm:text-3xl font-extrabold tracking-tight",
            isHighlight ? "text-white" : "text-neutral-950"
          )}
        >
          {value}
        </span>
        {unit && (
          <span
            className={cn(
              "text-sm font-semibold",
              isHighlight ? "text-orange-100" : "text-neutral-600"
            )}
          >
            {unit}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between text-xs mt-2 pt-2 border-t border-black/5">
        <span className={cn(isHighlight ? "text-orange-100" : "text-neutral-500")}>
          {subtext}
        </span>
        <span
          className={cn(
            "text-[10px] font-mono px-1.5 py-0.5 rounded",
            isHighlight
              ? "bg-orange-700 text-orange-100"
              : "bg-neutral-100 text-neutral-600"
          )}
        >
          {provenance}
        </span>
      </div>
    </Card>
  )
}

