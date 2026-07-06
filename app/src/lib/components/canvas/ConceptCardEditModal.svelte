<script lang="ts">
	/**
	 * ConceptCardEditModal — the shared rich-card edit popup used across every
	 * canvas that renders Concept (or related) cards: BEM Matrix + Canvas tabs,
	 * Concept Model canvas, plus any future canvases that surface the same
	 * cross-cutting `global_concept` / `global_domain` / `global_core_business_*`
	 * entities.
	 *
	 * Field set by detected card type:
	 *
	 *   - Concept  (global_concept | bem_dimension):
	 *       name, description, aliases, w-type, definition (category +
	 *       differentiator with @-mention autocomplete to glossary terms), notes
	 *   - Domain   (global_domain | bem_domain):
	 *       name, description, aliases, owner, notes
	 *   - Event    (global_core_business_event | bem_event):
	 *       name, description, notes
	 *   - Process  (global_core_business_process):
	 *       name, description, notes
	 *   - (fallback for any other label):
	 *       name, description, notes
	 *
	 * Autocomplete data comes from the `allNodes` prop:
	 *   - Definition category: filtered to other concepts in the model
	 *   - @-mention in differentiator: filtered to glossary terms
	 *
	 * Save / delete go through the DataAdapter from context.
	 *
	 * Promoted from BEM-app-local BemCardEditModal → shared so every canvas
	 * that touches Concept-family cards renders the SAME popup.
	 */
	import { getContext } from 'svelte';
	import type { ContextNode, DataAdapter } from '$lib/cp-shared';
	import { getNodeLabels } from '$lib/cp-shared';

	type W = 'who' | 'what' | 'when' | 'where' | 'why' | 'how' | 'how many';
	const WS: W[] = ['who', 'what', 'when', 'where', 'why', 'how', 'how many'];
	const W_LABELS: Record<W, string> = {
		who: 'Who',
		what: 'What',
		when: 'When',
		where: 'Where',
		why: 'Why',
		how: 'How',
		'how many': 'How Many'
	};

	let {
		node,
		allNodes,
		onClose,
		onSaved,
		onDeleted
	}: {
		node: ContextNode;
		/** All nodes — used to populate autocomplete (concept categories,
		 *  glossary @-mentions). Pass the same `nodes` array the canvas uses. */
		allNodes: ContextNode[];
		onClose: () => void;
		onSaved?: () => void;
		onDeleted?: () => void;
	} = $props();

	const adapter = getContext<DataAdapter>('dataAdapter');

	// Detect type from labels. Falls through to a generic "event" shape (just
	// name+description+notes) for any label not explicitly handled — keeps
	// the modal usable on canvases that surface other cross-cutting nodes.
	type CardType = 'domain' | 'concept' | 'event' | 'process';
	const cardType: CardType = (() => {
		const labels = getNodeLabels(node);
		if (labels.includes('global_domain') || labels.includes('bem_domain')) return 'domain';
		if (labels.includes('global_concept') || labels.includes('bem_dimension')) return 'concept';
		if (labels.includes('global_core_business_process')) return 'process';
		// global_core_business_event, bem_event, anything else → 'event' (basic fields)
		return 'event';
	})();

	const typeLabel =
		cardType === 'domain'
			? 'Domain'
			: cardType === 'concept'
				? 'Concept'
				: cardType === 'process'
					? 'Core Business Process'
					: 'Core Business Event';

	// Form state — initialised from the node and edited locally.
	let nameValue = $state(node.name ?? '');
	let descValue = $state(node.description ?? '');
	let aliasesValue = $state(((node.properties?.aliases as string[]) ?? []).join(', '));
	let ownerValue = $state((node.properties?.owner as string) ?? '');
	let wValue = $state<W>(((node.properties?.w as W) ?? 'who'));
	let notesValue = $state((node.properties?.notes as string) ?? '');
	let defCategory = $state((node.properties?.definitionCategory as string) ?? '');
	let defDifferentiator = $state((node.properties?.definitionDifferentiator as string) ?? '');

	// ── Definition category autocomplete (other concepts) ────────────
	let defCatQuery = $state('');
	let defCatFocusIdx = $state(-1);
	let showDefCatDropdown = $state(false);

	const otherConcepts = $derived(
		allNodes.filter(
			(n) =>
				n.id !== node.id &&
				(getNodeLabels(n).includes('global_concept') || getNodeLabels(n).includes('bem_dimension'))
		)
	);

	const defCatSuggestions = $derived.by(() => {
		const q = defCatQuery.toLowerCase().trim();
		if (!q) return [] as ContextNode[];
		return otherConcepts
			.filter((n) => n.name.toLowerCase().includes(q))
			.sort((a, b) => a.name.localeCompare(b.name))
			.slice(0, 8);
	});

	function handleDefCatInput() {
		defCatQuery = defCategory;
		showDefCatDropdown = defCatSuggestions.length > 0;
		defCatFocusIdx = -1;
	}

	function selectDefCatConcept(c: ContextNode) {
		defCategory = c.name;
		defCatQuery = '';
		showDefCatDropdown = false;
		defCatFocusIdx = -1;
	}

	function handleDefCatKeydown(e: KeyboardEvent) {
		if (!showDefCatDropdown) return;
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			defCatFocusIdx = Math.min(defCatFocusIdx + 1, defCatSuggestions.length - 1);
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			defCatFocusIdx = Math.max(defCatFocusIdx - 1, -1);
		} else if (e.key === 'Enter' && defCatFocusIdx >= 0) {
			e.preventDefault();
			selectDefCatConcept(defCatSuggestions[defCatFocusIdx]);
		} else if (e.key === 'Escape') {
			showDefCatDropdown = false;
		}
	}

	// ── @mention in differentiator (glossary terms) ────────────────────
	let mentionQuery = $state('');
	let mentionStartPos = $state(-1);
	let showMentionDropdown = $state(false);
	let mentionFocusIdx = $state(-1);
	let mentionInputEl = $state<HTMLInputElement | null>(null);

	const glossaryTerms = $derived(
		allNodes.filter((n) => getNodeLabels(n).includes('global_glossary_term'))
	);

	const mentionSuggestions = $derived.by(() => {
		const q = mentionQuery.toLowerCase().trim();
		if (!q) return [] as ContextNode[];
		return glossaryTerms
			.filter((n) => n.name.toLowerCase().includes(q))
			.sort((a, b) => a.name.localeCompare(b.name))
			.slice(0, 8);
	});

	function handleDiffInput(e: Event) {
		const input = e.target as HTMLInputElement;
		const pos = input.selectionStart ?? 0;
		const text = defDifferentiator.substring(0, pos);
		let atPos = -1;
		for (let i = text.length - 1; i >= 0; i--) {
			if (text[i] === '@') {
				atPos = i;
				break;
			}
			if (text[i] === '}') break;
		}
		if (atPos >= 0) {
			const after = text.substring(atPos + 1);
			if (after.includes('{')) {
				if (after.includes('}')) {
					showMentionDropdown = false;
					return;
				}
				mentionQuery = after.substring(1);
			} else {
				mentionQuery = after;
			}
			mentionStartPos = atPos;
			showMentionDropdown = mentionQuery.length > 0;
			mentionFocusIdx = -1;
		} else {
			showMentionDropdown = false;
		}
	}

	function selectMention(term: ContextNode) {
		const input = mentionInputEl;
		const pos = input?.selectionStart ?? defDifferentiator.length;
		const before = defDifferentiator.substring(0, mentionStartPos);
		const after = defDifferentiator.substring(pos);
		defDifferentiator = before + '@{' + term.name + '} ' + after;
		showMentionDropdown = false;
		mentionFocusIdx = -1;
		const newPos = before.length + term.name.length + 4;
		setTimeout(() => {
			if (input) {
				input.focus();
				input.setSelectionRange(newPos, newPos);
			}
		}, 0);
	}

	function handleDiffKeydown(e: KeyboardEvent) {
		if (!showMentionDropdown || mentionSuggestions.length === 0) return;
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			mentionFocusIdx = Math.min(mentionFocusIdx + 1, mentionSuggestions.length - 1);
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			mentionFocusIdx = Math.max(mentionFocusIdx - 1, -1);
		} else if (e.key === 'Enter' && mentionFocusIdx >= 0) {
			e.preventDefault();
			selectMention(mentionSuggestions[mentionFocusIdx]);
		} else if (e.key === 'Escape') {
			showMentionDropdown = false;
		}
	}

	// ── Save / delete ───────────────────────────────────────────────
	async function save() {
		const baseProps = node.properties || {};
		const properties: Record<string, unknown> = {
			...baseProps,
			notes: notesValue
		};
		// Aliases shown only for concepts + domains.
		if (cardType === 'concept' || cardType === 'domain') {
			properties.aliases = aliasesValue
				.split(',')
				.map((a) => a.trim())
				.filter((a) => a.length > 0);
		}
		if (cardType === 'domain') {
			properties.owner = ownerValue;
		}
		if (cardType === 'concept') {
			properties.w = wValue;
			properties.definitionCategory = defCategory;
			properties.definitionDifferentiator = defDifferentiator;
		}
		await adapter.updateNode(node.id, {
			name: nameValue,
			description: descValue,
			properties
		});
		onSaved?.();
		onClose();
	}

	async function handleDelete() {
		if (!confirm(`Delete "${node.name}"?\n\nThis cannot be undone.`)) return;
		await adapter.deleteNode(node.id);
		onDeleted?.();
		onClose();
	}
