<script lang="ts">
	import { getContext } from 'svelte';
	import type { DataAdapter, ContextNode } from '$lib/types/shared';

	const adapter = getContext<DataAdapter>('dataAdapter');

	let {
		node,
		color = '#6b7280',
		onSelect,
		isSelected = false
	}: {
		node: ContextNode;
		color?: string;
		onSelect: (id: string) => void;
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
	</div>
</div>
