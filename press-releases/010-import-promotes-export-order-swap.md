# Import Button Promoted to App Header, Export Order Reorganised

**24 April 2026**

AgileDataGuides today released a small but consequential UX cleanup of the Information Product Canvas toolbar. The Import button moves from the canvas-level Tier 2 toolbar up into the dark Tier 1 App Header — sitting next to New Canvas and Delete — and the Export buttons swap order so the more common JSON export sits to the left of PPTX.

## The Problem

The Import button had been parked in the Tier 2 toolbar alongside Export JSON and Export PPTX, which felt natural at first glance — Import and Export are conceptually paired actions. But the placement was wrong in two ways:

1. **Import always creates a NEW canvas.** It never replaces the current one. Conceptually it's a creation action, not a per-canvas one — so it belongs alongside New Canvas in Tier 1, not next to per-canvas Export.
2. **Users hunted for it.** When someone wants to import a canvas, the muscle-memory destination is the top-right of the app header where New Canvas lives. They rarely think to look in the canvas-level toolbar.

Separately, the Export buttons were ordered Export PPTX → Export JSON. PPTX export is useful but niche; JSON is what most users reach for daily (sharing, version control, Claude). Putting the more common action on the right made it the harder one to hit.

## The Solution

Two related changes:

### Import moves to Tier 1

The Import button now sits in the dark App Header next to New Canvas. The visual grouping makes the conceptual grouping obvious — both create a new canvas. Tier 2 keeps the canvas-level actions (canvas name, description, exports). Same change applied to every SA app at the same time so the pattern holds across IPC, BEM, Glossary, Dictionary, Concept Model, Checklist, and Data Contract.

### Export JSON moves to the left

The Tier 2 Export action group now reads JSON → PPTX, left to right. JSON is the daily-driver export so it gets the leftmost position; PPTX is for sharing with non-technical stakeholders and sits to the right. Matches the visual scanning order most users follow.

## Key Benefits

- **Import is where users look for it** — Tier 1 alongside New Canvas and Delete
- **Conceptual grouping matches visual grouping** — creation actions in Tier 1, per-canvas actions in Tier 2
- **Exports follow frequency-of-use order** — JSON (daily) on the left, PPTX (occasional) on the right
- **Cross-app consistency** — every SA app got the same treatment so the pattern holds wherever users land

The release is available now in the Context Plane monorepo at `apps/information-product-canvas/`.
