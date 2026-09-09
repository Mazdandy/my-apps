---
name: Precision Engineering Workspace
colors:
  surface: '#0b1326'
  surface-dim: '#0b1326'
  surface-bright: '#31394d'
  surface-container-lowest: '#060e20'
  surface-container-low: '#131b2e'
  surface-container: '#171f33'
  surface-container-high: '#222a3d'
  surface-container-highest: '#2d3449'
  on-surface: '#dae2fd'
  on-surface-variant: '#c7c4d8'
  inverse-surface: '#dae2fd'
  inverse-on-surface: '#283044'
  outline: '#918fa1'
  outline-variant: '#464555'
  surface-tint: '#c3c0ff'
  primary: '#c3c0ff'
  on-primary: '#1d00a5'
  primary-container: '#4f46e5'
  on-primary-container: '#dad7ff'
  inverse-primary: '#4d44e3'
  secondary: '#4edea3'
  on-secondary: '#003824'
  secondary-container: '#00a572'
  on-secondary-container: '#00311f'
  tertiary: '#ffb95f'
  on-tertiary: '#472a00'
  tertiary-container: '#885500'
  on-tertiary-container: '#ffd4a4'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#0f0069'
  on-primary-fixed-variant: '#3323cc'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#0b1326'
  on-background: '#dae2fd'
  surface-variant: '#2d3449'
typography:
  headline-xl:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.03em
  headline-lg:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Geist
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.015em
  body-lg:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 22px
    letterSpacing: -0.01em
  body-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: -0.005em
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0em
  code-md:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: -0.02em
  code-sm:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: -0.01em
  label-md:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit-2xs: 0.125rem
  unit-xs: 0.25rem
  unit-sm: 0.5rem
  unit-md: 0.75rem
  unit-base: 1rem
  unit-lg: 1.5rem
  unit-xl: 2rem
  sidebar-w: 16rem
  inspector-w: 22rem
  gutter-table: 0.75rem
---

## Brand & Style

This design system establishes a high-density, distraction-free productivity environment crafted specifically for Quality Assurance Engineers, SDETs, and Product Quality Leads. The visual posture reflects systematic order, razor-sharp precision, and analytical calm, drawing inspiration from developer-grade instruments like Linear, Raycast, and Notion.

### Core Tenets
- **Analytical Clarity:** Information density is embraced without chaotic clutter. The UI recedes behind content, letting PRD analyses, edge cases, and test assertions take absolute focus.
- **Instrument-Grade Tactility:** Micro-interactions, crisp hairline borders, and muted tonal shifts evoke the feeling of a reliable developer terminal combined with modern document craftsmanship.
- **Bilingual Ergonomics:** Designed specifically for Indonesian engineering ecosystems where core navigational chrome and conversational prompts operate in clean Bahasa Indonesia (e.g., *Unggah PRD*, *Jalankan Analisis*, *Ekspor Kasus Uji*), while technical testing artifacts retain standardized global English syntax (*Test Strategy*, *Test Case ID*, *Preconditions*, *Pass/Fail*, *Traceability Matrix*).

The overall style converges on **Minimalist Developer-Utility**: subtle dark/light contrast mechanics, high-legibility structural lines, and purposeful semantic badges.

## Colors

The color system is engineered for prolonged sessions of deep document review, PRD parsing, and test-case structuring. The primary operational mode is a deep slate dark environment with paired tokens for a crisp technical light mode.

### Palette Architecture
- **Primary (`#4F46E5` Indigo):** Applied intentionally to focal actions—generating matrices, initiating AI PRD breakdowns, and indicating active workflow states. Does not dominate secondary panels.
- **Secondary / Verification (`#10B981` QA Emerald):** Signals stability, positive test outcomes (*Pass*), requirement coverage completeness, and validated edge cases.
- **Tertiary / Warning (`#F59E0B` Amber):** Reserved for flaky risks, unlinked requirements, blocking assumptions, and medium-severity notices.
- **Critical (`#EF4444` Rose):** Strict application for *Blocked*, *Failed*, missing PRD constraints, or destructive data loss.
- **Neutrals (`#0F172A` Slate Base):** Forms a layered slate ladder (`#020617` root, `#0F172A` canvas, `#1E293B` panel, `#334155` active borders, and `#F8FAFC` foreground). In light mode, this flips cleanly to `#F8FAFC` base with `#FFFFFF` panels and `#E2E8F0` hairline dividers.

## Typography

The typographic hierarchy is calibrated for intense data scanning, tabular alignment, and structured Markdown specifications.

- **Primary Structure (`Geist`):** Delivers geometric precision for views, modal titles, and section dividers.
- **Narrative & Specifications (`Inter`):** Selected for its high x-height, neutral letterforms, and superior legibility inside dense test procedure tables, step-by-step descriptions, and acceptance criteria.
- **Artifacts & Identifiers (`JetBrains Mono`):** Applied exclusively to Test Case IDs (`TC-AUTH-001`), variable payloads, Gherkin syntax blocks (`Given/When/Then`), assertion expressions, and shortcut tokens (`⌘K`).

