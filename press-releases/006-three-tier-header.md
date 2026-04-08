# Canvas Header Redesigned with Three-Tier Layout

**8 April 2026**

AgileDataGuides today released a redesigned canvas header for the Information Product Canvas, replacing the flat toolbar with a structured three-tier layout that scales cleanly across standalone and embedded modes.

## The Problem

As the canvas gained features — model switching, export buttons, tabs, editable names — the single toolbar row became overcrowded. Controls competed for space, and the layout broke down on smaller screens. Worse, when the canvas was embedded inside the Context Plane, irrelevant controls (like the model switcher) still appeared because there was no way to selectively hide tiers.

## The Solution

The header is now organised into three independent tiers, each controlled by a boolean prop:

| Tier | Purpose | Prop |
|------|---------|------|
| **Tier 1** | Model switcher, New Canvas, Delete | `showSwitcher` |
| **Tier 2** | Editable name/description, export buttons | `showToolbar` |
| **Tier 3** | Canvas / Instructions tab switcher | `showTabs` |

Each tier can be shown or hidden independently. In standalone mode all three are visible. When embedded in the Context Plane, Tier 1 is hidden (the sidebar handles model switching) while Tiers 2 and 3 remain.

## Key Benefits

- **Cleaner layout** — each row has a single responsibility
- **Responsive embedding** — the Context Plane hides what it owns, keeps what it doesn't
- **Consistent pattern** — the same three-tier structure is shared across all canvas apps
- **New canvas defaults** — creating a new canvas now auto-populates the Name section with the canvas name, so all sections are immediately usable

The three-tier header is available now in the latest release.
