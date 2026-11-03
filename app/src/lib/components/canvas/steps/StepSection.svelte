<script lang="ts">
	// One canvas section inside a step panel. Capture happens live on a shared
	// screen, so the add field is the full form input, Enter adds and keeps the
	// cursor in the field, and a one-item section hides the field once it is
	// filled. The cards are the Canvas grid's cards: a click edits.
	import { getContext } from 'svelte';
	import CanvasCard from '$lib/components/canvas/CanvasCard.svelte';
	import type { ContextNode, DataAdapter } from '$lib/cp-shared';
	import type { SectionCanon } from '../../../canon/steps';
	import { BUTTON, INPUT } from '../../../ui/tokens';
	import { byOrder } from './order';

	let {
		section,
		nodes,
		onSelectNode,
		onAddNode
	}: {
		section: SectionCanon;
		nodes: ContextNode[];
		onSelectNode: (id: string) => void;
		onAddNode: (entityLabel: string, name: string) => void;
	} = $props();

	const adapter = getContext<DataAdapter>('dataAdapter');

	const sorted = $derived([...nodes].sort(byOrder));
	const atLimit = $derived(section.maxItems != null && nodes.length >= section.maxItems);
	const listId = $derived(`step-suggestions-${section.label}`);

	let value = $state('');
	let inputEl = $state<HTMLInputElement | null>(null);

	function submit() {
		const text = value.trim();
		if (!text) return;
		value = '';
		onAddNode(section.label, text);
		inputEl?.focus();
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			e.preventDefault();
			submit();
		} else if (e.key === 'Escape') {
			value = '';
		}
	}
</script>

<section class="space-y-2">
	<div class="flex items-center justify-between">
		<h3 class="text-[10px] font-bold uppercase tracking-wider" style="color: {section.color}">{section.title}</h3>
		<span class="text-[10px] text-slate-400">{nodes.length}{#if section.maxItems}/{section.maxItems}{/if}</span>
	</div>

	{#if !atLimit}
		<div class="flex items-center gap-2">
			<input
				bind:this={inputEl}
				bind:value
				type="text"
				placeholder={section.placeholder}
				aria-label={section.placeholder}
				list={section.suggestions ? listId : undefined}
				class={INPUT.text}
				onkeydown={handleKeydown}
			/>
			<button type="button" class="{BUTTON.add} shrink-0" onclick={submit}>Add</button>
		</div>
		{#if section.suggestions}
			<datalist id={listId}>
				{#each section.suggestions as option (option)}
					<option value={option}></option>
				{/each}
			</datalist>
		{/if}
	{/if}

	{#if sorted.length > 0}
		<div class="space-y-1.5">
			{#each sorted as node (node.id)}
				<CanvasCard {node} color={section.color} onSelect={onSelectNode} onDelete={(id) => adapter.deleteNode(id)} />
			{/each}
		</div>
	{/if}
</section>
