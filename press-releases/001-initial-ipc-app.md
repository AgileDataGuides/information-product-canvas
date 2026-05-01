# Information Product Canvas App Now Available

**25 March 2026**

AgileDataGuides today released the Information Product Canvas, a free, open-source app that helps data teams gather and organise the requirements for an Information Product before they start building it. Each canvas captures the personas, business questions, business events, vision, delivery types, action outcomes, and explicit will/won't scope decisions in one structured visual layout.

## The Problem

Most "information product" projects start with a slide deck, a Confluence page, or a sprawling Slack thread. Six months in, nobody can find the answers to the most basic questions: who is this for, what questions does it answer, what's in scope, what's NOT in scope, and what feeds it. Requirements get re-derived every time someone new joins, and the product drifts because the original commitments are nowhere to be found.

## The Solution

The Information Product Canvas provides a single canonical artefact for an Information Product's requirements. Open the app in a browser, fill in the canvas sections, and the team has a complete shareable requirements document within an hour. Each canvas captures every section needed to design and deliver the product:

- **Personas** — who will use the Information Product
- **Business Questions** — what they need answered
- **Action Outcomes** — what decisions or actions the product enables
- **Core Business Events** — events the product is anchored to
- **Vision** — the long-term aspirational state the product helps deliver
- **Delivery Types** — how the data gets to the consumer (Looker, BigQuery, dbt, …)
- **Will / Won't** — explicit scope decisions in both directions
- **Features** — user stories sized in T-shirts (S/M/L/XL)
- **Information Product** — the product itself with its name, owner, and t-shirt size

## How It Works

Users double-click `start-IPC.command` (macOS) or run `./start-IPC.sh` to launch the app at `localhost:5115`. The canvas appears as a five-column grid, colour-coded by section. Click `+ Add` on any section to add an item. Click an item to view, click again to inline-edit. Changes auto-save to a JSON file in the `data/` folder so they're version-controllable, diffable, and Claude-readable.

Multiple canvases can live side by side via the canvas dropdown — switch between them with one click. The app ships with a starter "SaaS Revenue Metrics" example canvas that demonstrates a complete, real-world Information Product so users land on a populated app the first time they open it.

## Key Benefits

- **One canonical answer** — every requirement lives in one place, not scattered across docs
- **Visual structure** — the canvas layout walks teams through every aspect of an Information Product, no requirement gets forgotten
- **Multiple canvases** — model different products in separate canvases, switch between them with one click
- **JSON-native** — versionable, diff-able, fits any docs or code repo
- **Works with Claude** — export the canvas as JSON and use it with Claude Code or Claude Chat to review, improve, and extend requirements
- **Runs locally** — no cloud accounts, no sign-ups, your data stays on your machine

The Information Product Canvas is available now at [github.com/AgileDataGuides/information-product-canvas](https://github.com/AgileDataGuides/information-product-canvas).
