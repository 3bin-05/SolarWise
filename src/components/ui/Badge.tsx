import React from "react"
import { cn } from "../../lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "destructive" | "outline" | "neutral"
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = "default",
  children,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center px-2.5 py-0.5 rounded-[4px] text-xs font-semibold tracking-wide transition-colors"

  const variantStyles = {
    default: "bg-orange-50 text-[#FE5A01] border border-orange-200/80",
    success: "bg-orange-500/10 text-orange-700 border border-orange-500/20",
    warning: "bg-amber-500/10 text-amber-700 border border-amber-500/20",
    destructive: "bg-rose-500/10 text-rose-700 border border-rose-500/20",
    outline: "border border-neutral-300 text-neutral-700 bg-white",
    neutral: "bg-neutral-100 text-neutral-700 border border-neutral-200",
  }

  return (
    <span className={cn(baseStyles, variantStyles[variant], className)} {...props}>
      {children}
    </span>
  )
}

