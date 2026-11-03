<!--
  ExportMenu: one Export button in the Tier 2 toolbar that opens the export
  formats as a grouped menu (DESIGN_SYSTEM.md § Export Menu, tokens.md
  export_menu). Each format shows its name and one line on what the file is for.
-->
<script lang="ts" module>
	export interface ExportMenuItem {
		/** The format name, e.g. "JSON". */
		label: string;
		/** One line on what the file is for. */
		description?: string;
		onSelect: () => void | Promise<void>;
	}

	export interface ExportMenuGroup {
		/** The group heading, e.g. "Standards". */
		heading: string;
		items: ExportMenuItem[];
	}

	/**
	 * One menu item, or none when the page cannot offer that export (its
	 * handler prop was not passed). Spread the result into a group's items.
	 */
	export function offerExport(
		onSelect: (() => void | Promise<void>) | false | null | undefined,
		label: string,
		description: string
	): ExportMenuItem[] {
		return onSelect ? [{ label, description, onSelect }] : [];
	}
</script>

<script lang="ts">
	import { tick } from 'svelte';

	let { groups, label = 'Export' }: { groups: ExportMenuGroup[]; label?: string } = $props();

	let open = $state(false);
	let rootEl: HTMLDivElement | undefined = $state();
	let triggerEl: HTMLButtonElement | undefined = $state();
	let panelEl: HTMLDivElement | undefined = $state();

	const visibleGroups = $derived(groups.filter((g) => g.items.length > 0));

	function menuItems(): HTMLButtonElement[] {
		return panelEl ? Array.from(panelEl.querySelectorAll<HTMLButtonElement>('[role="menuitem"]')) : [];
	}

	function close(returnFocus: boolean) {
		open = false;
		if (returnFocus) triggerEl?.focus();
	}

	// Close first, then run the export in the same click, so an export that
	// opens a window (Print to PDF) keeps the click's permission to do so.
	function choose(item: ExportMenuItem) {
		close(true);
		void item.onSelect();
	}

	function moveFocus(step: 1 | -1) {
		const items = menuItems();
		if (items.length === 0) return;
		const i = items.indexOf(document.activeElement as HTMLButtonElement);
		const next = i === -1 ? (step === 1 ? 0 : items.length - 1) : (i + step + items.length) % items.length;
		items[next].focus();
	}

	async function handleTriggerKeydown(e: KeyboardEvent) {
		if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
			e.preventDefault();
			open = true;
			await tick();
			moveFocus(e.key === 'ArrowDown' ? 1 : -1);
		} else if (e.key === 'Escape' && open) {
			e.preventDefault();
			close(true);
		}
	}

	function handleMenuKeydown(e: KeyboardEvent) {
		if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
			e.preventDefault();
			moveFocus(e.key === 'ArrowDown' ? 1 : -1);
		} else if (e.key === 'Escape') {
			e.preventDefault();
			close(true);
		} else if (e.key === 'Tab') {
			// Both start from the trigger, so neither depends on where a browser
			// resumes after the focused item is removed. Shift+Tab stops there, on
			// the Export button. Tab lets the browser move on to the next control.
			if (e.shiftKey) e.preventDefault();
			close(true);
		}
	}

	function handleWindowClick(e: MouseEvent) {
		if (open && rootEl && !rootEl.contains(e.target as Node)) open = false;
	}
</script>

<svelte:window onclick={handleWindowClick} />

<div class="relative shrink-0" bind:this={rootEl}>
	<button
		bind:this={triggerEl}
		type="button"
		class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-white text-slate-600 border border-slate-300 hover:bg-slate-50 transition-colors"
		aria-haspopup="menu"
		aria-expanded={open}
		onclick={() => (open = !open)}
		onkeydown={handleTriggerKeydown}
	>
		{label}
		<svg class="w-4 h-4 text-slate-400 transition-transform {open ? 'rotate-180' : ''}" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" aria-hidden="true">
			<path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
		</svg>
	</button>

	{#if open}
		<div
			bind:this={panelEl}
			role="menu"
			tabindex="-1"
			aria-label="{label} formats"
			class="absolute top-full right-0 mt-1.5 w-72 bg-white rounded-xl border border-slate-200 shadow-xl z-50 py-1"
			onkeydown={handleMenuKeydown}
		>
			{#each visibleGroups as group, gi}
				{#if gi > 0}
					<div class="my-1 border-t border-slate-100" role="separator"></div>
				{/if}
				<div role="group" aria-label={group.heading}>
					<div class="px-4 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500" aria-hidden="true">{group.heading}</div>
					{#each group.items as item}
						<button
							type="button"
							role="menuitem"
							class="block w-full text-left px-4 py-2 hover:bg-slate-50 focus-visible:bg-slate-50 outline-none transition-colors"
							onclick={() => choose(item)}
						>
							<span class="block text-sm font-medium text-slate-700">{item.label}</span>
							{#if item.description}
								<span class="block text-[10px] text-slate-400 leading-tight mt-0.5">{item.description}</span>
							{/if}
						</button>
					{/each}
				</div>
			{/each}
		</div>
	{/if}
</div>
