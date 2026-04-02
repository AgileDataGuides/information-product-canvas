<script lang="ts">
	import CanvasSection from './CanvasSection.svelte';
	import type { ContextNode, ContextLink, DataAdapter } from '$lib/types/shared';
	import { getNodeLabels } from '$lib/types/shared';
	import { getContext } from 'svelte';

	const adapter = getContext<DataAdapter>('dataAdapter');

	let {
		nodes,
		links = [],
		selectedIpcId,
		onSelectIpc,
		onSelectNode,
		onAddNode,
		onAddExisting,
		onExportJson,
		onImportJson,
		onExportPptx,
		showCanvasSelector = true
	}: {
		nodes: ContextNode[];
		links?: ContextLink[];
		selectedIpcId: string;
		onSelectIpc: (id: string) => void;
		onSelectNode: (id: string) => void;
		onAddNode: (entityLabel: string, name: string) => void;
		onAddExisting?: (entityLabel: string) => void;
		onExportJson?: (modelName: string) => void;
		onImportJson?: () => Promise<void>;
		onExportPptx?: () => Promise<void>;
		showCanvasSelector?: boolean;
	} = $props();

	let importing = $state(false);
	let exportingPptx = $state(false);

	const IPC_ENTITY_LABELS = new Set([
		'global_business_question',
		'global_persona',
		'ipc_delivery_type',
		'ipc_data_sync',
		'global_core_business_event',
		'ipc_feature_story',
		'ipc_will_wont',
		'ipc_product_owner',
		'ipc_tshirt_size',
		'ipc_vision',
		'ipc_action_outcome'
	]);

	// ── IPC Model nodes (root entities) ──
	const modelNodes = $derived(nodes.filter((n) => getNodeLabels(n).includes('ipc_model')));
	let selectedModelId = $state<string | null>(null);

	// Auto-select first model
	$effect(() => {
		if (modelNodes.length > 0 && (!selectedModelId || !modelNodes.find((n) => n.id === selectedModelId))) {
			selectedModelId = modelNodes[0].id;
		}
	});

	const selectedModel = $derived(modelNodes.find((n) => n.id === selectedModelId) ?? null);

	// Get IP nodes linked to the selected model via has_info_product links
	const ipLinks = $derived(
		selectedModelId
			? links.filter((l) => l.source_id === selectedModelId && l.label === 'has_info_product')
			: []
	);
	const ipNodeIds = $derived(new Set(ipLinks.map((l) => l.destination_id)));

	// IP name nodes (scoped to model or all if no model nodes exist)
	const ipcNames = $derived.by(() => {
		const allIps = nodes.filter((n) => getNodeLabels(n).includes('global_info_product'));
		if (modelNodes.length === 0) return allIps; // Legacy: no model nodes → show all
		return allIps.filter((n) => ipNodeIds.has(n.id));
	});

	// Auto-select first IP when model changes
	$effect(() => {
		if (ipcNames.length > 0) {
			const current = ipcNames.find((n) => n.id === selectedIpcId);
			if (!current) {
				onSelectIpc(ipcNames[0].id);
			}
		}
	});

	const allClaimedIds = $derived.by(() => {
		const nameIds = new Set(ipcNames.map((n) => n.id));
		const claimed = new Set<string>();
		for (const link of links) {
			if (nameIds.has(link.source_id)) {
				claimed.add(link.destination_id);
			}
		}
		return claimed;
	});

	const visibleNodeIds = $derived.by(() => {
		// When no links are provided (standalone mode), the caller already pre-filters
		// nodes for the selected IP, so all passed nodes should be visible.
		if (links.length === 0) {
			return new Set(nodes.map((n) => n.id));
		}
		if (selectedIpcId === '__new__') {
			return new Set(
				nodes
					.filter((n) => {
						const labels = getNodeLabels(n);
						return labels.some((l) => IPC_ENTITY_LABELS.has(l)) && !allClaimedIds.has(n.id);
					})
					.map((n) => n.id)
			);
		}
		const linked = new Set<string>([selectedIpcId]);
		for (const link of links) {
			if (link.source_id === selectedIpcId) {
				linked.add(link.destination_id);
			}
		}
		return linked;
	});

	const byLabel = $derived.by(() => {
		const map: Record<string, ContextNode[]> = {};
		for (const node of nodes) {
			if (!visibleNodeIds.has(node.id)) continue;
			for (const label of getNodeLabels(node)) {
				if (!map[label]) map[label] = [];
				map[label].push(node);
			}
		}
		return map;
	});

	const get = (label: string) => byLabel[label] || [];

	// ── Model switcher ──
	let showModelSwitcher = $state(false);

	// ── Editable name / description ──
	let editingModelName = $state(false);
	let editingModelNameValue = $state('');
	let editingModelDesc = $state(false);
	let editingModelDescValue = $state('');

	function autofocus(node: HTMLInputElement | HTMLTextAreaElement) {
		node.focus();
		if ('select' in node) node.select();
	}

	async function handleModelNameChange(newName: string) {
		editingModelName = false;
		if (!selectedModelId || !newName.trim()) return;
		await adapter.updateNode(selectedModelId, {
			label: 'ipc_model',
			name: newName.trim()
		});
	}

	async function handleModelDescChange(newDesc: string) {
		editingModelDesc = false;
		if (!selectedModelId) return;
		await adapter.updateNode(selectedModelId, {
			label: 'ipc_model',
			name: selectedModel?.name ?? '',
			description: newDesc.trim()
		});
	}

	async function handleCreateModel() {
		const name = prompt('IPC Canvas name:');
		if (!name) return;
		const newMod = await adapter.createNode({
			label: 'ipc_model',
			name,
			properties: { canvas: ['canvas_ipc'] }
		});
		if (newMod) selectedModelId = newMod.id;
	}

	async function handleDeleteModel() {
		if (!selectedModelId || !selectedModel) return;
		if (!confirm(`Delete model "${selectedModel.name}"? This will also remove all its information products.`)) return;
		// Delete all IP links and IP nodes first
		for (const link of ipLinks) {
			await adapter.deleteLink(link.id);
		}
		for (const ip of ipcNames) {
			await adapter.deleteNode(ip.id);
		}
		await adapter.deleteNode(selectedModelId);
		selectedModelId = null;
	}
