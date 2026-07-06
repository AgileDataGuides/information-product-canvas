// Ambient module declarations so svelte-check resolves Vite-alias-only
// imports (no .d.ts shipped from Vite for these). $data/*.json is the SA
// app's `data/` directory aliased in vite.config.ts.
declare module '$data/*.json' {
	const value: Record<string, unknown>;
	export default value;
}
