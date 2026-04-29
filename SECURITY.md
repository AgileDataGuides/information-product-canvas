# Security Policy

## Threat model

The Information Product Canvas is a **local-only dev tool**. It is designed to run on your own machine, alongside Claude Code or another local AI assistant. It is NOT designed for:

- Multi-user deployment
- LAN exposure
- Internet-facing deployment
- Storing sensitive / regulated data

The dev server binds to `127.0.0.1:5115` and the SvelteKit `+server.ts` API routes write JSON files directly to `data/`. There is no authentication. Anyone who can reach the port can read, overwrite, or delete your canvases.

If you need to share a canvas, use the **Export JSON / PowerPoint** buttons and share the downloaded files — never the server.

## Supported versions

Only the latest commit on `main` is supported. We don't backport security fixes to older releases. If you're running a fork, rebase onto current `main` to pick up patches.

## Reporting a vulnerability

Please report security issues privately to [shane.gibson@agiledata.io](mailto:shane.gibson@agiledata.io). Include:

- A description of the issue and the impact you believe it has.
- Steps to reproduce, or a proof-of-concept if available.
- The commit SHA you tested against.

We aim to acknowledge within **3 working days** (NZ time) and fix or publicly document within **14 days** for issues with realistic impact under the stated threat model.

**Do NOT** open a public GitHub issue for vulnerability reports — opening one accidentally is fine, just close it and email us instead.

## Out of scope

The following are intentional design choices, not vulnerabilities:

- **No authentication.** The app runs locally, so there's no user to authenticate. If you need multi-user access, use the upstream Context Plane app instead.
- **CSP `'unsafe-inline'`.** Required by SvelteKit hydration and Tailwind. Removing it breaks the app.
- **Filesystem writes from the dev API routes.** The threat model assumes you trust your own machine. The API rejects oversize bodies, structurally invalid models, and path-escape attempts via `safeFilePath()`, but it doesn't try to defend against an attacker who already has shell access.
- **`data/*.json` file format.** Anyone with shell access can hand-edit the JSON files. That's by design — it's also how the included Claude skill reads your canvases.

## Hardening

We do enforce some hardening even within the local-only threat model:

- The dev server binds to loopback (`127.0.0.1`), never `0.0.0.0`. Do NOT change `vite.config.ts` `server.host`.
- All API write routes (POST `/api/models`, PUT `/api/models/[id]`) cap the request body at 5 MB and reject non-JSON or structurally invalid models.
- The `informationProducts` array is capped at 100 entries to prevent runaway state on the client.
- File paths from URL params are filtered through `safeFilePath()` (kebab-case regex + path-prefix check) so `../../etc/passwd`-style traversal can't escape `data/`.
- PowerPoint export uses `pptxgenjs` (actively maintained). We do not depend on the abandoned `xlsx` package.
- Dependabot watches `package.json` and the GitHub Actions workflow for vulnerable updates.
- The `main` branch is protected against force-push, deletion, and merge-commit (linear history required) — prevents accidental history loss even from admins.
