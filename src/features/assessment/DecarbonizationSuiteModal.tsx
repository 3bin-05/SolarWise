import React, { useState, useEffect } from "react"
import {
  X,
  BookOpen,
  Wind,
  Calculator,
  Leaf,
  Sun,
  ShieldCheck,
  Zap,
  TrendingDown,
  TreePine,
  Flame,
  Car,
  ChevronRight,
  MapPin,
  CheckCircle2,
} from "lucide-react"

export type DecarbonizationTab = "guides" | "air-quality" | "calculator" | "reduce-emissions"

export interface DecarbonizationSuiteModalProps {
  isOpen: boolean
  onClose: () => void
  initialTab?: DecarbonizationTab
}

export const DecarbonizationSuiteModal: React.FC<DecarbonizationSuiteModalProps> = ({
  isOpen,
  onClose,
  initialTab = "calculator",
}) => {
  const [activeTab, setActiveTab] = useState<DecarbonizationTab>(initialTab)

  // Carbon Calculator state
  const [monthlyKwh, setMonthlyKwh] = useState<number>(380)

  // Selected city for Air Quality
  const [selectedCity, setSelectedCity] = useState<string>("Bengaluru")

  // Sync initialTab when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab)
    }
  }, [isOpen, initialTab])

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  // Carbon math based on Central Electricity Authority (CEA) grid emission factor: ~0.82 kg CO2 / kWh
  const annualKwh = monthlyKwh * 12
  const annualCo2Kg = Math.round(annualKwh * 0.82)
  const annualCo2Tonnes = (annualCo2Kg / 1000).toFixed(2)
  const lifetimeCo2Tonnes = ((annualCo2Kg * 25) / 1000).toFixed(1)
  const treesEquivalent = Math.round(annualCo2Kg / 22) // ~22kg CO2 per mature tree/year
  const coalAvoidedKg = Math.round(annualKwh * 0.55) // ~0.55 kg coal per kWh generated in India
  const carKmOffset = Math.round(annualCo2Kg / 0.14) // ~140g CO2 / km for avg petrol car

  // City air quality sample data
  const cityAqiData = [
    {
      city: "Bengaluru",
      state: "Karnataka",
      aqi: 64,
      status: "Moderate",
      pm25: "18.5 µg/m³",
      gridIntensity: "0.78 kg CO₂/kWh",
      color: "text-amber-600 bg-amber-50 border-amber-200",
      solarBenefit: "High irradiance (5.2 kWh/m²/day); displaces southern thermal grid emissions.",
    },
    {
      city: "Kochi",
      state: "Kerala",
      aqi: 42,
      status: "Good",
      pm25: "11.2 µg/m³",
      gridIntensity: "0.62 kg CO₂/kWh",
      color: "text-orange-600 bg-orange-50 border-orange-200",
      solarBenefit: "High hydro baseline; solar handles daytime industrial peak demand cleanly.",
    },
    {
      city: "New Delhi",
      state: "Delhi NCR",
      aqi: 228,
      status: "Poor",
      pm25: "98.4 µg/m³",
      gridIntensity: "0.89 kg CO₂/kWh",
      color: "text-red-600 bg-red-50 border-red-200",
      solarBenefit: "Directly combats winter coal plant smog and summer peak thermal emissions.",
    },
    {
      city: "Mumbai",
      state: "Maharashtra",
      aqi: 114,
      status: "Moderate",
      pm25: "36.8 µg/m³",
      gridIntensity: "0.84 kg CO₂/kWh",
      color: "text-amber-700 bg-amber-50 border-amber-200",
      solarBenefit: "Reduces heavy coastal thermal transmission losses during high AC usage.",
    },
    {
      city: "Hyderabad",
      state: "Telangana",
      aqi: 82,
      status: "Moderate",
      pm25: "24.1 µg/m³",
      gridIntensity: "0.83 kg CO₂/kWh",
      color: "text-amber-600 bg-amber-50 border-amber-200",
      solarBenefit: "Abundant 300+ sunny days/year; cuts state coal-fired peak reliance.",
    },
  ]

  const activeCityInfo = cityAqiData.find((c) => c.city === selectedCity) || cityAqiData[0]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-neutral-200/90 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-neutral-200/80 bg-neutral-50/70 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 border border-orange-200/80 flex items-center justify-center text-[#FE5A01] shrink-0">
              <Leaf className="w-5 h-5 text-[#FE5A01]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#FE5A01] bg-orange-50 px-2 py-0.5 rounded border border-orange-200/70">
                  Hackathon Decarbonization Hub
                </span>
              </div>
              <h3 className="font-extrabold text-lg sm:text-xl text-neutral-950 tracking-tight leading-tight mt-0.5">
                Clean Energy & Decarbonization Suite
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white hover:bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-500 hover:text-neutral-900 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation Navigation Bar */}
        <div className="px-6 pt-3 bg-neutral-50/40 border-b border-neutral-200/70 shrink-0">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {[
              { id: "calculator" as DecarbonizationTab, label: "Carbon Calculator", icon: Calculator },
              { id: "air-quality" as DecarbonizationTab, label: "Local Air-Quality Maps", icon: Wind },
              { id: "guides" as DecarbonizationTab, label: "Renewable Energy Guides", icon: BookOpen },
              { id: "reduce-emissions" as DecarbonizationTab, label: "Ways to Reduce Emissions", icon: TrendingDown },
            ].map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold border-t-2 border-x transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? "bg-white border-[#FE5A01] text-[#FE5A01] shadow-2xs border-b-white -mb-px"
                      : "bg-transparent border-transparent text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100/60"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* ========================================================================= */}
          {/* TAB 1: CARBON CALCULATOR */}
          {/* ========================================================================= */}
          {activeTab === "calculator" && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="bg-gradient-to-r from-orange-50/80 via-amber-50/50 to-orange-50/40 p-5 rounded-2xl border border-orange-200/80">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <h4 className="font-extrabold text-base text-neutral-950">
                      Household Carbon Footprint & Avoided Emissions
                    </h4>
                    <p className="text-xs text-neutral-600 mt-0.5">
                      Based on India&apos;s National Grid Emission Factor (0.82 kg CO₂ per kWh displaced from thermal plants).
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-neutral-500 block uppercase">Monthly Consumption</span>
                    <span className="text-2xl font-black text-[#FE5A01] font-mono">{monthlyKwh} kWh/mo</span>
                  </div>
                </div>

                {/* Slider */}
                <div className="space-y-2">
                  <input
                    type="range"
                    min={60}
                    max={1200}
                    step={10}
                    value={monthlyKwh}
                    onChange={(e) => setMonthlyKwh(Number(e.target.value))}
                    className="w-full accent-[#FE5A01] cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] font-bold text-neutral-400">
                    <span>60 kWh (Lifeline)</span>
                    <span>300 kWh (PM Surya Ghar Target)</span>
                    <span>600 kWh (Urban AC Home)</span>
                    <span>1,200 kWh (Villa / High Demand)</span>
                  </div>
                </div>
              </div>

              {/* 4 Impact Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Metric 1: Annual CO2 Avoided */}
                <div className="p-4 rounded-2xl bg-white border border-neutral-200 shadow-2xs">
                  <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center mb-2.5">
                    <Leaf className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-0.5">
                    Annual CO₂ Avoided
                  </span>
                  <span className="text-2xl font-black text-orange-600">
                    {annualCo2Tonnes} <span className="text-xs font-bold text-neutral-500">tonnes/yr</span>
                  </span>
                  <p className="text-[11px] text-neutral-500 mt-1">
                    {lifetimeCo2Tonnes} tonnes over 25-yr solar life
                  </p>
                </div>

                {/* Metric 2: Trees Equivalent */}
                <div className="p-4 rounded-2xl bg-white border border-neutral-200 shadow-2xs">
                  <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center mb-2.5">
                    <TreePine className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-0.5">
                    Trees Equivalent
                  </span>
                  <span className="text-2xl font-black text-neutral-900">
                    {treesEquivalent} <span className="text-xs font-bold text-neutral-500">trees/year</span>
                  </span>
                  <p className="text-[11px] text-neutral-500 mt-1">
                    Equivalent to planting a micro-forest
                  </p>
                </div>

                {/* Metric 3: Coal Burned Avoided */}
                <div className="p-4 rounded-2xl bg-white border border-neutral-200 shadow-2xs">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center mb-2.5">
                    <Flame className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-0.5">
                    Coal Combustion Avoided
                  </span>
                  <span className="text-2xl font-black text-amber-700">
                    {coalAvoidedKg.toLocaleString()} <span className="text-xs font-bold text-neutral-500">kg/year</span>
                  </span>
                  <p className="text-[11px] text-neutral-500 mt-1">
                    Direct thermal coal combustion avoided
                  </p>
                </div>

                {/* Metric 4: Gasoline km Offset */}
                <div className="p-4 rounded-2xl bg-white border border-neutral-200 shadow-2xs">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center mb-2.5">
                    <Car className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-0.5">
                    Vehicle Km Offset
                  </span>
                  <span className="text-2xl font-black text-blue-700">
                    {carKmOffset.toLocaleString()} <span className="text-xs font-bold text-neutral-500">km/year</span>
                  </span>
                  <p className="text-[11px] text-neutral-500 mt-1">
                    Equivalent petrol car road emissions
                  </p>
                </div>
              </div>

              {/* Hackathon Grid Metric Insight Box */}
              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/80 flex items-start gap-3">
                <Zap className="w-5 h-5 text-[#FE5A01] shrink-0 mt-0.5" />
                <div className="text-xs text-neutral-700 leading-relaxed">
                  <strong className="text-neutral-900 font-bold block mb-0.5">
                    Grid Metric Insight: How Rooftop Solar Decarbonizes the Indian Grid
                  </strong>
                  During peak daytime hours (11:00 AM – 3:30 PM), Indian state DISCOMs fire expensive and polluting coal peaker plants. Generating clean power directly on residential rooftops avoids transmission losses (~18% national average) and stabilizes localized feeder voltage.
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: LOCAL AIR-QUALITY MAPS & IMPACT */}
          {/* ========================================================================= */}
          {activeTab === "air-quality" && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div>
                <h4 className="font-extrabold text-base text-neutral-950">
                  Local Air Quality & Clean Energy Air-Pollution Offset
                </h4>
                <p className="text-xs text-neutral-600 mt-0.5">
                  See how rooftop solar generation in your city directly displaces thermal power plant particulate matter (PM2.5, SO₂, and NOx).
                </p>
              </div>

              {/* City Selector Pills */}
              <div className="flex flex-wrap gap-2">
                {cityAqiData.map((c) => (
                  <button
                    key={c.city}
                    onClick={() => setSelectedCity(c.city)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                      selectedCity === c.city
                        ? "bg-[#FE5A01] text-white border-[#FE5A01] shadow-2xs"
                        : "bg-white text-neutral-700 border-neutral-200 hover:border-neutral-300"
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{c.city}</span>
                    <span className="opacity-70 text-[10px]">({c.aqi} AQI)</span>
                  </button>
                ))}
              </div>

              {/* Active City Detail Card */}
              <div className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-2xs grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                    Current City Air Quality Index
                  </span>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-4xl font-black text-neutral-950 font-mono">{activeCityInfo.aqi}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${activeCityInfo.color}`}>
                      {activeCityInfo.status}
                    </span>
                  </div>
                  <span className="text-xs text-neutral-500 block">
                    PM2.5: <strong className="text-neutral-800">{activeCityInfo.pm25}</strong>
                  </span>
                </div>

                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                    Regional Grid Carbon Intensity
                  </span>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-3xl font-black text-[#FE5A01] font-mono">{activeCityInfo.gridIntensity}</span>
                  </div>
                  <span className="text-xs text-neutral-500 block">
                    Every kWh imported causes ~{activeCityInfo.gridIntensity} of emissions
                  </span>
                </div>

                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                    Solar Decarbonization Effect
                  </span>
                  <p className="text-xs text-neutral-700 leading-relaxed">
                    {activeCityInfo.solarBenefit}
                  </p>
                </div>
              </div>

              {/* Air Quality Impact Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-orange-50/50 border border-orange-200/60 text-xs">
                  <strong className="font-bold text-neutral-900 block mb-1">Zero Smog Emissions</strong>
                  <p className="text-neutral-600">Rooftop solar eliminates sulphur dioxide (SO₂) and nitrogen oxides (NOx) emitted by coal combustion.</p>
                </div>
                <div className="p-3.5 rounded-xl bg-orange-50/50 border border-orange-200/60 text-xs">
                  <strong className="font-bold text-neutral-900 block mb-1">Water Conservation</strong>
                  <p className="text-neutral-600">Thermal power plants consume 3.5 litres of freshwater per kWh. Solar PV consumes almost zero water.</p>
                </div>
                <div className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-200/60 text-xs">
                  <strong className="font-bold text-neutral-900 block mb-1">Neighborhood Health</strong>
                  <p className="text-neutral-600">Decentralized clean generation lowers urban thermal heat island load and improves suburban air purity.</p>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: RENEWABLE ENERGY GUIDES */}
          {/* ========================================================================= */}
          {activeTab === "guides" && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div>
                <h4 className="font-extrabold text-base text-neutral-950">
                  Comprehensive Clean Energy & Rooftop Solar Guides
                </h4>
                <p className="text-xs text-neutral-600 mt-0.5">
                  Authoritative engineering, financial, and policy guidance for residential decarbonization in India.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Guide 1 */}
                <div className="p-4 rounded-2xl bg-white border border-neutral-200 shadow-2xs hover:border-[#FE5A01] transition-all">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#FE5A01] mb-1">
                    <Sun className="w-4 h-4" />
                    <span>Government Policy & Subsidies</span>
                  </div>
                  <h5 className="font-bold text-neutral-900 text-sm mb-1.5">
                    PM Surya Ghar: Muft Bijli Yojana Official Guide
                  </h5>
                  <p className="text-xs text-neutral-600 leading-relaxed mb-3">
                    Learn how the Ministry of New and Renewable Energy (MNRE) provides ₹33,000 for 1 kW, ₹66,000 for 2 kW, and up to ₹78,000 for 3 kW+ direct DBT bank subsidies.
                  </p>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#FE5A01]">
                    <span>Eligible for all residential connections</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Guide 2 */}
                <div className="p-4 rounded-2xl bg-white border border-neutral-200 shadow-2xs hover:border-[#FE5A01] transition-all">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#FE5A01] mb-1">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Equipment Standards</span>
                  </div>
                  <h5 className="font-bold text-neutral-900 text-sm mb-1.5">
                    ALMM Certified Solar Panels & Inverters
                  </h5>
                  <p className="text-xs text-neutral-600 leading-relaxed mb-3">
                    Understand why ALMM (Approved List of Models and Manufacturers) compliance is mandatory for subsidy eligibility, and compare Mono PERC vs TOPCon bifacial modules.
                  </p>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#FE5A01]">
                    <span>25-year linear performance warranties</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Guide 3 */}
                <div className="p-4 rounded-2xl bg-white border border-neutral-200 shadow-2xs hover:border-[#FE5A01] transition-all">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#FE5A01] mb-1">
                    <Zap className="w-4 h-4" />
                    <span>Grid Integration</span>
                  </div>
                  <h5 className="font-bold text-neutral-900 text-sm mb-1.5">
                    Net Metering Regulations Across States
                  </h5>
                  <p className="text-xs text-neutral-600 leading-relaxed mb-3">
                    How bi-directional energy meters work with DISCOMs like BESCOM, KSEB, MSEDCL, and TANGEDCO. Export daytime solar surplus and credit it against night consumption.
                  </p>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#FE5A01]">
                    <span>1:1 energy credit settlement rules</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Guide 4 */}
                <div className="p-4 rounded-2xl bg-white border border-neutral-200 shadow-2xs hover:border-[#FE5A01] transition-all">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#FE5A01] mb-1">
                    <TrendingDown className="w-4 h-4" />
                    <span>Financial Engineering</span>
                  </div>
                  <h5 className="font-bold text-neutral-900 text-sm mb-1.5">
                    Solar Financial Twin & Payback Modeling
                  </h5>
                  <p className="text-xs text-neutral-600 leading-relaxed mb-3">
                    Calculate Levelized Cost of Energy (LCOE), simple payback periods (typically 3.5 – 5.5 years), and 25-year Net Present Value (NPV) with realistic tariff inflation.
                  </p>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#FE5A01]">
                    <span>18% – 28% internal rate of return</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: WAYS TO REDUCE EMISSIONS */}
          {/* ========================================================================= */}
          {activeTab === "reduce-emissions" && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div>
                <h4 className="font-extrabold text-base text-neutral-950">
                  Household Decarbonization Action Plan
                </h4>
                <p className="text-xs text-neutral-600 mt-0.5">
                  5 proven steps every home can take to cut emissions by up to 85% and achieve energy independence.
                </p>
              </div>

              <div className="space-y-3">
                {[
                  {
                    step: "01",
                    title: "Switch to Rooftop Solar PV",
                    impact: "Cuts 70% – 90% of electricity emissions",
                    desc: "Installing a 3 kWp – 5 kWp solar system replaces coal-fired grid imports with zero-emission daytime power directly on your roof.",
                  },
                  {
                    step: "02",
                    title: "Smart Daytime Load Shifting",
                    impact: "Boosts clean self-consumption by 25%",
                    desc: "Schedule heavy appliances (washing machines, water heaters, EV charging, and dishwashers) between 10:00 AM and 3:00 PM when solar output is at its peak.",
                  },
                  {
                    step: "03",
                    title: "Transition to Induction Cooking",
                    impact: "Eliminates ~450 kg CO₂ per household/yr",
                    desc: "Replace fossil LPG cylinders with high-efficiency induction cooktops powered directly by daytime solar electricity.",
                  },
                  {
                    step: "04",
                    title: "Solar-Powered Electric Mobility",
                    impact: "Saves ~1,800 kg CO₂ per 10,000 km driven",
                    desc: "Charge 2-wheeler and 4-wheeler EVs using solar energy to achieve true zero-tailpipe and zero-upstream transportation emissions.",
                  },
                  {
                    step: "05",
                    title: "Deploy Hybrid Battery Storage for Peak Shaving",
                    impact: "Prevents dirty evening peaker grid imports",
                    desc: "Store excess daytime solar generation in LiFePO4 batteries to power your night loads without drawing fossil electricity from the grid.",
                  },
                ].map((item) => (
                  <div key={item.step} className="p-4 rounded-xl bg-white border border-neutral-200/90 shadow-2xs flex items-start gap-4">
                    <span className="font-mono text-base font-extrabold text-[#FE5A01] bg-orange-50 w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border border-orange-200">
                      {item.step}
                    </span>
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                        <h5 className="font-bold text-sm text-neutral-900">{item.title}</h5>
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-orange-700 bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                          <CheckCircle2 className="w-3 h-3" /> {item.impact}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-600 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-neutral-200/80 bg-neutral-50/70 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-neutral-500 font-medium">
            <ShieldCheck className="w-4 h-4 text-orange-600" />
            <span>Hackathon Pillar Verification: Renewables • Emission Tracking • Grid Metrics</span>
          </div>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold transition-all cursor-pointer shadow-2xs"
          >
            Close Decarbonization Hub
          </button>
        </div>
      </div>
    </div>
  )
}

