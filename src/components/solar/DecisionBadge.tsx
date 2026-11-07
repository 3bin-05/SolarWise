import React from "react"
import { CheckCircle2, AlertTriangle, XCircle, HelpCircle, Sparkles } from "lucide-react"
import { DecisionOutcome } from "../../types/assessment"
import { cn } from "../../lib/utils"

export interface DecisionBadgeProps {
  outcome: DecisionOutcome
  className?: string
  size?: "sm" | "md" | "lg"
}

export const DecisionBadge: React.FC<DecisionBadgeProps> = ({
  outcome,
  className,
  size = "md",
}) => {
  const config = {
    "Strongly attractive": {
      bg: "bg-orange-600 text-white border-orange-700",
      icon: Sparkles,
      label: "Strongly Attractive",
    },
    Attractive: {
      bg: "bg-orange-500/15 text-orange-800 border-orange-500/30",
      icon: CheckCircle2,
      label: "Attractive",
    },
    Borderline: {
      bg: "bg-amber-500/15 text-amber-800 border-amber-500/30",
      icon: AlertTriangle,
      label: "Borderline Feasibility",
    },
    "Not recommended": {
      bg: "bg-rose-500/15 text-rose-800 border-rose-500/30",
      icon: XCircle,
      label: "Not Recommended",
    },
    "Financially infeasible": {
      bg: "bg-rose-600 text-white border-rose-700",
      icon: XCircle,
      label: "Financially Infeasible",
    },
    "Insufficient data": {
      bg: "bg-neutral-100 text-neutral-800 border-neutral-300",
      icon: HelpCircle,
      label: "Insufficient Data",
    },
  }[outcome]

  const Icon = config.icon

  const sizeClasses = {
    sm: "px-2.5 py-0.5 text-xs gap-1.5",
    md: "px-3.5 py-1.5 text-sm gap-2",
    lg: "px-4 py-2 text-base font-bold gap-2.5",
  }[size]

  return (
    <span
      className={cn(
        "inline-flex items-center font-semibold rounded-full border shadow-xs transition-all",
        config.bg,
        sizeClasses,
        className
      )}
    >
      <Icon className={size === "lg" ? "h-5 w-5" : "h-4 w-4"} />
      <span>{config.label}</span>
    </span>
  )
}

