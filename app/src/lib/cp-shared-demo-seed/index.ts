/**
 * Shared demo-seed helper for SA apps' GitHub Pages demo builds.
 *
 * Every SA app that publishes a demo (data-contract, BEM, IPC, ...) ships
 * a set of bundled example JSONs that should appear in the visitor's
 * `localStorage` on first load. The naive "seed-if-empty" approach misses
 * a real use-case: when the publisher updates the bundled examples and
 * re-publishes, returning visitors don't see the update because their
 * cached `localStorage` "wins".
 *
 * `applyDemoSeeds(config)` solves this with a version-aware overlay:
 *
 *   - First visit (empty `localStorage`):
 *       Seeds every example.
 *   - Returning visitor with stored version === `config.seedVersion`:
 *       No-op. User-edited state wins.
 *   - Returning visitor with stored version older / missing:
 *       Overlays the seeds BY ID — overwrites any existing entry whose
 *       ID matches a seed (so user edits to bundled examples ARE lost on
 *       a publisher refresh; intentional, that's how a "we shipped new
 *       examples" announcement reaches existing users). Entries the user
 *       CREATED with new IDs are left untouched.
 *
 * Usage in an SA app:
 *
 *   // apps/<app>/app/src/lib/stores/demo-seed.ts
 *   import { applyDemoSeeds } from '$lib/cp-shared-demo-seed';
 *   import contractA from '$data/contract-a.json';
 *   import contractB from '$data/contract-b.json';
 *
 *   export function seedDemo() {
 *     applyDemoSeeds({
 *       lsKey: 'data-contract-demo-models',
 *       seedVersionKey: 'data-contract-demo-seed-version',
 *       seedVersion: '2026-05-05',
 *       seeds: [contractA, contractB],
 *       migrate: (m) => migrateModel(m as Record<string, unknown>)
 *     });
 *   }
 *
 * The `migrate` callback is optional but every store ships one to handle
 * version upgrades; pass it through so seeds are normalised the same way
 * a reload from disk would be.
 *
 * Why this lives in the shared package and not per-app:
 *  - The pattern is identical across SA apps; one bug-fix in shared
 *    propagates to all of them.
 *  - The `$data` alias is per-app, so each SA app still owns its OWN
 *    `demo-seed.ts` to declare its bundled JSONs. This helper just owns
 *    the localStorage overlay logic.
 */

export interface DemoSeed {
	id: string;
	[key: string]: unknown;
}

export interface DemoSeedConfig<T extends DemoSeed> {
	/** localStorage key under which all models live (e.g. `data-contract-demo-models`). */
	lsKey: string;
	/** localStorage key for the stored seed version (sibling to lsKey). */
	seedVersionKey: string;
	/** Bumped by the publisher when bundled JSONs change. ISO date works well. */
	seedVersion: string;
	/** The bundled example models, imported via the SA's `$data` Vite alias. */
	seeds: T[];
	/** Optional migration callback — run per seed before storing. */
	migrate?: (m: Record<string, unknown>) => T;
}

/**
 * Apply the version-aware seed overlay. Call from the SA app's
 * `+page.svelte` / `+layout.svelte` `onMount` BEFORE `initStore()`,
 * gated by `import.meta.env.VITE_DEMO_MODE === 'true'`. No-op outside
 * the browser.
 */
export function applyDemoSeeds<T extends DemoSeed>(config: DemoSeedConfig<T>): void {
	if (typeof window === 'undefined') return;

	let existing: Record<string, T> = {};
	try {
		const raw = localStorage.getItem(config.lsKey);
		existing = raw ? JSON.parse(raw) : {};
	} catch {
		existing = {};
	}

	const storedVersion = localStorage.getItem(config.seedVersionKey);
	const isFresh = Object.keys(existing).length === 0;
	const seedVersionStale = storedVersion !== config.seedVersion;

	if (!isFresh && !seedVersionStale) return;

	const merged: Record<string, T> = { ...existing };
	for (const m of config.seeds) {
		const cloned = JSON.parse(JSON.stringify(m)) as Record<string, unknown>;
		const final = config.migrate ? config.migrate(cloned) : (cloned as T);
		merged[final.id] = final;
	}
	localStorage.setItem(config.lsKey, JSON.stringify(merged));
	localStorage.setItem(config.seedVersionKey, config.seedVersion);
}
