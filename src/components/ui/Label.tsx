import React from "react"
import { cn } from "../../lib/utils"

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean
}

export const Label: React.FC<LabelProps> = ({
  className,
  required,
  children,
  ...props
}) => (
  <label
    className={cn(
      "block text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-1.5",
      className
    )}
    {...props}
  >
    {children}
    {required && <span className="text-rose-500 ml-1">*</span>}
  </label>
)

