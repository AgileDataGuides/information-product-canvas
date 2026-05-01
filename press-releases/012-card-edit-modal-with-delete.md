# Click a Card to Edit or Delete — New Card Edit Modal Lands on the Information Product Canvas

**1 May 2026**

AgileDataGuides today released a new card edit modal across every section of the Information Product Canvas. Click any card on the canvas — Persona, Business Question, Action Outcome, Core Business Event, Delivery Type, anything — and a popup opens showing the card's name and description with Cancel, Save, and Delete actions. It's the same shared component that landed on the Business Event Matrix and Data Contract on the same day, so the experience is identical wherever users go.

## The Problem

Until now, the IPC had two separate paths for editing a card and deleting a card — and neither was great. Renaming was inline (click the name to type a new one), but the rest of the card's data (its description, primarily) had no editing affordance at all. Deletion required hovering to reveal a small trash icon — fine when you knew it was there, frustrating to discover when you didn't.

There was no single place that said "this card, in full — edit me." Users frequently asked where to write a description for a Business Question or a Persona; the answer was "you can't, just put it in the name."

## The Solution

A new shared `CardEditModal` component now opens on every card click. The modal shows:

- **Name** — a text input pre-filled with the current name
- **Description** — a multi-line textarea pre-filled with the current description
- **Delete** button on the left (red, separated from the primary actions to reduce mis-click risk)
- **Cancel** + **Save** on the right

Save persists both fields through the app's DataAdapter, which fires the existing autosave debounce so changes hit the JSON file (or localStorage in demo mode) within 300ms. Delete confirms first with a clear "This cannot be undone" message, then removes the card.

The modal is keyboard-friendly: `Esc` closes it, click outside the modal also closes it, the Save button is disabled while the name field is empty.

## How It Works

The modal is implemented as one shared Svelte component in `packages/shared/src/components/CardEditModal.svelte`. Each app passes:
- The selected `node` (the card being edited)
- A `typeLabel` for the modal heading + delete confirm message ("Persona", "Business Question", etc.)
- An `onSave` callback that writes via the adapter
- An `onDelete` callback that deletes via the adapter
- An `onClose` callback to dismiss the modal

The same component drops into every SA app's layout. The IPC's `+page.svelte` derives the `typeLabel` from each card's entity label, so the modal heading reads "Edit Persona" for personas, "Edit Business Question" for questions, etc. — without the modal needing any IPC-specific code.

## Key Benefits

- **One way to edit any card** — same pattern across every section and every SA app
- **Description editing finally has a home** — every card now exposes its description for editing
- **Delete is safe but accessible** — visible Delete button (red, isolated from Save) with explicit confirm
- **Same shared component everywhere** — IPC, BEM, and Data Contract all use the same modal, so users moving between apps don't have to relearn a different popup
- **Keyboard friendly** — Esc to close, Save disabled while name is empty, click-outside to dismiss

The release is available now at [github.com/AgileDataGuides/information-product-canvas](https://github.com/AgileDataGuides/information-product-canvas) and via the [live demo](https://agiledataguides.github.io/information-product-canvas/).
