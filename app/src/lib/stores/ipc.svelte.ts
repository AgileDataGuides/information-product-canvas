import type { IPCModel, InformationProduct, IPCItem, BusinessQuestion, IPCNode } from '$lib/types';

function stripDateTimeSuffix(name: string): string {
	return name.replace(/-\d{4}-\d{2}-\d{2}-\d{6}$/, '');
}


/**
 * Migrate old single-value string fields (vision, deliveryType, dataSync, actionOutcome)
 * to the new multi-item array format (visions[], deliveryTypes[], dataSyncs[], actionOutcomes[]).
 */
function migrateModel(model: IPCModel): IPCModel {
	for (const ip of model.informationProducts) {
		// Migrate vision → visions[]
		if (!ip.visions) ip.visions = [];
		if ((ip as any).vision && ip.visions.length === 0) {
			ip.visions.push({ id: createId('v'), name: (ip as any).vision, description: '' });
		}
		delete (ip as any).vision;

		// Migrate deliveryType → deliveryTypes[]
		if (!ip.deliveryTypes) ip.deliveryTypes = [];
		if ((ip as any).deliveryType && ip.deliveryTypes.length === 0) {
			ip.deliveryTypes.push({ id: createId('dt'), name: (ip as any).deliveryType, description: '' });
		}
		delete (ip as any).deliveryType;

		// Migrate dataSync → dataSyncs[]
		if (!ip.dataSyncs) ip.dataSyncs = [];
		if ((ip as any).dataSync && ip.dataSyncs.length === 0) {
			ip.dataSyncs.push({ id: createId('ds'), name: (ip as any).dataSync, description: '' });
		}
		delete (ip as any).dataSync;

		// Migrate actionOutcome from businessQuestions → actionOutcomes[]
		if (!ip.actionOutcomes) ip.actionOutcomes = [];
		for (const bq of ip.businessQuestions) {
			if (bq.actionOutcome && ip.actionOutcomes.length === 0) {
				ip.actionOutcomes.push({ id: createId('ao'), name: bq.actionOutcome, description: '' });
			}
			// Keep the field on BQ type for backward compat but clear it
		}
	}
	return model;
}

function createId(prefix: string): string {
	const rand = typeof crypto !== 'undefined' && crypto.randomUUID
		? crypto.randomUUID().slice(0, 8)
		: Math.random().toString(36).slice(2, 10);
	return `${prefix}-${rand}`;
}

function slugify(name: string, existing: string[]): string {
	let base = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'model';
	if (!existing.includes(base)) return base;
	let i = 2;
	while (existing.includes(`${base}-${i}`)) i++;
	return `${base}-${i}`;
}

// --- Single reactive store ---

export const store = $state({
	savedList: [] as { id: string; name: string }[],
	model: {
		version: '1.0',
		id: 'empty',
		name: 'Loading...',
		description: '',
		informationProducts: [],
		sharedPersonas: [],
		sharedBusinessQuestions: [],
		sharedCoreBusinessEvents: []
	} as IPCModel,
	/** Currently selected Information Product ID within the model */
	selectedIpId: '' as string,
	dirty: false,
	loaded: false
});

// --- Persistence layer ---
// In demo mode (VITE_DEMO_MODE), all data lives in localStorage.
// In normal mode, data is persisted via API routes (file-system JSON).

const DEMO_MODE = typeof import.meta !== 'undefined' && import.meta.env?.VITE_DEMO_MODE === 'true';
const LS_KEY = 'ipc-demo-models';

function lsGetAll(): Record<string, IPCModel> {
	try {
		const raw = localStorage.getItem(LS_KEY);
		return raw ? JSON.parse(raw) : {};
	} catch { return {}; }
}

function lsSaveAll(models: Record<string, IPCModel>) {
	localStorage.setItem(LS_KEY, JSON.stringify(models));
}

// --- API helpers (swapped by DEMO_MODE) ---

async function apiListModels(): Promise<IPCModel[]> {
	if (DEMO_MODE) {
		return Object.values(lsGetAll());
	}
	const res = await fetch('/api/models');
	if (!res.ok) throw new Error(`GET /api/models failed: ${res.status}`);
	return res.json();
}

async function apiSaveModel(m: IPCModel): Promise<void> {
	if (DEMO_MODE) {
		const all = lsGetAll();
		all[m.id] = m;
		lsSaveAll(all);
		return;
	}
	await fetch(`/api/models/${m.id}`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(m)
	});
}

