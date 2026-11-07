import React, { useState } from "react"
import { RotateCcw, Menu, X } from "lucide-react"
import { Button } from "../ui/Button"

export const SolarSunBurst: React.FC<{ className?: string }> = ({ className = "w-7 h-7" }) => (
  <svg
    viewBox="0 0 28 28"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    {/* Inner ring */}
    <circle cx="14" cy="14" r="3.2" stroke="#FE5A01" strokeWidth="2.2" fill="none" />
    {/* Cardinal rays */}
    <line x1="14" y1="2" x2="14" y2="6.8" stroke="#FE5A01" strokeWidth="2.2" strokeLinecap="round" />
    <line x1="14" y1="21.2" x2="14" y2="26" stroke="#FE5A01" strokeWidth="2.2" strokeLinecap="round" />
    <line x1="2" y1="14" x2="6.8" y2="14" stroke="#FE5A01" strokeWidth="2.2" strokeLinecap="round" />
    <line x1="21.2" y1="14" x2="26" y2="14" stroke="#FE5A01" strokeWidth="2.2" strokeLinecap="round" />
    {/* Diagonal rays */}
    <line x1="5.5" y1="5.5" x2="8.9" y2="8.9" stroke="#FE5A01" strokeWidth="2.2" strokeLinecap="round" />
    <line x1="19.1" y1="19.1" x2="22.5" y2="22.5" stroke="#FE5A01" strokeWidth="2.2" strokeLinecap="round" />
    <line x1="5.5" y1="22.5" x2="8.9" y2="19.1" stroke="#FE5A01" strokeWidth="2.2" strokeLinecap="round" />
    <line x1="19.1" y1="8.9" x2="22.5" y2="5.5" stroke="#FE5A01" strokeWidth="2.2" strokeLinecap="round" />
  </svg>
)

export interface HeaderProps {
  currentStep: number
  totalSteps: number
  onReset: () => void
  onScenarioToggle?: () => void
  scenarioName?: string
  onStart?: () => void
  activeSection?: "home" | "features" | "how-it-works" | "about" | "contact"
  onNavigate?: (section: "home" | "features" | "how-it-works" | "about" | "contact") => void
}

