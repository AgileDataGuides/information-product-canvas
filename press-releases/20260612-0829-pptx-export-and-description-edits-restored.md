# Information Product Canvas PPTX Decks Show Real Content Again and Description Edits Now Save

**12 June 2026**

AgileDataGuides today fixed two silent data-loss bugs in the Information Product Canvas: PowerPoint exports that shipped half-empty decks, and card description edits that vanished on save.

## The Problem

When the canvas moved its Vision, Delivery Types, Data Sync and Outcomes fields from single values to multi-item lists, the PowerPoint exporter kept reading the old single-value fields — fields the migration deletes on every load. The result was a professional-looking deck with empty Delivery Types and Data Sync cells, blank Vision pills, and one Outcome where the canvas showed five. Separately, editing a card's description in the standalone app closed the modal as if saved, but the text was silently discarded — only the name field actually persisted.

## The Solution

The PPTX exporter now reads the same multi-item lists the canvas displays, with the old single-value fields kept as a fallback for unmigrated files. Vision pills are built from the structured FOR/WHO/THE/THAT/UNLIKE lines. Card description edits flow through a new store updater that walks every section, so what you type in the modal is what lands on disk — including clearing a description to empty.

## Key Benefits

- **Decks match the canvas** — the shipped SaaS Revenue Metrics example now exports its 3 delivery types, data sync, 5 vision lines and 5 outcomes
- **No more silent description loss** — every card's description saves, in every section
- **Old files still work** — legacy single-value JSONs export correctly via the fallback path

The fixes are available now on `main` in the Context Plane monorepo.