async function apiCreateModel(m: IPCModel): Promise<void> {
	if (DEMO_MODE) {
		const all = lsGetAll();
		all[m.id] = m;
		lsSaveAll(all);
		return;
	}
	await fetch('/api/models', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(m)
	});
}

async function apiDeleteModel(id: string): Promise<void> {
	if (DEMO_MODE) {
		const all = lsGetAll();
		delete all[id];
		lsSaveAll(all);
		return;
	}
	await fetch(`/api/models/${id}`, { method: 'DELETE' });
}

async function apiGetModel(id: string): Promise<IPCModel | null> {
	if (DEMO_MODE) {
		return lsGetAll()[id] ?? null;
	}
	const res = await fetch(`/api/models/${id}`);
	if (!res.ok) return null;
	return res.json();
}

// --- Init ---

function makeExampleModel(): IPCModel {
	return {
		version: '1.0',
		id: 'saas-revenue-metrics',
		name: 'SaaS Revenue Metrics',
		description: '',
		informationProducts: [
			{
				id: 'ip-mnfzrxet-axx4',
				name: 'SaaS Revenue Metrics',
				description: '',
				productOwner: 'ADI McADI',
				tshirtSize: 'M',
				personas: [
					{ id: 'global-mnfzx5kp-nrri', name: 'Chief Revenue Officer (CRO)', description: '', order: 1 }
				],
				businessQuestions: [
					{ id: 'global-mnfzsvtr-2wgp', name: 'What is the Monthly Recurring Revenue (MRR) trend over the last 12 months?', description: '', order: 1, actionOutcome: '' },
					{ id: 'global-mnfzt1lc-04oi', name: 'How much Annual Recurring Revenue (ARR) are we generating across all customer segments?', description: '', order: 2, actionOutcome: '' },
					{ id: 'global-mnfztf9s-lz1g', name: 'What is the Average Revenue Per User (ARPU) for each customer segment?', description: '', order: 3, actionOutcome: '' },
					{ id: 'global-mnfztl47-e9jp', name: 'How much revenue is being added through expansion (up-sells, cross-sells) each month?', description: '', order: 4, actionOutcome: '' },
					{ id: 'global-mnfzts3j-v9e9', name: 'What percentage of recurring revenue is retained after accounting for churn and expansion (Net Revenue Retention)?', description: '', order: 5, actionOutcome: '' },
					{ id: 'global-mnfztxkr-h1qs', name: 'What is the contribution of each channel to total MRR and ARR?', description: '', order: 6, actionOutcome: '' },
					{ id: 'global-mnfzu3h2-nbm0', name: 'What percentage of total revenue comes from new vs. existing customers?', description: '', order: 7, actionOutcome: 'Increase overall ARR by targeting high-value customer segments for expansion.' }
				],
				coreBusinessEvents: [
					{ id: 'global-mng001l7-2x3g', name: 'Prospect Clicks on Ad', description: '', order: 1 },
					{ id: 'global-mng006wl-ooov', name: 'Prospect Signs-up for Trial', description: '', order: 2 },
					{ id: 'global-mng00d88-m6mo', name: 'Customer Activates Account', description: '', order: 3 },
					{ id: 'global-mng00hzi-06ap', name: 'Customer Subscribes to a Paid Plan', description: '', order: 4 },
					{ id: 'global-mng00ml4-ostp', name: 'Customer Upgrades or Downgrades their Subscription', description: '', order: 5 },
					{ id: 'global-mng00r6r-d7m8', name: 'Customer Cancels their Subscription', description: '', order: 6 },
					{ id: 'global-mng00vso-mjtc', name: 'Customer Renews their Subscription', description: '', order: 7 }
				],
				featureStories: [
					{ id: 'ipc_fe-mnfzucm8-9wtk', name: 'As an CRO, I want to be able to drill down from the summary numbers to see the transactions that make up the number, so I can scan for outliers.', description: '', order: 1 },
					{ id: 'ipc_fe-mnfzuhr7-hhpl', name: 'As an CRO, I need to be able to see the data "as at" any point of historical time.', description: '', order: 2 },
					{ id: 'ipc_fe-mnfzuofq-865b', name: 'As a CRO, I want to be able to export the data, so I can use it Google Sheets.', description: '', order: 3 }
				],
				willWont: [
					{ id: 'ipc_wi-mnfzuurn-his2', name: "Won't Include internal or trial accounts in revenue metrics.", description: '', order: 1 },
					{ id: 'ipc_wi-mnfzv2a8-sycx', name: 'Will include Discounts in revenue calculations.', description: '', order: 2 },
					{ id: 'ipc_wi-mnfzvem9-0bz0', name: 'Will provide revenue trends for the past 24 months.', description: '', order: 3 },
					{ id: 'ipc_wi-mnfzvk85-rnpp', name: "Won't provide metrics for non-recurring or one-time revenue streams.", description: '', order: 4 },
					{ id: 'ipc_wi-mnfzvpey-5vhe', name: 'Will define Customer Segmentation based on demographic attributes.', description: '', order: 5 },
					{ id: 'ipc_wi-mnfzvuqc-fe5w', name: "Won't define Customer Segmentation based on acquisition cohorts.", description: '', order: 6 }
				],
				visions: [
					{ id: 'v-mng09u12-2e99', name: 'FOR the Chief Revenue Office,', description: '' },
					{ id: 'ipc_vi-mng0ezoq-8xyl', name: 'WHO needs to increase Annual Recurring Revenue,', description: '', order: 2 },
					{ id: 'ipc_vi-mng0f6lc-v5f4', name: 'THE Revenue Metrics is an Interactive Dashboard,', description: '', order: 3 },
					{ id: 'ipc_vi-mng0focx-oms9', name: 'THAT automates the calculation of core revenue metrics,', description: '', order: 4 },
					{ id: 'ipc_vi-mng0fvum-0cpr', name: 'UNLIKE the current manual process using Google Sheets.', description: '', order: 5 }
				],
				deliveryTypes: [
					{ id: 'dt-mng09u12-f2eh', name: 'Interactive Dashboard', description: '' },
					{ id: 'ipc_de-mng0g9kt-pjoq', name: 'AI Analyst', description: '', order: 2 },
					{ id: 'ipc_de-mng0gk8u-hblo', name: 'Data Extract', description: '', order: 3 }
				],
				dataSyncs: [
					{ id: 'ds-mng09u12-w5vb', name: 'Daily, before 7am', description: '' }
				],
				actionOutcomes: [
					{ id: 'ao-mng09u12-fm9h', name: 'Increase Annual Recurring Revenue', description: '' },
					{ id: 'ipc_ac-mng0dtb8-pur6', name: 'Increase overall ARR by targeting high-value customer segments for expansion.', description: '', order: 2 },
					{ id: 'ipc_ac-mng0dzd3-jn9k', name: 'Improve Net Revenue Retention (NRR) by increasing the number of plan upgrades.', description: '', order: 3 },
					{ id: 'ipc_ac-mng0e9zj-2gb0', name: 'Optimise ARPU through personalised product features and upgrade strategies.', description: '', order: 4 },
					{ id: 'ipc_ac-mng0eerz-nngn', name: 'Drive ARR growth by focusing on customer acquisition for profitable channels.', description: '', order: 5 }
				]
			}
		],
		sharedPersonas: [],
		sharedBusinessQuestions: [],
		sharedCoreBusinessEvents: []
	};
}

