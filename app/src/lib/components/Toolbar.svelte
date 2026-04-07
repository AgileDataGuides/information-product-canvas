<script lang="ts">
	import {
		store,
		saveModel,
		exportJSON,
		importJSON,
		renameModel,
		updateDescription
	} from '$lib/stores/ipc.svelte';
	import { ipcToContextPlane, contextPlaneToIpc } from '$lib/converters/context-plane';
	import { exportIpcToPptx } from '$lib/export-pptx';

	let {
		activeTab = $bindable('canvas'),
	}: {
		activeTab: string;
	} = $props();

	const tabs = [
		{ id: 'canvas', label: 'Canvas' },
		{ id: 'instructions', label: 'Instructions' }
	];

	let saving = $state(false);
	let exportingPptx = $state(false);

	// Name editing
	let editingName = $state(false);
	let editNameValue = $state('');
	let nameInputEl = $state<HTMLInputElement | null>(null);

	// Description editing
	let editingDesc = $state(false);
	let editDescValue = $state('');
	let descInputEl = $state<HTMLInputElement | null>(null);

	function startEditName() {
		editNameValue = store.model.name;
		editingName = true;
		setTimeout(() => nameInputEl?.focus(), 0);
	}

	function saveName() {
		const trimmed = editNameValue.trim();
		editingName = false;
		if (!trimmed || trimmed === store.model.name) return;
		renameModel(trimmed);
	}

	function handleNameKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') { e.preventDefault(); saveName(); }
		else if (e.key === 'Escape') { editingName = false; }
	}

	function startEditDesc() {
		editDescValue = store.model.description || '';
		editingDesc = true;
		setTimeout(() => descInputEl?.focus(), 0);
	}

	function saveDesc() {
		editingDesc = false;
		updateDescription(editDescValue.trim());
	}

	function handleDescKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') { e.preventDefault(); saveDesc(); }
		else if (e.key === 'Escape') { editingDesc = false; }
	}

	async function handleSave() {
		saving = true;
		try { await saveModel(); } finally { saving = false; }
	}

	function exportTimestamp(): string {
		const d = new Date();
		const pad = (n: number) => n.toString().padStart(2, '0');
		return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
	}

	function handleExportJSON() {
		const cpData = ipcToContextPlane(store.model);
		const json = cpData.nodes.length > 0
			? JSON.stringify(cpData, null, 2)
			: exportJSON();
		const blob = new Blob([json], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `${store.model.id}-ipc-${exportTimestamp()}.json`;
		a.click();
		URL.revokeObjectURL(url);
	}

	function handleImportJSON() {
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
					const model = contextPlaneToIpc(data, file.name.replace(/\.json$/, '').replace(/-\d{4}-\d{2}-\d{2}-\d{6}$/, ''));
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

	async function handleExportPptx() {
		exportingPptx = true;
		try { await exportIpcToPptx(store.model); } finally { exportingPptx = false; }
	}
</script>

<!-- Toolbar: Name/Desc + Save + Exports -->
<div class="bg-white border border-slate-200 rounded-lg">
	<div class="flex items-center justify-between px-4 py-2.5">
		<div class="flex items-center gap-3 min-w-0">
			<div class="min-w-0">
				{#if editingName}
					<input
						bind:this={nameInputEl}
						bind:value={editNameValue}
						onblur={saveName}
						onkeydown={handleNameKeydown}
						onclick={(e) => e.stopPropagation()}
						type="text"
						class="text-sm font-semibold text-slate-800 px-1 border border-blue-400 rounded outline-none w-64"
					/>
				{:else}
					<button
						class="text-sm font-semibold text-slate-800 leading-tight cursor-pointer hover:text-slate-600 transition-colors text-left truncate max-w-md"
						onclick={startEditName}
						title="Click to edit name"
					>{store.model.name}</button>
				{/if}
				{#if editingDesc}
					<input
						bind:this={descInputEl}
						bind:value={editDescValue}
						onblur={saveDesc}
						onkeydown={handleDescKeydown}
						onclick={(e) => e.stopPropagation()}
						type="text"
						placeholder="Add a description..."
						class="text-[10px] text-slate-500 px-1 border border-blue-400 rounded outline-none w-full mt-0.5"
					/>
				{:else}
					<button
						class="block text-[10px] leading-tight mt-0.5 truncate max-w-md text-left cursor-pointer transition-colors {store.model.description ? 'text-slate-400 hover:text-slate-600' : 'text-slate-300 italic hover:text-slate-500'}"
						onclick={startEditDesc}
						title="Click to edit description"
					>{store.model.description || 'Click to add a description'}</button>
				{/if}
			</div>

			<button
				onclick={handleSave}
				disabled={!store.dirty || saving}
				class="px-3 py-1.5 text-sm font-medium rounded-lg transition-colors shrink-0 {store.dirty ? 'bg-white text-blue-700 border border-blue-300 hover:bg-blue-50' : 'bg-white text-slate-300 border border-slate-200 cursor-not-allowed'}"
			>
				{#if saving}Saving...{:else if store.dirty}Save{:else}Saved{/if}
			</button>
		</div>

		<div class="flex items-center gap-2 shrink-0">
			<button
				onclick={handleExportPptx}
				disabled={exportingPptx}
				class="px-3 py-1.5 text-sm font-medium rounded-lg bg-white text-teal-600 border border-teal-300 hover:bg-teal-50 transition-colors disabled:opacity-50"
			>{exportingPptx ? 'Exporting...' : 'Export PPTX'}</button>
			<button
				onclick={handleExportJSON}
				class="px-3 py-1.5 text-sm font-medium rounded-lg bg-white text-slate-600 border border-slate-300 hover:bg-slate-50 transition-colors"
			>Export JSON</button>
			<button
				onclick={handleImportJSON}
				class="px-3 py-1.5 text-sm font-medium rounded-lg bg-white text-slate-600 border border-slate-300 hover:bg-slate-50 transition-colors"
			>Import JSON</button>
		</div>
	</div>
</div>

<!-- Tabs -->
<div class="flex gap-0 px-4 border-b border-slate-200">
	{#each tabs as tab}
		<button
			class="flex items-center px-3.5 py-2 text-xs font-medium border-b-2 -mb-px transition-colors {activeTab === tab.id ? 'text-blue-600 border-blue-600' : 'text-slate-400 border-transparent hover:text-slate-600'}"
			onclick={() => (activeTab = tab.id)}
		>{tab.label}</button>
	{/each}
</div>
