<script lang="ts">
	import CanvasCard from './CanvasCard.svelte';
	import type { ContextNode, DataAdapter } from '$lib/cp-shared';
	import { getContext } from 'svelte';

	const adapter = getContext<DataAdapter>('dataAdapter');

	let {
		title,
		color,
		nodes,
		entityLabel,
		onSelectNode,
		onAddNode,
		onAddExisting,
		maxItems,
		hideBadges = false,
		addSuggestions
	}: {
		title: string;
		color: string;
		nodes: ContextNode[];
		entityLabel: string;
		onSelectNode: (id: string) => void;
		onAddNode: (entityLabel: string, name: string) => void;
		onAddExisting?: (entityLabel: string) => void;
		maxItems?: number;
		/** When true, cards in this section render as name-only (no type-specific
		 *  metadata badge rows). Details remain available in the node detail popup.
		 *  Used by the Data Contract Schema / Columns grid to keep it uncluttered. */
		hideBadges?: boolean;
		/** Optional predefined values (catalog labels) shown as an HTML datalist
		 *  on the "+ Add" input. Users can pick one or type their own. The store
		 *  is responsible for resolving the chosen label back to a catalog key
		 *  (e.g. via getDeliveryTypeByLabel()). See packages/shared/data/delivery-types.json
		 *  for the Delivery Types catalog — the first use of this mechanism. */
		addSuggestions?: string[];
	} = $props();

	// Unique datalist id per section instance so multiple CanvasSections on
	// the same page don't collide.
	const suggestionsListId = `canvas-section-suggestions-${Math.random().toString(36).slice(2, 10)}`;

	async function handleDeleteNode(id: string) {
		await adapter.deleteNode(id);
	}

	const atLimit = $derived(maxItems != null && nodes.length >= maxItems);

	// --- Drag-and-drop state ---
	let dragId = $state<string | null>(null);
	let dropTargetId = $state<string | null>(null);
	let dropPosition = $state<'before' | 'after'>('before');

	function clearDragState() {
		dragId = null;
		dropTargetId = null;
		dropPosition = 'before';
	}

	function handleDragStart(e: DragEvent, id: string) {
		dragId = id;
		if (e.dataTransfer) {
			e.dataTransfer.effectAllowed = 'move';
			e.dataTransfer.setData('text/plain', id);
		}
	}

	function handleDragOverRow(e: DragEvent, targetId: string) {
		if (!dragId || dragId === targetId) return;
		e.preventDefault();
		const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
		dropPosition = e.clientY < rect.top + rect.height / 2 ? 'before' : 'after';
		dropTargetId = targetId;
	}

	const sortedNodes = $derived(
		[...nodes].sort((a, b) => ((a.properties?.order as number) || 0) - ((b.properties?.order as number) || 0))
	);

	async function handleDrop(e: DragEvent) {
		e.preventDefault();
		if (!dragId || !dropTargetId || dragId === dropTargetId) { clearDragState(); return; }
		const sorted = [...sortedNodes];
		const dragIdx = sorted.findIndex((n) => n.id === dragId);
		let dropIdx = sorted.findIndex((n) => n.id === dropTargetId);
		if (dragIdx === -1 || dropIdx === -1) { clearDragState(); return; }
		const [moved] = sorted.splice(dragIdx, 1);
		dropIdx = sorted.findIndex((n) => n.id === dropTargetId);
		const insertIdx = dropPosition === 'after' ? dropIdx + 1 : dropIdx;
		sorted.splice(insertIdx, 0, moved);
		for (let i = 0; i < sorted.length; i++) {
			const node = sorted[i];
			const newOrder = i + 1;
			if ((node.properties?.order as number) !== newOrder) {
				await adapter.updateNode(node.id, { properties: { ...node.properties, order: newOrder } });
			}
		}
		clearDragState();
	}

	// ── Search filter ──
	let searchQuery = $state('');

	const filteredNodes = $derived.by(() => {
		const q = searchQuery.toLowerCase().trim();
		if (!q) return sortedNodes;
		return sortedNodes.filter((n) => n.name.toLowerCase().includes(q));
	});

	let adding = $state(false);
	let newName = $state('');
	let inputEl = $state<HTMLInputElement | null>(null);

	function startAdding() {
		adding = true;
		newName = '';
		setTimeout(() => inputEl?.focus(), 0);
	}

	async function submitAdd() {
		const trimmed = newName.trim();
		if (!trimmed) { adding = false; return; }
		onAddNode(entityLabel, trimmed);
		newName = '';
		adding = false;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') { e.preventDefault(); submitAdd(); }
		else if (e.key === 'Escape') { adding = false; newName = ''; }
	}