export async function initStore() {
	if (store.loaded) return;
	try {
		const models = await apiListModels();
		if (models.length === 0) {
			const example = makeExampleModel();
			await apiCreateModel(example);
			store.savedList = [{ id: example.id, name: example.name }];
			store.model = example;
		} else {
			store.savedList = models.map((m) => ({ id: m.id, name: m.name }));
			const lastId = typeof window !== 'undefined' ? localStorage.getItem('ipc-current-id') : null;
			const found = models.find((m) => m.id === lastId);
			store.model = migrateModel(found || models[0]);
		}
		// Select first IP if available
		if (store.model.informationProducts.length > 0) {
			store.selectedIpId = store.model.informationProducts[0].id;
		}
		store.dirty = false;
		store.loaded = true;
	} catch (err) {
		console.error('Failed to initialise IPC store:', err);
		// Fall back to example model without persistence
		const example = makeExampleModel();
		store.savedList = [{ id: example.id, name: example.name }];
		store.model = example;
		if (example.informationProducts.length > 0) {
			store.selectedIpId = example.informationProducts[0].id;
		}
		store.dirty = false;
		store.loaded = true;
	}
}

// --- Model CRUD ---

export async function switchTo(id: string) {
	if (store.dirty) {
		try { await saveModel(); } catch { /* best effort */ }
	}
	const model = await apiGetModel(id);
	if (model) {
		store.model = migrateModel(model);
		store.selectedIpId = store.model.informationProducts[0]?.id || '';
		store.dirty = false;
		if (typeof window !== 'undefined') {
			localStorage.setItem('ipc-current-id', id);
		}
	}
}

