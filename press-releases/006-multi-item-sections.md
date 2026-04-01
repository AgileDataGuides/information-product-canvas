# Vision, Delivery Types, Data Sync and Outcomes Now Support Multiple Items

**FOR IMMEDIATE RELEASE**
**Date: 2026-04-01**

## Four IPC canvas sections upgraded from single-value to multi-item

**Wellington, New Zealand** — The Information Product Canvas app now allows users to add multiple items to Vision, Delivery Types, Data Sync, and Outcomes/Actions sections. Previously, adding a second item to any of these sections would silently overwrite the first.

### What Changed

Four fields on the InformationProduct were converted from simple strings to proper arrays:

- **Vision** — was a single string, now supports multiple vision statements
- **Delivery Types** — was a single string, now supports multiple delivery channels
- **Data Sync** — was a single string, now supports multiple sync approaches
- **Outcomes/Actions** — was attached to individual Business Questions, now a standalone list on the Information Product

### Backward Compatibility

A migration function (`migrateModel()`) runs automatically whenever a model is loaded. Old JSON files with single-value strings are silently converted to the new array format. No manual data migration is required.

### Files Changed

- `types.ts` — new array fields (`visions`, `deliveryTypes`, `dataSyncs`, `actionOutcomes`), old string fields deprecated
- `stores/ipc.svelte.ts` — updated LABEL_TO_SECTION mapping, migration function, CRUD operations
- `converters/context-plane.ts` — both directions use arrays
- `standalone-io.ts` (CP import/export) — handles both old and new formats

---

**Contact:** Context Plane Team
