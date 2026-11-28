# Portfolio Studio — Cycle 2 Final Build Plan

Complete the remaining four planned Portfolio Studio destinations (**Patterns**, **Page Templates**, **Experiments & Versions**, **Documentation**) and deepen the existing **Interaction States**, **Motion & Transitions**, **Icons & Sound**, **Materials & Effects Lab**, **Decision Log**, and **Overview** experiences into one cohesive, production-grounded design-system studio—without altering the public portfolio or introducing unnecessary dependencies or backends.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> All product decisions below follow the existing Portfolio Studio architecture and codebase ground truth. Click **Proceed** to execute all three workstreams in dependency order (Workstream A → Workstream B → Workstream C → Consolidated QA), or request adjustments before implementation begins.

- **Confirmed Scope Boundary**: Strictly preserve all public routes, public component styling, and the unconditional first-class `/design-system` navigation (no feature flags reintroduced, no P3.7 Design Spec Overlay, no backend service).
- **Persistence Architecture**: Extend the existing client-side `localStorage` workshop persistence model with a dedicated, schema-validated key for Experiments & Version Snapshots alongside the existing Decision Log and Effects Lab keys. Scoped JSON import/export validates incoming payloads and merges or replaces only the targeted domain without touching unrelated Studio state.
- **Truth-First Labelling**: Every specimen, token, duration, easing curve, material treatment, and pattern is audited against live production code. Capabilities that do not yet exist in public pages (such as candidate hero treatments, optional parallax, or proposed editorial patterns) are explicitly labelled **Experimental** or **Proposed**—never presented as live production behaviour.
- **No Duplication**: Extend existing destinations in place (Interaction State Matrix, Motion & Transitions, Icons & Sound, Materials & Effects Lab, Decision Log, Overview) rather than creating parallel views or cloning the 41-entry Component Library.

---

## 1. Overview & Core Concept

- **What It Does**: Evolves Portfolio Studio from 12 live / 4 planned routes into a complete 16-route internal design-system reference and experimentation studio covering Foundations, Component Library, Interaction Behaviour, Motion Physics & Playground, Materials & Effects, Iconography & Sound, Experiments & Version Snapshots, Patterns, Page Templates, Documentation Hub, TOC Lab, and the Decision Log.
- **Target Audience / Persona**: The portfolio designer and frontend engineer maintaining, auditing, and evolving the portfolio's Apple HIG-inspired visual language across light/dark and Cool/Warm neutral matrices.
- **Key Value**: Consolidates production specs, interactive playgrounds, structured experiment snapshots with diff comparison, reusable composition patterns, page blueprints, and searchable cross-linked documentation inside one restrained editorial workspace.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Workstream A — Behaviour, Motion, Materials & Sound**:
   - **Interaction States**: Keep the live 5-primitive Interaction State Matrix at top, then expand below with a full 10-state reference (`Default`, `Hover`, `Focus-visible`, `Pressed`, `Active`, `Selected`, `Disabled`, `Loading`, `Error`, `Success`) and a structured 9-pattern Interaction Behaviour catalogue (Buttons & Controls, Navigation, Dropdowns & Popovers, Dialogs & Drawers, Accordions, Tabs & Segmented Controls, Form Validation, Image Galleries, Scroll-Triggered Interactions) detailing trigger, initial state, resulting state, feedback, keyboard, touch, and accessibility rules.
   - **Motion & Transitions + Interactive Playground**: Organise real codebase motion into four layers (**Micro-interactions**, **Component transitions**, **Page transitions**, **Ambient motion**), document the real motion vocabulary (durations, cubic-bezier curves, spring physics, stagger delays, movement distances), preserve the synchronized curve comparison track, and add a focused **Interactive Motion Playground** with live specimens, trigger/replay controls, duration/easing/delay/distance sliders, side-by-side **Before vs. After** comparison, and an explicit **Reduced-Motion Preview** toggle that directly drives the specimen.
   - **Materials & Effects Lab**: Preserve all 7 isolated exploration tracks, side-by-side/focused comparison, Desktop/Mobile preview frames, Cool/Warm + Light/Dark sandbox switching, and Decision Log bar. Add a clear **Production vs. Experimental** material index (covering frosted glass, translucency, layered surfaces, shadows, borders/edge highlights, blur, overlays, gradients, depth/elevation, image treatments, light/dark behaviour), **copyable CSS output** generated from the live sliders, and concise usage, accessibility, and GPU/compositor performance guidance.
   - **Icons & Sound**: Preserve all 40 custom SF-proportioned SVG symbols, 9 animated Lucide specimens, and 8 live Web Audio sound pads. Add structured documentation covering icon families, sizing scale (`12px–24px`), optical stroke weights (`1.7–2.1px`), baseline alignment, interactive icon states, sound feedback policy, global preference persistence, and muted/disabled behaviour.

