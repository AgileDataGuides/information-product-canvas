# The Information Product Canvas Now Runs on SvelteKit 3 and Takes Its Dependency Updates Cleanly

**23 November 2026**

AgileDataGuides today moved the Information Product Canvas to SvelteKit 3, so the public repository builds on current, supported versions of its framework and stops collecting update requests that could never pass.

## The Problem

The public repository had a queue of automated dependency updates waiting for review. Most of them failed their checks. SvelteKit 3 changed where an app keeps its settings and how it finds its own files, so a version bump alone broke the build. The matching adapter updates needed SvelteKit 3 first. TypeScript 7 updates failed because SvelteKit and its type checker both still require TypeScript 6. Anyone looking at the repository saw a pile of red pull requests and no way to tell which ones were safe.

## The Solution

The Information Product Canvas now runs on SvelteKit 3.4 with its current adapters, Vite 8 and current Node type definitions. The build checks on every pull request now run on Node 24 with the latest GitHub Actions. The repository tells its update bot to skip TypeScript 7 until SvelteKit supports it, so the queue only holds updates that can pass.

## How It Works

The app's SvelteKit settings now live in `vite.config.ts`, inside the `sveltekit()` plugin call, because SvelteKit 3 no longer reads `svelte.config.js`. Code inside the app imports its own files through the `#lib` alias that the app's `package.json` declares. Running the app locally now needs Node.js 22.17 or a later 22 release, or Node.js 24 and later (not 23), which is what SvelteKit 3 and its Vite plugin require.

## Key Benefits

- **A clean update queue**: this release meets or passes every open SvelteKit, adapter, Node types and GitHub Actions update, and the update bot stops raising TypeScript 7 bumps that cannot pass.
- **Current, supported framework**: the app picks up SvelteKit's fixes and security updates as they ship.
- **Checks you can trust**: every pull request builds and type-checks on the same Node version the demo deploys with.
- **Same app, same data**: nothing changes in how the canvas looks or works, and saved models load as before.

The SvelteKit 3 release of the Information Product Canvas is available now in the [AgileDataGuides/information-product-canvas](https://github.com/AgileDataGuides/information-product-canvas) repository.