export async function saveModel() {
	const snapshot = JSON.parse(JSON.stringify(store.model));
	await apiSaveModel(snapshot);
	const idx = store.savedList.findIndex((s) => s.id === store.model.id);
	if (idx >= 0) {
		store.savedList[idx] = { id: store.model.id, name: store.model.name };
	}
	store.dirty = false;
}

function markDirty() {
	store.dirty = true;
}

export async function newModel(name: string) {
	const existingIds = store.savedList.map((s) => s.id);
	const id = slugify(name, existingIds);
	const defaultIpId = createId('ip');
	const newM: IPCModel = {
		version: '1.0',
		id,
		name,
		description: '',
		informationProducts: [{
			id: defaultIpId,
			name,
			description: '',
			productOwner: '',
			tshirtSize: '',
			visions: [],
			deliveryTypes: [],
			dataSyncs: [],
			actionOutcomes: [],
			personas: [],
			businessQuestions: [],
			coreBusinessEvents: [],
			featureStories: [],
			willWont: []
		}],
		sharedPersonas: [],
		sharedBusinessQuestions: [],
		sharedCoreBusinessEvents: []
	};
	await apiCreateModel(newM);
	store.savedList = [...store.savedList, { id, name }];
	store.model = newM;
	store.selectedIpId = defaultIpId;
	store.dirty = false;
	if (typeof window !== 'undefined') {
		localStorage.setItem('ipc-current-id', id);
	}
}

export async function deleteModel(id: string) {
	await apiDeleteModel(id);
	store.savedList = store.savedList.filter((s) => s.id !== id);
	if (store.savedList.length > 0) {
		await switchTo(store.savedList[0].id);
	} else {
		const example = makeExampleModel();
		await apiCreateModel(example);
		store.savedList = [{ id: example.id, name: example.name }];
		store.model = example;
		store.selectedIpId = example.informationProducts[0]?.id || '';
	}
	store.dirty = false;
}

export function renameModel(name: string) {
	store.model.name = name;
	markDirty();
}

export function updateDescription(desc: string) {
	store.model.description = desc;
	markDirty();
}

// --- Information Product CRUD ---

export function getSelectedIp(): InformationProduct | undefined {
	return store.model.informationProducts.find((ip) => ip.id === store.selectedIpId);
}

export function selectIp(id: string) {
	if (id === '__new__') {
		store.selectedIpId = '__new__';
		return;
	}
	store.selectedIpId = id;
}

export function addInformationProduct(name: string): InformationProduct {
	const ip: InformationProduct = {
		id: createId('ip'),
		name,
		description: '',
		productOwner: '',
		tshirtSize: '',
		visions: [],
		deliveryTypes: [],
		dataSyncs: [],
		actionOutcomes: [],
		personas: [],
		businessQuestions: [],
		coreBusinessEvents: [],
		featureStories: [],
		willWont: []
	};
	store.model.informationProducts = [...store.model.informationProducts, ip];
	store.selectedIpId = ip.id;
	markDirty();
	return ip;
}

export function removeInformationProduct(id: string) {
	store.model.informationProducts = store.model.informationProducts.filter((ip) => ip.id !== id);
	if (store.selectedIpId === id) {
		store.selectedIpId = store.model.informationProducts[0]?.id || '';
	}
	markDirty();
}

// --- Section item operations ---

type SectionKey = 'personas' | 'businessQuestions' | 'coreBusinessEvents' | 'featureStories' | 'willWont' | 'visions' | 'deliveryTypes' | 'dataSyncs' | 'actionOutcomes';

/** Map from entity label to the section key + simple-field info on the InformationProduct */
const LABEL_TO_SECTION: Record<string, { section?: SectionKey; field?: keyof InformationProduct }> = {
	global_info_product: {},
	global_persona: { section: 'personas' },
	global_business_question: { section: 'businessQuestions' },
	global_core_business_event: { section: 'coreBusinessEvents' },
	ipc_feature_story: { section: 'featureStories' },
	ipc_will_wont: { section: 'willWont' },
	ipc_action_outcome: { section: 'actionOutcomes' },
	ipc_delivery_type: { section: 'deliveryTypes' },
	ipc_data_sync: { section: 'dataSyncs' },
	ipc_product_owner: { field: 'productOwner' },
	ipc_tshirt_size: { field: 'tshirtSize' },
	ipc_vision: { section: 'visions' }
};

