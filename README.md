# SolarWise Frontend

Modern, accessible, explainable single-page application for the **SolarWise** household solar feasibility platform.

## Overview

- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS with SolarWise brand design tokens (`#FE5A01` orange accents, warm neutrals)
- **Icons**: Lucide React
- **Testing**: Vitest + React Testing Library + jsdom (65 automated unit & integration tests)
- **Linting**: Oxlint & TypeScript
- **Deployment Target**: Vercel / Netlify / Cloudflare Pages

## Architecture & Principles

- **Dual Interaction Modes**:
  - **Conversational Consultant**: Guided question-and-answer flow with instant bill analysis.
  - **Technical Stepper View**: Deep engineering flow for power users and detailed assessments.
- **Explainability**: Clear breakdowns of self-consumption, marginal avoided costs, export compensation, and payback.
- **Transparent Honest Recommendations**: Dynamic engineering explanation engine that transparently details why rooftop solar is unviable under low-consumption or heavily shaded conditions.
- **Maximum Performance**:
  - Inline zero-dependency brand preloader in `index.html` for instant first paint.
  - Fully responsive next-gen image pipeline (AVIF & WebP) with modern `<picture>` elements.
  - Optimized vendor code-splitting (`vendor-react`, `vendor-icons`, `vendor-charts`).
- **Decoupled Backend**: Zero server secrets in client bundles; typed contracts with the backend REST API.

## Project Structure

```text
solarwise-frontend/
├── public/                      # Static assets
├── src/
│   ├── app/                     # App router and top-level providers
│   ├── assets/                  # Images, SVGs, and brand marks
│   ├── components/              # Shared design system components
│   │   ├── ui/                  # Primitives (button, card, dialog, badge)
│   │   ├── layout/              # Navbar, footer, shell containers
│   │   ├── forms/               # Validated inputs (bill details, usage)
│   │   ├── charts/              # Recharts visualizations
│   │   └── solar/               # System badges, decision indicators
│   ├── features/                # Domain-driven feature modules
│   │   ├── onboarding/          # Household profile collection
│   │   ├── bill-upload/         # Upload & confirmation screen
│   │   ├── energy-analysis/     # Load profile breakdown
│   │   ├── solar-recommendation/# Sizing & configuration display
│   │   ├── financial-twin/      # Financial twin & cash flow comparison
│   │   ├── roof-planner/        # Interactive canvas layout planner
│   │   ├── scenario-simulator/  # Sensitivity analysis & parameter tuning
│   │   ├── provider-matching/   # Verified installer list
│   │   └── reports/             # Feasibility report export
│   ├── lib/                     # Utilities (cn, formatting)
│   ├── services/                # API client endpoints
│   ├── types/                   # Shared TypeScript definitions
│   ├── App.tsx                  # Root application component
│   ├── main.tsx                 # Entrypoint
│   └── index.css                # Tailwind directives & CSS variables
├── tests/
│   ├── setup.ts                 # Test setup & jest-dom matchers
│   └── smoke.test.tsx           # Initial UI shell smoke test
├── .env.example                 # Frontend environment template
├── .env.local                   # Local development overrides (git-ignored)
├── tailwind.config.js           # Tailwind theme configuration
├── vite.config.ts               # Vite configuration & path aliases (@)
├── tsconfig.json                # TypeScript root configuration
├── tsconfig.app.json            # TypeScript application configuration
└── README.md
```

## Local Development Setup

### 1. Requirements

- Node.js 20+
- npm 10+

### 2. Install Dependencies

```bash
cd solarwise-frontend
npm install
```

### 3. Environment Configuration

Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Set `VITE_API_BASE_URL` to point to the backend (e.g. `http://localhost:8000/api/v1`).

### 4. Run Development Server

```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### 5. Running Tests and Verification

```bash
# Run unit & component tests
npm run test:run

# Type check
npm run typecheck

# Lint check
npm run lint

# Production build test
npm run build
```

## Deployment on Vercel

- Framework Preset: `Vite`
- Root Directory: `solarwise-frontend`
- Build Command: `npm run build`
- Output Directory: `dist`
- Environment Variables:
  - `VITE_API_BASE_URL`: Production backend URL (Render Web Service)
  - `VITE_APP_ENV`: `production`
