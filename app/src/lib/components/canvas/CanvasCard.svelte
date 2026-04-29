<script lang="ts">
	import { getContext } from 'svelte';
	import type { DataAdapter, ContextNode } from '$lib/types/shared';
	import { getNodeLabels } from '$lib/types/shared';

	const adapter = getContext<DataAdapter>('dataAdapter');

	let {
		node,
		color = '#6b7280',
		onSelect,
		onDelete,
		isSelected = false,
		hideBadges = false
	}: {
		node: ContextNode;
		color?: string;
		onSelect: (id: string) => void;
		onDelete?: (id: string) => void;
		isSelected?: boolean;
		/** When true, suppresses the dict_column / global_policy metadata badge rows.
		 *  Used by sections that want minimal, name-only cards (e.g. the Data Contract
		 *  Schema / Columns grid where the detail popup carries the full metadata). */
		hideBadges?: boolean;
	} = $props();

	let editingName = $state(false);
	let editName = $state('');
	let nameInputEl = $state<HTMLInputElement | null>(null);

	// dict_column nodes render compact metadata badges (dataType, PK, UNIQUE, REQ, classification)
	// below the name, matching the Agreement view schema table. Kept here (in the shared card)
	// because dict_column is a globally-defined entity label and the metadata is useful
	// everywhere columns appear (Data Dictionary canvas, Data Contract tab).
	const isColumn = $derived(getNodeLabels(node).includes('dict_column'));
	const colProps = $derived(node.properties || {});
	const classificationLabel = $derived(
		(colProps.classification as string | undefined)?.trim() || ''
	);

	// global_policy = Trust Rule (v2.1.1 Policy-shape). Shows category badge + target-field
	// badge so the "which field does this rule check?" story stays visible at a glance —
	// matching the Agreement view Trust Rules clause. Legacy `ruleType` / `operator` /
	// `threshold` properties fall back into the category + rule display so pre-migration
	// graphs still read cleanly.
	const isTrustRule = $derived(getNodeLabels(node).includes('global_policy'));
	const ruleCategory = $derived(
		((colProps.category as string | undefined)?.trim())
			|| (() => {
				const rt = (colProps.ruleType as string | undefined)?.trim() || '';
				return rt ? rt.charAt(0).toUpperCase() + rt.slice(1) : '';
			})()
	);
	const ruleColumn = $derived((colProps.column as string | undefined)?.trim() || '');

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

			{#if isColumn && !hideBadges}
				<!-- Column metadata flag badges — see DESIGN_SYSTEM.md § Column Metadata Flag Badges -->
				<div class="mt-1 flex flex-wrap gap-1">
					{#if colProps.dataType}
						<span class="inline-block px-1 py-0 rounded text-[9px] font-mono font-semibold bg-orange-50 text-orange-700 border border-orange-200">
							{colProps.dataType}
						</span>
					{/if}
					{#if colProps.primaryKey}
						<span class="inline-block px-1 py-0 rounded text-[9px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">PK</span>
					{/if}
					{#if colProps.unique}
						<span class="inline-block px-1 py-0 rounded text-[9px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">UNIQUE</span>
					{/if}
					{#if colProps.required}
						<span class="inline-block px-1 py-0 rounded text-[9px] font-semibold bg-red-50 text-red-700 border border-red-200">REQ</span>
					{/if}
					{#if classificationLabel && classificationLabel !== 'public'}
						<span class="inline-block px-1 py-0 rounded text-[9px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
							{classificationLabel}
						</span>
					{/if}
				</div>
			{/if}

			{#if isTrustRule && !hideBadges}
				<!-- Trust Rule flag badges — see DESIGN_SYSTEM.md § Trust Rule Flag Badges -->
				<div class="mt-1 flex flex-wrap gap-1">
					{#if ruleCategory}
						<span class="inline-block px-1 py-0 rounded text-[9px] font-semibold bg-violet-50 text-violet-700 border border-violet-200">
							{ruleCategory}
						</span>
					{/if}
					{#if ruleColumn === '*'}
						<span class="inline-block px-1 py-0 rounded text-[9px] font-semibold bg-slate-100 text-slate-600 border border-slate-200" title="Applies to every row (table-level rule)">
							ALL
						</span>
					{:else if ruleColumn}
						<span class="inline-block px-1 py-0 rounded text-[9px] font-mono font-semibold bg-blue-50 text-blue-700 border border-blue-200" title="Validates column {ruleColumn}">
							{ruleColumn}
						</span>
					{:else}
						<span class="inline-block px-1 py-0 rounded text-[9px] font-semibold bg-slate-100 text-slate-400 italic border border-slate-200 border-dashed" title="No target field set">
							no field
						</span>
					{/if}
				</div>
			{/if}

		</div>
		<!-- Per-card hover trash icon removed. Card-level deletion goes through the
		     opened detail (NodeDetailPanel on CP, app-specific edit modal on SA — e.g.
		     BEM's domain/concept modal has a Delete button). The `onDelete` prop is
		     kept on the API so sections that want a custom inline delete can still
		     wire one — but the shared card no longer renders a trash affordance. -->
	</div>
</div>
