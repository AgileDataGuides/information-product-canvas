<script lang="ts">
	import { getContext } from 'svelte';
	import type { ContextNode, ContextLink, DataAdapter } from '$lib/cp-shared';
	import { getNodeLabels } from '$lib/cp-shared';

	let {
		nodes,
		links = [],
		editable = false
	}: {
		nodes: ContextNode[];
		links?: ContextLink[];
		/** When true, each cell becomes click-to-edit — edits persist through
		 *  the DataAdapter from context. Used by the Data Contract Dictionary tab.
		 *  When false (default), the table is read-only. */
		editable?: boolean;
	} = $props();

	// Adapter is only needed when editing. Consumers that render read-only can
	// safely mount this component without providing one in context.
	const adapter = editable ? getContext<DataAdapter>('dataAdapter') : null;

	let searchQuery = $state('');
	let sortColumn = $state<string>('dataset');
	let sortAsc = $state(true);

	// ── Click-to-edit state ────────────────────────────────────────────────
	// Each editable cell keys by `${columnId}:${field}` so only one edit is
	// in flight at a time. Arrow keys / Escape cancel; Enter or blur commits.
	let editingKey = $state<string | null>(null);
	let editingValue = $state<string>('');

	const DATA_TYPE_OPTIONS = ['string', 'integer', 'decimal', 'date', 'timestamp', 'boolean'];
	const CLASSIFICATION_OPTIONS = ['public', 'internal', 'confidential', 'restricted'];

	function startEdit(key: string, current: string) {
		if (!editable) return;
		editingKey = key;
		editingValue = current;
	}

	function cancelEdit() {
		editingKey = null;
		editingValue = '';
	}

	async function commitText(columnId: string, field: 'name' | 'description' | 'businessRule') {
		if (!adapter) { cancelEdit(); return; }
		const value = editingValue;
		cancelEdit();
		if (field === 'name') {
			await adapter.updateNode(columnId, { name: value.trim() });
		} else if (field === 'description') {
			await adapter.updateNode(columnId, { description: value });
		} else {
			const node = nodes.find((n) => n.id === columnId);
			const props = { ...(node?.properties || {}), businessRule: value };
			await adapter.updateNode(columnId, { properties: props });
		}
	}

	async function commitProperty(columnId: string, key: string, value: string | boolean) {
		if (!adapter) return;
		const node = nodes.find((n) => n.id === columnId);
		const props = { ...(node?.properties || {}), [key]: value };
		await adapter.updateNode(columnId, { properties: props });
	}

	async function toggleBoolean(columnId: string, key: 'primaryKey' | 'unique' | 'required', current: boolean) {
		await commitProperty(columnId, key, !current);
	}

	interface TableRow {
		columnId: string;
		datasetName: string;
		datasetDescription: string;
		columnName: string;
		columnDescription: string;
		dataType: string;
		required: boolean;
		unique: boolean;
		primaryKey: boolean;
		classification: string;
		sourceSystem: string;
		businessRule: string;
		glossaryTerm: string;
	}

	// Build a node lookup
	const nodeMap = $derived.by(() => {
		const map: Record<string, ContextNode> = {};
		for (const n of nodes) map[n.id] = n;
		return map;
	});

	// Derive flat table rows from nodes + links
	const allRows = $derived.by(() => {
		const rows: TableRow[] = [];
		// Accept both the canonical global_data_asset label and the legacy dict_dataset
		// label so models imported before the unification still render correctly.
		const datasetNodes = nodes.filter((n) => {
			const labels = getNodeLabels(n);
			return labels.includes('global_data_asset') || labels.includes('dict_dataset');
		});

		for (const ds of datasetNodes) {
			// Find columns linked to this dataset
			const colLinks = links.filter((l) => l.source_id === ds.id && l.label === 'contains_column');
			// Find source system for this dataset
			const ssLink = links.find((l) => l.source_id === ds.id && l.label === 'sourced_from_system');
			const ssNode = ssLink ? nodeMap[ssLink.destination_id] : null;
			const sourceSystem = ssNode?.name || '';

			if (colLinks.length === 0) {
				rows.push({
					columnId: '',
					datasetName: ds.name,
					datasetDescription: ds.description || '',
					columnName: '',
					columnDescription: '',
					dataType: '',
					required: false,
					unique: false,
					primaryKey: false,
					classification: '',
					sourceSystem,
					businessRule: '',
					glossaryTerm: ''
				});
			} else {
				for (const cl of colLinks) {
					const col = nodeMap[cl.destination_id];
					if (!col) continue;

					rows.push({
						columnId: col.id,
						datasetName: ds.name,
						datasetDescription: ds.description || '',
						columnName: col.name,
						columnDescription: col.description || '',
						dataType: (col.properties?.dataType as string) || '',
						required: Boolean(col.properties?.required),
						unique: Boolean(col.properties?.unique),
						primaryKey: Boolean(col.properties?.primaryKey),
						classification: (col.properties?.classification as string) || '',
						sourceSystem,
						businessRule: (col.properties?.businessRule as string) || '',
						glossaryTerm: (col.properties?.glossaryTerm as string) || ''
					});
				}
			}
		}
		return rows;
	});

	// Dictionary name from the dict_dictionary node
	const dictionaryName = $derived.by(() => {
		const dictNode = nodes.find((n) => getNodeLabels(n).includes('dict_dictionary'));
		return dictNode?.name || 'Data Dictionary';
	});

	const filteredRows = $derived.by(() => {
		const q = searchQuery.toLowerCase().trim();
		if (!q) return allRows;
		return allRows.filter((r) =>
			r.datasetName.toLowerCase().includes(q) ||
			r.columnName.toLowerCase().includes(q) ||
			r.columnDescription.toLowerCase().includes(q) ||
			r.dataType.toLowerCase().includes(q) ||
			r.classification.toLowerCase().includes(q) ||
			r.sourceSystem.toLowerCase().includes(q) ||
			r.businessRule.toLowerCase().includes(q) ||
			r.glossaryTerm.toLowerCase().includes(q)
		);
	});

	const sortedRows = $derived.by(() => {
		const col = sortColumn;
		const asc = sortAsc;
		const stringKeyMap: Record<string, keyof TableRow> = {
			dataset: 'datasetName',
			column: 'columnName',
			description: 'columnDescription',
			dataType: 'dataType',
			classification: 'classification',
			sourceSystem: 'sourceSystem',
			businessRule: 'businessRule',
			glossaryTerm: 'glossaryTerm'
		};
		const boolKeyMap: Record<string, keyof TableRow> = {
			required: 'required',
			unique: 'unique',
			primaryKey: 'primaryKey'
		};
		if (boolKeyMap[col]) {
			const key = boolKeyMap[col];
			return [...filteredRows].sort((a, b) => {
				const va = a[key] ? 1 : 0;
				const vb = b[key] ? 1 : 0;
				return asc ? va - vb : vb - va;
			});
		}
		const key = stringKeyMap[col] || 'datasetName';
		return [...filteredRows].sort((a, b) => {
			const va = String(a[key]).toLowerCase();
			const vb = String(b[key]).toLowerCase();
			return asc ? va.localeCompare(vb) : vb.localeCompare(va);
		});
	});

	function toggleSort(col: string) {
		if (sortColumn === col) {
			sortAsc = !sortAsc;
		} else {
			sortColumn = col;
			sortAsc = true;
		}
	}

	function sortIcon(col: string): string {
		if (sortColumn !== col) return '↕';
		return sortAsc ? '↑' : '↓';
	}

	const columns = [
		{ id: 'dataset', label: 'Data Asset' },
		{ id: 'column', label: 'Column' },
		{ id: 'description', label: 'Description' },
		{ id: 'dataType', label: 'Data Type' },
		{ id: 'primaryKey', label: 'PK' },
		{ id: 'unique', label: 'Unique' },
		{ id: 'required', label: 'Required' },
		{ id: 'classification', label: 'Classification' },
		{ id: 'sourceSystem', label: 'Source System' },
		{ id: 'businessRule', label: 'Business Rule' },
		{ id: 'glossaryTerm', label: 'Glossary Term' }
	];