2. **Workstream B — Experiments & Versions + Decision Log Integration**:
   - **Experiments Workspace**: Filterable library organised by category (Typography, Colour, Surfaces, Motion, Components, Layout, Materials, Interaction Patterns) and status (`Draft`, `Exploring`, `Approved`, `Rejected`, `Archived`), seeded with real portfolio explorations plus full **Create / Edit / Duplicate / Delete** controls and interactive live specimens tied to tokens and components.
   - **Version Snapshots & Comparison**: Capture named snapshots of any experiment with parameter properties and a short change note; select any two snapshots to inspect **Before / After visual previews**, a structured **Changed Properties diff table**, and safe **Restore Snapshot** action—with clear client-side persistence scope disclosure (local browser storage, not Git or production rollback).
   - **Decision Log Integration**: Link experiments directly to Decision Log records ("Send to Decision Log"), surface linked experiment references and status distinctions (`Proposed / Exploring` vs. `Approved` vs. `Promoted` vs. `Rejected`) inside both views, and allow navigating cleanly between an experiment and its logged decision without duplicating the Decision Log.
   - **Scoped Import / Export**: Export and import Experiments & Snapshots JSON with strict schema validation and merge/replace safety so importing experiments never overwrites the Decision Log or Effects Lab configuration (and vice versa).

3. **Workstream C — Patterns, Page Templates, Documentation Hub & Overview**:
   - **Patterns Library**: 12 portfolio-grounded patterns (Hero Sections, Project Introduction, Project Metadata, Case-Study Section Layouts, Image & Media Sections, Before/After Comparisons, Testimonials, Project Credits, Related Projects, Contact & Conversion Sections, Editorial Content Layouts, Footer Patterns). Each entry includes all 10 required fields—Name, Purpose, Live Specimen reusing real production components, Component Composition, Responsive Behaviour, Relevant Tokens, Accessibility, Source Reference, Usage Guidance, and Do / Don't examples—with non-production proposals (e.g., Testimonials with empty public data, Before/After with zero public pairs) explicitly marked **Proposed / Conditional**.
   - **Page Templates Library**: 6 architectural blueprints reflecting the real portfolio routes (**Homepage**, **Case-Study Landing**, **Case-Study Content**, **Notes / Article**, **About**, **Contact**). Each shows interactive section hierarchy, component composition, layout & container widths (`1160px` shell, `60ch` prose), typography & spacing cadence, responsive breakpoints, design tokens, and isolated Desktop/Tablet/Mobile structural previews without mutating public routes.
   - **Documentation Hub**: Central searchable index connecting all 15 Studio reference and exploration destinations with keyword search + domain/maturity filtering (`Production`, `Experimental`, `Proposed`), clear descriptions, cross-links to related sections, and implementation pointers—without duplicating body documentation.
   - **Studio Overview Integration**: Update the Overview telemetry and directory to derive 100% real counts directly from live registries (16/16 live Studio routes, verified WCAG AA ratio count, 41 Component Library entries, 12 Patterns, 6 Page Templates, active Experiments & Decision Log records, and honest remaining gaps).

### Visual Identity & Theme

- **Aesthetic Direction**: Restrained Apple HIG editorial monograph—consistent with the existing Studio shell and portfolio monograph guidelines. Generous negative space, crisp typographic hierarchy, hairline rules, and zero dashboard clutter.
- **Color Palette & Mood (60-30-10 Budget)**:
  - **60% Neutral Canvas**: `--apple-bg` (`#ffffff` / `#0b0b0d` Cool, `#fbfaf7` / `#12110f` Warm).
  - **30% Structural Surfaces**: `--apple-bg-secondary`, `--apple-surface-elevated`, and `--apple-separator` hairlines—single-elevation framing, avoiding nested cards-within-cards.
  - **10% Focal Accent**: `--apple-blue` / `--apple-link` reserved for primary actions, active states, and keyboard focus rings (`--apple-focus-ring`), paired with AA-verified `--apple-success`, `--apple-warning`, and `--apple-error` accompanied by explicit text labels (never color-only state signaling).
