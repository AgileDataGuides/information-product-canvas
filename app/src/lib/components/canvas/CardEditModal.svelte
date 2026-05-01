<script lang="ts">
	/**
	 * Lightweight edit-card modal used by every SA app's canvas. Opens when the
	 * user clicks (selects) a card. Lets them edit name + description and
	 * delete the card. Mirrors the BEM column-header modal's button layout
	 * (Delete on the left, Cancel + Save on the right) so the destructive
	 * action sits away from the primary action.
	 *
	 * The modal does not write directly — it calls the supplied `onSave` /
	 * `onDelete` callbacks. The host (page or layout) wires those to its
	 * adapter so the same component works whether the persistence sink is
	 * localStorage, a SvelteKit API route, DuckDB, or anything else.
	 *
	 * App-specific extra fields (e.g. column dataType, persona role, lineage
	 * provType) can be slotted in later via a snippet prop when the apps need
	 * more than name + description; this version intentionally keeps the
	 * surface small to ship the delete-card capability across IPC, BEM, and
	 * Data Contract in one go.
	 */
	import type { ContextNode } from '$lib/cp-shared';

	let {
		node,
		color = '#6b7280',
		typeLabel = 'card',
		onSave,
		onDelete,
		onClose
	}: {
		/** The card being edited. */
		node: ContextNode;
		/** Accent colour for the modal header — usually the section colour. */
		color?: string;
		/** User-facing name for the kind of thing being edited (e.g. "Persona", "Column", "Concept"). Used in the delete confirm + heading. */
		typeLabel?: string;
		/** Save handler — receives the new name + description. Called on Save click. */
		onSave: (updates: { name: string; description: string }) => Promise<void> | void;
		/** Delete handler — confirmation dialog already fires inside the modal. */
		onDelete: () => Promise<void> | void;
		/** Close the modal (dismiss without saving). */
		onClose: () => void;
	} = $props();

	let editName = $state(node.name);
	let editDescription = $state(node.description || '');
	let saving = $state(false);

	async function handleSave() {
		if (saving) return;
		const trimmedName = editName.trim();
		if (!trimmedName) return;
		saving = true;
		try {
			await onSave({ name: trimmedName, description: editDescription });
			onClose();
		} finally {
			saving = false;
		}
	}

	async function handleDelete() {
		const ok = window.confirm(
			`Delete ${typeLabel.toLowerCase()} "${node.name}"?\n\nThis cannot be undone.`
		);
		if (!ok) return;
		await onDelete();
		onClose();
	}

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === e.currentTarget) onClose();
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') onClose();
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
	onclick={handleBackdropClick}
>
	<div
		class="w-full max-w-md bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden"
		role="dialog"
		aria-modal="true"
	>
		<!-- Tier 2-style header — coloured left border + uppercase label -->
		<div
			class="px-4 py-2 flex items-center justify-between border-b border-slate-200"
			style="background-color: {color}10;"
		>
			<span class="text-[10px] font-bold uppercase tracking-wider" style="color: {color}">
				Edit {typeLabel}
			</span>
			<button
				type="button"
				class="text-slate-400 hover:text-slate-600 transition-colors"
				onclick={onClose}
				aria-label="Close"
				title="Close (Esc)"
			>
				<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<line x1="18" y1="6" x2="6" y2="18" />
					<line x1="6" y1="6" x2="18" y2="18" />
				</svg>
			</button>
		</div>

		<div class="px-4 py-3 space-y-3">
			<div>
				<label class="block text-xs font-medium text-slate-500 mb-1" for="card-edit-name">Name</label>
				<input
					id="card-edit-name"
					type="text"
					bind:value={editName}
					class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
					placeholder="Name…"
				/>
			</div>
			<div>
				<label class="block text-xs font-medium text-slate-500 mb-1" for="card-edit-description">Description</label>
				<textarea
					id="card-edit-description"
					bind:value={editDescription}
					rows={4}
					class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
					placeholder="Description…"
				></textarea>
			</div>
		</div>

		<div class="px-4 py-3 border-t border-slate-200 bg-slate-50/50 flex justify-between items-center gap-2">
			<!--
				Delete sits on the left, away from Save, to reduce mis-click risk.
				Uses `buttons.danger_delete_header` token (red palette) — see
				design/tokens.md and design/DESIGN_SYSTEM.md.
			-->
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
					onclick={handleSave}
					disabled={saving || !editName.trim()}
					class="px-3 py-1.5 text-sm font-medium rounded-lg bg-white text-blue-700 border border-blue-300 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
				>{saving ? 'Saving…' : 'Save'}</button>
			</div>
		</div>
	</div>
</div>