Typography scales downward for high-density settings. Titles maintain tight letter-spacing to prevent visual leakage across complex split-screen views.

## Layout & Spacing

The spatial architecture relies on a **docked three-pane workbench layout** rather than a traditional loose marketing grid. 

### Spatial Mechanics
- **Left Pane (16rem / `sidebar-w`):** Workspace navigation, PRD source repository, and test plan hierarchies. Collapsible on mobile and tablet viewport widths.
- **Center Canvas (Flexible):** Main working view containing generated Test Strategies, dynamic step tables, and Gherkin editor blocks. Uses a strict 8px horizontal/vertical rhythm.
- **Right Inspector (22rem / `inspector-w`):** Live AI context inspector, traceability links, coverage telemetry, and metadata adjustments.
- **Mobile / Compact Adjustments:** Collapses sidebars into drawer overlays triggered by persistent top app chrome. Center canvas shifts from complex data grids into vertical stacked card summaries with swipeable steps.

## Elevation & Depth

This design system strictly avoids heavy skeuomorphic drops and multi-layered blurry drop shadows. Depth is achieved via **tonal stacking** and **crisp 1px borders**.

### Depth Layers
- **Base 0 (Canvas):** Pure `#020617` (Dark) / `#F8FAFC` (Light). Serves as the substrate for the application backdrop.
- **Base 1 (Panels & Surfaces):** `#0F172A` (Dark) / `#FFFFFF` (Light) separated by a sharp hairline border: `1px solid rgba(255, 255, 255, 0.08)` in dark mode and `1px solid #E2E8F0` in light mode.
- **Base 2 (Hover & Active States):** Surface lift occurs through subtle tonal fills (`#1E293B`) rather than elevated physical shadows.
- **Flyouts & Command Palettes:** Modals, auto-complete drawers, and Raycast-style prompt bars use an ambient dark shadow (`0 12px 32px -4px rgba(0, 0, 0, 0.5)`) supplemented by a hairline primary tint border (`1px solid rgba(79, 70, 229, 0.25)`).

## Shapes

The interface embraces a **Soft (Level 1)** geometry. Radii are kept compact to maximize usable canvas area and maintain an engineering-first tool aesthetic.

- **Interactive Inputs & Buttons:** `4px` (`0.25rem`) roundedness for a crisp, tactile feel.
- **Containers & Data Tables:** `6px` to `8px` outer edge curvature with square interior cell dividers.
- **Status & Priority Indicators:** Full-pill (`9999px`) roundedness for metadata tags, ensuring instant differentiation between structural card boundaries and categorical metadata.

## Components

### Buttons
- **Primary:** Background `#4F46E5`, foreground `#FFFFFF`, `border: 1px solid rgba(255, 255, 255, 0.15)`. Active states compress subtly via CSS transform (`scale(0.99)`).
- **Secondary / Ghost:** Transparent surface with `border: 1px solid #334155`. Text color `#F8FAFC`. Hover brings an active tint of `rgba(255, 255, 255, 0.04)`.
- **Destructive:** Deep crimson background tint (`rgba(239, 68, 68, 0.15)`), red border (`#EF4444`), text `#FCA5A5`.

### Status & Priority Chips (Pill Badges)
Compact badges display priority and outcome states utilizing a two-tone pattern (low-opacity colored background paired with a high-contrast label):
- **Priority High:** Background `rgba(239, 68, 68, 0.12)`, text `#F87171`, border `rgba(239, 68, 68, 0.3)`.
- **Priority Medium:** Background `rgba(245, 158, 11, 0.12)`, text `#FBBF24`, border `rgba(245, 158, 11, 0.3)`.
- **Priority Low:** Background `rgba(100, 116, 139, 0.12)`, text `#94A3B8`, border `rgba(100, 116, 139, 0.3)`.
- **Status Pass / Ready:** Background `rgba(16, 185, 129, 0.12)`, text `#34D399`, border `rgba(16, 185, 129, 0.3)`.

### Test Case Data Tables
- **Header:** Sticky top, `code-sm` JetBrains Mono text, uppercase, muted slate color (`#64748B`), bottom border `1px solid #1E293B`.
- **Rows:** Alternating rows leverage a micro-contrast background; row height is clamped to `36px` to ensure visibility of dozens of test conditions simultaneously.
- **Columns:** Monospaced ID column (`TC-001`), interactive editable title cell, priority badge, and instant status picker.

### Input Fields & PRD Text Areas
- Inputs feature inset background `#0B1120`, border `1px solid #1E293B`, focus ring `1px solid #4F46E5`.
- PRD upload and ingestion zones feature subtle dashed borders (`1px dashed #334155`) that light up with Indigo ring effects on file hover.

### Specialized Component: Traceability Matrix Card
- Compact cards showing bidirectional linking: PRD User Story ID on the left linked via an arrow glyph (`→`) to generated Test Case tokens on the right, providing immediate visual confirmation of PRD test coverage.