- **Typography & Hierarchy**: Existing optical Apple SF Pro pairing (`--font-sf-display` for `>= 20pt` display/titles with `text-wrap: balance`; `--font-sf-text` for body/UI; monospace strictly for tokens, CSS values, and `tabular-nums` counts). Zero pill enclosures on static metadata—use quiet unboxed text with `·` or `/` separators; interactive segmented controls use `.apple-segmented`.
- **Interactive Feedback & Motion**: Micro-interactions settle within `160–220ms` using compositor-only `transform`/`opacity`; all playgrounds and interactive previews honor `prefers-reduced-motion` and provide explicit reduced-motion simulation where relevant.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1 — Extend Existing Destinations In Place vs. Creating New Routes**
  - *Chosen Approach*: Keep the exact 16-route Studio sidebar architecture and promote the 4 remaining `planned` routes (`patterns`, `page-templates`, `experiments`, `documentation`) to `live`, while enriching `interaction-states`, `motion`, `icons-sound`, `effects`, `decisions`, and `overview`.
  - *Why*: Preserves familiar navigation muscle memory, avoids sidebar bloat, and satisfies the requirement that the Studio feels like one coherent product.
  - *Alternatives Considered*: Adding sub-routes for Motion Playground or Experiment Diffing; rejected to prevent fragmented navigation and redundant wrappers.

- **Decision 2 — Local Persistence Scope for Experiments & Snapshots**
  - *Chosen Approach*: Store experiments and their version snapshots in a dedicated `localStorage` key (`portfolio_workshop_experiments_v1`) seeded with curated baseline experiments, with pure helper functions for snapshot creation, property diffing, safe restoration, and schema-validated JSON import/export.
  - *Why*: Matches the existing Decision Log and Effects Lab architecture, works offline with zero backend infrastructure, and keeps experiment state strictly isolated from both public routes and Decision Log entries.
  - *Alternatives Considered*: Introducing a database or backend API; rejected per scope constraints.

- **Decision 3 — Real Production Component Reuse in Patterns & Templates**
  - *Chosen Approach*: Render live specimens directly from real production components (e.g., project cards, credits, related projects, breadcrumbs, audio player, before/after comparator, local time clock, footer, segmented controls) inside isolated `[data-ds-sandbox]` frames with safe no-op or toast-backed navigation callbacks.
  - *Why*: Guarantees patterns and templates reflect real production tokens and responsive behaviour rather than drifting mockups, while preventing clicks inside previews from unexpectedly navigating away from the Studio.
  - *Alternatives Considered*: Static wireframe boxes only; rejected because real specimens provide far stronger design-system utility.

- **Decision 4 — Unified Searchable Documentation Hub Without Content Duplication**
  - *Chosen Approach*: Build a structured registry indexing every Studio destination, key topics, maturity posture (`Production` / `Experimental` / `Proposed`), related cross-links, and source pointers, powered by fast client-side keyword search and maturity filters.
  - *Why*: Gives designers and engineers a single entry point to locate any token, component, motion curve, pattern, or decision rule without copying documentation text out of its canonical home.
  - *Alternatives Considered*: Duplicating token tables inside the Documentation tab; rejected to maintain a single source of truth.

---

## 4. Technical Architecture & Data Strategy *(Technical Reference)*

### Architecture & Component Diagram

```text
┌────────────────────────────────────────────────────────────────────────────┐
│                        Portfolio Studio Shell (/design-system)             │
│  Persistent 5-Group Sidebar (16 Live Routes) · Sandbox Theme/Palette Bar   │
└──────┬─────────────────────────────┬──────────────────────────────┬────────┘
       │                             │                              │
       ▼                             ▼                              ▼
┌─────────────────────┐  ┌─────────────────────────┐  ┌──────────────────────┐
│  WORKSTREAM A       │  │  WORKSTREAM B           │  │  WORKSTREAM C        │
│  Behaviour & Lab    │  │  Experiments & Log      │  │  Library & System    │
├─────────────────────┤  ├─────────────────────────┤  ├──────────────────────┤
│ • Interaction States│  │ • Experiments Library   │  │ • Patterns Library   │
│   (Matrix + 10-State│  │   (Filter/Create/Edit)  │  │   (12 Real/Proposed) │
│   + 9 Patterns)     │  │ • Snapshot Versioning   │  │ • Page Templates     │
│ • Motion System +   │  │   (Diff + Before/After  │  │   (6 Route Blueprints│
│   Motion Playground │  │   + Safe Restore)       │  │   + Viewport Frames) │
│ • Materials &       │  │ • Decision Log Link     │  │ • Documentation Hub  │
│   Effects Lab       │  │   (Bi-directional Refs) │  │   (Search + Index)   │
│   (Prod vs Exp +CSS)│  │ • Scoped JSON Import &  │  │ • Studio Overview    │
│ • Icons & Sound     │  │   Export Validation     │  │   (Live Real Counts) │
│   (Specs + Matrix)  │  └───────────┬─────────────┘  └──────────┬───────────┘
└──────────┬──────────┘              │                           │
           │                         ▼                           │
           │             ┌─────────────────────────┐             │
           └────────────►│  Isolated Client State  │◄────────────┘
                         │  & Catalog Modules      │
                         ├─────────────────────────┤
                         │ • Navigation Registry   │
                         │ • Interaction/Motion/   │
                         │   Material Catalogs     │
                         │ • Experiments Store     │
                         │   (localStorage v1)     │
                         │ • Decision Log Store    │
                         │   (localStorage v1)     │
                         │ • Patterns/Templates/   │
                         │   Docs Catalogs         │
                         └─────────────────────────┘
```

