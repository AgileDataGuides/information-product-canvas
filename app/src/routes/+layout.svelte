<script lang="ts">
	import '../app.css';
	let { children } = $props();

	const demoMode = import.meta.env.VITE_DEMO_MODE === 'true';
</script>

<svelte:head>
	<title>Information Product Canvas</title>
</svelte:head>

<div class="flex flex-col h-screen">
	{#if demoMode}
		<div class="bg-sky-50 border-b border-sky-200 px-6 py-2 text-center text-xs text-sky-700 shrink-0">
			<strong>Live Demo</strong> — Your data is saved in your browser's localStorage and never leaves your device.
			<a href="https://github.com/AgileDataGuides/information-product-canvas" target="_blank" rel="noopener" class="underline hover:text-sky-900 font-medium">Download</a> to run locally with file-based storage.
		</div>
	{/if}
	<main class="flex-1 overflow-hidden flex flex-col">
		{@render children()}
	</main>
	<footer class="bg-slate-50 border-t border-slate-200 px-6 py-3 text-center text-[11px] text-slate-400 shrink-0">
		An <a href="https://agiledataguides.com" target="_blank" rel="noopener" class="underline hover:text-slate-600">AgileDataGuides</a> Pattern Template
		&middot; Code: <a href="https://opensource.org/licenses/MIT" target="_blank" rel="noopener" class="underline hover:text-slate-600">MIT</a>
		&middot; Docs: <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener" class="underline hover:text-slate-600">CC BY-SA 4.0</a>
	</footer>
</div>
