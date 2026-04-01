<script lang="ts">
	import '../app.css';
	let { children } = $props();
</script>

<svelte:head>
	<title>Information Product Canvas</title>
</svelte:head>

<div class="flex flex-col h-screen">
	<header class="bg-slate-900 text-white px-6 py-4 shrink-0">
		<h1 class="text-lg font-bold tracking-tight">Information Product Canvas</h1>
		<p class="text-xs text-slate-400 mt-0.5">Gather Information Product requirements with the Information Product Canvas</p>
	</header>
	<main class="flex-1 overflow-hidden flex flex-col">
		{@render children()}
	</main>
	<footer class="bg-slate-50 border-t border-slate-200 px-6 py-3 text-center text-[11px] text-slate-400 shrink-0">
		An <a href="https://agiledataguides.com" target="_blank" rel="noopener" class="underline hover:text-slate-600">AgileDataGuides</a> Pattern Template
		&middot; Code: <a href="https://opensource.org/licenses/MIT" target="_blank" rel="noopener" class="underline hover:text-slate-600">MIT</a>
		&middot; Docs: <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener" class="underline hover:text-slate-600">CC BY-SA 4.0</a>
	</footer>
</div>
