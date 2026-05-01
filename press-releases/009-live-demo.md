# Try the Information Product Canvas Online — No Install Required

**17 April 2026**

AgileDataGuides today released a live demo of the Information Product Canvas, available instantly at [agiledataguides.github.io/information-product-canvas](https://agiledataguides.github.io/information-product-canvas). No download, no install, no sign-up — just open the link and start mapping requirements.

## The Problem

Until now, the only way to try the Information Product Canvas was to download the repository, install Node.js, run a start script, and wait for it to spin up. That's a real barrier for the data leaders, product owners, and information product managers who would benefit most from the canvas but aren't going to set up a dev environment to try it.

## The Solution

The live demo runs entirely in the browser as a static site hosted on GitHub Pages. It includes the full SaaS Revenue Metrics example canvas so visitors immediately have a populated, real-world canvas to explore and learn from.

All data is saved in the browser's localStorage — nothing is sent to any server, nothing leaves the visitor's device. The demo is functionally identical to the local version, minus the file-based storage and Claude Code integration.

## How It Works

The app detects demo mode at build time via a `VITE_DEMO_MODE=true` environment variable. In demo mode, the persistence layer swaps from server API routes (which write JSON files to disk) to browser localStorage. The SvelteKit app is compiled with `adapter-static` to produce a pure client-side single-page application, then automatically deployed to GitHub Pages via a GitHub Actions workflow on every push to `main`.

The SaaS Revenue Metrics example canvas is bundled at build time and seeded into localStorage on first visit, so visitors land on a populated app rather than an empty one. Subsequent visits load the visitor's own changes from localStorage — the seed only runs when the store is empty.

## Key Benefits

- **Zero friction** — share a link, the recipient is using it in seconds
- **Safe to share** — no server, no API, no file system access, nothing to attack
- **SaaS Revenue example preloaded** — the same example that ships with the local install, so the demo proves the canvas's value within seconds
- **Full experience** — create canvases, edit cards, switch between canvases, export JSON / PPTX, search, drag-to-reorder
- **Private by design** — all data stays in the visitor's browser
- **Always up to date** — auto-deployed from the latest code on every release

## Embedding in Your Site

The demo can be embedded in any website using an iframe:

```html
<iframe src="https://agiledataguides.github.io/information-product-canvas"
        width="100%" height="800" frameborder="0"
        style="border: 1px solid #e2e8f0; border-radius: 8px;">
</iframe>
```

## What's Next

The live demo makes it easy to share the Information Product Canvas with colleagues and stakeholders. Download the [full local version](https://github.com/AgileDataGuides/information-product-canvas) when you're ready for file-based storage and Claude Code integration.

The live demo is available now at [agiledataguides.github.io/information-product-canvas](https://agiledataguides.github.io/information-product-canvas).
