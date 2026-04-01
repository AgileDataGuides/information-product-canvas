# Information Product Canvas -- Architecture

> For onboarding another AI session or developer to this codebase without scanning files.

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | SvelteKit | 2.50.2 |
| UI Library | Svelte 5 (runes) | 5.51.0 |
| CSS | Tailwind CSS | 4.0.0 |
| Bundler | Vite | 7.3.1 |
| Language | TypeScript | 5.9.3 |
| Database | None - JSON file persistence | - |
| SSR | Disabled | - |
| PPTX Export | PptxGenJS | 4.0.1 |

Dev server runs on port **5115**.

## Directory Structure

```
/
├── app/                            # SvelteKit application
│   ├── package.json
│   ├── svelte.config.js            # Adapter + runes enabled
│   ├── vite.config.ts              # Tailwind plugin + $data alias, port 5115
│   ├── tsconfig.json
│   └── src/
│       ├── app.css                 # Tailwind import + base styles
│       ├── app.html
│       ├── lib/
│       │   ├── types.ts            # Core interfaces (IPCModel, InformationProduct, IPCItem, BusinessQuestion, IPCNode)
│       │   ├── index.ts            # Re-exports
│       │   ├── manifest.ts         # AppManifest for Context Plane
│       │   ├── export-pptx.ts      # Client-side PPTX generation (PptxGenJS, ADG template)
│       │   ├── constants/
│       │   │   └── context-types.ts # Entity type configs with colors
│       │   ├── stores/
│       │   │   └── ipc.svelte.ts   # Centralized reactive store
│       │   ├── adapters/
│       │   │   └── standalone-adapter.ts  # Full DataAdapter with CRUD callbacks
│       │   ├── components/
│       │   │   ├── Toolbar.svelte         # SA Standalone Toolbar (switcher, New Canvas, Save, Delete, Export PPTX, Export JSON, Import JSON)
│       │   │   └── canvas/
│       │   │       ├── IPCLayout.svelte   # 5-column grid layout
│       │   │       ├── CanvasSection.svelte  # Reusable section with add
│       │   │       └── CanvasCard.svelte     # Node card with inline edit
│       │   └── converters/
│       │       └── context-plane.ts       # Bidirectional CP converter
│       └── routes/
│           ├── +layout.svelte      # App shell (header)
│           ├── +page.svelte        # Root page, calls initStore()
│           └── api/models/
│               ├── +server.ts      # GET (list all), POST (create)
│               └── [id]/+server.ts # GET, PUT, DELETE single model
├── data/                           # JSON file storage
│   └── *.json                      # Saved IPC models
├── manifest.ts                     # AppManifest for Context Plane
├── start.sh                        # Bash startup script
└── start-IPC.command               # macOS double-clickable launcher
```

## Data Model

### IPCModel (JSON Schema)

```typescript
interface IPCItem {
  id: string;
  name: string;
  description: string;
}

interface BusinessQuestion extends IPCItem {
  actionOutcome: string;
}

interface InformationProduct {
  id: string;
  name: string;
  description: string;
  productOwner: string;       // single-value string
  tshirtSize: string;         // single-value string
  visions: IPCItem[];         // was: vision: string (migrated)
  deliveryTypes: IPCItem[];   // was: deliveryType: string (migrated)
  dataSyncs: IPCItem[];       // was: dataSync: string (migrated)
  actionOutcomes: IPCItem[];  // was: actionOutcome on BusinessQuestion (migrated)
  personas: IPCItem[];
  businessQuestions: BusinessQuestion[];
  coreBusinessEvents: IPCItem[];
  featureStories: IPCItem[];
  willWont: IPCItem[];
}

interface IPCModel {
  version: string;
  id: string;
  name: string;
  description: string;
  informationProducts: InformationProduct[];
  sharedPersonas: IPCItem[];
  sharedBusinessQuestions: IPCItem[];
  sharedCoreBusinessEvents: IPCItem[];
}
```

### Root Entity Pattern

The IPC uses a root entity `ipc_model` that groups Information Products via `has_info_product` links. This is the same pattern used by other standalone apps (e.g., `gls_glossary` / `has_term`, `dict_dictionary` / `has_dataset`).

## Data Flow

```
User Interactions (Svelte Components)
         |
         v
Reactive Store (ipc.svelte.ts)
  |-- store.model        <-- current IPCModel
  |-- store.dirty        <-- tracks unsaved changes
  |-- store.savedList    <-- available models [{id, name}]
  |-- store.loaded       <-- initialization flag
         |
         v (on save/create/delete/switch)
SvelteKit API Routes (/api/models)
         |
         v
Filesystem (/data/*.json)
```

## Canvas Layout

The IPC canvas is a 5-column grid displaying each Information Product across these sections:

| Column | Content |
|--------|---------|
| 1 | Name, Product Owner, T-Shirt Size / Outcomes |
| 2 | Vision |
| 3 | Personas / Delivery Types |
| 4 | Data Sync / Business Questions |
| 5 | Core Business Events / Feature Stories / Will-Won't |

`IPCLayout.svelte` accepts a `showCanvasSelector` prop (default `true` for Context Plane, `false` for standalone).

## Context Plane Integration

This app operates both as a standalone app and as an embedded canvas inside the Context Plane.

