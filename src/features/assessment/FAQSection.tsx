import React, { useState } from "react"
import { ChevronDown, HelpCircle } from "lucide-react"

export const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const faqs = [
    {
      q: "How does the PM Surya Ghar: Muft Bijli Yojana subsidy work?",
      a: "Eligible residential consumers receive central financial assistance of up to ₹78,000 for installations up to 3 kWp. The subsidy is deposited directly into your linked bank account via Direct Benefit Transfer (DBT) within 30 days of the DISCOM commissioning your net meter.",
    },
    {
      q: "How much rooftop area is needed for a residential solar system?",
      a: "As a general engineering rule of thumb, each 1 kWp of solar capacity requires approximately 80 to 100 square feet of shadow-free rooftop space. A typical 3.3 kWp system needs about 280–320 square feet of RCC flat or sloped roof.",
    },
    {
      q: "Does rooftop solar generate power on cloudy or rainy days?",
      a: "Yes. Solar panels generate power from ambient daylight (diffuse irradiance), producing around 20% to 35% of their peak rated output on heavily overcast days. Your connection to the grid ensures uninterrupted power around the clock.",
    },
    {
      q: "What is net metering and how do I earn credits?",
      a: "A bidirectional net meter tracks both the electricity you draw from the grid and the excess solar electricity you export. At the end of each billing cycle, your state DISCOM nets out your import vs. export, reducing your payable electricity bill.",
    },
    {
      q: "How does SolarWise maintain independence from solar contractors?",
      a: "SolarWise is an independent engineering and financial calculation engine. We do not sell panels, take commissions from EPC installers, or mark up equipment prices. Our recommendations are 100% objective and governed by your tariff economics.",
    },
  ]

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section id="faq" className="relative w-full py-14 lg:py-18 border-t border-neutral-200/60 scroll-mt-20">
      <div className="w-full max-w-4xl mx-auto px-6 sm:px-10">
        {/* Section Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-neutral-300 bg-white/95 text-xs sm:text-sm font-semibold text-neutral-900 mb-4 shadow-2xs backdrop-blur-xs">
            <HelpCircle className="w-4 h-4 text-[#c2410c]" />
            <span>Got Questions?</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-950 tracking-tight leading-tight mb-3">
            Frequently Asked <span className="text-[#FE5A01]">Questions</span>
          </h2>
          <p className="text-sm sm:text-base text-neutral-600 max-w-lg mx-auto leading-relaxed">
            Everything you need to know about rooftop solar feasibility, central subsidies, net metering, and savings.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx
            return (
              <div
                key={idx}
                className="rounded-xl border border-neutral-200/90 bg-white shadow-2xs overflow-hidden transition-all duration-200 hover:border-neutral-300"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full px-5 py-4 text-left font-bold text-neutral-900 text-sm sm:text-base flex items-center justify-between gap-4 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FE5A01]"
                  aria-expanded={isOpen}
                >
                  <span className="leading-snug">{faq.q}</span>
                  <div
                    className={`w-7 h-7 rounded-full bg-orange-50 border border-orange-200/60 flex items-center justify-center text-[#c2410c] shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180 bg-orange-100" : ""
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-neutral-600 leading-relaxed border-t border-neutral-100 animate-in fade-in duration-150">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

