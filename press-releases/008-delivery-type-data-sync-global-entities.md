# Delivery Type and Data Sync Become Global Entities

**9 April 2026**

AgileDataGuides today released a refactor that promotes Delivery Type and Data Sync from IPC-only entity labels to global entities — `global_delivery_type` and `global_data_sync` — that are reusable across every AgileData canvas. The same Snowflake delivery type a team defines on their Information Product Canvas can now be linked from a Data Contract, a Data Dictionary entry, or any other canvas without being duplicated.

## The Problem

Every Information Product Canvas had its own private list of "delivery types" — Looker, BigQuery, Snowflake, dbt, S3 — and every Data Contract had its own private list of the same things. Even though they were the same concept across every canvas, they couldn't be linked. A user defining `Snowflake` on five different products would have five distinct, unrelated `Snowflake` records, with no way to say "they're all the same thing."

The Information Product also had its own concept of "data sync" — refresh frequency / latency / uptime commitments — that was duplicated separately in the Data Contract canvas. Same shape, different storage, no shared identity.

## The Solution

Two entity-label promotions:

- `ipc_delivery_type` → **`global_delivery_type`**
- `ipc_data_sync` → **`global_data_sync`**

The `global_*` prefix marks these as cross-canvas entities that get matched by name on import (case-insensitive), so the same Snowflake delivery type imported from an IPC and a Data Contract resolves to the same record. The Context Plane's import-export layer already had this convention for `global_persona`, `global_business_question`, `global_concept`, `global_glossary_term`, and `global_info_product` — Delivery Type and Data Sync now join that family.

Existing IPC JSON files auto-migrate on load: `ipc_delivery_type` references rewrite to `global_delivery_type` (same data, new label) and the same for Data Sync. Round-trip exports stay valid against the new schema.

## How It Works

The IPC store still keeps its own arrays (`deliveryTypes`, `dataSyncs`) but the entity label written into the canonical Context Plane graph is now the global form. The bidirectional converter (`src/lib/converters/context-plane.ts`) handles both directions — emit IPC JSON with the global label; import IPC JSON into the Context Plane and the global identity is preserved.

When the same delivery type appears in multiple sources (e.g. an IPC import and a Data Contract import), the Context Plane's name-based deduplication merges them into one global record. The user sees one Snowflake card linked from every canvas that uses it.

## Key Benefits

- **One source of truth per delivery type** — `Snowflake` is one record, used everywhere
- **Cross-canvas linking** — the IPC's delivery type can be the same record the Data Contract is anchored to
- **Round-trip clean** — the graph + JSON formats both round-trip through the new global label
- **Migration is automatic** — older IPC JSON files just work; the rename happens on load

The release is available now in the Context Plane monorepo at `apps/information-product-canvas/`.