### Data Model & State

- **Studio Navigation Registry**: All 16 destinations marked `status: 'live'` with accurate `supportsSandboxContext` flags (enabled for Foundations, Components, Patterns, Page Templates, Interaction States, Motion, Materials & Effects Lab, and Experiments so Cool/Warm + Light/Dark inspection works consistently across visual previews).
- **Behaviour & Motion Catalogs**: Typed read-only specifications grounded in real CSS tokens and motion exports—10 interaction states, 9 interaction patterns (with trigger, initial/result state, feedback, keyboard, touch, a11y), 4 motion categories, real duration/easing/spring/distance vocabulary, production vs. experimental material matrix, and icon/sound specification matrices.
- **Experiments & Version Snapshots Store**:
  - `StudioExperiment`: `id`, `name`, `shortDescription`, `category` (8 categories), `status` (`draft | exploring | approved | rejected | archived`), `date`, `systemArea`, `rationale`, `specimenType`, `tokens`, `components`, `notes`, `parameters`, `snapshots[]`, `linkedDecisionId?`.
  - `ExperimentSnapshot`: `id`, `versionLabel` (e.g. `v1`, `v2`), `createdAt`, `changeNote`, `parameters`, `statusAtSnapshot`.
  - Pure utilities for creating snapshots, computing typed property diffs between any two snapshots, restoring a snapshot safely (with automatic pre-restore checkpoint), and validating/exporting/importing experiment JSON without touching Decision Log or Effects Lab keys.
- **Decision Log Extension**: Extend `subjectType` cleanly to include `'experiment'` and optional `experimentId` reference so linked decisions display a direct "Open Experiment" affordance and preserve full backward compatibility with existing stored JSON logs.
- **Patterns, Templates & Docs Catalogs**: Typed specifications for 12 portfolio patterns (each carrying all 10 required documentation fields and explicit `production | proposed` status), 6 portfolio page templates, and a unified Documentation Hub search index.

### Interactive Component & State Mapping

- **Interaction States View**: Preserves the live 5-primitive matrix + loading test trigger; adds interactive state filter tabs (`All 10 States`) and expandable/selectable pattern inspector for all 9 interaction patterns.
- **Motion Playground**: Local reactive state for selected specimen (Button Press, Popover/Drawer, Accordion Disclosure, Toast Notification, Section Reveal), `durationMs`, `easingId`, `delayMs`, `distancePx`, `simulateReducedMotion`, `compareBeforeAfter`, and `replayKey`—every control immediately updates live inline transition props and generated CSS/Motion snippets.
- **Materials & Effects Lab**: Keeps all 7 track controls and live comparison stage; adds a Production vs. Experimental material matrix toggle, live copyable CSS block derived from current sliders + theme/palette, and accessibility/compositor guidance drawer/panel.
- **Experiments & Versions View**: Category & status filters, search input, "New Experiment" creation form, inline parameter & notes editor with live themed specimen preview, "Save Snapshot" trigger with change note, side-by-side **Compare Snapshots** selector (Version A vs. Version B) rendering visual Before/After frames + property diff table + "Restore Version", "Log to Decision Log" button, and scoped JSON Export/Import controls with validation error states.
- **Patterns & Page Templates Views**: Category/maturity filter + selector list, live isolated sandbox specimen frame with Desktop (`100%`) / Tablet (`768px`) / Mobile (`375px`) viewport toggles, full structured specs, copyable tokens, and source pointers.
- **Documentation Hub**: Live keyword search input + domain & maturity filter controls; clicking any entry or related cross-link navigates seamlessly inside the Studio shell.

### Verification & Quality Assurance Strategy

- **Unit Tests**: Extend the existing `tsx --test` suite to cover experiment store CRUD, snapshot creation, diff calculation, safe restore, scoped JSON import/export validation (including malformed payloads and isolation from Decision Log), Decision Log experiment linking, and catalog integrity across Interactions, Motion, Patterns, Page Templates, and Documentation Hub.
- **Static & Build Verification**: Run TypeScript typechecking (`tsc --noEmit`) and production Vite build (`npm run build`) with zero errors.
- **Live Browser & Responsive QA**: Verify the live running app in headless Chromium across Desktop (`1440×900`), Tablet (`768×900`), and Mobile (`390×844`) covering all 16 Studio routes, interactive playgrounds, experiment creation/snapshot diff/import-export, theme/palette switching, reduced-motion preview, public portfolio regression routes (`/`, `/work/stallsync`, `/notes`, `/about`, `/contact`), `0px` horizontal overflow, and `0` console/page errors.
