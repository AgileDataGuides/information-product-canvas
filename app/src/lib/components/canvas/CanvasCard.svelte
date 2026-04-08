<script lang="ts">
	import { getContext } from 'svelte';
	import type { DataAdapter, ContextNode } from '$lib/types/shared';

	const adapter = getContext<DataAdapter>('dataAdapter');

	let {
		node,
		color = '#6b7280',
		onSelect,
		onDelete,
		isSelected = false
	}: {
		node: ContextNode;
		color?: string;
		onSelect: (id: string) => void;
		onDelete?: (id: string) => void;
		isSelected?: boolean;
	} = $props();

	let editingName = $state(false);
	let editName = $state('');
	let nameInputEl = $state<HTMLInputElement | null>(null);

	function startEditName(e: MouseEvent) {
		e.stopPropagation();
		editName = node.name;
		editingName = true;
		setTimeout(() => nameInputEl?.focus(), 0);
	}

	async function saveName() {
		const trimmed = editName.trim();
		editingName = false;
		if (!trimmed || trimmed === node.name) return;
		await adapter.updateNode(node.id, { name: trimmed });
	}

	function handleNameKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') { e.preventDefault(); saveName(); }
		else if (e.key === 'Escape') { editingName = false; }
	}
</script>

<div
	data-node-id={node.id}
	class="w-full text-left p-2 rounded-lg border transition-all hover:shadow-md cursor-pointer group {isSelected ? 'ring-2 ring-blue-500 ring-offset-1' : ''}"
	style="border-color: {color}30; background-color: {color}08;"
	role="button"
	tabindex="0"
	onclick={() => onSelect(node.id)}
	onkeydown={(e) => e.key === 'Enter' && onSelect(node.id)}
>
	<div class="flex items-start gap-1.5">
		<span
			class="w-2 h-2 rounded-full shrink-0 mt-1"
			style="background-color: {color}"
		></span>
		<div class="min-w-0 flex-1">
			{#if editingName}
				<input
					bind:this={nameInputEl}
					bind:value={editName}
					onblur={saveName}
					onkeydown={handleNameKeydown}
					onclick={(e) => e.stopPropagation()}
					type="text"
					class="w-full px-1 py-0 text-xs font-medium text-slate-800 border border-blue-400 rounded bg-white outline-none focus:ring-1 focus:ring-blue-400"
				/>
			{:else}
				<button
					class="w-full text-left text-xs font-medium text-slate-800 leading-tight line-clamp-2 group-hover:text-slate-900 hover:bg-white/60 rounded px-1 -mx-1 cursor-text"
					onclick={startEditName}
					title="Click to edit name"
				>
					{node.name}
				</button>
			{/if}
		</div>
		{#if onDelete && !editingName}
			<button
				onclick={(e) => { e.stopPropagation(); onDelete(node.id); }}
				class="w-4 h-4 shrink-0 flex items-center justify-center rounded opacity-0 group-hover:opacity-100 hover:bg-red-100 text-slate-300 hover:text-red-500 transition-all"
				title="Delete"
			>
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-3 h-3">
					<path fill-rule="evenodd" d="M5 3.25V4H2.75a.75.75 0 0 0 0 1.5h.3l.815 8.15A1.5 1.5 0 0 0 5.357 15h5.285a1.5 1.5 0 0 0 1.493-1.35l.815-8.15h.3a.75.75 0 0 0 0-1.5H11v-.75A2.25 2.25 0 0 0 8.75 1h-1.5A2.25 2.25 0 0 0 5 3.25Zm2.25-.75a.75.75 0 0 0-.75.75V4h3v-.75a.75.75 0 0 0-.75-.75h-1.5ZM6.05 6a.75.75 0 0 1 .787.713l.275 5.5a.75.75 0 0 1-1.498.075l-.275-5.5A.75.75 0 0 1 6.05 6Zm3.9 0a.75.75 0 0 1 .712.787l-.275 5.5a.75.75 0 0 1-1.498-.075l.275-5.5A.75.75 0 0 1 9.95 6Z" clip-rule="evenodd" />
				</svg>
			</button>
		{/if}
	</div>
</div>
