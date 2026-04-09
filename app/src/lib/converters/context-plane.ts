/**
 * Bidirectional converter between IPC native JSON and Context Plane { nodes, links } format.
 */
import type { ContextNode, ContextLink } from '$lib/types/shared';
import type { IPCModel, InformationProduct, IPCItem, BusinessQuestion } from '../types';

function createId(prefix: string): string {
	const rand = typeof crypto !== 'undefined' && crypto.randomUUID
		? crypto.randomUUID().slice(0, 8)
		: Math.random().toString(36).slice(2, 10);
	return `${prefix}-${rand}`;
}

function now(): string {
	return new Date().toISOString();
}

/** Relationship label mapping: entity label → relationship from global_info_product */
const RELATIONSHIP_MAP: Record<string, string> = {
	global_business_question: 'answers',
	global_persona: 'consumed_by',
	ipc_delivery_type: 'delivered_via',
	ipc_data_sync: 'synced_by',
	global_core_business_event: 'sourced_from',
	ipc_feature_story: 'includes_feature',
	ipc_will_wont: 'scoped_by',
	ipc_product_owner: 'owned_by',
	ipc_tshirt_size: 'sized_as',
	ipc_vision: 'fulfills_vision',
	ipc_action_outcome: 'drives_action'
};

/**
 * Convert an IPCModel to Context Plane nodes + links format.
 */
export function ipcToContextPlane(model: IPCModel): { nodes: ContextNode[]; links: ContextLink[] } {
	const nodes: ContextNode[] = [];
	const links: ContextLink[] = [];
	const ts = now();

	// IPC model node (root entity)
	const modelNodeId = `ipc-model-${model.id}`;
	nodes.push({
		id: modelNodeId,
		label: 'ipc_model',
		name: model.name,
		description: model.description,
		properties: { canvas: ['canvas_ipc'], sourceId: model.id },
		created_at: ts,
		updated_at: ts
	});

	for (const ip of model.informationProducts) {
		// IP name node
		const ipNodeId = `ipc-ip-${ip.id}`;
		nodes.push({
			id: ipNodeId,
			label: 'global_info_product',
			name: ip.name,
			description: ip.description,
			properties: { canvas: ['canvas_ipc'], sourceId: ip.id },
			created_at: ts,
			updated_at: ts
		});

		// Link model → IP
		links.push({
			id: createId('link'),
			source_id: modelNodeId,
			destination_id: ipNodeId,
			label: 'has_info_product',
			created_at: ts,
			updated_at: ts
		});

		// Helper to add an item node and link it to the IP
		function addItemNode(label: string, item: IPCItem, relLabel: string) {
			const nodeId = `ipc-${label}-${item.id}`;
			nodes.push({
				id: nodeId,
				label,
				name: item.name,
				description: item.description || undefined,
				properties: { canvas: ['canvas_ipc'], order: item.order ?? 0 },
				created_at: ts,
				updated_at: ts
			});
			links.push({
				id: createId('link'),
				source_id: ipNodeId,
				destination_id: nodeId,
				label: relLabel,
				created_at: ts,
				updated_at: ts
			});
			return nodeId;
		}

		// Helper to add a simple-field node
		function addFieldNode(label: string, value: string, relLabel: string) {
			if (!value) return;
			const nodeId = `ipc-${label}-${ip.id}`;
			nodes.push({
				id: nodeId,
				label,
				name: value,
				properties: { canvas: ['canvas_ipc'] },
				created_at: ts,
				updated_at: ts
			});
			links.push({
				id: createId('link'),
				source_id: ipNodeId,
				destination_id: nodeId,
				label: relLabel,
				created_at: ts,
				updated_at: ts
			});
		}

		// Simple fields (single-value)
		addFieldNode('ipc_product_owner', ip.productOwner, 'owned_by');
		addFieldNode('ipc_tshirt_size', ip.tshirtSize, 'sized_as');

		// Array sections
		for (const v of ip.visions || []) {
			addItemNode('ipc_vision', v, 'fulfills_vision');
		}
		for (const d of ip.deliveryTypes || []) {
			addItemNode('ipc_delivery_type,global_delivery_type', d, 'delivered_via');
		}
		for (const ds of ip.dataSyncs || []) {
			addItemNode('ipc_data_sync,global_data_sync', ds, 'synced_by');
		}
		for (const ao of ip.actionOutcomes || []) {
			addItemNode('ipc_action_outcome', ao, 'drives_action');
		}

		for (const p of ip.personas) {
			addItemNode('global_persona', p, 'consumed_by');
		}

		for (const bq of ip.businessQuestions) {
			addItemNode('global_business_question', bq, 'answers');
		}

		for (const e of ip.coreBusinessEvents) {
			addItemNode('global_core_business_event', e, 'sourced_from');
		}

		for (const f of ip.featureStories) {
			addItemNode('ipc_feature_story', f, 'includes_feature');
		}

		for (const w of ip.willWont) {
			addItemNode('ipc_will_wont', w, 'scoped_by');
		}
	}

	return { nodes, links };
}

