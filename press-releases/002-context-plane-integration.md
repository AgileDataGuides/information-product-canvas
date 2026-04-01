# Context Plane Integration -- IPC as an Embedded Canvas

**Date:** 2026-03-27

## What's New

- **Canvas deduplication with single source of truth** -- IPCLayout.svelte lives in the standalone IPC app and is the single source of truth for the canvas component. The Context Plane imports it via pnpm workspace dependency, eliminating any duplicated canvas code.

- **DataAdapter pattern for storage abstraction** -- A standalone-adapter.ts wraps the native IPC store behind the DataAdapter interface. In standalone mode, the adapter delegates to localStorage and API routes. In Context Plane mode, the CP provides a DuckDB-backed adapter. The canvas component has zero knowledge of which mode it is running in.

- **Bidirectional converters for import/export** -- Pure functions ipcToContextPlane and contextPlaneToIpc convert between the native IPC JSON format and the Context Plane's { nodes, links } format, enabling seamless data exchange.

- **Global entity types shared across canvases** -- IPC entity types including global_info_product, global_persona, global_business_question, and global_core_business_event are shared across all Context Plane canvases. Entities created in the IPC are automatically visible on other canvases that reference the same global types.
