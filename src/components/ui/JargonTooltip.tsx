import React, { useState, useRef, useEffect } from "react"
import { HelpCircle } from "lucide-react"

export interface JargonTooltipProps {
  term: string
  definition: string
  children?: React.ReactNode
}

/**
 * Inline accessible glossary helper for technical solar & energy jargon.
 * Accessible via tap on mobile or hover/focus on desktop.
 */
export const JargonTooltip: React.FC<JargonTooltipProps> = ({ term, definition, children }) => {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!isOpen) return

    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleOutsideClick)
    document.addEventListener("touchstart", handleOutsideClick)
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick)
      document.removeEventListener("touchstart", handleOutsideClick)
    }
  }, [isOpen])

  return (
    <span ref={containerRef} className="relative inline-flex items-center gap-1 group">
      <span className="border-b border-dotted border-neutral-400 group-hover:border-[#FE5A01] transition-colors">
        {children || term}
      </span>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setIsOpen((prev) => !prev)
        }}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        aria-label={`Definition of ${term}`}
        aria-expanded={isOpen}
        className="text-neutral-400 hover:text-[#FE5A01] p-0.5 rounded cursor-pointer transition-colors"
      >
        <HelpCircle className="w-3.5 h-3.5" />
      </button>

      {isOpen && (
        <span
          role="tooltip"
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-neutral-900 text-white text-xs rounded-xl shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150 leading-relaxed font-normal normal-case text-left border border-neutral-700"
        >
          <strong className="block text-orange-400 font-bold mb-1">{term}</strong>
          <span className="text-neutral-200">{definition}</span>
          <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-neutral-900" />
        </span>
      )}
    </span>
  )
}

