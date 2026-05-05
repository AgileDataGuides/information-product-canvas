<script lang="ts">
	import { onMount, setContext } from 'svelte';
	import {
		store,
		initStore,
		selectIp,
		addNodeToIp,
		getNodesForIp,
		updateNodeName,
		updateNodeOrder,
		removeNodeFromIp,
		switchTo,
		newModel,
		deleteModel,
		importJSON
	} from '$lib/stores/ipc.svelte';
	import { applyIpcDemoSeeds } from '$lib/stores/demo-seed';
	import { ipcToContextPlane, contextPlaneToIpc } from '$lib/converters/context-plane';
	import { createStandaloneAdapter } from '$lib/adapters/standalone-adapter';
	import Toolbar from '$lib/components/Toolbar.svelte';
	import Instructions from '$lib/components/Instructions.svelte';
	import IPCLayout from '$lib/components/canvas/IPCLayout.svelte';
	import CardEditModal from '$lib/components/canvas/CardEditModal.svelte';
	import type { ContextNode, ContextLink } from '$lib/cp-shared';

	let activeTab = $state<string>('canvas');

	// Model management
	let showSwitcher = $state(false);
	let showNew = $state(false);
	let newModelName = $state('');

	function handleClickOutsideSwitcher(e: MouseEvent) {
		const target = e.target as HTMLElement;
		if (!target.closest('[data-model-switcher]')) {
			showSwitcher = false;
		}
	}

	async function handleNew() {
		const name = newModelName.trim();
		if (!name) return;
		await newModel(name);
		newModelName = '';
		showNew = false;
	}

	async function handleDelete() {
		if (!confirm(`Delete "${store.model.name}"?`)) return;
		await deleteModel(store.model.id);
	}

	/**
	 * Import an IPC model file as a NEW canvas (never overwrites the current one).
	 * The store's importJSON handles the creation side: it slugifies the imported
	 * name against existing IDs (collisions append "-2", "-3"…) and calls
	 * apiCreateModel, so the existing model is untouched and the new one lands
	 * alongside it in the saved list.
	 *
	 * Accepts either IPC native JSON ({ id, informationProducts, ... }) or a
	 * Context Plane graph export ({ nodes, links }) — the latter is converted
	 * back to native via contextPlaneToIpc before import.
	 */
	function handleImport() {
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = '.json';
		input.onchange = async () => {
			const file = input.files?.[0];
			if (!file) return;
			if (file.size > 5 * 1024 * 1024) {
				alert('File too large (max 5MB)');
				return;
			}
			try {
				const text = await file.text();
				const data = JSON.parse(text);
				if (data.nodes && data.links) {
					const fallbackName = file.name
						.replace(/\.json$/, '')
						.replace(/-\d{4}-\d{2}-\d{2}-\d{6}$/, '');
					const model = contextPlaneToIpc(data, fallbackName);
					await importJSON(JSON.stringify(model));
				} else if (data.informationProducts) {
					await importJSON(text);
				} else {
					alert('Invalid JSON — expected IPC model or { nodes, links } format');
				}
			} catch {
				alert('Could not parse JSON file');
			}
		};
		input.click();
	}

	function createId(prefix: string): string {
		return `${prefix}-${crypto.randomUUID()}`;
	}

	// Provide DataAdapter context for canvas components
	const adapter = createStandaloneAdapter({
		getModel: () => {
			return ipcToContextPlane(store.model);
		},
		onUpdateNode: (id, updates) => {
			if (updates.name) updateNodeName(id, updates.name);
			if (updates.properties && typeof updates.properties.order === 'number') {
				updateNodeOrder(id, updates.properties.order);
			}
		},
		onCreateNode: async (node) => {
			const result = addNodeToIp(node.label ?? '', node.name ?? '');
			return { id: result?.id ?? createId('node'), label: node.label ?? '', name: node.name ?? '', properties: node.properties ?? {}, created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as ContextNode;
		},
		onDeleteNode: async (id) => { removeNodeFromIp(id); },
		onCreateLink: async (link) => {
			return { id: createId('link'), source_id: link.source_id ?? '', destination_id: link.destination_id ?? '', label: link.label ?? '', created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as ContextLink;
		},
		onDeleteLink: async () => {}
	});
	setContext('dataAdapter', adapter);

	onMount(() => {
		// Apply demo seeds BEFORE initStore so the store sees seeded localStorage
		// as the source of truth on first/cold visit. No-op outside demo mode.
		const isDemo = import.meta.env.VITE_DEMO_MODE === 'true';
		if (isDemo) applyIpcDemoSeeds();

		initStore();
	});

	const nodes = $derived(getNodesForIp(store.selectedIpId));

	function handleSelectIpc(id: string) {
		selectIp(id);
	}

	// Card edit modal — clicking a card opens the modal to edit name/description
	// or delete the card. Mirrors the popup pattern from CP NodeDetailPanel and
	// the SA BEM column-header modal.
	let editingCardId = $state<string | null>(null);
	const editingCardNode = $derived(
		editingCardId ? nodes.find((n) => n.id === editingCardId) ?? null : null
	);

	function handleSelectNode(id: string) {
		editingCardId = id;
	}

	async function handleCardSave(updates: { name: string; description: string }) {
		if (!editingCardId) return;
		await adapter.updateNode(editingCardId, updates);
	}

	async function handleCardDelete() {
		if (!editingCardId) return;
		await adapter.deleteNode(editingCardId);
	}

	function entityTypeLabel(node: ContextNode | null): string {
		if (!node) return 'Card';
		const labels = node.label.split(',').map((l) => l.trim());
		if (labels.includes('global_persona')) return 'Persona';
		if (labels.includes('global_business_question')) return 'Business Question';
		if (labels.includes('global_info_product')) return 'Information Product';
		if (labels.includes('global_data_asset')) return 'Data Asset';
		if (labels.some((l) => l.startsWith('ipc_'))) return 'Card';
		return 'Card';
	}

	function handleAddNode(entityLabel: string, name: string) {
		addNodeToIp(entityLabel, name);
	}
</script>

<svelte:window onclick={handleClickOutsideSwitcher} />

<!-- App Header (dark) -->
<header class="bg-slate-900 text-white px-6 py-3 shrink-0">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-lg font-bold tracking-tight">Information Product Canvas</h1>
			<p class="text-xs text-slate-400 mt-0.5">Gather Information Product requirements with the Information Product Canvas</p>
		</div>
		<div class="flex items-center gap-2" data-model-switcher>
			<div class="relative">
				<button
					onclick={() => (showSwitcher = !showSwitcher)}
					class="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors hover:bg-slate-800 text-sm"
				>
					<span class="text-slate-300">{store.model.name}</span>
					<svg class="w-3.5 h-3.5 text-slate-400 transition-transform {showSwitcher ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
					</svg>
				</button>

				{#if showSwitcher}
					<div class="absolute top-full right-0 mt-1.5 bg-white rounded-xl border border-slate-200 shadow-xl z-50 py-1 min-w-[200px]">
						{#each store.savedList as item (item.id)}
							<button
								onclick={() => { switchTo(item.id); showSwitcher = false; }}
								class="w-full text-left px-4 py-2 text-sm transition-colors {item.id === store.model.id ? 'bg-slate-100 font-semibold text-slate-800' : 'text-slate-600 hover:bg-slate-50'}"
							>
								{item.name}
							</button>
						{/each}
					</div>
				{/if}
			</div>

			{#if showNew}
				<input
					type="text"
					placeholder="Model name..."
					bind:value={newModelName}
					onkeydown={(e) => e.key === 'Enter' && handleNew()}
					class="px-3 py-1.5 border border-slate-600 bg-slate-800 text-white rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none w-40 placeholder-slate-500"
				/>
				<button onclick={handleNew} class="px-3 py-1.5 text-sm font-medium rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 transition-colors">Create</button>
				<button onclick={() => { showNew = false; newModelName = ''; }} class="px-3 py-1.5 text-sm font-medium rounded-lg text-slate-400 hover:text-slate-200 transition-colors">Cancel</button>
			{:else}
				<button onclick={() => (showNew = true)} class="px-3 py-1.5 text-sm font-medium rounded-lg text-slate-300 border border-slate-600 hover:bg-slate-800 transition-colors">New Canvas</button>
				<!-- Import sits next to New Canvas because Import IS a creation
				     action — it always lands as a brand-new canvas alongside
				     the existing ones, never overwriting the current model. -->
				<button
					onclick={handleImport}
					class="px-3 py-1.5 text-sm font-medium rounded-lg text-slate-300 border border-slate-600 hover:bg-slate-800 transition-colors"
					title="Import an IPC JSON file as a new canvas"
				>Import</button>
			{/if}

			<button onclick={handleDelete} class="px-3 py-1.5 text-sm font-medium rounded-lg text-red-400 border border-slate-600 hover:bg-slate-800 transition-colors">Delete</button>
		</div>
	</div>
</header>

{#if activeTab === 'canvas'}
	{#if store.loaded}
		<div class="px-6 py-3 border-b border-slate-200 bg-white shrink-0">
			<Toolbar bind:activeTab />
		</div>
		<div class="flex-1 overflow-hidden">
			<IPCLayout
				{nodes}
				selectedIpcId={store.selectedIpId}
				onSelectIpc={handleSelectIpc}
				onSelectNode={handleSelectNode}
				onAddNode={handleAddNode}
				showSwitcher={false} showToolbar={false} showTabs={false}
			/>
		</div>
	{:else}
		<div class="flex items-center justify-center h-64 text-slate-400 text-sm">Loading models...</div>
	{/if}
{:else}
	{#if store.loaded}
		<div class="px-6 py-3 border-b border-slate-200 bg-white shrink-0">
			<Toolbar bind:activeTab />
		</div>
	{/if}
	<div class="p-6 overflow-y-auto flex-1">
		<Instructions />
	</div>
{/if}

{#if editingCardNode}
	<CardEditModal
		node={editingCardNode}
		typeLabel={entityTypeLabel(editingCardNode)}
		onSave={handleCardSave}
		onDelete={handleCardDelete}
		onClose={() => (editingCardId = null)}
	/>
{/if}
