import React from "react"
import { cn } from "../../lib/utils"

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number // 0 to 100
}

export const Progress: React.FC<ProgressProps> = ({
  value,
  className,
  ...props
}) => {
  const clampedValue = Math.min(100, Math.max(0, value))

  return (
    <div
      className={cn("w-full bg-neutral-200 rounded-full h-2 overflow-hidden", className)}
      {...props}
    >
      <div
        className="bg-emerald-600 h-full rounded-full transition-all duration-300 ease-out"
        style={{ width: `${clampedValue}%` }}
      />
    </div>
  )
}

