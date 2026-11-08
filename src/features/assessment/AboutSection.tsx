import React, { useState } from "react"
import house3Avif1000 from "../../assets/house3-1000.avif"
import house3Avif650 from "../../assets/house3-650.avif"
import house3Avif400 from "../../assets/house3-400.avif"
import house3Webp1000 from "../../assets/house3-1000.webp"
import house3Webp650 from "../../assets/house3-650.webp"
import house3Webp400 from "../../assets/house3-400.webp"
import { DecarbonizationSuiteModal, DecarbonizationTab } from "./DecarbonizationSuiteModal"
import { BookOpen, Wind, Calculator, Leaf, ArrowRight } from "lucide-react"

export interface AboutSectionProps {
  onStart?: () => void
  onOpenDecarbonizationModal?: (tab: DecarbonizationTab) => void
}

export const AboutSection: React.FC<AboutSectionProps> = ({
  onOpenDecarbonizationModal,
}) => {
  const [internalTab, setInternalTab] = useState<DecarbonizationTab | null>(null)

  const handleOpen = (tab: DecarbonizationTab) => {
    if (onOpenDecarbonizationModal) {
      onOpenDecarbonizationModal(tab)
    } else {
      setInternalTab(tab)
    }
  }

  return (
    <section id="about" className="relative w-full min-h-[calc(100vh-5rem)] flex flex-col justify-center py-12 lg:py-16 overflow-hidden border-t border-neutral-200/50 scroll-mt-20">
      <div className="w-full max-w-[1536px] mx-auto px-6 sm:px-10 lg:px-16 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center">
          {/* Left Content Column */}
          <div className="lg:col-span-6 xl:col-span-5 z-20 flex flex-col items-start justify-center">
            {/* Badge: Clean Energy & Decarbonization */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md border border-neutral-300 bg-white/95 text-xs sm:text-sm font-semibold text-neutral-900 mb-5 shadow-2xs backdrop-blur-xs">
              <svg className="w-4 h-4 text-[#FE5A01] fill-[#FE5A01] shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
                <path d="M2 21c0-3 1.85-5.36 5.08-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span>Clean Energy & Decarbonization</span>
            </div>

            {/* Headline */}
            <h2 className="text-4xl sm:text-5xl lg:text-[44px] xl:text-[50px] font-extrabold text-neutral-950 tracking-tight leading-[1.12] mb-4">
              Clean Energy & <br />
              <span className="text-[#FE5A01]">Decarbonization</span>
            </h2>

            {/* Description */}
            <p className="text-sm sm:text-base text-neutral-600 max-w-lg leading-relaxed mb-6">
              Solarwise empowers Indian households to transition to clean energy, monitor localized carbon emissions, and optimize grid metrics for sustainable living.
            </p>

            {/* 3 Pillar Features Row: Renewables, Emission Tracking, Grid Metrics */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-7 pt-1 w-full max-w-lg">
              {/* Pillar 1: Renewables */}
              <div className="flex flex-col gap-1.5 p-3 rounded-lg bg-white border border-neutral-200/80 shadow-2xs">
                <div className="w-7 h-7 rounded-md bg-orange-50 border border-orange-200/60 flex items-center justify-center text-[#FE5A01]">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                </div>
                <div className="text-xs sm:text-sm font-extrabold text-neutral-900 leading-tight">
                  Renewables
                </div>
                <p className="text-[11px] text-neutral-500 leading-tight">
                  Clean rooftop solar adoption
                </p>
              </div>

              {/* Pillar 2: Emission Tracking */}
              <div className="flex flex-col gap-1.5 p-3 rounded-lg bg-white border border-neutral-200/80 shadow-2xs">
                <div className="w-7 h-7 rounded-md bg-orange-50 border border-orange-200/60 flex items-center justify-center text-[#FE5A01]">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
                    <path d="M2 21c0-3 1.85-5.36 5.08-6" />
                  </svg>
                </div>
                <div className="text-xs sm:text-sm font-extrabold text-neutral-900 leading-tight">
                  Emission Tracking
                </div>
                <p className="text-[11px] text-neutral-500 leading-tight">
                  CEA-verified CO₂ reduction
                </p>
              </div>

              {/* Pillar 3: Grid Metrics */}
              <div className="flex flex-col gap-1.5 p-3 rounded-lg bg-white border border-neutral-200/80 shadow-2xs">
                <div className="w-7 h-7 rounded-md bg-blue-50 border border-blue-200/60 flex items-center justify-center text-blue-600">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                </div>
                <div className="text-xs sm:text-sm font-extrabold text-neutral-900 leading-tight">
                  Grid Metrics
                </div>
                <p className="text-[11px] text-neutral-500 leading-tight">
                  Peak relief & net metering
                </p>
              </div>
            </div>

            {/* In-column Banner: Explore a Cleaner, Greener Future with 4 Hackathon Ideas */}
            <div className="w-full pt-5 border-t border-neutral-200/70">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base sm:text-lg font-extrabold text-neutral-950 tracking-tight">
                    Explore Decarbonization Tools
                  </h3>
                  <span className="text-xs font-semibold text-[#FE5A01]">
                    Interactive Suite
                  </span>
                </div>

                {/* 4 Interactive Hackathon Topic Cards */}
                <div className="grid grid-cols-2 gap-2.5 sm:gap-3 w-full">
                  {/* Tool 1: Renewable Energy Guides */}
                  <button
                    type="button"
                    onClick={() => handleOpen("guides")}
                    className="p-2.5 sm:p-3 rounded-lg bg-white hover:bg-neutral-50 border border-neutral-200 text-left transition-all hover:border-[#FE5A01]/50 hover:shadow-xs group cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-900 group-hover:text-[#FE5A01] transition-colors">
                        <BookOpen className="w-3.5 h-3.5 text-[#FE5A01]" />
                        <span>Renewables Guides</span>
                      </div>
                      <ArrowRight className="w-3 h-3 text-neutral-400 group-hover:text-[#FE5A01] transition-colors" />
                    </div>
                    <p className="text-[11px] text-neutral-500 leading-tight">
                      CFA subsidies, ALMM rules & solar guides
                    </p>
                  </button>

                  {/* Tool 2: Local Air-Quality Maps */}
                  <button
                    type="button"
                    onClick={() => handleOpen("air-quality")}
                    className="p-2.5 sm:p-3 rounded-lg bg-white hover:bg-neutral-50 border border-neutral-200 text-left transition-all hover:border-[#FE5A01]/50 hover:shadow-xs group cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-900 group-hover:text-[#FE5A01] transition-colors">
                        <Wind className="w-3.5 h-3.5 text-[#FE5A01]" />
                        <span>Air-Quality Maps</span>
                      </div>
                      <ArrowRight className="w-3 h-3 text-neutral-400 group-hover:text-[#FE5A01] transition-colors" />
                    </div>
                    <p className="text-[11px] text-neutral-500 leading-tight">
                      Live AQI, PM2.5 & grid carbon intensity
                    </p>
                  </button>

                  {/* Tool 3: Carbon Calculator */}
                  <button
                    type="button"
                    onClick={() => handleOpen("calculator")}
                    className="p-2.5 sm:p-3 rounded-lg bg-white hover:bg-neutral-50 border border-neutral-200 text-left transition-all hover:border-amber-500/50 hover:shadow-xs group cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-900 group-hover:text-amber-600 transition-colors">
                        <Calculator className="w-3.5 h-3.5 text-amber-600" />
                        <span>Carbon Calculator</span>
                      </div>
                      <ArrowRight className="w-3 h-3 text-neutral-400 group-hover:text-amber-600 transition-colors" />
                    </div>
                    <p className="text-[11px] text-neutral-500 leading-tight">
                      Calculate CO₂ avoided & trees equivalent
                    </p>
                  </button>

                  {/* Tool 4: Ways to Reduce Emissions */}
                  <button
                    type="button"
                    onClick={() => handleOpen("reduce-emissions")}
                    className="p-2.5 sm:p-3 rounded-lg bg-white hover:bg-neutral-50 border border-neutral-200 text-left transition-all hover:border-orange-500/50 hover:shadow-xs group cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-900 group-hover:text-orange-600 transition-colors">
                        <Leaf className="w-3.5 h-3.5 text-orange-600" />
                        <span>Reduce Emissions</span>
                      </div>
                      <ArrowRight className="w-3 h-3 text-neutral-400 group-hover:text-orange-600 transition-colors" />
                    </div>
                    <p className="text-[11px] text-neutral-500 leading-tight">
                      5-step household decarbonization roadmap
                    </p>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Visual: house3 (Clean Energy & Decarbonization) */}
          <div className="lg:col-span-6 xl:col-span-7 flex justify-center lg:justify-end items-center relative mt-8 lg:mt-0">
            <div className="relative w-full max-w-[700px] sm:max-w-[780px] lg:max-w-[880px] xl:max-w-[980px] 2xl:max-w-[1080px] flex items-center justify-center lg:justify-end">
              <picture className="w-full h-auto">
                <source
                  type="image/avif"
                  srcSet={`${house3Avif400} 400w, ${house3Avif650} 650w, ${house3Avif1000} 1000w`}
                  sizes="(min-width: 1280px) 880px, (min-width: 640px) 780px, 92vw"
                />
                <source
                  type="image/webp"
                  srcSet={`${house3Webp400} 400w, ${house3Webp650} 650w, ${house3Webp1000} 1000w`}
                  sizes="(min-width: 1280px) 880px, (min-width: 640px) 780px, 92vw"
                />
                <img
                  src={house3Webp1000}
                  alt="Clean Energy & Decarbonization with Solarwise"
                  width={1000}
                  height={568}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-auto object-contain select-none pointer-events-none drop-shadow-xl scale-105 sm:scale-110 lg:scale-115 xl:scale-120 transition-transform duration-300 origin-center lg:origin-right"
                />
              </picture>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Decarbonization Suite Modal (standalone fallback) */}
      {!onOpenDecarbonizationModal && (
        <DecarbonizationSuiteModal
          isOpen={Boolean(internalTab)}
          onClose={() => setInternalTab(null)}
          initialTab={internalTab || "calculator"}
        />
      )}
    </section>
  )
}
