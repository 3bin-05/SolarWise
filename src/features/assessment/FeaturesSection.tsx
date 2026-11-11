import React from "react"
import house2Avif1000 from "../../assets/house2-1000.avif"
import house2Avif650 from "../../assets/house2-650.avif"
import house2Avif400 from "../../assets/house2-400.avif"
import house2Webp1000 from "../../assets/house2-1000.webp"
import house2Webp650 from "../../assets/house2-650.webp"
import house2Webp400 from "../../assets/house2-400.webp"

export interface FeaturesSectionProps {
  onStart: () => void
  onSeeHowItWorks?: () => void
  onOpenDecarbonizationModal?: (tab: "guides" | "air-quality" | "calculator" | "reduce-emissions") => void
}

export const FeaturesSection: React.FC<FeaturesSectionProps> = ({
  onStart,
  onSeeHowItWorks,
  onOpenDecarbonizationModal,
}) => {
  const handleSeeHowItWorks = () => {
    if (onSeeHowItWorks) {
      onSeeHowItWorks()
    } else {
      const el = document.getElementById("how-it-works")
      if (el) {
        const headerOffset = 80
        const elementPosition = el.getBoundingClientRect().top + window.scrollY
        window.scrollTo({
          top: Math.max(0, elementPosition - headerOffset),
          behavior: "smooth",
        })
      }
    }
  }

  return (
    <section id="features" className="relative w-full min-h-screen flex flex-col justify-center py-12 lg:py-16 overflow-hidden scroll-mt-20">
      <div className="w-full max-w-[1536px] mx-auto px-6 sm:px-10 lg:px-16 relative flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-center">
          {/* Left Content Column */}
          <div className="lg:col-span-5 xl:col-span-5 z-20 flex flex-col items-start">
            {/* Badge: Clean Energy & Decarbonization */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-neutral-300 bg-white/90 text-xs sm:text-sm font-semibold text-neutral-900 mb-5 shadow-2xs backdrop-blur-xs">
              <svg
                className="w-4 h-4 text-[#FE5A01] fill-[#FE5A01] shrink-0"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
                <path d="M2 21c0-3 1.85-5.36 5.08-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span>Clean Energy & Decarbonization</span>
            </div>

            {/* Main Headline */}
            <h2 className="text-3xl xs:text-4xl sm:text-5xl lg:text-[46px] xl:text-[52px] font-extrabold text-neutral-950 tracking-tight leading-[1.14] mb-4">
              Decarbonize Your Home, <br />
              <span className="text-[#FE5A01]">Confidently</span>
            </h2>

            {/* Description Subtext */}
            <p className="text-sm sm:text-base text-neutral-600 max-w-[460px] leading-relaxed mb-7">
              Plan, evaluate, and transition to renewable energy with all the insights you need—from solar physics to emission reduction and grid metrics.
            </p>

            {/* 3 Feature Rows: Renewables, Emission Tracking, Grid Metrics */}
            <div className="space-y-5 sm:space-y-6 mb-8 w-full max-w-lg">
              {/* Feature 1: Renewables & Solar Potential */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl border border-neutral-200/90 bg-white shadow-2xs flex items-center justify-center shrink-0">
                  <svg
                    className="w-6 h-6 text-[#FE5A01]"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-neutral-900 text-sm sm:text-base mb-0.5">
                    Renewables & Solar Potential
                  </h3>
                  <p className="text-xs sm:text-[13px] text-neutral-500 leading-snug max-w-[360px]">
                    Calculate optimal rooftop panel capacity, ALMM compliance, and clean energy generation.
                  </p>
                </div>
              </div>

              {/* Feature 2: Emission Tracking & Carbon Offsets */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl border border-neutral-200/90 bg-white shadow-2xs flex items-center justify-center shrink-0">
                  <svg
                    className="w-6 h-6 text-[#FE5A01]"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
                    <path d="M2 21c0-3 1.85-5.36 5.08-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-neutral-900 text-sm sm:text-base mb-0.5">
                    Emission Tracking & Carbon Offsets
                  </h3>
                  <p className="text-xs sm:text-[13px] text-neutral-500 leading-snug max-w-[360px]">
                    Track lifetime CO₂ avoidance, mature trees equivalent, and coal combustion eliminated via India CEA metrics.
                  </p>
                </div>
              </div>

              {/* Feature 3: Grid Metrics & Returns */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl border border-neutral-200/90 bg-white shadow-2xs flex items-center justify-center shrink-0">
                  <svg
                    className="w-6 h-6 text-blue-600"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="20" x2="18" y2="10" />
                    <line x1="12" y1="20" x2="12" y2="4" />
                    <line x1="6" y1="20" x2="6" y2="14" />
                    <path d="M4 8l6-4 4 6 6-4" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-neutral-900 text-sm sm:text-base mb-0.5">
                    Grid Metrics & Financial Returns
                  </h3>
                  <p className="text-xs sm:text-[13px] text-neutral-500 leading-snug max-w-[360px]">
                    Model DISCOM peak relief, net metering feed-in rates, PM Surya Ghar subsidy (up to ₹78,000), and 25-yr ROI.
                  </p>
                </div>
              </div>
            </div>

            {/* Interactive Decarbonization Suite Quick Actions */}
            <div className="mb-8 w-full max-w-lg p-3 rounded-xl bg-orange-50/70 border border-orange-200/80 shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#c2410c] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#FE5A01] animate-pulse" />
                  Explore Decarbonization Tools
                </span>
                <span className="text-[11px] text-neutral-500 font-semibold">Interactive Suite</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => onOpenDecarbonizationModal?.("calculator")}
                  className="px-2.5 py-1.5 rounded-lg bg-white border border-neutral-200 hover:border-[#FE5A01] text-neutral-800 font-medium flex items-center justify-between transition-colors text-left cursor-pointer shadow-2xs hover:shadow-xs"
                >
                  <span className="truncate">Carbon Calculator</span>
                  <span className="text-[#FE5A01] font-bold">→</span>
                </button>
                <button
                  type="button"
                  onClick={() => onOpenDecarbonizationModal?.("air-quality")}
                  className="px-2.5 py-1.5 rounded-lg bg-white border border-neutral-200 hover:border-[#FE5A01] text-neutral-800 font-medium flex items-center justify-between transition-colors text-left cursor-pointer shadow-2xs hover:shadow-xs"
                >
                  <span className="truncate">Air-Quality Maps</span>
                  <span className="text-[#FE5A01] font-bold">→</span>
                </button>
                <button
                  type="button"
                  onClick={() => onOpenDecarbonizationModal?.("guides")}
                  className="px-2.5 py-1.5 rounded-lg bg-white border border-neutral-200 hover:border-[#FE5A01] text-neutral-800 font-medium flex items-center justify-between transition-colors text-left cursor-pointer shadow-2xs hover:shadow-xs"
                >
                  <span className="truncate">Renewables Guides</span>
                  <span className="text-[#FE5A01] font-bold">→</span>
                </button>
                <button
                  type="button"
                  onClick={() => onOpenDecarbonizationModal?.("reduce-emissions")}
                  className="px-2.5 py-1.5 rounded-lg bg-white border border-neutral-200 hover:border-[#FE5A01] text-neutral-800 font-medium flex items-center justify-between transition-colors text-left cursor-pointer shadow-2xs hover:shadow-xs"
                >
                  <span className="truncate">Ways to Reduce</span>
                  <span className="text-[#FE5A01] font-bold">→</span>
                </button>
              </div>
            </div>

            {/* Bottom Action Buttons */}
            <div className="flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={onStart}
                className="bg-[#FE5A01] hover:bg-[#e04f00] active:scale-[0.99] text-white font-semibold text-base px-7 py-3 rounded-lg flex items-center gap-2 shadow-xs transition-all cursor-pointer"
              >
                Calculate Solar Feasibility <span className="text-lg leading-none">→</span>
              </button>

              <button
                type="button"
                onClick={handleSeeHowItWorks}
                className="bg-white hover:bg-neutral-50 active:scale-[0.99] border border-neutral-900 text-neutral-900 font-semibold text-base px-6 py-3 rounded-lg flex items-center gap-2.5 transition-all cursor-pointer"
              >
                <span className="w-5 h-5 rounded-full border border-neutral-900 flex items-center justify-center shrink-0">
                  <svg className="w-2.5 h-2.5 translate-x-px text-neutral-900 fill-neutral-900" viewBox="0 0 24 24">
                    <polygon points="6 4 19 12 6 20" />
                  </svg>
                </span>
                See How It Works
              </button>
            </div>
          </div>

          {/* Right Column: house2 (Clean Energy & Solar Potential) */}
          <div className="lg:col-span-7 xl:col-span-7 relative flex items-center justify-center lg:justify-end mt-8 lg:mt-0">
            <div className="relative w-full max-w-[680px] sm:max-w-[740px] lg:max-w-[820px] xl:max-w-[900px] flex items-center justify-center">
              <picture className="w-full h-auto">
                <source
                  type="image/avif"
                  srcSet={`${house2Avif400} 400w, ${house2Avif650} 650w, ${house2Avif1000} 1000w`}
                  sizes="(min-width: 1280px) 850px, (min-width: 640px) 740px, 92vw"
                />
                <source
                  type="image/webp"
                  srcSet={`${house2Webp400} 400w, ${house2Webp650} 650w, ${house2Webp1000} 1000w`}
                  sizes="(min-width: 1280px) 850px, (min-width: 640px) 740px, 92vw"
                />
                <img
                  src={house2Webp1000}
                  alt="Solar powered house with clean energy features"
                  width={1000}
                  height={667}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-auto object-contain select-none pointer-events-none drop-shadow-md scale-105 sm:scale-110 lg:scale-115 xl:scale-120 transition-transform duration-300"
                />
              </picture>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

