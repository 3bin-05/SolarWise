import React from "react"
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  ArrowUp,
  ChevronRight,
  Sparkles,
} from "lucide-react"
import { SolarSunBurst } from "../../components/layout/Header"
import footerWebp1600 from "../../assets/footer-1600.webp"
import footerWebp1000 from "../../assets/footer-1000.webp"
import footerWebp500 from "../../assets/footer-500.webp"
import footerAvif1600 from "../../assets/footer-1600.avif"
import footerAvif1000 from "../../assets/footer-1000.avif"
import footerAvif500 from "../../assets/footer-500.avif"
import mascotWebp600 from "../../assets/mascot-600.webp"
import mascotWebp400 from "../../assets/mascot-400.webp"
import mascotWebp300 from "../../assets/mascot-300.webp"
import mascotAvif600 from "../../assets/mascot-600.avif"
import mascotAvif400 from "../../assets/mascot-400.avif"
import mascotAvif300 from "../../assets/mascot-300.avif"

export interface LandingFooterProps {
  onStart?: () => void
}

export const LandingFooter: React.FC<LandingFooterProps> = ({ onStart }) => {
  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleNavClick = (sectionId: string) => {
    const el = document.getElementById(sectionId)
    if (el) {
      el.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <footer id="contact" className="relative w-full overflow-hidden bg-gradient-to-b from-white/60 via-[#fff8f3]/90 to-[#fdf2e9] pt-10 sm:pt-14 border-t border-neutral-200/60 scroll-mt-20">
      {/* Top 4-Column Content Grid */}
      <div className="w-full max-w-[1536px] mx-auto px-6 sm:px-10 lg:px-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-7 items-start mb-6 sm:mb-8">
          {/* Column 1: Brand, Headline, Subtext, Social Links (col-span-4) */}
          <div className="lg:col-span-4 flex flex-col items-start pr-0 lg:pr-4">
            {/* Logo */}
            <div
              className="flex items-center gap-2 mb-4 cursor-pointer select-none"
              onClick={handleScrollToTop}
            >
              <SolarSunBurst className="w-7 h-7 shrink-0" />
              <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-neutral-900">
                Solar<span className="text-[#FE5A01]">wise</span>
              </span>
            </div>

            {/* Headline */}
            <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 tracking-tight leading-[1.2] mb-3">
              Have a question <br />
              or <span className="text-[#FE5A01]">need help?</span>
            </h2>

            {/* Subtext */}
            <p className="text-xs sm:text-sm text-neutral-600 max-w-sm leading-relaxed mb-5">
              Get in touch with us. We&apos;re here to help you with solar planning, feasibility assessments, and general queries.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-2.5">
              {/* LinkedIn */}
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg bg-[#fff4ec] border border-[#fed7c0] flex items-center justify-center text-neutral-800 hover:text-[#FE5A01] hover:border-[#FE5A01] transition-all hover:scale-105 shadow-2xs"
                aria-label="LinkedIn"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.45a1.64 1.64 0 1 0 1.64 1.64 1.64 1.64 0 0 0-1.64-1.64Z" />
                </svg>
              </a>

              {/* GitHub */}
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg bg-[#fff4ec] border border-[#fed7c0] flex items-center justify-center text-neutral-800 hover:text-[#FE5A01] hover:border-[#FE5A01] transition-all hover:scale-105 shadow-2xs"
                aria-label="GitHub"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2Z" />
                </svg>
              </a>

              {/* Instagram */}
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg bg-[#fff4ec] border border-[#fed7c0] flex items-center justify-center text-neutral-800 hover:text-[#FE5A01] hover:border-[#FE5A01] transition-all hover:scale-105 shadow-2xs"
                aria-label="Instagram"
              >
                <svg className="w-3.5 h-3.5 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </a>

              {/* YouTube */}
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg bg-[#fff4ec] border border-[#fed7c0] flex items-center justify-center text-neutral-800 hover:text-[#FE5A01] hover:border-[#FE5A01] transition-all hover:scale-105 shadow-2xs"
                aria-label="YouTube"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links (col-span-2) */}
          <div className="lg:col-span-2 flex flex-col items-start">
            <h3 className="text-sm sm:text-base font-extrabold text-neutral-900 mb-3.5 tracking-tight">
              Quick Links
            </h3>
            <ul className="w-full space-y-2.5 text-xs sm:text-sm font-semibold text-neutral-700">
              {[
                { label: "Home", id: "home" },
                { label: "Features", id: "features" },
                { label: "How It Works", id: "how-it-works" },
                { label: "Clean Energy & Decarbonization", id: "about" },
                { label: "FAQs", id: "faq" },
              ].map((item) => (
                <li key={item.label} className="w-full">
                  <a
                    href={`#${item.id}`}
                    onClick={(e) => {
                      e.preventDefault()
                      handleNavClick(item.id)
                    }}
                    className="flex items-center justify-between group hover:text-[#FE5A01] transition-colors py-0.5 cursor-pointer"
                  >
                    <span>{item.label}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-[#FE5A01] transition-transform group-hover:translate-x-0.5" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contact Details (col-span-3) */}
          <div className="lg:col-span-3 flex flex-col items-start">
            <h3 className="text-sm sm:text-base font-extrabold text-neutral-900 mb-3.5 tracking-tight">
              Contact Details
            </h3>
            <div className="space-y-3 text-xs sm:text-sm">
              {/* Email */}
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#fff4ec] border border-[#fed7c0] flex items-center justify-center text-[#FE5A01] shrink-0">
                  <Mail className="w-3.5 h-3.5" />
                </div>
                <a
                  href="mailto:support@solarwise.in"
                  className="font-medium text-neutral-800 hover:text-[#FE5A01] transition-colors"
                >
                  support@solarwise.in
                </a>
              </div>

              {/* Phone */}
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#fff4ec] border border-[#fed7c0] flex items-center justify-center text-[#FE5A01] shrink-0">
                  <Phone className="w-3.5 h-3.5" />
                </div>
                <a
                  href="tel:+919876543210"
                  className="font-medium text-neutral-800 hover:text-[#FE5A01] transition-colors"
                >
                  +91 98765 43210
                </a>
              </div>

              {/* Location */}
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#fff4ec] border border-[#fed7c0] flex items-center justify-center text-[#FE5A01] shrink-0">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <span className="font-medium text-neutral-800">
                  Kerala, India
                </span>
              </div>

              {/* Hours */}
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#fff4ec] border border-[#fed7c0] flex items-center justify-center text-[#FE5A01] shrink-0">
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <span className="font-medium text-neutral-800">
                  Mon – Sat, 9:00 AM – 6:00 PM
                </span>
              </div>
            </div>
          </div>

          {/* Column 4: SolarWise Mascot Character Card (col-span-3) */}
          <div className="lg:col-span-3 w-full">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-5 sm:p-6 border border-neutral-200/80 shadow-md relative flex flex-col items-center text-center group hover:shadow-lg transition-all">
              {/* Mascot 3D Character with floating soft glow */}
              <div className="relative w-36 h-36 sm:w-40 sm:h-40 flex items-center justify-center mb-2">
                <div className="absolute inset-0 bg-radial from-orange-200/50 via-amber-100/30 to-transparent rounded-full blur-md -z-10" />
                <picture className="w-full h-full flex items-center justify-center">
                  <source
                    type="image/avif"
                    srcSet={`${mascotAvif300} 300w, ${mascotAvif400} 400w, ${mascotAvif600} 600w`}
                    sizes="(min-width: 1024px) 160px, 144px"
                  />
                  <source
                    type="image/webp"
                    srcSet={`${mascotWebp300} 300w, ${mascotWebp400} 400w, ${mascotWebp600} 600w`}
                    sizes="(min-width: 1024px) 160px, 144px"
                  />
                  <img
                    src={mascotWebp400}
                    alt="SolarWise Mascot - Sunny"
                    width={160}
                    height={160}
                    loading="lazy"
                    decoding="async"
                    className="max-h-full max-w-full object-contain select-none pointer-events-none drop-shadow-md group-hover:scale-105 transition-transform duration-300"
                  />
                </picture>
              </div>

              {/* Speech Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200/80 text-xs font-bold text-[#FE5A01] mb-2 shadow-2xs">
                <Sparkles className="w-3 h-3 text-[#FE5A01]" />
                <span>Meet Sunny</span>
                <span className="text-[10px] text-neutral-400 font-normal">• Solar AI</span>
              </div>

              <h3 className="text-base font-extrabold text-neutral-950 tracking-tight mb-1">
                Ready to Go Solar?
              </h3>
              <p className="text-xs text-neutral-500 leading-relaxed mb-4 max-w-[220px]">
                I&apos;ll help you calculate your solar savings and cut power bills by up to 90%!
              </p>

              {/* Start Assessment CTA */}
              <button
                type="button"
                onClick={onStart || handleScrollToTop}
                className="w-full py-2.5 px-4 rounded-lg bg-[#FE5A01] hover:bg-[#e04f00] active:scale-[0.99] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
              >
                Calculate Solar Savings <span>→</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Landscape Image Layer: footer with smooth top fade effect */}
      <div className="w-full relative mt-1 sm:mt-2 overflow-hidden select-none pointer-events-none">
        {/* Soft top gradient fade overlay */}
        <div className="absolute inset-x-0 top-0 h-14 sm:h-20 bg-gradient-to-b from-[#fff8f3] via-[#fff8f3]/70 to-transparent pointer-events-none z-10" />

        <picture className="w-full block">
          <source
            type="image/avif"
            srcSet={`${footerAvif500} 500w, ${footerAvif1000} 1000w, ${footerAvif1600} 1600w`}
            sizes="100vw"
          />
          <source
            type="image/webp"
            srcSet={`${footerWebp500} 500w, ${footerWebp1000} 1000w, ${footerWebp1600} 1600w`}
            sizes="100vw"
          />
          <img
            src={footerWebp1600}
            alt="SolarWise Clean Energy Landscape"
            width={1600}
            height={276}
            loading="lazy"
            decoding="async"
            style={{
              maskImage: "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.4) 15%, rgba(0,0,0,0.85) 30%, black 50%)",
              WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.4) 15%, rgba(0,0,0,0.85) 30%, black 50%)",
            }}
            className="w-full h-auto max-h-[180px] sm:max-h-[220px] md:max-h-[260px] lg:max-h-[300px] xl:max-h-[330px] block object-cover object-top"
          />
        </picture>
      </div>

      {/* Final Dark Wave Bottom Layer (Overlapping footer.png smoothly) */}
      <div className="relative w-full z-20 -mt-10 sm:-mt-14 md:-mt-18 lg:-mt-22 xl:-mt-24">
        {/* Smooth Organic Wave Transition at top of dark layer */}
        <div className="w-full overflow-hidden leading-none -mb-px">
          <svg
            className="w-full h-6 sm:h-9 md:h-12 lg:h-14 text-[#171615] fill-current block"
            viewBox="0 0 1440 60"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
          >
            <path d="M0,26 C260,42 500,14 760,28 C1040,42 1260,16 1440,24 L1440,60 L0,60 Z" />
          </svg>
        </div>

        {/* Sleek Dark Footer Body */}
        <div className="bg-[#171615] text-white py-3.5 sm:py-4 px-6 sm:px-10 lg:px-16">
          <div className="max-w-[1536px] mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-[11px] sm:text-xs font-medium text-neutral-300">
            {/* Left: Copyright & Sustainability Pillars */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 sm:gap-3.5 text-neutral-400">
              <span className="text-neutral-300">© 2026 SolarWise. All rights reserved.</span>
              <span className="hidden sm:inline w-px h-3 bg-neutral-700" />
              <div className="flex items-center gap-2 text-neutral-300 font-semibold">
                <svg
                  className="w-3.5 h-3.5 text-[#FE5A01] fill-[#FE5A01] shrink-0"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
                  <path d="M2 21c0-3 1.85-5.36 5.08-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <span>Clean Energy</span>
                <span className="text-[#FE5A01]">•</span>
                <span>Lower Emissions</span>
                <span className="text-[#FE5A01]">•</span>
                <span>Sustainable Homes</span>
              </div>
            </div>

            {/* Right: Back to Top Button */}
            <button
              type="button"
              onClick={handleScrollToTop}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-neutral-200 hover:text-white text-[11px] sm:text-xs font-bold transition-all cursor-pointer shadow-2xs"
            >
              <ArrowUp className="w-3.5 h-3.5" /> Back to Top
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}
