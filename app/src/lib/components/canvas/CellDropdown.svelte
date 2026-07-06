<script lang="ts">
	/**
	 * CellDropdown — direct port of the Checklist's CellDropdown pattern
	 * (apps/layered-data-architecture-checklist/app/src/lib/components/CellDropdown.svelte),
	 * adapted to take object options with `{ id, name, description? }` instead
	 * of plain strings — so callers (Data Contract Trust Rule + Glossary Term
	 * cells) can persist selections by id and survive renames.
	 *
	 * UX (matches Checklist verbatim):
	 *  - Click cell → dropdown opens
	 *  - Filter input
	 *  - Checkboxes (multiSelect) or radios (single-select)
	 *  - Click outside / ESC → closes
	 *  - Selected values shown as chips in the cell trigger
	 *
	 * The original uses scoped CSS with var(--color-primary) tokens; this port
	 * uses Tailwind so it can drop into any consumer without a CSS variable
	 * setup. Class strings come from `tokens.md` (form_inputs, cards.modal).
	 */

	export interface CellDropdownOption {
		id: string;
		name: string;
		description?: string;
	}

	let {
		options,
		selected,
		multiSelect = true,
		placeholder = 'Select...',
		chipClass = 'inline-block px-1.5 py-0.5 text-[11px] rounded bg-violet-50 text-violet-700 border border-violet-200',
		emptyOptionsMessage = 'No options available.',
		onchange
	}: {
		options: CellDropdownOption[];
		selected: string[]; // ids
		multiSelect?: boolean;
		placeholder?: string;
		chipClass?: string;
		emptyOptionsMessage?: string;
		onchange: (ids: string[]) => void;
	} = $props();

	let open = $state(false);
	let search = $state('');

	const filtered = $derived(
		search
			? options.filter(
					(o) =>
						o.name.toLowerCase().includes(search.toLowerCase()) ||
						(o.description ?? '').toLowerCase().includes(search.toLowerCase())
				)
			: options
	);

	const selectedOptions = $derived(
		selected.map((id) => options.find((o) => o.id === id)).filter((o): o is CellDropdownOption => !!o)
	);

	function toggle(id: string) {
		let next: string[];
		if (multiSelect) {
			next = selected.includes(id) ? selected.filter((v) => v !== id) : [...selected, id];
		} else {
			next = selected.includes(id) ? [] : [id];
		}
		onchange(next);
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') open = false;
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="relative" onkeydown={handleKeydown}>
	<button
		type="button"
		class="block w-full min-h-[2rem] px-1 py-1 bg-transparent border border-transparent rounded text-left cursor-pointer hover:border-blue-300 hover:bg-blue-50/40 transition-colors"
		onclick={() => (open = !open)}
	>
		{#if selectedOptions.length > 0}
			<span class="flex flex-wrap gap-1">
				{#each selectedOptions as opt (opt.id)}
					<span class={chipClass}>{opt.name}</span>
				{/each}
			</span>
		{:else}
			<span class="text-[11px] text-slate-300 italic">{placeholder}</span>
		{/if}
	</button>

	{#if open}
		<!-- Backdrop closes the dropdown when clicked outside; fixed inset covers
		     the viewport. z-50 below the panel's z-[51] so clicks INSIDE the
		     panel hit the panel and stop there. -->
		<button
			type="button"
			class="fixed inset-0 z-50 cursor-default"
			aria-label="Close picker"
			onclick={() => (open = false)}
		></button>
		<div class="absolute z-[51] top-full left-0 mt-1 min-w-[280px] max-h-80 bg-white rounded-lg border border-slate-200 shadow-xl flex flex-col">
			{#if options.length === 0}
				<p class="text-xs text-slate-400 italic px-3 py-3 text-center">{emptyOptionsMessage}</p>
			{:else}
				<input
					type="text"
					placeholder="Filter..."
					bind:value={search}
					class="px-3 py-2 text-sm border-b border-slate-200 outline-none rounded-t-lg"
				/>
				<div class="overflow-y-auto flex-1">
					{#each filtered as opt (opt.id)}
						{@const isSelected = selected.includes(opt.id)}
						<label class="flex items-start gap-2 px-3 py-2 cursor-pointer text-xs border-b border-slate-100 last:border-b-0 {isSelected ? 'bg-blue-50/40' : 'hover:bg-slate-50'}">
							<input
								type={multiSelect ? 'checkbox' : 'radio'}
								checked={isSelected}
								onchange={() => toggle(opt.id)}
								class="mt-0.5 flex-shrink-0"
							/>
							<div class="flex flex-col gap-0.5 min-w-0">
								<span class="font-semibold text-slate-800">{opt.name}</span>
								{#if opt.description}
									<span class="text-[10px] text-slate-500 leading-snug">{opt.description}</span>
								{/if}
							</div>
						</label>
					{/each}
					{#if filtered.length === 0}
						<p class="text-xs text-slate-400 italic px-3 py-3 text-center">No matches</p>
					{/if}
				</div>
			{/if}
		</div>
	{/if}
</div>
