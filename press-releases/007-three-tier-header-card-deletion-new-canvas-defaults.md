# Three-Tier Header, Per-Card Deletion, and Sensible New-Canvas Defaults

**8 April 2026**

AgileDataGuides today released a UX-cluster update for the Information Product Canvas — the three-tier header structure is fully adopted, every card on the canvas now exposes a delete affordance, and creating a new blank canvas no longer leaves the user staring at an empty grid wondering which section to fill in first.

## The Problem

Three small frictions added up:

1. The header pattern documented in `DESIGN_SYSTEM.md` was partially adopted — the Tier 1 dark header was right, but Tier 2 still mixed canvas name, description, and exports without the visual hierarchy the design system called for.
2. The only way to delete a card was to dive into the card's detail popup, find the Delete button, and confirm. Useful when the popup was already open for editing, but heavy-handed for "I added the wrong thing, I want to remove it now."
3. New canvases started completely empty. The user had to know that a canvas wants Personas, Business Questions, Vision, Delivery Types, Will/Won't, and Features — and knew it was up to them to fill in every section. The result was a lot of half-finished canvases.

## The Solution

Three coordinated changes shipped together.

### Three-tier header structure fully adopted

Tier 2 now has the documented two-column layout: name + description (click-to-edit) on the left in a card-style container, action buttons (Export JSON, Export PPTX, Import) on the right. Tier 3 sits below as a clean tab strip. Visual hierarchy matches the documented pattern exactly.

### Per-card delete affordance

Every card now shows a small red trash icon on hover. One click opens a confirm dialog; one more click and the card is gone. The detail-popup delete path still exists (and is the right place for it when the popup is already open), but the hover-trash provides the fast "remove the card I just added by mistake" path users were missing.

### Sensible new-canvas defaults

A new blank canvas now starts with placeholder structure: each section has the section name + a "Click to add..." placeholder, every section is visible from the moment the canvas opens, and the user can immediately see what's expected. No more empty grid.

## Key Benefits

- **Clean header hierarchy** — three tiers, each with one clear job
- **Fast card removal** — the trash icon is always one hover away
- **Less blank-canvas paralysis** — new canvases start with structure already visible, even if empty
- **Designed-by-default** — the documented design system patterns are the defaults, not aspirations

The release is available now in the Context Plane monorepo at `apps/information-product-canvas/`.