</script>

<div class="w-full h-full p-3 overflow-auto bg-slate-50">
	{#if showCanvasSelector}
	<!-- IPC Model sub-header bar -->
	<div class="flex flex-wrap items-center justify-between gap-3 mb-4 bg-white border border-slate-200 rounded-lg px-4 py-3">
		<div class="flex items-center gap-2">
			<!-- Model switcher -->
			<div class="relative" data-ipc-switcher>
				<button
					onclick={() => (showModelSwitcher = !showModelSwitcher)}
					class="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors hover:bg-slate-100"
				>
					<div class="text-left">
						<div class="text-sm font-semibold text-slate-800 leading-tight">{selectedModel?.name ?? 'No model'}</div>
						<div class="text-[10px] text-slate-400 leading-tight">Switch canvas</div>
					</div>
					<svg class="w-4 h-4 text-slate-400 transition-transform {showModelSwitcher ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
					</svg>
				</button>

				{#if showModelSwitcher}
					<div class="absolute top-full left-0 mt-1.5 bg-white rounded-xl border border-slate-200 shadow-xl z-50 py-1 min-w-[200px]">
						{#each modelNodes as mod}
							<button
								onclick={() => { selectedModelId = mod.id; showModelSwitcher = false; }}
								class="w-full text-left px-4 py-2 text-sm transition-colors {mod.id === selectedModelId ? 'bg-slate-100 font-semibold text-slate-800' : 'text-slate-600 hover:bg-slate-50'}"
							>
								{mod.name}
							</button>
						{/each}
					</div>
				{/if}
			</div>

			<button
				class="px-3 py-1.5 text-sm font-medium rounded-lg bg-white text-blue-700 border border-blue-300 hover:bg-blue-50 transition-colors"
				onclick={handleCreateModel}
			>
				New Canvas
			</button>
			{#if selectedModel && modelNodes.length > 0}
				<button
					class="px-3 py-1.5 text-sm font-medium rounded-lg bg-white text-red-500 border border-red-300 hover:bg-red-50 transition-colors"
					onclick={handleDeleteModel}
				>
					Delete
				</button>
			{/if}
		</div>

		<div class="flex items-center gap-2">
			{#if onExportPptx}
				<button
					class="px-3 py-1.5 text-sm font-medium rounded-lg bg-white text-teal-600 border border-teal-300 hover:bg-teal-50 transition-colors disabled:opacity-50"
					disabled={exportingPptx}
					onclick={async () => { exportingPptx = true; try { await onExportPptx!(); } finally { exportingPptx = false; } }}
				>
					{exportingPptx ? 'Exporting...' : 'Export PPTX'}
				</button>
			{/if}
			{#if onExportJson}
				<button
					class="px-3 py-1.5 text-sm font-medium rounded-lg bg-white text-slate-600 border border-slate-300 hover:bg-slate-50 transition-colors"
					onclick={() => onExportJson(selectedModel?.name ?? '')}
				>
					Export JSON
				</button>
			{/if}
			{#if onImportJson}
				<button
					class="px-3 py-1.5 text-sm font-medium rounded-lg bg-white text-slate-600 border border-slate-300 hover:bg-slate-50 transition-colors disabled:opacity-50"
					disabled={importing}
					onclick={async () => { importing = true; try { await onImportJson!(); } finally { importing = false; } }}
				>
					{importing ? 'Importing...' : 'Import JSON'}
				</button>
			{/if}
		</div>
	</div>

	{#if !selectedModel}
		<div class="text-center py-12 text-slate-400">
			<p class="text-lg mb-2">No IPC model found</p>
			<p class="text-sm">Create a new model to get started.</p>
		</div>
	{:else}
		<!-- Model info (editable on double-click) -->
		<div class="mb-4">
			{#if editingModelName}
				<input
					use:autofocus
					type="text"
					bind:value={editingModelNameValue}
					onblur={() => handleModelNameChange(editingModelNameValue)}
					onkeydown={(e) => { if (e.key === 'Enter') handleModelNameChange(editingModelNameValue); if (e.key === 'Escape') { editingModelName = false; } }}
					class="text-lg font-semibold text-slate-800 px-1 py-0.5 border border-blue-400 rounded outline-none"
				/>
			{:else}
				<h2
					class="text-lg font-semibold text-slate-800 cursor-default"
					ondblclick={() => { editingModelNameValue = selectedModel!.name; editingModelName = true; }}
				>{selectedModel.name}</h2>
			{/if}
			{#if editingModelDesc}
				<textarea
					use:autofocus
					bind:value={editingModelDescValue}
					onblur={() => handleModelDescChange(editingModelDescValue)}
					onkeydown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleModelDescChange(editingModelDescValue); } if (e.key === 'Escape') { editingModelDesc = false; } }}
					rows="2"
					class="w-full text-sm text-slate-500 px-1 py-0.5 border border-blue-400 rounded outline-none resize-none"
				></textarea>
			{:else}
				<p
					class="text-sm text-slate-500 cursor-default {selectedModel.description ? '' : 'italic'}"
					ondblclick={() => { editingModelDescValue = selectedModel!.description || ''; editingModelDesc = true; }}
				>{selectedModel.description || 'Double-click to add a description'}</p>
			{/if}
		</div>
	{/if}
	{/if}

	{#if selectedModel || !showCanvasSelector}
	<div class="grid grid-cols-5 grid-rows-[auto_minmax(80px,0.5fr)_minmax(80px,0.5fr)_minmax(100px,1fr)_minmax(80px,0.7fr)] gap-1.5 {showCanvasSelector ? 'h-[calc(100%-11rem)]' : 'h-[calc(100%-0.5rem)]'}">
		<div class="col-span-3">
			<CanvasSection title="Name" color="#0ea5e9" entityLabel="global_info_product" nodes={get('global_info_product')} {onSelectNode} {onAddNode} {onAddExisting} maxItems={1} />
		</div>
		<div class="col-span-1">
			<CanvasSection title="Product Owner" color="#0ea5e9" entityLabel="ipc_product_owner" nodes={get('ipc_product_owner')} {onSelectNode} {onAddNode} {onAddExisting} maxItems={1} />
		</div>
		<div class="col-span-1">
			<CanvasSection title="T-Shirt Size" color="#0ea5e9" entityLabel="ipc_tshirt_size" nodes={get('ipc_tshirt_size')} {onSelectNode} {onAddNode} {onAddExisting} maxItems={1} />
		</div>

		<div class="col-span-2 row-span-2">
			<CanvasSection title="Outcomes/Actions" color="#7c3aed" entityLabel="ipc_action_outcome" nodes={get('ipc_action_outcome')} {onSelectNode} {onAddNode} {onAddExisting} />
		</div>
		<div class="col-span-1 row-span-3">
			<CanvasSection title="Vision" color="#0ea5e9" entityLabel="ipc_vision" nodes={get('ipc_vision')} {onSelectNode} {onAddNode} {onAddExisting} />
		</div>
		<div class="col-span-1 row-span-2">
			<CanvasSection title="Personas" color="#f97316" entityLabel="global_persona" nodes={get('global_persona')} {onSelectNode} {onAddNode} {onAddExisting} />
		</div>
		<div class="col-span-1 row-span-1">
			<CanvasSection title="Delivery Types" color="#f97316" entityLabel="ipc_delivery_type" nodes={get('ipc_delivery_type')} {onSelectNode} {onAddNode} {onAddExisting} />
		</div>

		<div class="col-span-1 row-span-1">
			<CanvasSection title="DataSync" color="#f97316" entityLabel="ipc_data_sync" nodes={get('ipc_data_sync')} {onSelectNode} {onAddNode} {onAddExisting} />
		</div>

		<div class="col-span-2 row-span-1">
			<CanvasSection title="Business Questions" color="#7c3aed" entityLabel="global_business_question" nodes={get('global_business_question')} {onSelectNode} {onAddNode} {onAddExisting} />
		</div>
		<div class="col-span-2 row-span-1">
			<CanvasSection title="Core Business Events" color="#16a34a" entityLabel="global_core_business_event" nodes={get('global_core_business_event')} {onSelectNode} {onAddNode} {onAddExisting} />
		</div>

		<div class="col-span-3 row-span-1">
			<CanvasSection title="Feature Stories" color="#f97316" entityLabel="ipc_feature_story" nodes={get('ipc_feature_story')} {onSelectNode} {onAddNode} {onAddExisting} />
		</div>
		<div class="col-span-2 row-span-1">
			<CanvasSection title="Will/Won't" color="#f97316" entityLabel="ipc_will_wont" nodes={get('ipc_will_wont')} {onSelectNode} {onAddNode} {onAddExisting} />
		</div>
	</div>
	{/if}
</div>

<!-- Click-away handler for dropdowns -->
{#if showModelSwitcher}
	<div
		class="fixed inset-0 z-40"
		onclick={() => { showModelSwitcher = false; }}
	></div>
{/if}
