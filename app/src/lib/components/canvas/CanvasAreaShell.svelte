<script lang="ts">
	import type { Snippet } from 'svelte';

	// Visual shell that matches CanvasSection's outer frame (rounded border,
	// tinted header bar, faint body wash) but takes arbitrary content via a
	// children snippet. Use this when a canvas area needs to render something
	// that isn't a list of CanvasCards — e.g. a single property chip, an
	// inline-editable value, or a custom picker. Keeps the canvas visually
	// coherent with CanvasSection-based areas sitting alongside.
	//
	// Colour-token usage mirrors CanvasSection:
	//   border:      {color}30  (30% alpha)
	//   header bg:   {color}12  (12% alpha)
	//   body bg:     {color}04  (4%  alpha)
	//   label text:  {color}    (full)

	let {
		title,
		color,
		trailing,
		children
	}: {
		title: string;
		color: string;
		/** Optional snippet rendered on the right side of the header (e.g. a small count or action) */
		trailing?: Snippet;
		/** The card content */
		children: Snippet;
	} = $props();
</script>

<div class="flex flex-col h-full rounded-lg border overflow-hidden" style="border-color: {color}30;">
	<div class="px-3 py-1.5 shrink-0" style="background-color: {color}12;">
		<div class="flex items-center justify-between">
			<span class="text-[10px] font-bold uppercase tracking-wider" style="color: {color}">{title}</span>
			{#if trailing}
				{@render trailing()}
			{/if}
		</div>
	</div>
	<div class="flex-1 overflow-y-auto p-1.5" style="background-color: {color}04;">
		{@render children()}
	</div>
</div>
