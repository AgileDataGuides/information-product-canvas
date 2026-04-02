<script lang="ts">
	import {
		store,
		switchTo,
		saveModel,
		newModel,
		deleteModel,
		exportJSON,
		importJSON,
		renameModel,
		updateDescription
	} from '$lib/stores/ipc.svelte';
	import { ipcToContextPlane, contextPlaneToIpc } from '$lib/converters/context-plane';
	import { exportIpcToPptx } from '$lib/export-pptx';

	let showSwitcher = $state(false);
	let showNew = $state(false);
	let newModelName = $state('');
	let saving = $state(false);
	let exportingPptx = $state(false);

	function handleClickOutsideSwitcher(e: MouseEvent) {
		const target = e.target as HTMLElement;
		if (!target.closest('[data-ipc-switcher]')) {
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

	async function handleSave() {
		saving = true;
		try { await saveModel(); } finally { saving = false; }
	}

	async function handleDelete() {
		if (!confirm(`Delete "${store.model.name}"?`)) return;
		await deleteModel(store.model.id);
	}

	function exportTimestamp(): string {
		const d = new Date();
		const pad = (n: number) => n.toString().padStart(2, '0');
		return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
	}

	function handleExportJSON() {
		// Auto-detect: try graph format first, fall back to native
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
				// Auto-detect format: graph { nodes, links } vs native IPC JSON
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

<svelte:window onclick={handleClickOutsideSwitcher} />

<div class="flex flex-wrap items-center justify-between gap-3 mb-4 bg-white border border-slate-200 rounded-lg px-4 py-3">
	<div class="flex items-center gap-2">
		<!-- Switcher dropdown -->
		<div class="relative" data-ipc-switcher>
			<button
				onclick={() => (showSwitcher = !showSwitcher)}
				class="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors hover:bg-slate-100"
			>
				<div class="text-left">
					<div class="text-sm font-semibold text-slate-800 leading-tight">{store.model.name}</div>
					<div class="text-[10px] text-slate-400 leading-tight">Switch canvas</div>
				</div>
				<svg class="w-4 h-4 text-slate-400 transition-transform {showSwitcher ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
				</svg>
			</button>

			{#if showSwitcher}
				<div class="absolute top-full left-0 mt-1.5 bg-white rounded-xl border border-slate-200 shadow-xl z-50 py-1 min-w-[200px]">
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

		<!-- Inline New -->
		{#if showNew}
			<input
				type="text"
				placeholder="Model name..."
				bind:value={newModelName}
				onkeydown={(e) => e.key === 'Enter' && handleNew()}
				class="px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none w-48"
			/>
			<button
				onclick={handleNew}
				class="px-3 py-1.5 text-sm font-medium rounded-lg bg-white text-emerald-700 border border-emerald-300 hover:bg-emerald-50 transition-colors"
			>Create</button>
			<button
				onclick={() => (showNew = false)}
				class="px-3 py-1.5 text-sm font-medium rounded-lg bg-white text-slate-500 border border-slate-300 hover:bg-slate-50 transition-colors"
			>Cancel</button>
		{:else}
			<button
				onclick={() => (showNew = true)}
				class="px-3 py-1.5 text-sm font-medium rounded-lg bg-white text-emerald-700 border border-emerald-300 hover:bg-emerald-50 transition-colors"
			>New Canvas</button>
		{/if}

		<!-- Save / Saved -->
		<button
			onclick={handleSave}
			disabled={!store.dirty || saving}
			class="px-3 py-1.5 text-sm font-medium rounded-lg transition-colors {store.dirty ? 'bg-white text-blue-700 border border-blue-300 hover:bg-blue-50' : 'bg-white text-slate-300 border border-slate-200 cursor-not-allowed'}"
		>
			{#if saving}Saving...{:else if store.dirty}Save{:else}Saved{/if}
		</button>

		<!-- Delete -->
		<button
			onclick={handleDelete}
			class="px-3 py-1.5 text-sm font-medium rounded-lg bg-white text-red-500 border border-red-300 hover:bg-red-50 transition-colors"
		>Delete</button>
	</div>

	<!-- Right: Export + Import -->
	<div class="flex items-center gap-2">
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
