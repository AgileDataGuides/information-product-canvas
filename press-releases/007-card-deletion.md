# Cards Can Now Be Deleted from the Canvas

**8 April 2026**

AgileDataGuides today released an update to the Information Product Canvas that adds the ability to delete individual cards directly from the canvas.

## The Problem

Once a card was added to a canvas section, there was no way to remove it without editing the underlying JSON file. Mistakes, duplicates, and outdated items had to stay on the canvas or be worked around manually.

## The Solution

Every card on the canvas now shows a delete button on hover. Click the trash icon to remove the card from its section immediately. The delete action is available on all multi-item sections — Personas, Business Questions, Core Business Events, Feature Stories, Will/Won't, Vision, Delivery Types, Data Sync, and Outcomes.

## How It Works

Hover over any card to reveal the trash icon in the top-right corner. Click it to remove the card. The deletion is handled through the shared DataAdapter interface, so it works identically in both standalone mode (localStorage) and when embedded in the Context Plane (DuckDB).

## Key Benefits

- **Quick cleanup** — remove mistakes and duplicates without leaving the canvas
- **Consistent interaction** — the same hover-to-reveal pattern used for drag handles and edit actions
- **Works everywhere** — standalone and embedded modes both support deletion
- **Shared component** — the delete button lives in the shared `CanvasCard` component, so all canvas apps benefit automatically

Card deletion is available now in the latest release.
