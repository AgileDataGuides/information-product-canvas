# Information Product Canvas -- Standalone App Launch

**Date:** 2026-03-25

## What's New

- **SvelteKit 5 standalone app with Svelte 5 runes and Tailwind CSS 4** -- The Information Product Canvas is built on the latest Svelte stack, using runes for reactive state management and Tailwind CSS 4 for styling.

- **Canvas layout matching the Agile Data Guides IPC pattern** -- A 5-column grid layout faithfully reproduces the Information Product Canvas pattern from the Agile Data Guides methodology, with columns for Personas, Business Questions, Core Business Events, Feature Stories, and Will/Won't items.

- **Nested JSON data model** -- The data model follows a clean hierarchy: IPCModel contains InformationProducts, each of which contains Personas, Business Questions, Core Business Events, Feature Stories, and Will/Won't items. This maps directly to the visual canvas structure.

- **API-backed persistence with JSON file storage** -- All data is persisted via SvelteKit API routes that read and write JSON files to disk, providing reliable storage without requiring a database.

- **Multiple model support with model switching** -- Users can create and manage multiple IPC models, each containing its own set of Information Products. A model switcher allows quick navigation between models.
