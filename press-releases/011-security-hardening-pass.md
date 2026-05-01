# Information Product Canvas Ships a Security Hardening Pass

**29 April 2026**

AgileDataGuides today released a security hardening pass for the Information Product Canvas covering dependency CVE patches, server-side request validation upgrades, branch protection, and a published security policy. The threat model — local-only single-user dev tool — hasn't changed; this release closes the gaps that existed even within that model.

## The Problem

A security review identified open vulnerabilities in the IPC's dependency tree, including CVEs in `@sveltejs/kit` and `vite`. The API endpoints accepted an unbounded request body, and the body-size check trusted the client-supplied `Content-Length` header — chunked requests could trivially bypass it. The `main` branch had no protection against accidental force-push or deletion. There was no public security policy, so vulnerability reporters had no clear way to reach the team privately.

## The Solution

A focused hardening pass landed across multiple commits, closing every issue in the review:

- **Dependency CVE patches** — `@sveltejs/kit` bumped to 2.58.0, `vite` to 7.3.2, plus monorepo-wide pnpm overrides forcing transitive vulnerabilities up to safe versions (`dompurify` ≥3.4.0, `cookie` ≥0.7.0, `postcss` ≥8.5.10, `uuid` ≥14.0.0).
- **Server-side body size cap** — the inline `Content-Length` check is replaced with a shared `readJsonBody()` helper that reads the body as text, caps it server-side, and returns a 413 if exceeded. Both POST and PUT use it.
- **PUT id reconciliation** — saving a canvas now forces `model.id = params.id` to prevent on-disk drift between filename and internal id.
- **Stricter request validation** — `isValidModel` now structurally validates that every canvas array (`personas`, `businessQuestions`, `events`, `deliveryTypes`, etc.) is actually an array, not just present, before writing to disk.
- **Local-only commitment reinforced** — comments in `vite.config.ts` and a banner in the start scripts explicitly call out that the dev server binds to loopback and must NOT be exposed to a LAN.
- **`SECURITY.md`** — a public security policy stating the threat model, supported versions, the private vulnerability reporting address, and what's intentionally out of scope vs. in.
- **Dependabot** — a config that watches `package.json` and the GitHub Actions workflow weekly for vulnerable updates. Patch + minor versions get grouped into one PR per week so the queue stays manageable.
- **Branch protection** — a ruleset on `main` blocks force-push, deletion, and merge commits (linear history required), applying to admins as well.

## How It Works

`readJsonBody(request, maxBytes)` is a small shared utility imported by every API route that accepts a body. It reads the body as text first (so the size check is on the actual delivered bytes, not the client-claimed `Content-Length`), bails out with a 413 on exceeding the cap, attempts a `JSON.parse` inside a try/catch, and returns either the parsed object or a structured error response. Every route handler is one line — call the helper, then validate the result. No room for any route to accidentally skip the size check.

`isValidModel` walks every expected array field and confirms `Array.isArray(value)` before letting the model land on disk. Combined with the kebab-case ID regex on filename construction, there's no path from a malformed payload to a corrupted file or a path traversal.

## Key Benefits

- **No known CVEs in dependencies** — every vulnerability the audit flagged is patched
- **Body-size cap is honest** — the server enforces the limit on actual delivered bytes, not the client's claim
- **Filenames stay consistent** — the on-disk filename and internal `id` field can never drift apart
- **Branch protection** — accidental force-push or deletion of `main` is blocked, including for admins
- **Public reporting path** — `SECURITY.md` tells anyone who finds an issue exactly how to reach the team privately
- **Automated updates** — Dependabot keeps the dependency tree fresh without manual triage

The release is available now at [github.com/AgileDataGuides/information-product-canvas](https://github.com/AgileDataGuides/information-product-canvas).
