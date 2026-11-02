# Clinahir

> Digital patient discovery, online appointment booking, and clinic operations platform engineered specifically for radiology and medical imaging centers in Morocco.

---

## Table of Contents

- [Overview](#overview)
- [Architecture & Tech Stack](#architecture--tech-stack)
- [Directory Structure](#directory-structure)
- [Core Subsystems](#core-subsystems)
  - [1. Public Landing Page & Interactive Dashboard](#1-public-landing-page--interactive-dashboard)
  - [2. Owner Administration (`/admin`)](#2-owner-administration-admin)
  - [3. Backend & Lead Integration Pipeline (`/api`)](#3-backend--lead-integration-pipeline-api)
- [Documentation Index](#documentation-index)
- [Getting Started & Local Development](#getting-started--local-development)
  - [Prerequisites](#prerequisites)
  - [Environment Setup](#environment-setup)
  - [Available Scripts](#available-scripts)
- [Testing & Quality Assurance](#testing--quality-assurance)
- [Deployment](#deployment)

---

## Overview

Clinahir connects patient discovery on Google and social media with online appointment requests and internal clinical coordination for medical imaging centers. 

Key capabilities:
- **Patient Experience:** Clear, intuitive examination booking (MRI, Ultrasound, CT Scan, Mammography, Radiography) with localized time slots.
- **Interactive Practice Dashboard:** High-density appointment telemetry, examination breakdowns, staff activity metrics, and scheduling agendas.
- **Bilingual Interface:** Full English and French support across both public marketing pages and backoffice administration.
- **Durable Lead Capture:** Resilient outbox pipeline capturing inquiries via same-origin APIs into Supabase with automatic CRM and WhatsApp integration.
- **Owner Workspace:** Secure backoffice CMS for lead triage, prospect qualification, and website content publishing.

---

## Architecture & Tech Stack

- **Frontend:** React 19, Vite 6, TypeScript, Tailwind CSS, Framer Motion, Lucide React
- **Backend & APIs:** Vercel Serverless Functions (`api/`), Node.js native test runner
- **Database & Auth:** Supabase (PostgreSQL, Row Level Security, transactional RPCs, Supabase Auth)
- **Integrations:** Daily Command CRM webhook receiver, Meta WhatsApp Business API
- **Deployment:** Vercel (Frontend & Serverless API), OpenCode Sites static package support

---

## Directory Structure

```text
kelo-clone/
├── api/                    # Vercel serverless API routes (/api/leads, /api/admin, /api/content)
├── components/             # Reusable modular marketing template components
│   └── templates/          # Landing sections: Hero, Features, How it Works, FAQ, Footer
├── docs/                   # Centralized documentation, specifications, and archives
│   ├── architecture/       # Subsystem architectural deep dives (Admin, Design, Integration)
│   ├── design-system/      # Design guidelines for prospects and admin workspaces
│   ├── audits/             # Historical audit reports, QA verification, and review archives
│   └── previews/           # Visual UI preview captures and screenshot assets
├── public/                 # Static assets, favicons, and manifest files
├── scripts/                # Development middleware, build hooks, and Sites packaging
├── server/                 # Core server libraries, Supabase client, and lead validators
├── src/                    # Main application source code
│   ├── admin/              # Owner backoffice SPA (/admin)
│   ├── assets/             # Internal project images and client captures
│   ├── content/            # Site schema, default copy, and content client
│   ├── leads/              # Client-side lead attribution and submission client
│   ├── App.jsx             # Public marketing page container
│   ├── AppointmentsPage.tsx# Interactive dashboard appointments view
│   ├── AgendaPage.tsx      # Scheduling calendar view
│   ├── ClientSpotlight.tsx # Verified Marrakech center client spotlight
│   └── LandingSections.tsx # Proof, Process, Offers, and Booking Form sections
├── supabase/               # PostgreSQL schema migrations and RLS policies
├── tests/                  # Automated integration, lead pipeline, and worker tests
└── worker/                 # Static site worker implementation
```

---

## Core Subsystems

### 1. Public Landing Page & Interactive Dashboard

The public application provides an interactive experience for center owners evaluating Clinahir:
- **Hero & Embedded Demo:** Features a live interactive simulation of a Moroccan medical imaging center dashboard anchored with plausible synthetic telemetry.
- **Examination Breakdown:** Real medical scan modalities categorized with distinct clinical palette tokens (MRI, Scanner, Échographie, etc.).
- **Client Spotlight:** Verified real-world implementation based on *Radiologie Bab Doukkala* in Marrakech.
- **Booking Request Flow:** Accessible modal dropdowns, inline form validation, and attribution capture forwarding to the central lead API.

> Detailed design principles and tokens are documented in [`docs/architecture/DESIGN.md`](./docs/architecture/DESIGN.md).

### 2. Owner Administration (`/admin`)

The private `/admin` workspace provides clinic owners and operators with business control:
- **Authentication:** Backed by Supabase Auth using secure, server-verified HttpOnly cookies (`SameSite=Strict`).
- **Lead Pipeline:** Searchable, filterable lead dashboard with pipeline stage transitions (`new`, `contacted`, `qualified`, `won`, `lost`) and private notes.
- **Prospect Qualification:** Prospect workspace for reviewing regional medical center listings, verifying website presence, and recording WhatsApp opt-in consent.
- **Content Management:** Bilingual CMS allowing draft editing and live publishing of landing headlines, copy, FAQ items, and contact details with optimistic concurrency protection.

> Backoffice activation and operational boundaries are documented in [`docs/architecture/ADMIN.md`](./docs/architecture/ADMIN.md).

### 3. Backend & Lead Integration Pipeline (`/api`)

The backend ensures that no patient lead is lost:
- **Atomic Capture:** Inquiries submitted to `POST /api/leads` are validated and committed to a durable Supabase outbox table before reporting success to the visitor.
- **CRM Synchronization:** Background delivery syncs leads to the Daily Command Center with automatic retry backoff.
- **Scheduled Processor:** Vercel Cron (`03:00 UTC`) processes any pending or retryable outbox deliveries using constant-time secret verification.

> Complete API contracts, webhook payloads, and retry logic are documented in [`docs/architecture/INTEGRATION.md`](./docs/architecture/INTEGRATION.md).

---

## Documentation Index

Detailed reference manuals have been structured within [`docs/`](./docs/):

- **[`docs/architecture/ADMIN.md`](./docs/architecture/ADMIN.md):** Owner administration runbook, Supabase auth setup, and operational boundaries.
- **[`docs/architecture/DESIGN.md`](./docs/architecture/DESIGN.md):** Clinical dark-glass aesthetic, palette roles, and interaction patterns.
- **[`docs/architecture/INTEGRATION.md`](./docs/architecture/INTEGRATION.md):** Lead outbox pipeline, Daily Command CRM integration, and cron setup.
- **[`docs/design-system/`](./docs/design-system/):** Guidelines for the admin workspace and prospect review tools.
- **[`docs/audits/`](./docs/audits/):** Historical audit records and QA verification logs.
- **[`docs/previews/`](./docs/previews/):** UI reference screenshots.
- **[`AGENTS.md`](./AGENTS.md):** Guidelines and operational rules for AI coding agents working in this repository.

---

## Getting Started & Local Development

### Prerequisites

- Node.js 20+ (recommended: Node 24)
- npm 10+

### Environment Setup

Copy `.env.example` to `.env.local` and configure your credentials:

```bash
cp .env.example .env.local
```

Key environment variables:
- `SUPABASE_URL` & `SUPABASE_SERVICE_ROLE_KEY`: Clinahir Supabase database credentials.
- `CLINAHIR_ADMIN_EMAIL` & `CLINAHIR_ADMIN_USER_ID`: Owner Supabase Auth credentials.
- `DAILY_COMMAND_URL` & `CLINAHIR_INTEGRATION_SECRET`: CRM receiver endpoint and bearer token.
- `CRON_SECRET`: Random authorization secret for the outbox processor.

### Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the Vite development server with local lead API middleware at `http://localhost:5173/` |
| `npm run build` | Compiles TypeScript, runs Vite production build, and generates Sites packaging |
| `npm run preview` | Previews the production build locally |
| `npm run typecheck` | Runs strict TypeScript verification (`tsc --noEmit`) |
| `npm run test:leads` | Runs all 41 backend, lead outbox, admin, and migration tests |
| `npm run test:sites` | Runs static packaging worker tests |
| `npm run lint` | Runs architectural boundary and import linting |

---

## Testing & Quality Assurance

Clinahir includes an automated test suite executed with Node's native test runner:

```bash
# Run the complete test suite
npm run test:leads
npm run test:sites

# Verify TypeScript types
npm run typecheck
```

---

## Deployment

1. **Vercel (Recommended):**
   - Root directory: `kelo-clone` (or repo root)
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist/client`
   - Configure server-only environment variables in Vercel project settings.
2. **Supabase Database:**
   - Apply migrations located in `supabase/migrations/` in sequential order.

