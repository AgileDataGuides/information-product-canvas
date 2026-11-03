// The design tokens the Steps tab uses, copied from design/tokens.md.
//
// tokens.md is AUTHORITATIVE: if this file and tokens.md disagree, tokens.md
// wins. They live here, not imported from @context-plane/shared/design-tokens,
// because scripts/publish-app.sh does not bundle that module into the public
// repo. The Concept Model keeps its own copy for the same reason.

/** tokens.md buttons */
export const BUTTON = {
	/** buttons.success_create_outlined */
	add: 'px-3 py-1.5 text-sm font-medium rounded-lg bg-white text-emerald-700 border border-emerald-300 hover:bg-emerald-50 transition-colors'
};

/** tokens.md form_inputs */
export const INPUT = {
	/** form_inputs.text */
	text: 'w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white'
};

/** tokens.md step_rail: the steps down the left of the Steps tab (DESIGN_SYSTEM.md § 18 Step Rail, § 19). */
export const STEP_RAIL = {
	container: 'w-72 shrink-0 border-r border-slate-200 bg-slate-50 overflow-y-auto',
	row: 'w-full text-left flex items-start gap-2 px-3 py-2 border-l-2 transition-colors',
	rowActive: 'bg-white border-blue-600',
	rowInactive: 'border-transparent hover:bg-slate-100',
	labelActive: 'text-xs font-semibold text-slate-800',
	labelInactive: 'text-xs font-medium text-slate-600',
	status: 'text-[10px] text-slate-400 leading-tight',
	dotStarted: 'mt-1 w-2 h-2 shrink-0 rounded-full bg-slate-600',
	dotEmpty: 'mt-1 w-2 h-2 shrink-0 rounded-full border border-slate-300'
};

/** tokens.md step_panel: the header of the selected step (DESIGN_SYSTEM.md § 18 Step Panel). */
export const STEP_PANEL = {
	label: 'text-xs font-semibold text-slate-500',
	question: 'text-base font-semibold text-slate-800',
	description: 'text-xs text-slate-500 leading-relaxed',
	readMore: 'text-xs text-blue-600 hover:underline',
	body: 'px-6 py-5',
	/** The book's advice to the Facilitator, under the description */
	guide: 'text-xs text-slate-700 leading-relaxed',
	/** The step's label, question, description, guide and example, ruled off from its sections */
	header: 'space-y-1 pb-3 mb-4 border-b border-slate-200',
	/** The step's sections under the header, held to a reading width */
	content: 'max-w-2xl space-y-6'
};

/** tokens.md steps_tab: the box the whole 12 Steps tab sits in, where the grid around it has borders (DESIGN_SYSTEM.md § 19). */
export const STEPS_TAB = {
	frame: 'rounded-lg border border-slate-200 overflow-hidden'
};

/** tokens.md hint: a quiet line from the book, never a gate (DESIGN_SYSTEM.md § 18). The example card on a step. */
export const HINT = {
	quiet: 'flex items-start gap-1.5 text-[11px] text-slate-500 leading-snug',
	icon: 'w-3.5 h-3.5 shrink-0 mt-px text-slate-400'
};

/** tokens.md step_nav: Back and Next under the selected step (DESIGN_SYSTEM.md § 18 Step Nav). */
export const STEP_NAV = {
	bar: 'shrink-0 flex items-center justify-between gap-3 px-6 py-2.5 border-t border-slate-200 bg-white',
	/** buttons.secondary_slate, with room for the arrow */
	button:
		'inline-flex items-center gap-1.5 min-w-0 px-3 py-1.5 text-sm font-medium rounded-lg bg-white text-slate-600 border border-slate-300 hover:bg-slate-50 transition-colors',
	label: 'truncate',
	/** Heroicons outline arrow-left / arrow-right */
	icon: 'w-4 h-4 shrink-0'
};