</script>

<div class="flex-1 overflow-auto p-4 bg-slate-50">
	<div class="flex items-center justify-between mb-3">
		<div class="flex items-center gap-3">
			<h2 class="text-sm font-semibold text-slate-700">{dictionaryName}</h2>
			<span class="text-[10px] text-slate-400">{filteredRows.length} of {allRows.length} rows</span>
		</div>
		<div class="relative">
			<input
				type="text"
				placeholder="Search..."
				bind:value={searchQuery}
				class="px-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none w-64"
			/>
			{#if searchQuery}
				<button
					class="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
					onclick={() => (searchQuery = '')}
				>✕</button>
			{/if}
		</div>
	</div>

	<div class="bg-white rounded-lg border border-slate-200 overflow-hidden">
		<table class="w-full text-sm">
			<thead>
				<tr class="border-b border-slate-200 bg-slate-50">
					{#each columns as col}
						<th
							class="text-left px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500 cursor-pointer hover:text-slate-700 select-none"
							onclick={() => toggleSort(col.id)}
						>
							{col.label}
							<span class="text-[10px] text-slate-400 ml-0.5">{sortIcon(col.id)}</span>
						</th>
					{/each}
				</tr>
			</thead>
			<tbody>
				{#each sortedRows as row, i (i)}
					<tr class="border-b border-slate-100 hover:bg-blue-50/30 transition-colors">
						<!-- Dataset name — never editable (it's derived from the dataset node) -->
						<td class="px-3 py-2 text-slate-800 font-medium">{row.datasetName}</td>

						<!-- Column name — click-to-edit when editable -->
						<td class="px-3 py-2 text-slate-700">
							{#if editable && editingKey === `${row.columnId}:name` && row.columnId}
								<input type="text" value={editingValue}
									oninput={(e) => (editingValue = e.currentTarget.value)}
									onblur={() => commitText(row.columnId, 'name')}
									onkeydown={(e) => { if (e.key === 'Enter') { e.preventDefault(); commitText(row.columnId, 'name'); } else if (e.key === 'Escape') cancelEdit(); }}
									class="w-full px-1 py-0 text-sm border border-blue-400 rounded outline-none"
									autofocus
								/>
							{:else if editable && row.columnId}
								<button class="w-full text-left cursor-text hover:bg-slate-50 rounded px-1 -mx-1 transition-colors"
									onclick={() => startEdit(`${row.columnId}:name`, row.columnName)}
									title="Click to edit name"
								>{row.columnName}</button>
							{:else}
								{row.columnName}
							{/if}
						</td>

						<!-- Column description — click-to-edit -->
						<td class="px-3 py-2 text-slate-500 max-w-[240px]">
							{#if editable && editingKey === `${row.columnId}:description` && row.columnId}
								<input type="text" value={editingValue}
									oninput={(e) => (editingValue = e.currentTarget.value)}
									onblur={() => commitText(row.columnId, 'description')}
									onkeydown={(e) => { if (e.key === 'Enter') { e.preventDefault(); commitText(row.columnId, 'description'); } else if (e.key === 'Escape') cancelEdit(); }}
									class="w-full px-1 py-0 text-sm border border-blue-400 rounded outline-none"
									autofocus
								/>
							{:else if editable && row.columnId}
								<button class="block w-full text-left cursor-text hover:bg-slate-50 rounded px-1 -mx-1 transition-colors truncate {row.columnDescription ? '' : 'italic text-slate-300'}"
									onclick={() => startEdit(`${row.columnId}:description`, row.columnDescription)}
									title={row.columnDescription || 'Click to add description'}
								>{row.columnDescription || 'Add description...'}</button>
							{:else}
								<span class="truncate block" title={row.columnDescription}>{row.columnDescription}</span>
							{/if}
						</td>

						<!-- Data Type — inline select when editable -->
						<td class="px-3 py-2">
							{#if editable && row.columnId}
								<select value={row.dataType}
									onchange={(e) => commitProperty(row.columnId, 'dataType', e.currentTarget.value)}
									class="px-1.5 py-0.5 text-[11px] font-mono rounded bg-orange-50 text-orange-700 border border-orange-200 outline-none focus:ring-1 focus:ring-blue-400"
								>
									<option value="">—</option>
									{#each DATA_TYPE_OPTIONS as opt}
										<option value={opt}>{opt}</option>
									{/each}
								</select>
							{:else if row.dataType}
								<span class="inline-block px-1.5 py-0.5 text-[11px] rounded bg-orange-50 text-orange-700 border border-orange-200">{row.dataType}</span>
							{/if}
						</td>

						<!-- PK — checkbox-pill when editable -->
						<td class="px-3 py-2 text-center">
							{#if editable && row.columnId}
								<button class="inline-block px-1.5 py-0.5 text-[11px] font-semibold rounded border transition-colors {row.primaryKey ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-white text-slate-300 border-slate-200 hover:border-amber-200 hover:text-amber-400'}"
									onclick={() => toggleBoolean(row.columnId, 'primaryKey', row.primaryKey)}
									title="Click to toggle Primary Key"
								>PK</button>
							{:else if row.primaryKey}
								<span class="inline-block px-1.5 py-0.5 text-[11px] font-semibold rounded bg-amber-50 text-amber-700 border border-amber-200">PK</span>
							{/if}
						</td>

						<!-- Unique -->
						<td class="px-3 py-2 text-center">
							{#if editable && row.columnId}
								<button class="inline-block px-1.5 py-0.5 text-[11px] font-semibold rounded border transition-colors {row.unique ? 'bg-sky-50 text-sky-700 border-sky-200' : 'bg-white text-slate-300 border-slate-200 hover:border-sky-200 hover:text-sky-400'}"
									onclick={() => toggleBoolean(row.columnId, 'unique', row.unique)}
									title="Click to toggle Unique"
								>UNIQUE</button>
							{:else if row.unique}
								<span class="inline-block px-1.5 py-0.5 text-[11px] font-semibold rounded bg-sky-50 text-sky-700 border border-sky-200">UNIQUE</span>
							{/if}
						</td>

						<!-- Required -->
						<td class="px-3 py-2 text-center">
							{#if editable && row.columnId}
								<button class="inline-block px-1.5 py-0.5 text-[11px] font-semibold rounded border transition-colors {row.required ? 'bg-red-50 text-red-700 border-red-200' : 'bg-white text-slate-300 border-slate-200 hover:border-red-200 hover:text-red-400'}"
									onclick={() => toggleBoolean(row.columnId, 'required', row.required)}
									title="Click to toggle Required"
								>REQ</button>
							{:else if row.required}
								<span class="inline-block px-1.5 py-0.5 text-[11px] font-semibold rounded bg-red-50 text-red-700 border border-red-200">REQ</span>
							{/if}
						</td>

						<!-- Classification — inline select when editable -->
						<td class="px-3 py-2">
							{#if editable && row.columnId}
								<select value={row.classification || 'public'}
									onchange={(e) => commitProperty(row.columnId, 'classification', e.currentTarget.value)}
									class="px-1.5 py-0.5 text-[11px] rounded bg-slate-100 text-slate-600 border border-slate-200 outline-none focus:ring-1 focus:ring-blue-400"
								>
									{#each CLASSIFICATION_OPTIONS as opt}
										<option value={opt}>{opt}</option>
									{/each}
								</select>
							{:else if row.classification && row.classification !== 'public'}
								<span class="inline-block px-1.5 py-0.5 text-[11px] rounded bg-slate-100 text-slate-600 border border-slate-200">{row.classification}</span>
							{:else if row.classification === 'public'}
								<span class="text-[11px] text-slate-400">public</span>
							{/if}
						</td>

						<!-- Source System — never editable here (lives on the dataset) -->
						<td class="px-3 py-2">
							{#if row.sourceSystem}
								<span class="inline-block px-1.5 py-0.5 text-[11px] rounded bg-emerald-50 text-emerald-700 border border-emerald-200">{row.sourceSystem}</span>
							{/if}
						</td>

						<!-- Business Rule — click-to-edit free text -->
						<td class="px-3 py-2 text-slate-500">
							{#if editable && editingKey === `${row.columnId}:businessRule` && row.columnId}
								<input type="text" value={editingValue}
									oninput={(e) => (editingValue = e.currentTarget.value)}
									onblur={() => commitText(row.columnId, 'businessRule')}
									onkeydown={(e) => { if (e.key === 'Enter') { e.preventDefault(); commitText(row.columnId, 'businessRule'); } else if (e.key === 'Escape') cancelEdit(); }}
									class="w-full px-1 py-0 text-sm border border-blue-400 rounded outline-none"
									autofocus
								/>
							{:else if editable && row.columnId}
								<button class="block w-full text-left cursor-text hover:bg-slate-50 rounded px-1 -mx-1 transition-colors {row.businessRule ? '' : 'italic text-slate-300'}"
									onclick={() => startEdit(`${row.columnId}:businessRule`, row.businessRule)}
									title="Click to edit business rule"
								>{row.businessRule || 'Add rule...'}</button>
							{:else}
								{row.businessRule}
							{/if}
						</td>

						<!-- Glossary Term — read-only (lives as a separate node + link) -->
						<td class="px-3 py-2">
							{#if row.glossaryTerm}
								<span class="inline-block px-1.5 py-0.5 text-[11px] rounded bg-green-50 text-green-700 border border-green-200">{row.glossaryTerm}</span>
							{/if}
						</td>
					</tr>
				{:else}
					<tr>
						<td colspan="11" class="px-3 py-8 text-center text-slate-400 text-sm">
							{#if searchQuery}
								No matches for "{searchQuery}"
							{:else}
								No data — add datasets and columns in the Canvas view
							{/if}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