### Entity & Relationship Types

| Entity Type | Description |
|------------|-------------|
| `ipc_model` | Root entity grouping Information Products |
| `global_info_product` | An Information Product (global, shared) |
| `global_persona` | A consumer persona (global, shared) |
| `global_business_question` | A business question (global, shared) |
| `global_core_business_event` | A core business event (global, shared) |
| `ipc_feature_story` | A feature story for an Information Product |
| `ipc_will_wont` | A will/won't scope item |
| `ipc_product_owner` | Product owner of an Information Product |
| `ipc_tshirt_size` | T-shirt size estimate |
| `ipc_vision` | Vision statement |
| `ipc_delivery_type` | How the product is delivered |
| `ipc_data_sync` | Data synchronisation approach |
| `ipc_action_outcome` | Action/outcome tied to a business question |

| Relationship | Source -> Target |
|-------------|-----------------|
| `has_info_product` | `ipc_model` -> `global_info_product` |
| `consumed_by` | `global_info_product` -> `global_persona` |
| `answers` | `global_info_product` -> `global_business_question` |
| `sourced_from` | `global_info_product` -> `global_core_business_event` |
| `includes_feature` | `global_info_product` -> `ipc_feature_story` |
| `scoped_by` | `global_info_product` -> `ipc_will_wont` |
| `owned_by` | `global_info_product` -> `ipc_product_owner` |
| `sized_as` | `global_info_product` -> `ipc_tshirt_size` |
| `fulfills_vision` | `global_info_product` -> `ipc_vision` |
| `delivered_via` | `global_info_product` -> `ipc_delivery_type` |
| `synced_by` | `global_info_product` -> `ipc_data_sync` |
| `drives_action` | `global_info_product` -> `ipc_action_outcome` |

### Data Migration (v1 → v2)

Four fields were converted from single-value strings to multi-item arrays:

| Old field | New field | Migration |
|-----------|-----------|-----------|
| `vision: string` | `visions: IPCItem[]` | String → single-item array |
| `deliveryType: string` | `deliveryTypes: IPCItem[]` | String → single-item array |
| `dataSync: string` | `dataSyncs: IPCItem[]` | String → single-item array |
| `BusinessQuestion.actionOutcome` | `actionOutcomes: IPCItem[]` on IP | Moved from BQ to IP-level array |

The `migrateModel()` function in `ipc.svelte.ts` runs automatically on every model load (init, switch, import). It detects old-format data and converts it in place. Old JSON files continue to work without manual intervention.

### Context Plane Import/Export

- `src/lib/converters/context-plane.ts` -- bidirectional converters:
  - `ipcToContextPlane(model)` -> `{ nodes: ContextNode[], links: ContextLink[] }`
  - `contextPlaneToIpc(data)` -> `IPCModel`
- Export/Import supports auto-detect: `{ nodes, links }` Context Plane format OR native `{ informationProducts }` format
- The `@context-plane/shared` package provides `ContextNode` and `ContextLink` types

## Canvas Deduplication (Phase 8)

This app now exports its canvas layout as a reusable component that the Context Plane imports directly via pnpm workspace dependency. There is a single source of truth for the IPC canvas UI.

### Exported components

The `package.json` `exports` field exposes:
- `IPCLayout.svelte` -- the 5-column grid layout
- `CanvasSection.svelte` and `CanvasCard.svelte` -- supporting components
- `export-pptx` -- PPTX generation module
- `converters/context-plane` -- bidirectional converters
- `constants/context-types` -- entity type configurations

### Standalone adapter

`src/lib/adapters/standalone-adapter.ts` implements the `DataAdapter` interface from `@context-plane/shared`, wrapping the IPC store. It is set via `setContext('dataAdapter', adapter)` in `+page.svelte`.

### How it works

- All canvas components use `ContextNode` types and `getContext<DataAdapter>('dataAdapter')` for mutations
- In standalone mode, the standalone adapter wraps the native IPC store
- In embedded mode (Context Plane), the DuckDB-backed `DataAdapter` is provided by the host
- The component has zero knowledge of which mode it is running in

## Toolbar Patterns

### SA Standalone Toolbar

The standalone Toolbar follows the Design System SA Standalone Toolbar pattern:
- Model switcher dropdown with inline "New Canvas" option
- Save / Saved button with dirty state tracking
- Delete button
- Export PPTX button
- Export JSON / Import JSON buttons (auto-detect format)

### CP Canvas Sub-Header

When embedded in the Context Plane, the canvas sub-header uses a blue accent theme (`text-blue-700 border-blue-300`) with:
- Model switcher
- New Canvas
- Delete
- Export PPTX
- Export JSON / Import JSON

## PPTX Export

`src/lib/export-pptx.ts` generates client-side PowerPoint slides using PptxGenJS, matching the ADG Google Slides template:
- Green header with Information Product Name, Product Owner, T-Shirt Size
- Canvas grid with bordered cells for each section
- Vision section with FOR / WHO / THE / THAT / UNLIKE green pills
- CC BY-SA 4.0 footer on each slide
- One slide per Information Product

## Running the App

```bash
# From project root
./start.sh              # Terminal
# or double-click start-IPC.command on macOS

# Manual
cd app && pnpm install && pnpm dev --port 5115
```

Access at http://localhost:5115
