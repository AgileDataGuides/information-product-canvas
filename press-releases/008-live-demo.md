# Try the Information Product Canvas Online — No Install Required

**9 April 2026**

AgileDataGuides today released a live demo of the Information Product Canvas, available instantly at [agiledataguides.github.io/information-product-canvas](https://agiledataguides.github.io/information-product-canvas). No download, no install, no sign-up — just open the link and start building your first canvas.

This feature was suggested by Nick Zervoudis, who pointed out that people need a way to see how the app works before committing to downloading and running it locally.

## The Problem

Until now, the only way to try the Information Product Canvas was to download the repository, install Node.js, and run it locally. That's a real barrier for people who just want to see what it does — especially non-technical stakeholders like product owners, business analysts, and data leaders who might benefit from the canvas but aren't going to spin up a dev environment to find out.

## The Solution

The live demo runs entirely in the browser as a static site hosted on GitHub Pages. It includes the full *SaaS Revenue Metrics* example canvas so visitors can immediately see a completed canvas and start experimenting with their own.

All data is saved in the browser's localStorage — nothing is sent to any server, and nothing leaves the visitor's device. The demo is functionally identical to the local version, minus the file-based storage and Claude Code integration.

## How It Works

The app detects demo mode at build time via an environment variable. In demo mode, the persistence layer swaps from server API routes (which write JSON files to disk) to browser localStorage. The SvelteKit app is compiled with `adapter-static` to produce a pure client-side single-page application, then automatically deployed to GitHub Pages via a GitHub Actions workflow on every push to main.

A sky-blue banner at the top of the demo tells visitors their data is browser-only and links to the GitHub repo for the full local version.

## Key Benefits

- **Zero friction** — share a link, they're using it in seconds
- **Safe to share** — no server, no API, no file system access, nothing to attack
- **Full experience** — create canvases, edit cards, export JSON, switch between models
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