</script>

<div
	class="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
	onclick={onClose}
	role="presentation"
>
	<div
		class="bg-white rounded-xl shadow-xl border border-slate-200 p-5 w-full max-w-md"
		onclick={(e) => e.stopPropagation()}
		role="presentation"
	>
		<h3 class="text-sm font-bold text-slate-700 mb-3">{typeLabel} Details</h3>

		<label class="block text-xs font-medium text-slate-500 mb-1" for="bem-edit-name">Name</label>
		<input
			id="bem-edit-name"
			type="text"
			bind:value={nameValue}
			class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
		/>

		{#if cardType === 'concept' || cardType === 'domain'}
			<label class="block text-xs font-medium text-slate-500 mb-1 mt-3" for="bem-edit-aliases">
				Aliases <span class="text-slate-400 font-normal">(comma-separated)</span>
			</label>
			<input
				id="bem-edit-aliases"
				type="text"
				bind:value={aliasesValue}
				placeholder="e.g. Revenue, Income"
				class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
			/>
		{/if}

		<label class="block text-xs font-medium text-slate-500 mb-1 mt-3" for="bem-edit-desc">Description</label>
		<textarea
			id="bem-edit-desc"
			bind:value={descValue}
			placeholder="Describe what this {typeLabel.toLowerCase()} covers..."
			rows={3}
			class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
		></textarea>

		{#if cardType === 'domain'}
			<label class="block text-xs font-medium text-slate-500 mb-1 mt-3" for="bem-edit-owner">Domain Owner</label>
			<input
				id="bem-edit-owner"
				type="text"
				bind:value={ownerValue}
				placeholder="e.g. Sales Manager, Jane Smith"
				class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
			/>
		{:else if cardType === 'concept'}
			<label class="block text-xs font-medium text-slate-500 mb-1 mt-3" for="bem-edit-wtype">W's</label>
			<select
				id="bem-edit-wtype"
				bind:value={wValue}
				class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
			>
				{#each WS as wt}
					<option value={wt}>{W_LABELS[wt]}</option>
				{/each}
			</select>

			<div class="mt-3 rounded-lg border border-orange-200 bg-orange-50/50 p-3">
				<label class="block text-xs font-medium text-orange-600 mb-2" for="bem-edit-defcat">Definition</label>
				<p class="text-xs text-slate-500 mb-2">
					A <strong>{nameValue || 'concept'}</strong> is a
					<span class="text-orange-600 font-medium">[broader category]</span>
					that <span class="text-orange-600 font-medium">[distinguishing feature]</span>
				</p>
				<div class="flex items-center gap-2 text-sm text-slate-700">
					<span class="text-xs text-slate-400 shrink-0">is a</span>
					<div class="relative flex-1">
						<input
							id="bem-edit-defcat"
							type="text"
							bind:value={defCategory}
							placeholder="broader category (genus)"
							oninput={handleDefCatInput}
							onkeydown={handleDefCatKeydown}
							onfocus={() => {
								defCatQuery = defCategory;
								handleDefCatInput();
							}}
							onblur={() => setTimeout(() => (showDefCatDropdown = false), 150)}
							autocomplete="off"
							class="w-full px-2 py-1 border border-orange-200 rounded text-sm focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none bg-white"
						/>
						{#if showDefCatDropdown && defCatSuggestions.length > 0}
							<div class="absolute top-full left-0 mt-1 bg-white rounded-lg border border-orange-200 shadow-xl z-[60] py-1 w-56 max-h-40 overflow-y-auto">
								{#each defCatSuggestions as concept, i}
									<button
										type="button"
										onmousedown={(e) => {
											e.preventDefault();
											selectDefCatConcept(concept);
										}}
										class="w-full text-left px-3 py-1.5 text-sm transition-colors {i === defCatFocusIdx ? 'bg-orange-50 text-orange-800' : 'text-slate-700 hover:bg-slate-50'}"
									>
										<span class="font-medium">{concept.name}</span>
									</button>
								{/each}
							</div>
						{/if}
					</div>
				</div>
				<div class="flex items-center gap-2 text-sm text-slate-700 mt-1.5">
					<span class="text-xs text-slate-400 shrink-0">that</span>
					<div class="relative flex-1">
						<input
							type="text"
							bind:value={defDifferentiator}
							bind:this={mentionInputEl}
							placeholder="distinguishing feature (type @ to link)"
							oninput={handleDiffInput}
							onkeydown={handleDiffKeydown}
							onblur={() => setTimeout(() => (showMentionDropdown = false), 150)}
							autocomplete="off"
							class="w-full px-2 py-1 border border-orange-200 rounded text-sm focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none bg-white"
						/>
						{#if showMentionDropdown && mentionSuggestions.length > 0}
							<div class="absolute top-full left-0 mt-1 bg-white rounded-lg border border-orange-200 shadow-xl z-[60] py-1 w-64 max-h-40 overflow-y-auto">
								{#each mentionSuggestions as term, i}
									<button
										type="button"
										onmousedown={(e) => {
											e.preventDefault();
											selectMention(term);
										}}
										class="w-full text-left px-3 py-1.5 text-sm transition-colors flex items-center gap-2 {i === mentionFocusIdx ? 'bg-orange-50 text-orange-800' : 'text-slate-700 hover:bg-slate-50'}"
									>
										<span class="inline-block px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-orange-100 text-orange-700 border border-orange-200">@</span>
										<span class="font-medium">{term.name}</span>
									</button>
								{/each}
							</div>
						{/if}
					</div>
				</div>
			</div>
		{/if}

		<label class="block text-xs font-medium text-slate-500 mb-1 mt-3" for="bem-edit-notes">Notes</label>
		<textarea
			id="bem-edit-notes"
			bind:value={notesValue}
			placeholder="Additional notes..."
			rows={3}
			class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
		></textarea>

		<div class="flex justify-between items-center gap-2 mt-4">
			<!-- Delete on the left, away from Save, to reduce mis-click risk; uses
			     the documented danger-button red palette (see tokens.md § buttons.danger_delete_header). -->
			<button
				type="button"
				onclick={handleDelete}
				class="px-3 py-1.5 text-sm font-medium rounded-lg bg-white text-red-600 border border-red-300 hover:bg-red-50 transition-colors"
			>Delete</button>
			<div class="flex gap-2">
				<button
					type="button"
					onclick={onClose}
					class="px-3 py-1.5 text-sm font-medium rounded-lg bg-white text-slate-500 border border-slate-300 hover:bg-slate-50 transition-colors"
				>Cancel</button>
				<button
					type="button"
					onclick={save}
					class="px-3 py-1.5 text-sm font-medium rounded-lg bg-white text-blue-700 border border-blue-300 hover:bg-blue-50 transition-colors"
				>Save</button>
			</div>
		</div>
	</div>
</div>