/**
 * Convert Context Plane nodes + links back to an IPCModel.
 */
export function contextPlaneToIpc(
	data: { nodes: ContextNode[]; links: ContextLink[] },
	modelName?: string
): IPCModel {
	const { nodes, links } = data;

	// Find model node if it exists
	const modelNode = nodes.find((n) => n.label === 'ipc_model');

	// Find all IP name nodes (scoped to model if model node exists)
	let ipNodes: ContextNode[];
	if (modelNode) {
		const ipLinks = links.filter((l) => l.source_id === modelNode.id && l.label === 'has_info_product');
		const ipIds = new Set(ipLinks.map((l) => l.destination_id));
		ipNodes = nodes.filter((n) => n.label === 'global_info_product' && ipIds.has(n.id));
	} else {
		ipNodes = nodes.filter((n) => n.label === 'global_info_product');
	}

	const informationProducts: InformationProduct[] = ipNodes.map((ipNode) => {
		// Find all links FROM this IP node
		const ipLinks = links.filter((l) => l.source_id === ipNode.id);
		const linkedNodeIds = new Set(ipLinks.map((l) => l.destination_id));
		const linkedNodes = nodes.filter((n) => linkedNodeIds.has(n.id));

		// Helper to find linked nodes by label
		function findByLabel(label: string): ContextNode[] {
			return linkedNodes.filter((n) => n.label === label || n.label.split(',').map(l => l.trim()).includes(label));
		}

		// Simple fields (single-value)
		const productOwner = findByLabel('ipc_product_owner')[0]?.name || '';
		const tshirtSize = findByLabel('ipc_tshirt_size')[0]?.name || '';

		// Helper to convert nodes to IPCItem[]
		function toItems(label: string): IPCItem[] {
			return findByLabel(label).map((n) => ({
				id: n.properties?.sourceId as string || n.id,
				name: n.name,
				description: n.description || '',
				order: (n.properties?.order as number) ?? 0
			}));
		}

		// Array sections
		const visions = toItems('ipc_vision');
		const deliveryTypes = toItems('ipc_delivery_type');
		const dataSyncs = toItems('ipc_data_sync');
		const actionOutcomes = toItems('ipc_action_outcome');
		const personas = toItems('global_persona');
		const coreBusinessEvents = toItems('global_core_business_event');
		const featureStories = toItems('ipc_feature_story');
		const willWont = toItems('ipc_will_wont');

		const bqNodes = findByLabel('global_business_question');
		const businessQuestions: BusinessQuestion[] = bqNodes.map((bqNode) => ({
			id: bqNode.properties?.sourceId as string || bqNode.id,
			name: bqNode.name,
			description: bqNode.description || '',
			actionOutcome: '',
			order: (bqNode.properties?.order as number) ?? 0
		}));

		return {
			id: ipNode.properties?.sourceId as string || ipNode.id,
			name: ipNode.name,
			description: ipNode.description || '',
			productOwner,
			tshirtSize,
			visions,
			deliveryTypes,
			dataSyncs,
			actionOutcomes,
			personas,
			businessQuestions,
			coreBusinessEvents,
			featureStories,
			willWont
		};
	});

	return {
		version: '1.0',
		id: modelNode?.properties?.sourceId as string || modelName?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'imported',
		name: modelNode?.name || modelName || 'Imported IPC',
		description: modelNode?.description || '',
		informationProducts,
		sharedPersonas: [],
		sharedBusinessQuestions: [],
		sharedCoreBusinessEvents: []
	};
}
