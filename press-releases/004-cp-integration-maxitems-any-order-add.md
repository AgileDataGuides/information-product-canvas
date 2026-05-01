# IPC Embeds Cleanly into the Context Plane with Single-Item Sections and Any-Order Add

**2 April 2026**

AgileDataGuides today released a cluster of refinements to the Information Product Canvas making it ready for first-class embedding inside the wider Context Plane app. Single-item sections now render as a single card without an empty-list affordance, items can be added to any section in any order without being forced through a fixed wizard flow, and the canvas grid layout is fixed for embedded mode where the available width is constrained.

## The Problem

The standalone IPC was built around the assumption that every section is a list — which works for sections like Personas and Business Questions, but felt awkward for the singular Information Product itself, which is exactly one card. The empty-list state showed an `+ Add` placeholder even after the user had filled in the product, because the section didn't know it was supposed to cap at one.

The original add flow also assumed users would walk through the canvas left-to-right, top-to-bottom — but real teams jump around, filling in business questions first, vision third, personas fifth. The form-style flow blocked them.

When embedded inside the Context Plane (where the canvas shares horizontal space with the sidebar and detail panel), the five-column grid would overflow or compress unattractively, depending on screen width.

## The Solution

Three changes shipped together:

### Single-item sections via `maxItems`

A new `maxItems` prop on `CanvasSection` caps how many cards a section will accept. The Information Product section uses `maxItems={1}` — once a card is there, the `+ Add` button hides. The single card behaves identically to a list card in every other respect (click to open, click to inline-edit, drag to reorder — though there's nothing to reorder when there's only one).

### Any-order add

The original "next-section-please" form flow is gone. Every section's `+ Add` button is independent. Users can fill in business questions first, then jump to delivery types, then vision, then back to personas, in any order. There's no wizard, no required sequence, and no "complete this step before moving on" prompt.

### Embedded grid fix

The canvas layout now uses a CSS-grid template that responds correctly when embedded. The five columns become flexible tracks instead of fixed widths, sections wrap below a minimum threshold, and the grid no longer overflows the container in the Context Plane sidebar layout.

## Key Benefits

- **Single-item sections work properly** — the Information Product card sits as a single card, no awkward empty-list affordance
- **Frictionless data entry** — fill in any section, in any order, no wizard stopping users
- **Embeds cleanly in CP** — same canvas component rendered in the standalone app and the Context Plane, shared layout works in both contexts
- **Forward-compatible** — `maxItems` is a generic constraint; future apps with their own singular-card sections (Data Asset on Data Contract, Architecture Name on Checklist) inherit the same behaviour automatically

The release is available now in the Context Plane monorepo at `apps/information-product-canvas/`.