/**
 * Add a node to the current IP by entity label.
 * Returns the created node for canvas display.
 */
export function addNodeToIp(entityLabel: string, name: string): IPCNode | null {
	const mapping = LABEL_TO_SECTION[entityLabel];
	if (!mapping) return null;

	// If adding a Name, create a new IP with that name
	if (entityLabel === 'global_info_product') {
		const ip = addInformationProduct(name);
		return { id: ip.id, label: entityLabel, name };
	}

	// If no IP selected yet, auto-create an untitled one so items can be added in any order
	let ip = getSelectedIp();
	if (!ip) {
		ip = addInformationProduct('Untitled');
	}

	// Simple string fields
	if (mapping.field) {
		(ip as any)[mapping.field] = name;
		markDirty();
		return { id: `${ip.id}-${mapping.field}`, label: entityLabel, name };
	}

	// Array sections
	if (mapping.section) {
		const existingItems = ip[mapping.section] as IPCItem[];
		const item: IPCItem = { id: createId(entityLabel.slice(0, 6)), name, description: '', order: existingItems.length + 1 };
		if (mapping.section === 'businessQuestions') {
			(item as BusinessQuestion).actionOutcome = '';
		}
		existingItems.push(item);
		markDirty();
		return { id: item.id, label: entityLabel, name };
	}

	return null;
}

/**
 * Update a node name (inline edit from CanvasCard).
 */
export function updateNodeName(nodeId: string, newName: string) {
	const ip = getSelectedIp();
	if (!ip) return;

	// Check all array sections
	for (const section of ['personas', 'businessQuestions', 'coreBusinessEvents', 'featureStories', 'willWont', 'visions', 'deliveryTypes', 'dataSyncs', 'actionOutcomes'] as SectionKey[]) {
		const item = ip[section].find((i: IPCItem) => i.id === nodeId);
		if (item) {
			item.name = newName;
			markDirty();
			return;
		}
	}

	// Check if it's an IP name
	const targetIp = store.model.informationProducts.find((p) => p.id === nodeId);
	if (targetIp) {
		targetIp.name = newName;
		markDirty();
		return;
	}

	// Check simple string fields encoded as {ipId}-{field}
	for (const ipEntry of store.model.informationProducts) {
		for (const field of ['productOwner', 'tshirtSize'] as const) {
			if (nodeId === `${ipEntry.id}-${field}`) {
				ipEntry[field] = newName;
				markDirty();
				return;
			}
		}
	}
}

/**
 * Update a node description (card edit modal). Composite `{ipId}-{field}`
 * pseudo-nodes (productOwner / tshirtSize) carry no description, so they are
 * intentionally not handled here.
 */
export function updateNodeDescription(nodeId: string, description: string) {
	const ip = getSelectedIp();
	if (ip) {
		for (const section of ['personas', 'businessQuestions', 'coreBusinessEvents', 'featureStories', 'willWont', 'visions', 'deliveryTypes', 'dataSyncs', 'actionOutcomes'] as SectionKey[]) {
			const item = ip[section].find((i: IPCItem) => i.id === nodeId);
			if (item) {
				item.description = description;
				markDirty();
				return;
			}
		}
	}

	// The IP node itself also exposes a description
	const targetIp = store.model.informationProducts.find((p) => p.id === nodeId);
	if (targetIp) {
		targetIp.description = description;
		markDirty();
	}
}

/**
 * Update the order of a node (used by drag-and-drop reordering).
 */
export function updateNodeOrder(nodeId: string, order: number) {
	const ip = getSelectedIp();
	if (!ip) return;

	// Check all array sections
	for (const section of ['personas', 'businessQuestions', 'coreBusinessEvents', 'featureStories', 'willWont', 'visions', 'deliveryTypes', 'dataSyncs', 'actionOutcomes'] as SectionKey[]) {
		const item = ip[section].find((i: IPCItem) => i.id === nodeId);
		if (item) {
			item.order = order;
			markDirty();
			return;
		}
	}
}

/**
 * Remove a node from the current IP by its ID.
 * Handles array items, simple fields, and IP names.
 */