export const Header: React.FC<HeaderProps> = ({
  currentStep,
  totalSteps,
  onReset,
  onScenarioToggle,
  scenarioName = "Standard Household",
  onStart,
  activeSection = "home",
  onNavigate,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const scrollToTarget = (section: "home" | "features" | "how-it-works" | "about" | "contact") => {
    if (section === "home") {
      window.scrollTo({ top: 0, behavior: "smooth" })
      return
    }
    const el = document.getElementById(section)
    if (el) {
      const headerOffset = 80
      const elementPosition = el.getBoundingClientRect().top + window.scrollY
      window.scrollTo({
        top: Math.max(0, elementPosition - headerOffset),
        behavior: "smooth",
      })
    }
  }

  const handleNavClick = (section: "home" | "features" | "how-it-works" | "about" | "contact") => {
    setMobileMenuOpen(false)
    if (currentStep !== 0) {
      onReset()
      setTimeout(() => {
        if (onNavigate) {
          onNavigate(section)
        } else {
          scrollToTarget(section)
        }
      }, 60)
    } else {
      if (onNavigate) {
        onNavigate(section)
      } else {
        scrollToTarget(section)
      }
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-[#fafbfc]/80 backdrop-blur-md border-b border-neutral-200/50 w-full transition-all">
      <div className="max-w-[1536px] mx-auto px-6 sm:px-10 lg:px-16 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <div
          className="flex items-center gap-2.5 cursor-pointer select-none"
          onClick={onReset}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && onReset()}
        >
          <SolarSunBurst className="w-8 h-8 shrink-0" />
          <span className="font-extrabold text-2xl tracking-tight text-neutral-900">
            Solar<span className="text-[#FE5A01]">wise</span>
          </span>
          <span className="sr-only">SolarWise</span>
        </div>

        {/* Center Navigation Links - Visible on all pages */}
        <nav className="hidden md:flex items-center gap-9">
          <a
            href="#home"
            onClick={(e) => {
              e.preventDefault()
              handleNavClick("home")
            }}
            className={`flex items-center font-bold text-sm tracking-wide transition-colors ${
              currentStep === 0 && activeSection === "home"
                ? "text-[#FE5A01]"
                : "text-neutral-900 hover:text-neutral-700"
            }`}
          >
            {currentStep === 0 && activeSection === "home" ? (
              <>
                <span className="mr-1.5">[</span>
                <span>Home</span>
                <span className="ml-1.5">]</span>
              </>
            ) : (
              <span>Home</span>
            )}
          </a>
          <a
            href="#features"
            onClick={(e) => {
              e.preventDefault()
              handleNavClick("features")
            }}
            className={`flex items-center font-bold text-sm tracking-wide transition-colors ${
              currentStep === 0 && activeSection === "features"
                ? "text-[#FE5A01]"
                : "text-neutral-900 hover:text-neutral-700 font-semibold"
            }`}
          >
            {currentStep === 0 && activeSection === "features" ? (
              <>
                <span className="mr-1.5">[</span>
                <span>Features</span>
                <span className="ml-1.5">]</span>
              </>
            ) : (
              <span>Features</span>
            )}
          </a>
          <a
            href="#how-it-works"
            onClick={(e) => {
              e.preventDefault()
              handleNavClick("how-it-works")
            }}
            className={`flex items-center font-bold text-sm tracking-wide transition-colors ${
              currentStep === 0 && activeSection === "how-it-works"
                ? "text-[#FE5A01]"
                : "text-neutral-900 hover:text-neutral-700 font-semibold"
            }`}
          >
            {currentStep === 0 && activeSection === "how-it-works" ? (
              <>
                <span className="mr-1.5">[</span>
                <span>How It Works</span>
                <span className="ml-1.5">]</span>
              </>
            ) : (
              <span>How It Works</span>
            )}
          </a>
          <a
            href="#about"
            onClick={(e) => {
              e.preventDefault()
              handleNavClick("about")
            }}
            className={`flex items-center font-bold text-sm tracking-wide transition-colors ${
              currentStep === 0 && activeSection === "about"
                ? "text-[#FE5A01]"
                : "text-neutral-900 hover:text-neutral-700 font-semibold"
            }`}
          >
            {currentStep === 0 && activeSection === "about" ? (
              <>
                <span className="mr-1.5">[</span>
                <span>About</span>
                <span className="ml-1.5">]</span>
              </>
            ) : (
              <span>About</span>
            )}
          </a>
          <a
            href="#contact"
            onClick={(e) => {
              e.preventDefault()
              handleNavClick("contact")
            }}
            className={`flex items-center font-bold text-sm tracking-wide transition-colors ${
              currentStep === 0 && activeSection === "contact"
                ? "text-[#FE5A01]"
                : "text-neutral-900 hover:text-neutral-700 font-semibold"
            }`}
          >
            {currentStep === 0 && activeSection === "contact" ? (
              <>
                <span className="mr-1.5">[</span>
                <span>Contact</span>
                <span className="ml-1.5">]</span>
              </>
            ) : (
              <span>Contact</span>
            )}
          </a>
        </nav>

        {/* Right Action Buttons */}
        <div className="hidden sm:flex items-center gap-3.5">
          {currentStep > 0 ? (
            <>
              {onScenarioToggle && (
                <div className="hidden md:flex items-center gap-2 bg-neutral-100/90 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-neutral-200/80">
                  <span className="text-xs text-neutral-500">Scenario:</span>
                  <span className="text-xs font-semibold text-neutral-800">{scenarioName}</span>
                  <button
                    onClick={onScenarioToggle}
                    className="text-xs font-semibold text-[#FE5A01] hover:text-[#d44800] underline ml-1 cursor-pointer"
                  >
                    Switch
                  </button>
                </div>
              )}
              <div className="text-xs font-medium text-neutral-500 hidden lg:block">
                Step {currentStep} of {totalSteps}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={onReset}
                className="text-xs h-9 px-3.5 text-neutral-700 border-neutral-300 hover:bg-neutral-100"
                title="Start New Assessment"
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1" />
                <span>Reset</span>
              </Button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onStart || onReset}
                className="text-sm font-semibold text-white bg-[#FE5A01] hover:bg-[#e04f00] rounded-[4px] px-5 py-2 flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                Get Started <span className="text-base leading-none">→</span>
              </button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          className="md:hidden p-2 text-neutral-800 hover:text-neutral-950"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden px-6 pt-2 pb-6 bg-[#fafbfc]/95 backdrop-blur-md border-b border-neutral-200 space-y-3">
          <a
            href="#home"
            onClick={() => handleNavClick("home")}
            className="block font-semibold text-base text-[#FE5A01] py-1"
          >
            Home
          </a>
          <a
            href="#features"
            onClick={() => handleNavClick("features")}
            className="block font-medium text-base text-neutral-800 hover:text-neutral-950 py-1"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            onClick={() => handleNavClick("how-it-works")}
            className="block font-medium text-base text-neutral-800 hover:text-neutral-950 py-1"
          >
            How It Works
          </a>
          <a
            href="#about"
            onClick={() => handleNavClick("about")}
            className="block font-medium text-base text-neutral-800 hover:text-neutral-950 py-1"
          >
            About
          </a>
          <a
            href="#contact"
            onClick={() => handleNavClick("contact")}
            className="block font-medium text-base text-neutral-800 hover:text-neutral-950 py-1"
          >
            Contact
          </a>
          <div className="pt-2 flex flex-col gap-2">
            {currentStep > 0 ? (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false)
                  onReset()
                }}
                className="w-full text-center py-2.5 text-sm font-semibold text-neutral-900 border border-neutral-300 rounded-[4px] bg-white"
              >
                Start New Assessment (Reset)
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false)
                  if (onStart) onStart()
                  else onReset()
                }}
                className="w-full text-center py-2.5 text-sm font-semibold text-white bg-[#FE5A01] hover:bg-[#e04f00] rounded-[4px] shadow-xs"
              >
                Get Started →
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
