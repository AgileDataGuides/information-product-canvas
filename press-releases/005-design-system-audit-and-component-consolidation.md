# Design System Audit + Shared Component Consolidation

**6 April 2026**

AgileDataGuides today released a major design refactor of the Information Product Canvas. Every button, card, header and section across the app is now sourced from a single set of design tokens documented in the AgileData Design System; the duplicated `CanvasSection` and `CanvasCard` components that lived in each SA app are now consolidated into one canonical version in the shared package.

## The Problem

Three months of fast feature work left the IPC with three problems:

1. **Visual drift.** Buttons in different sections used different border colours, hover states, font weights, and padding. Some used `text-sm`, others `text-xs`. Some had `rounded-lg`, others `rounded-md`. None of it was deliberate — it was just what landed when the feature was built.
2. **Duplicated components.** Each SA app had its own copy of `CanvasSection.svelte` and `CanvasCard.svelte`. Bug fixes and feature improvements had to be hand-applied to every copy. Half the time only one copy got updated and the canvases drifted out of sync.
3. **No documented design system.** New contributors had no reference for "what should a button look like here?" — the answer was "look at the most recent button and copy that one."

## The Solution

Three coordinated changes shipped together.

### Shared CanvasSection + CanvasCard

The duplicated copies are gone. There's one `CanvasSection.svelte` and one `CanvasCard.svelte` in `packages/shared/src/components/`. Every SA app imports from the same source. A bug fixed once is fixed everywhere; a feature added once shows up everywhere.

Each SA app passes its section colour as a prop, so the shared component has zero knowledge of which canvas is rendering it. The components are pure UI; persistence still flows through each app's `DataAdapter` so the shared canvas can talk to localStorage in the SA, the SvelteKit API in dev mode, or DuckDB in the embedded Context Plane — without knowing which.

### `design/DESIGN_SYSTEM.md`

A documented design system captures every reusable pattern: button styles (primary save, secondary slate, danger delete header, success create), card patterns (`bg-white rounded-lg shadow-sm border`), typography (`text-sm` for body, `text-xs` for chrome), spacing (`gap-2`, `gap-3`, never arbitrary), entity colours, toolbar tier structure, and click-to-edit interaction patterns.

### Design tokens applied across the app

Every button, card, input, and section header in the IPC was audited and rewritten to match the documented tokens. No more drift. Future PRs that want a custom colour or padding now have to add it to the design system first — the system is the source of truth, the apps are the consumers.

## How It Works

The shared components live at `packages/shared/src/components/{CanvasSection,CanvasCard}.svelte`. Apps import via `@context-plane/shared/components/CanvasSection.svelte`. Each section's accent colour is passed as a prop using a hex value picked from the design system's documented entity colour map. The publish flow (`scripts/publish-app.sh`) bundles the shared components inline into each public repo, so the standalone version still has zero monorepo dependencies.

## Key Benefits

- **Single source of truth for canvas UI** — one fix, every canvas inherits it
- **No more visual drift** — every button, card, header looks identical to its peers
- **Documented patterns** — new contributors know exactly what to use
- **Faster feature work** — adding a new canvas means picking entity colours and writing the layout, not redesigning every button from scratch
- **Cross-canvas consistency** — users moving between IPC, BEM, Glossary, Dictionary, Checklist, and Data Contract see one cohesive product, not five disconnected apps

The refactored Information Product Canvas is available now in the Context Plane monorepo at `apps/information-product-canvas/`.
