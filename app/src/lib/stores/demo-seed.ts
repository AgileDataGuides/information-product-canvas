// Demo-mode seed for IPC's standalone GitHub Pages build.
//
// Imports the example IPC model JSONs via the `$data` Vite alias (defined
// in `apps/information-product-canvas/app/vite.config.ts`). The
// version-aware overlay logic lives in `@context-plane/shared/demo-seed`.
//
// Bump SEED_VERSION when bundled JSONs change so returning visitors get
// the updated examples on next load.
//
// Note: IPC's `makeExampleModel()` in ipc.svelte.ts remains as a cold-start
// fallback for non-demo runs (e.g. fresh dev install with no `data/` JSONs).
// In demo mode, this seed file ensures the SaaS Revenue Metrics example
// is always populated, with publisher updates reaching returning visitors.

import { applyDemoSeeds } from '$lib/cp-shared-demo-seed';
import type { IPCModel } from '../types';

import saasRevenueMetrics from '$data/saas-revenue-metrics.json';
import saasRevenueMetrics2 from '$data/saas-revenue-metrics-2.json';

const LS_KEY = 'ipc-demo-models';
const SEED_VERSION_KEY = 'ipc-demo-seed-version';

/** Bump when bundled JSONs change. ISO date format. */
const SEED_VERSION = '2026-05-05';

const SEEDS: IPCModel[] = [
	saasRevenueMetrics as unknown as IPCModel,
	saasRevenueMetrics2 as unknown as IPCModel
];

/**
 * Apply demo seeds. Call from `+page.svelte` `onMount` BEFORE `initStore()`,
 * gated by `VITE_DEMO_MODE === 'true'`.
 */
export function applyIpcDemoSeeds(): void {
	applyDemoSeeds<IPCModel>({
		lsKey: LS_KEY,
		seedVersionKey: SEED_VERSION_KEY,
		seedVersion: SEED_VERSION,
		seeds: SEEDS
		// migrateModel for IPC isn't exported as a pure function; the bundled
		// JSONs are kept in the latest IPCModel shape so no migration needed
		// at seed time.
	});
}