</script>

<div class="flex flex-col h-full rounded-lg border overflow-hidden" style="border-color: {color}30;">
	<div class="px-3 py-1.5 shrink-0" style="background-color: {color}12;">
		<div class="flex items-center justify-between">
			<span class="text-[10px] font-bold uppercase tracking-wider" style="color: {color}">{title}</span>
			<div class="flex items-center gap-1.5">
				<span class="text-[10px] text-slate-400">{nodes.length}{#if maxItems}/{maxItems}{/if}</span>
				{#if !atLimit}
					{#if onAddExisting}
						<button onclick={() => onAddExisting(entityLabel)} class="w-4 h-4 flex items-center justify-center rounded hover:bg-black/10 transition-colors" style="color: {color}" title="Add existing node to {title}">
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-3 h-3">
								<path d="M1 10a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1v-4ZM10 1a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1V1ZM6.5 3.5a2.5 2.5 0 0 0-5 0v.006c0 .07.003.14.009.209l2.86 2.86a2.5 2.5 0 0 0 2.122-2.404L6.5 3.5ZM9.5 12.5a2.5 2.5 0 0 0 5 0v-.006a2.52 2.52 0 0 0-.009-.209l-2.86-2.86a2.5 2.5 0 0 0-2.122 2.404l-.009.671Z" />
							</svg>
						</button>
					{/if}
					<button onclick={startAdding} class="w-4 h-4 flex items-center justify-center rounded hover:bg-black/10 transition-colors" style="color: {color}" title="Add {title}">
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-3 h-3">
							<path d="M8 2a.75.75 0 0 1 .75.75v4.5h4.5a.75.75 0 0 1 0 1.5h-4.5v4.5a.75.75 0 0 1-1.5 0v-4.5h-4.5a.75.75 0 0 1 0-1.5h4.5v-4.5A.75.75 0 0 1 8 2Z" />
						</svg>
					</button>
				{/if}
			</div>
		</div>
		{#if adding}
			<div class="mt-1">
				<input
					bind:this={inputEl}
					bind:value={newName}
					onkeydown={handleKeydown}
					onblur={submitAdd}
					type="text"
					placeholder={addSuggestions && addSuggestions.length > 0 ? 'Pick or type a name...' : 'Name...'}
					list={addSuggestions && addSuggestions.length > 0 ? suggestionsListId : undefined}
					class="w-full px-2 py-1 text-[11px] border rounded bg-white focus:ring-1 focus:ring-blue-400 focus:border-blue-400 outline-none"
					style="border-color: {color}40;"
				/>
				{#if addSuggestions && addSuggestions.length > 0}
					<datalist id={suggestionsListId}>
						{#each addSuggestions as s (s)}
							<option value={s}></option>
						{/each}
					</datalist>
				{/if}
			</div>
		{/if}
		{#if nodes.length >= 5}
			<div class="mt-1 relative">
				<svg class="absolute left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
				<input bind:value={searchQuery} type="text" placeholder="Search..." class="w-full pl-6 pr-6 py-1 text-[11px] border rounded bg-white focus:ring-1 focus:ring-blue-400 focus:border-blue-400 outline-none" style="border-color: {color}30;" />
				{#if searchQuery}
					<button onclick={() => (searchQuery = '')} class="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-[10px]">✕</button>
				{/if}
			</div>
		{/if}
	</div>
	<div class="flex-1 overflow-y-auto p-1.5 space-y-1" style="background-color: {color}04;">
		{#each filteredNodes as node (node.id)}
			<div
				class="flex items-stretch group/drag {dragId === node.id ? 'opacity-30' : ''} {dropTargetId === node.id ? (dropPosition === 'before' ? 'border-t-2 border-t-blue-500' : 'border-b-2 border-b-blue-500') : ''}"
				ondragover={(e) => handleDragOverRow(e, node.id)}
				ondrop={handleDrop}
			>
				{#if sortedNodes.length > 1}
					<span
						class="inline-flex items-center justify-center w-5 shrink-0 text-[10px] text-slate-400 hover:text-slate-600 cursor-grab select-none"
						draggable="true"
						ondragstart={(e) => handleDragStart(e, node.id)}
						ondragend={clearDragState}
						role="img"
						aria-label="Drag to reorder"
					>⠿</span>
				{/if}
				<div class="flex-1 min-w-0">
					<CanvasCard {node} {color} onSelect={onSelectNode} onDelete={handleDeleteNode} {hideBadges} />
				</div>
			</div>
		{:else}
			<div class="flex items-center justify-center h-full">
				<span class="text-[10px] text-slate-300 italic">Empty</span>
			</div>
		{/each}
	</div>
</div>
