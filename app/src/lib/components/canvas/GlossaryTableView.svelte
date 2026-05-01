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
		 *  the DataAdapter from context. Used by the Glossary Table tab on the
		 *  SA Glossary app and the CP Glossary canvas. When false (default),
		 *  the table is read-only. */
		editable?: boolean;
	} = $props();

	// Adapter is only needed when editing.
	const adapter = editable ? getContext<DataAdapter>('dataAdapter') : null;

	let searchQuery = $state('');
	let sortColumn = $state<string>('term');
	let sortAsc = $state(true);

	// ── Click-to-edit state ────────────────────────────────────────────────
	let editingKey = $state<string | null>(null);
	let editingValue = $state<string>('');

	function startEdit(key: string, current: string) {
		if (!editable) return;
		editingKey = key;
		editingValue = current;
	}

	function cancelEdit() {
		editingKey = null;
		editingValue = '';
	}

	async function commitText(termId: string, field: 'name' | 'description') {
		if (!adapter) { cancelEdit(); return; }
		const value = editingValue;
		cancelEdit();
		if (field === 'name') {
			await adapter.updateNode(termId, { name: value.trim() });
		} else {
			await adapter.updateNode(termId, { description: value });
		}
	}

	/** Find-or-create commit for the single-link reference cells
	 *  (Category / Steward / Status). Looks up an existing target node
	 *  by name (case-insensitive); creates one if absent. Replaces the
	 *  existing link if it points to a different node; deletes the link
	 *  if the input is empty. */
	async function commitLinkedRef(
		termId: string,
		inputValue: string,
		linkLabel: 'categorised_as' | 'stewarded_by' | 'has_status',
		targetEntityLabel: 'gls_category' | 'gls_steward' | 'gls_status'
	) {
		if (!adapter) { cancelEdit(); return; }
		const trimmed = inputValue.trim();
		cancelEdit();

		const existingLink = links.find((l) => l.source_id === termId && l.label === linkLabel);

		if (!trimmed) {
			if (existingLink) await adapter.deleteLink(existingLink.id);
			return;
		}

		let targetNode = nodes.find((n) =>
			getNodeLabels(n).includes(targetEntityLabel) &&
			n.name.toLowerCase() === trimmed.toLowerCase()
		);
		if (!targetNode) {
			targetNode = await adapter.createNode({ label: targetEntityLabel, name: trimmed });
		}

		if (existingLink) {
			if (existingLink.destination_id === targetNode.id) return; // no change
			await adapter.deleteLink(existingLink.id);
		}

		await adapter.createLink({
			source_id: termId,
			destination_id: targetNode.id,
			label: linkLabel
		});
	}

	interface TableRow {
		termId: string;
		glossaryName: string;
		termName: string;
		termDescription: string;
		aliases: string;
		category: string;
		steward: string;
		status: string;
	}

	// Build a node lookup
	const nodeMap = $derived.by(() => {
		const map: Record<string, ContextNode> = {};
		for (const n of nodes) map[n.id] = n;
		return map;
	});

	// Build flat rows: one row per global_glossary_term node.
	const allRows = $derived.by(() => {
		const rows: TableRow[] = [];
		const termNodes = nodes.filter((n) => getNodeLabels(n).includes('global_glossary_term'));

		for (const term of termNodes) {
			// Parent glossary via has_term (incoming link from a gls_glossary)
			const parentLink = links.find(
				(l) => l.label === 'has_term' && l.destination_id === term.id
			);
			const parent = parentLink ? nodeMap[parentLink.source_id] : null;
			const glossaryName = parent?.name || '';

			// Aliases via also_known_as (outgoing links to gls_synonym nodes)
			const aliasLinks = links.filter(
				(l) => l.source_id === term.id && l.label === 'also_known_as'
			);
			const aliasNames = aliasLinks
				.map((l) => nodeMap[l.destination_id]?.name)
				.filter((n): n is string => !!n);

			// Single-link refs
			const categoryLink = links.find(
				(l) => l.source_id === term.id && l.label === 'categorised_as'
			);
			const stewardLink = links.find(
				(l) => l.source_id === term.id && l.label === 'stewarded_by'
			);
			const statusLink = links.find(
				(l) => l.source_id === term.id && l.label === 'has_status'
			);

			rows.push({
				termId: term.id,
				glossaryName,
				termName: term.name,
				termDescription: term.description || '',
				aliases: aliasNames.join(', '),
				category: categoryLink ? (nodeMap[categoryLink.destination_id]?.name || '') : '',
				steward: stewardLink ? (nodeMap[stewardLink.destination_id]?.name || '') : '',
				status: statusLink ? (nodeMap[statusLink.destination_id]?.name || '') : ''
			});
		}
		return rows;
	});

	// Top title: glossary name from the first gls_glossary node, or fallback.
	const titleText = $derived.by(() => {
		const glsNode = nodes.find((n) => getNodeLabels(n).includes('gls_glossary'));
		return glsNode?.name || 'Business Glossary';
	});

	const filteredRows = $derived.by(() => {
		const q = searchQuery.toLowerCase().trim();
		if (!q) return allRows;
		return allRows.filter((r) =>
			r.glossaryName.toLowerCase().includes(q) ||
			r.termName.toLowerCase().includes(q) ||
			r.termDescription.toLowerCase().includes(q) ||
			r.aliases.toLowerCase().includes(q) ||
			r.category.toLowerCase().includes(q) ||
			r.steward.toLowerCase().includes(q) ||
			r.status.toLowerCase().includes(q)
		);
	});

	const sortedRows = $derived.by(() => {
		const col = sortColumn;
		const asc = sortAsc;
		const keyMap: Record<string, keyof TableRow> = {
			glossary: 'glossaryName',
			term: 'termName',
			description: 'termDescription',
			category: 'category',
			steward: 'steward',
			status: 'status'
		};
		const key = keyMap[col] || 'termName';
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
		{ id: 'glossary', label: 'Glossary', sortable: true },
		{ id: 'term', label: 'Term', sortable: true },
		{ id: 'description', label: 'Description', sortable: true },
		{ id: 'aliases', label: 'Aliases', sortable: false },
		{ id: 'category', label: 'Category', sortable: true },
		{ id: 'steward', label: 'Steward', sortable: true },
		{ id: 'status', label: 'Status', sortable: true }
	];
</script>

<div class="flex-1 overflow-auto p-4 bg-slate-50">
	<div class="flex items-center justify-between mb-3">
		<div class="flex items-center gap-3">
			<h2 class="text-sm font-semibold text-slate-700">{titleText}</h2>
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
							class="text-left px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500 select-none {col.sortable ? 'cursor-pointer hover:text-slate-700' : ''}"
							onclick={() => col.sortable && toggleSort(col.id)}
						>
							{col.label}
							{#if col.sortable}
								<span class="text-[10px] text-slate-400 ml-0.5">{sortIcon(col.id)}</span>
							{/if}
						</th>
					{/each}
				</tr>
			</thead>
			<tbody>
				{#each sortedRows as row, i (i)}
					<tr class="border-b border-slate-100 hover:bg-blue-50/30 transition-colors">
						<!-- Glossary name — read-only (parent ref) -->
						<td class="px-3 py-2 text-slate-800 font-medium">{row.glossaryName}</td>

						<!-- Term name — click-to-edit -->
						<td class="px-3 py-2 text-slate-700">
							{#if editable && editingKey === `${row.termId}:name`}
								<input type="text" value={editingValue}
									oninput={(e) => (editingValue = e.currentTarget.value)}
									onblur={() => commitText(row.termId, 'name')}
									onkeydown={(e) => { if (e.key === 'Enter') { e.preventDefault(); commitText(row.termId, 'name'); } else if (e.key === 'Escape') cancelEdit(); }}
									class="w-full px-1 py-0 text-sm border border-blue-400 rounded outline-none"
									autofocus
								/>
							{:else if editable}
								<button class="w-full text-left cursor-text hover:bg-slate-50 rounded px-1 -mx-1 transition-colors"
									onclick={() => startEdit(`${row.termId}:name`, row.termName)}
									title="Click to edit term name"
								>{row.termName}</button>
							{:else}
								{row.termName}
							{/if}
						</td>

						<!-- Description — click-to-edit -->
						<td class="px-3 py-2 text-slate-500 max-w-[280px]">
							{#if editable && editingKey === `${row.termId}:description`}
								<input type="text" value={editingValue}
									oninput={(e) => (editingValue = e.currentTarget.value)}
									onblur={() => commitText(row.termId, 'description')}
									onkeydown={(e) => { if (e.key === 'Enter') { e.preventDefault(); commitText(row.termId, 'description'); } else if (e.key === 'Escape') cancelEdit(); }}
									class="w-full px-1 py-0 text-sm border border-blue-400 rounded outline-none"
									autofocus
								/>
							{:else if editable}
								<button class="block w-full text-left cursor-text hover:bg-slate-50 rounded px-1 -mx-1 transition-colors truncate {row.termDescription ? '' : 'italic text-slate-300'}"
									onclick={() => startEdit(`${row.termId}:description`, row.termDescription)}
									title={row.termDescription || 'Click to add description'}
								>{row.termDescription || 'Add description...'}</button>
							{:else}
								<span class="truncate block" title={row.termDescription}>{row.termDescription}</span>
							{/if}
						</td>

						<!-- Aliases — read-only in v1 (display joined gls_synonym names) -->
						<td class="px-3 py-2 text-slate-500 max-w-[200px]">
							<span class="truncate block" title={row.aliases}>{row.aliases}</span>
						</td>

						<!-- Category — find-or-create on commit -->
						<td class="px-3 py-2">
							{#if editable && editingKey === `${row.termId}:category`}
								<input type="text" value={editingValue}
									oninput={(e) => (editingValue = e.currentTarget.value)}
									onblur={() => commitLinkedRef(row.termId, editingValue, 'categorised_as', 'gls_category')}
									onkeydown={(e) => { if (e.key === 'Enter') { e.preventDefault(); commitLinkedRef(row.termId, editingValue, 'categorised_as', 'gls_category'); } else if (e.key === 'Escape') cancelEdit(); }}
									class="w-full px-1 py-0 text-sm border border-blue-400 rounded outline-none"
									autofocus
								/>
							{:else if editable}
								<button class="block w-full text-left cursor-text hover:bg-slate-50 rounded px-1 -mx-1 transition-colors {row.category ? '' : 'italic text-slate-300'}"
									onclick={() => startEdit(`${row.termId}:category`, row.category)}
									title="Click to edit category"
								>{row.category || 'Set category...'}</button>
							{:else if row.category}
								<span class="inline-block px-1.5 py-0.5 text-[11px] rounded bg-emerald-50 text-emerald-700 border border-emerald-200">{row.category}</span>
							{/if}
						</td>

						<!-- Steward — find-or-create on commit -->
						<td class="px-3 py-2">
							{#if editable && editingKey === `${row.termId}:steward`}
								<input type="text" value={editingValue}
									oninput={(e) => (editingValue = e.currentTarget.value)}
									onblur={() => commitLinkedRef(row.termId, editingValue, 'stewarded_by', 'gls_steward')}
									onkeydown={(e) => { if (e.key === 'Enter') { e.preventDefault(); commitLinkedRef(row.termId, editingValue, 'stewarded_by', 'gls_steward'); } else if (e.key === 'Escape') cancelEdit(); }}
									class="w-full px-1 py-0 text-sm border border-blue-400 rounded outline-none"
									autofocus
								/>
							{:else if editable}
								<button class="block w-full text-left cursor-text hover:bg-slate-50 rounded px-1 -mx-1 transition-colors {row.steward ? '' : 'italic text-slate-300'}"
									onclick={() => startEdit(`${row.termId}:steward`, row.steward)}
									title="Click to edit steward"
								>{row.steward || 'Set steward...'}</button>
							{:else if row.steward}
								<span class="inline-block px-1.5 py-0.5 text-[11px] rounded bg-cyan-50 text-cyan-700 border border-cyan-200">{row.steward}</span>
							{/if}
						</td>

						<!-- Status — find-or-create on commit -->
						<td class="px-3 py-2">
							{#if editable && editingKey === `${row.termId}:status`}
								<input type="text" value={editingValue}
									oninput={(e) => (editingValue = e.currentTarget.value)}
									onblur={() => commitLinkedRef(row.termId, editingValue, 'has_status', 'gls_status')}
									onkeydown={(e) => { if (e.key === 'Enter') { e.preventDefault(); commitLinkedRef(row.termId, editingValue, 'has_status', 'gls_status'); } else if (e.key === 'Escape') cancelEdit(); }}
									class="w-full px-1 py-0 text-sm border border-blue-400 rounded outline-none"
									autofocus
								/>
							{:else if editable}
								<button class="block w-full text-left cursor-text hover:bg-slate-50 rounded px-1 -mx-1 transition-colors {row.status ? '' : 'italic text-slate-300'}"
									onclick={() => startEdit(`${row.termId}:status`, row.status)}
									title="Click to edit status"
								>{row.status || 'Set status...'}</button>
							{:else if row.status}
								<span class="inline-block px-1.5 py-0.5 text-[11px] rounded bg-violet-50 text-violet-700 border border-violet-200">{row.status}</span>
							{/if}
						</td>
					</tr>
				{:else}
					<tr>
						<td colspan="7" class="px-3 py-8 text-center text-slate-400 text-sm">
							{#if searchQuery}
								No matches for "{searchQuery}"
							{:else}
								No glossary terms — add terms in the Canvas view
							{/if}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
