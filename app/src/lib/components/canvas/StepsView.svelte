<script lang="ts">
	// The Steps tab: the Information Product Canvas filled in one step at a
	// time. A rail of steps on the left, the selected step's panel on the
	// right, Back and Next under the panel. A checklist, never a wizard: every
	// step is reachable at any time and no step blocks another. Each row's
	// status line reads off the canvas, so the Steps tab and the Canvas grid
	// are two views of the same cards.
	import type { ContextNode } from '$lib/cp-shared';
	import { HINT, STEP_NAV, STEP_PANEL, STEP_RAIL } from '../../ui/tokens';
	import { SECTIONS, STEPS, stepLabel, type SectionCanon, type StepCanon } from '../../canon/steps';
	import StepSection from './steps/StepSection.svelte';
	import { byOrder } from './steps/order';

	let {
		get,
		onSelectNode,
		onAddNode,
		selected = $bindable()
	}: {
		/** The cards in a section, already scoped to the selected Information Product. */
		get: (label: string) => ContextNode[];
		onSelectNode: (id: string) => void;
		onAddNode: (entityLabel: string, name: string) => void;
		/** The selected step. A host can bind it; an unknown value falls back to the remembered step. */
		selected?: string;
	} = $props();

	// Without a step from the host, the selected step is a per-viewer convenience, remembered in this browser
	const STORAGE_KEY = 'ipc-active-step';

	function isStep(value: string | null | undefined): value is string {
		return STEPS.some((s) => s.id === value);
	}

	function remembered(): string {
		try {
			const saved = localStorage.getItem(STORAGE_KEY);
			if (isStep(saved)) return saved;
		} catch {
			// no storage: start at Step 1
		}
		return STEPS[0].id;
	}

	if (!isStep(selected)) selected = remembered();
	const stepIndex = $derived(Math.max(0, STEPS.findIndex((s) => s.id === selected)));
	const step = $derived(STEPS[stepIndex]);

	function select(target: StepCanon) {
		selected = target.id;
		try {
			localStorage.setItem(STORAGE_KEY, target.id);
		} catch {
			// no storage: the choice lasts until reload
		}
	}

	// Back and Next: the steps either side of this one
	const previous = $derived(stepIndex > 0 ? STEPS[stepIndex - 1] : undefined);
	const next = $derived(stepIndex < STEPS.length - 1 ? STEPS[stepIndex + 1] : undefined);

	// A step opens at its top, whether it was picked on the rail or with Back and Next
	let scroller = $state<HTMLElement>();
	$effect(() => {
		void step;
		scroller?.scrollTo({ top: 0 });
	});

	/** "3 Personas", "No Personas yet", "Product Owner: Chief Revenue Officer" */
	function sectionStatus(section: SectionCanon): string {
		// Sorted the way the panel and the grid sort, so a one-item line names the card they show first
		const nodes = [...get(section.label)].sort(byOrder);
		const [one, many] = section.noun;
		if (section.maxItems === 1) return nodes[0] ? `${one}: ${nodes[0].name}` : `No ${one} yet`;
		if (nodes.length === 0) return `No ${many} yet`;
		return `${nodes.length} ${nodes.length === 1 ? one : many}`;
	}

	function stepStarted(s: StepCanon): boolean {
		return s.sections.some((label) => get(label).length > 0);
	}
</script>

<div class="flex h-full min-h-0">
	<nav class={STEP_RAIL.container} aria-label="The steps">
		<ul class="py-2">
			{#each STEPS as s (s.id)}
				{@const active = s.id === step.id}
				<li>
					<button
						type="button"
						aria-current={active ? 'step' : undefined}
						class="{STEP_RAIL.row} {active ? STEP_RAIL.rowActive : STEP_RAIL.rowInactive}"
						onclick={() => select(s)}
					>
						<span class={stepStarted(s) ? STEP_RAIL.dotStarted : STEP_RAIL.dotEmpty}></span>
						<span class="min-w-0">
							<span class="block {active ? STEP_RAIL.labelActive : STEP_RAIL.labelInactive}">{stepLabel(s)}</span>
							<span class="block {STEP_RAIL.status}">{s.sections.map((label) => sectionStatus(SECTIONS[label])).join(', ')}</span>
						</span>
					</button>
				</li>
			{/each}
		</ul>
	</nav>

	<section class="flex-1 min-w-0 flex flex-col overflow-hidden bg-slate-50">
		<div bind:this={scroller} class="flex-1 overflow-y-auto {STEP_PANEL.body}">
			<header class={STEP_PANEL.header}>
				<p class={STEP_PANEL.label}>{stepLabel(step)}</p>
				<h2 class={STEP_PANEL.question}>{step.question}</h2>
				<p class={STEP_PANEL.description}>
					{step.description}
					<a href={step.readMoreUrl} target="_blank" rel="noopener" class={STEP_PANEL.readMore}>Read more</a>
				</p>
				<p class={STEP_PANEL.guide}>{step.guide}</p>
				<p class={HINT.quiet}>
					<svg class={HINT.icon} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
						<path stroke-linecap="round" stroke-linejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
					</svg>
					<span>Example from the book: {step.example}</span>
				</p>
			</header>
			<div class={STEP_PANEL.content}>
				{#each step.sections as label (label)}
					<StepSection section={SECTIONS[label]} nodes={get(label)} {onSelectNode} {onAddNode} />
				{/each}
			</div>
		</div>

		<nav class={STEP_NAV.bar} aria-label="Move between steps">
			{#if previous}
				{@const to = previous}
				<button type="button" class={STEP_NAV.button} title="Back: {stepLabel(to)}" onclick={() => select(to)}>
					<svg class={STEP_NAV.icon} fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
						<path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
					</svg>
					<span class={STEP_NAV.label}>Back: {stepLabel(to)}</span>
				</button>
			{:else}
				<span></span>
			{/if}
			{#if next}
				{@const to = next}
				<button type="button" class={STEP_NAV.button} title="Next: {stepLabel(to)}" onclick={() => select(to)}>
					<span class={STEP_NAV.label}>Next: {stepLabel(to)}</span>
					<svg class={STEP_NAV.icon} fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
						<path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
					</svg>
				</button>
			{/if}
		</nav>
	</section>
</div>
