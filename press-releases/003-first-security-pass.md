# Information Product Canvas Ships First Security Hardening Pass

**1 April 2026**

AgileDataGuides today released a security hardening pass for the Information Product Canvas covering ten distinct fixes — input validation, request body limits, file path safety, HTTP response hardening, CSP compatibility, and explicit reinforcement that the app is a local-only dev tool. The threat model — single-user, loopback-only — hasn't changed; this release closes every gap that existed inside that model.

## The Problem

The first build of the IPC was functional but trusted its input. The API routes accepted unbounded request bodies, didn't validate request shapes before writing JSON to disk, didn't sanitise filenames being used for path construction, and let SvelteKit's default error pages leak stack traces. A misconfigured Content Security Policy was also blocking SvelteKit's inline hydration scripts — visible in the demo, but the same path applied locally.

There was no public security policy, no statement of threat model, no clear way for someone to report an issue privately.

## The Solution

A focused review-driven pass landed ten fixes:

- **Bounded request bodies** — POST `/api/models` and PUT `/api/models/[id]` cap the body size and reject requests that exceed it with a 413, before any JSON parsing.
- **Stricter `isValidModel`** — the model validator structurally checks that each canvas array (`personas`, `businessQuestions`, `events`, etc.) is actually an array, not just present. Malformed payloads get rejected before they hit disk.
- **Filename safety** — IDs from URL params are filtered through a kebab-case regex + path-prefix check, so traversal attempts (`../../etc/passwd`) can't escape the data directory.
- **Try/catch around `JSON.parse`** — malformed JSON now returns a clean 400 instead of crashing the route handler and surfacing a stack trace.
- **`crypto.randomUUID` for new IDs** — replaces the older Math.random()-based ID generator. Cryptographically strong + collision-free.
- **PUT id reconciliation** — saving a canvas forces `model.id = params.id` so the on-disk filename and internal id can never drift apart.
- **CSP fix** — the original CSP blocked SvelteKit's inline hydration scripts. Adjusted to allow `'unsafe-inline'` for `<script>` (required by SvelteKit) while keeping everything else locked down.
- **`initStore` error handling** — startup failures now show a clean error in the UI instead of leaving the app in an unloadable state.
- **Loopback enforcement** — the dev server is configured to bind to `127.0.0.1` only, never `0.0.0.0`. Comments and start-script banners explicitly call out that the app must NOT be exposed to a LAN.
- **Threat model documented** — the README now explicitly states the IPC is a local-only single-user dev tool.

## How It Works

Each `+server.ts` API route uses a shared `readJsonBody()` helper that reads the request body as text, caps it at the documented size, parses inside a try/catch, and rejects oversize / malformed inputs with appropriate status codes. Filenames flow through `safeFilePath()` which combines a kebab-case format check with a `path.resolve` prefix verification. Both helpers are tested and reused everywhere a route accepts user input.

## Key Benefits

- **Defence in depth** — every API route now defends its inputs at three layers: HTTP, structural, and filesystem
- **Explicit threat model** — the README says what the app is designed for and what it's NOT, so users know exactly what they're running
- **Clean error paths** — bad requests no longer leak stack traces or crash the route handler
- **CSP-compatible** — works in stricter browser security contexts without disabling CSP entirely
- **Loopback-locked** — the app refuses to bind to a public interface, hard-coded into the dev server config

The hardened Information Product Canvas is available now at [github.com/AgileDataGuides/information-product-canvas](https://github.com/AgileDataGuides/information-product-canvas).