export function removeNodeFromIp(nodeId: string) {
	const ip = getSelectedIp();
	if (!ip) return;

	// Check all array sections
	for (const section of ['personas', 'businessQuestions', 'coreBusinessEvents', 'featureStories', 'willWont', 'visions', 'deliveryTypes', 'dataSyncs', 'actionOutcomes'] as SectionKey[]) {
		const idx = ip[section].findIndex((i: IPCItem) => i.id === nodeId);
		if (idx !== -1) {
			ip[section].splice(idx, 1);
			markDirty();
			return;
		}
	}

	// Check simple string fields encoded as {ipId}-{field}
	for (const ipEntry of store.model.informationProducts) {
		for (const field of ['productOwner', 'tshirtSize'] as const) {
			if (nodeId === `${ipEntry.id}-${field}`) {
				ipEntry[field] = '';
				markDirty();
				return;
			}
		}
	}

	// Check if it's an IP name — delete the entire IP
	const targetIp = store.model.informationProducts.find((p) => p.id === nodeId);
	if (targetIp) {
		removeInformationProduct(nodeId);
		return;
	}
}

/**
 * Flatten the current model state into IPCNode[] for the canvas to render.
 * This is the bridge between the nested JSON model and the flat node list
 * that CanvasSection/CanvasCard expect.
 */
export function getNodesForIp(ipId: string): IPCNode[] {
	if (ipId === '__new__') return [];

	const ip = store.model.informationProducts.find((p) => p.id === ipId);
	if (!ip) return [];

	const nodes: IPCNode[] = [];

	// The IP name node itself
	nodes.push({ id: ip.id, label: 'global_info_product', name: ip.name, description: ip.description });

	// Simple string fields → single nodes (only productOwner and tshirtSize remain as single-value)
	if (ip.productOwner) nodes.push({ id: `${ip.id}-productOwner`, label: 'ipc_product_owner', name: ip.productOwner });
	if (ip.tshirtSize) nodes.push({ id: `${ip.id}-tshirtSize`, label: 'ipc_tshirt_size', name: ip.tshirtSize });

	// Array sections
	for (const v of ip.visions) {
		nodes.push({ id: v.id, label: 'ipc_vision', name: v.name, description: v.description, properties: { order: v.order ?? 0 } });
	}
	for (const d of ip.deliveryTypes) {
		nodes.push({ id: d.id, label: 'ipc_delivery_type', name: d.name, description: d.description, properties: { order: d.order ?? 0 } });
	}
	for (const ds of ip.dataSyncs) {
		nodes.push({ id: ds.id, label: 'ipc_data_sync', name: ds.name, description: ds.description, properties: { order: ds.order ?? 0 } });
	}
	for (const ao of ip.actionOutcomes) {
		nodes.push({ id: ao.id, label: 'ipc_action_outcome', name: ao.name, description: ao.description, properties: { order: ao.order ?? 0 } });
	}
	for (const p of ip.personas) {
		nodes.push({ id: p.id, label: 'global_persona', name: p.name, description: p.description, properties: { order: p.order ?? 0 } });
	}
	for (const bq of ip.businessQuestions) {
		nodes.push({ id: bq.id, label: 'global_business_question', name: bq.name, description: bq.description, properties: { order: bq.order ?? 0 } });
	}
	for (const e of ip.coreBusinessEvents) {
		nodes.push({ id: e.id, label: 'global_core_business_event', name: e.name, description: e.description, properties: { order: e.order ?? 0 } });
	}
	for (const f of ip.featureStories) {
		nodes.push({ id: f.id, label: 'ipc_feature_story', name: f.name, description: f.description, properties: { order: f.order ?? 0 } });
	}
	for (const w of ip.willWont) {
		nodes.push({ id: w.id, label: 'ipc_will_wont', name: w.name, description: w.description, properties: { order: w.order ?? 0 } });
	}

	return nodes;
}

// --- Import/Export ---

export function exportJSON(): string {
	return JSON.stringify(store.model, null, 2);
}

export async function importJSON(json: string) {
	const parsed = JSON.parse(json);
	if (!parsed.id || !parsed.informationProducts) {
		throw new Error('Invalid IPC model JSON');
	}
	parsed.name = stripDateTimeSuffix(parsed.name || 'imported');
	const existingIds = store.savedList.map((s) => s.id);
	const id = slugify(parsed.name, existingIds);
	parsed.id = id;
	const migrated = migrateModel(parsed);
	await apiCreateModel(migrated);
	store.savedList = [...store.savedList, { id, name: migrated.name }];
	store.model = migrated;
	store.selectedIpId = parsed.informationProducts[0]?.id || '';
	store.dirty = false;
	if (typeof window !== 'undefined') {
		localStorage.setItem('ipc-current-id', id);
	}
}
