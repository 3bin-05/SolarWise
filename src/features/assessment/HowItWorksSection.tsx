import React from "react"
import step1Avif440 from "../../assets/step1-440.avif"
import step1Avif240 from "../../assets/step1-240.avif"
import step1Webp440 from "../../assets/step1-440.webp"
import step1Webp240 from "../../assets/step1-240.webp"

import step2Avif440 from "../../assets/step2-440.avif"
import step2Avif240 from "../../assets/step2-240.avif"
import step2Webp440 from "../../assets/step2-440.webp"
import step2Webp240 from "../../assets/step2-240.webp"

import step3Avif440 from "../../assets/step3-440.avif"
import step3Avif240 from "../../assets/step3-240.avif"
import step3Webp440 from "../../assets/step3-440.webp"
import step3Webp240 from "../../assets/step3-240.webp"

import step4Avif440 from "../../assets/step4-440.avif"
import step4Avif240 from "../../assets/step4-240.avif"
import step4Webp440 from "../../assets/step4-440.webp"
import step4Webp240 from "../../assets/step4-240.webp"

export const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      number: "01",
      title: "Upload Your Bill",
      description: "Upload your electricity bill or enter your meter readings (monthly units, etc.).",
      avifSrcSet: `${step1Avif240} 240w, ${step1Avif440} 440w`,
      webpSrcSet: `${step1Webp240} 240w, ${step1Webp440} 440w`,
      fallbackSrc: step1Webp440,
      offsetClass: "lg:translate-y-1",
    },
    {
      number: "02",
      title: "Tell Us Your Usage",
      description: "Let us know your usage pattern — do you use more electricity during the day or at night?",
      avifSrcSet: `${step2Avif240} 240w, ${step2Avif440} 440w`,
      webpSrcSet: `${step2Webp240} 240w, ${step2Webp440} 440w`,
      fallbackSrc: step2Webp440,
      offsetClass: "lg:translate-y-0",
    },
    {
      number: "03",
      title: "We Calculate & Suggest",
      description: "Our app analyzes your usage and recommends the right solar system — panel capacity, inverter, battery (if needed), and clean energy generation.",
      avifSrcSet: `${step3Avif240} 240w, ${step3Avif440} 440w`,
      webpSrcSet: `${step3Webp240} 240w, ${step3Webp440} 440w`,
      fallbackSrc: step3Webp440,
      offsetClass: "lg:-translate-y-1",
    },
    {
      number: "04",
      title: "See Returns & Carbon Offsets",
      description: "Get a complete summary with installation cost, expected savings, payback period, and lifetime CO₂ emissions eliminated.",
      avifSrcSet: `${step4Avif240} 240w, ${step4Avif440} 440w`,
      webpSrcSet: `${step4Webp240} 240w, ${step4Webp440} 440w`,
      fallbackSrc: step4Webp440,
      offsetClass: "lg:-translate-y-2",
    },
  ]

  return (
    <section id="how-it-works" className="relative w-full flex flex-col justify-center py-10 lg:py-12 overflow-hidden border-t border-neutral-200/50 scroll-mt-20">
      <div className="w-full max-w-[1536px] mx-auto px-6 sm:px-10 lg:px-16 relative flex flex-col justify-center">
        {/* Top Header */}
        <div className="flex flex-col items-start mb-4 sm:mb-6">
          {/* Badge: How It Works? */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-[4px] border border-neutral-300 bg-white/95 text-xs sm:text-sm font-semibold text-neutral-900 mb-4 shadow-2xs backdrop-blur-xs">
            {/* Brand Accent Gear Icon */}
            <svg
              className="w-4 h-4 text-[#FE5A01] fill-[#FE5A01]/20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <span>How It Works?</span>
          </div>

          {/* Headline */}
          <h2 className="text-4xl sm:text-5xl lg:text-[46px] xl:text-[52px] font-extrabold text-neutral-950 tracking-tight leading-[1.12] mb-3">
            Get Your Solar Plan <br />
            in <span className="text-[#FE5A01]">4 Simple Steps</span>
          </h2>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-neutral-600 max-w-xl leading-relaxed">
            From your electricity bill to a complete solar recommendation — <br className="hidden sm:inline" />
            Solarwise makes it quick, simple, and accurate.
          </p>
        </div>

        {/* 4 Steps Timeline Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 relative">
          {steps.map((step, index) => (
            <div key={step.number} className="relative flex flex-col items-start text-left group">
              {/* Step 3D Illustration Container with step-timeline vertical alignment */}
              <div className={`w-full flex items-end justify-center mb-4 h-36 sm:h-40 lg:h-44 relative transition-transform duration-300 ${step.offsetClass}`}>
                <picture className="max-h-full flex items-end justify-center">
                  <source
                    type="image/avif"
                    srcSet={step.avifSrcSet}
                    sizes="(min-width: 1280px) 220px, (min-width: 1024px) 205px, (min-width: 640px) 190px, 170px"
                  />
                  <source
                    type="image/webp"
                    srcSet={step.webpSrcSet}
                    sizes="(min-width: 1280px) 220px, (min-width: 1024px) 205px, (min-width: 640px) 190px, 170px"
                  />
                  <img
                    src={step.fallbackSrc}
                    alt={step.title}
                    width={220}
                    height={180}
                    loading="lazy"
                    decoding="async"
                    className="max-h-full max-w-[170px] sm:max-w-[190px] lg:max-w-[205px] xl:max-w-[220px] object-contain select-none pointer-events-none drop-shadow-md transition-transform duration-300 group-hover:scale-105"
                  />
                </picture>

                {/* Orange Curved Dashed Arrow between steps (desktop lg screens) */}
                {index === 0 && (
                  <div className="hidden lg:block absolute bottom-5 -right-10 xl:-right-12 w-20 xl:w-24 h-12 pointer-events-none z-20">
                    <svg className="w-full h-full text-[#FE5A01]" viewBox="0 0 90 45" fill="none">
                      <path
                        d="M 4 35 C 28 42, 60 18, 80 18"
                        stroke="#FE5A01"
                        strokeWidth="1.8"
                        strokeDasharray="3.5 3.5"
                      />
                      <polygon points="85 18, 77 14, 78 22" fill="#FE5A01" />
                    </svg>
                  </div>
                )}

                {index === 1 && (
                  <div className="hidden lg:block absolute bottom-5 -right-10 xl:-right-12 w-20 xl:w-24 h-12 pointer-events-none z-20">
                    <svg className="w-full h-full text-[#FE5A01]" viewBox="0 0 90 45" fill="none">
                      <path
                        d="M 4 35 C 28 42, 60 18, 80 18"
                        stroke="#FE5A01"
                        strokeWidth="1.8"
                        strokeDasharray="3.5 3.5"
                      />
                      <polygon points="85 18, 77 14, 78 22" fill="#FE5A01" />
                    </svg>
                  </div>
                )}

                {index === 2 && (
                  <div className="hidden lg:block absolute bottom-6 -right-10 xl:-right-12 w-20 xl:w-24 h-12 pointer-events-none z-20">
                    <svg className="w-full h-full text-[#FE5A01]" viewBox="0 0 90 45" fill="none">
                      <path
                        d="M 4 36 C 26 42, 58 14, 78 12"
                        stroke="#FE5A01"
                        strokeWidth="1.8"
                        strokeDasharray="3.5 3.5"
                      />
                      <polygon points="83 12, 75 8, 76 16" fill="#FE5A01" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Number Badge */}
              <div className="inline-block px-2.5 py-0.5 rounded-[4px] bg-orange-50 border border-orange-200/90 text-[#FE5A01] font-bold text-xs mb-2.5 shadow-2xs">
                {step.number}
              </div>

              {/* Step Title */}
              <h3 className="font-extrabold text-neutral-900 text-base sm:text-lg mb-1.5 tracking-tight">
                {step.title}
              </h3>

              {/* Step Description */}
              <p className="text-xs sm:text-[13px] text-neutral-500 leading-relaxed max-w-[260px]">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

