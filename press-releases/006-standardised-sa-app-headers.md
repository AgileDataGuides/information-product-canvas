# Information Product Canvas Adopts the Standardised SA App Header

**7 April 2026**

AgileDataGuides today released a header refactor of the Information Product Canvas, bringing it in line with the standardised three-tier header pattern used across every AgileData standalone app. The dark App Header sits at the top with the Canvas switcher and global model actions; below it sits the Tier 2 toolbar carrying the canvas name, description, and exports; below that sits the Tier 3 tab strip for switching between Canvas / Instructions views.

## The Problem

The original IPC header was a single bar mixing app branding, canvas switching, model creation, the canvas name, the description, and four different action buttons all in one row. As the feature set grew, the header got more crowded and harder to scan. Different SA apps were also drifting toward different header layouts — IPC, BEM, and Checklist each had slightly different structures, even though they were trying to express the same concepts.

Without a documented header pattern, every new SA app had to reinvent the layout, and users moving between apps had to relearn where things lived.

## The Solution

The IPC adopts the documented three-tier header pattern:

### Tier 1 — App Header (dark)
- App name + tagline on the left
- Canvas switcher dropdown on the right with the current canvas name
- `New Canvas` and `Import` buttons (creation actions)
- `Delete` button on the far right (destructive — uses the documented red-edge palette)
- Background: `bg-slate-900 text-white`

### Tier 2 — Toolbar
- Canvas name (click-to-edit) + description (click-to-edit) on the left
- Export action group on the right (Export JSON, Export PPTX)
- Background: `bg-white border-b border-slate-200`

### Tier 3 — Tabs
- Tab strip switching between Canvas, Instructions, and any future tabs
- Active tab: `text-blue-600 border-b-2 border-blue-600`
- Inactive: `text-slate-400 hover:text-slate-600`

Each tier has a distinct visual weight so the user's eye is drawn to whichever level they're operating at.

## How It Works

The Tier 1 header is hand-coded in `+page.svelte` (the standalone entrypoint). The Tier 2 toolbar lives in a shared `Toolbar.svelte` component each SA app extends. The Tier 3 tabs come from the shared `ContractLayout.svelte` / `IPCLayout.svelte` style canvas components which carry their own tab state.

When the IPC is embedded inside the Context Plane, the parent CP frontend renders Tier 1 (its own app header) and Tier 3 (its own tab strip) directly, while the IPC's canvas component receives `showSwitcher={false} showToolbar={false} showTabs={false}` props and just renders the canvas grid. Same component, two different header contexts.

## Key Benefits

- **Predictable navigation** — users moving between SA apps find the same controls in the same places
- **Cleaner visual hierarchy** — three tiers separate global / canvas / view-level controls
- **Embedded-mode polish** — the canvas component renders cleanly inside the Context Plane without duplicate headers
- **Documented pattern** — `design/DESIGN_SYSTEM.md` carries the full toolbar tier specification, so every new SA app gets the layout for free

The release is available now in the Context Plane monorepo at `apps/information-product-canvas/`.
