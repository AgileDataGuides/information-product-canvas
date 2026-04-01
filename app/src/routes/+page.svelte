<script lang="ts">
	import { onMount, setContext } from 'svelte';
	import {
		store,
		initStore,
		selectIp,
		addNodeToIp,
		getNodesForIp,
		updateNodeName,
		updateNodeOrder
	} from '$lib/stores/ipc.svelte';
	import { ipcToContextPlane } from '$lib/converters/context-plane';
	import { createStandaloneAdapter } from '$lib/adapters/standalone-adapter';
	import Toolbar from '$lib/components/Toolbar.svelte';
	import Instructions from '$lib/components/Instructions.svelte';
	import IPCLayout from '$lib/components/canvas/IPCLayout.svelte';
	import type { ContextNode, ContextLink } from '$lib/types/shared';

	let activeTab = $state<'canvas' | 'instructions'>('canvas');

	function createId(prefix: string): string {
		return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
	}

	// Provide DataAdapter context for canvas components
	const adapter = createStandaloneAdapter({
		getModel: () => {
			// Convert current model to nodes + links for the adapter
			return ipcToContextPlane(store.model);
		},
		onUpdateNode: (id, updates) => {
			if (updates.name) updateNodeName(id, updates.name);
			if (updates.properties && typeof updates.properties.order === 'number') {
				updateNodeOrder(id, updates.properties.order);
			}
		},
		onCreateNode: async (node) => {
			// For IPC standalone, node creation happens through addNodeToIp
			const result = addNodeToIp(node.label ?? '', node.name ?? '');
			return { id: result?.id ?? createId('node'), label: node.label ?? '', name: node.name ?? '', properties: node.properties ?? {}, created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as ContextNode;
		},
		onDeleteNode: async () => {
			// Deletion handled through store
		},
		onCreateLink: async (link) => {
			return { id: createId('link'), source_id: link.source_id ?? '', destination_id: link.destination_id ?? '', label: link.label ?? '', created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as ContextLink;
		},
		onDeleteLink: async () => {
			// Link deletion handled through store
		}
	});
	setContext('dataAdapter', adapter);

	onMount(() => {
		initStore();
	});

	const nodes = $derived(getNodesForIp(store.selectedIpId));

	function handleSelectIpc(id: string) {
		selectIp(id);
	}

	function handleSelectNode(id: string) {
		// In standalone mode, node selection is a no-op for now
	}

	function handleAddNode(entityLabel: string, name: string) {
		addNodeToIp(entityLabel, name);
	}
</script>

<div class="tabs">
	<button
		class="tab"
		class:active={activeTab === 'canvas'}
		type="button"
		onclick={() => (activeTab = 'canvas')}
	>Canvas</button>
	<button
		class="tab"
		class:active={activeTab === 'instructions'}
		type="button"
		onclick={() => (activeTab = 'instructions')}
	>Instructions</button>
</div>

{#if activeTab === 'canvas'}
	{#if store.loaded}
		<div class="px-6 py-3 border-b border-slate-200 bg-white shrink-0">
			<Toolbar />
		</div>
		<div class="flex-1 overflow-hidden">
			<IPCLayout
				{nodes}
				selectedIpcId={store.selectedIpId}
				onSelectIpc={handleSelectIpc}
				onSelectNode={handleSelectNode}
				onAddNode={handleAddNode}
				showCanvasSelector={false}
			/>
		</div>
	{:else}
		<div class="flex items-center justify-center h-64 text-slate-400 text-sm">Loading models...</div>
	{/if}
{:else}
	<div class="p-6 overflow-y-auto flex-1">
		<Instructions />
	</div>
{/if}

<style>
	.tabs {
		display: flex;
		gap: 0;
		border-bottom: 2px solid #e2e8f0;
		padding: 0 1.5rem;
		background: white;
		shrink: 0;
	}

	.tab {
		padding: 0.5rem 1.25rem;
		font: inherit;
		font-size: 0.875rem;
		font-weight: 500;
		border: none;
		background: none;
		cursor: pointer;
		color: #64748b;
		border-bottom: 2px solid transparent;
		margin-bottom: -2px;
		transition: color 0.1s, border-color 0.1s;
	}

	.tab:hover {
		color: #0f172a;
	}

	.tab.active {
		color: #2563eb;
		border-bottom-color: #2563eb;
	}
</style>
