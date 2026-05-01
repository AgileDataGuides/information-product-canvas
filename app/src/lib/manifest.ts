import type { AppManifest, EntityTypeDefinition, RelationshipTypeDefinition } from '$lib/cp-shared';

const entityTypes: EntityTypeDefinition[] = [
	{ label: 'global_info_product', displayName: 'Information Product', shape: 'diamond', color: '#f59e0b', category: 'global', isGlobal: true },
	{ label: 'global_business_question', displayName: 'Business Question', shape: 'round-rectangle', color: '#0ea5e9', category: 'global', isGlobal: true },
	{ label: 'global_persona', displayName: 'Persona', shape: 'round-rectangle', color: '#0369a1', category: 'global', isGlobal: true },
	{ label: 'global_core_business_event', displayName: 'Core Business Event', shape: 'diamond', color: '#6d28d9', category: 'global', isGlobal: true },
	{ label: 'ipc_action_outcome', displayName: 'Action/Outcome', shape: 'round-rectangle', color: '#0284c7', category: 'ipc_why', isGlobal: false },
	{ label: 'ipc_delivery_type', displayName: 'Delivery Type', shape: 'round-rectangle', color: '#8b5cf6', category: 'ipc_what', isGlobal: false },
	{ label: 'ipc_data_sync', displayName: 'Data Sync', shape: 'round-rectangle', color: '#7c3aed', category: 'ipc_what', isGlobal: false },
	{ label: 'ipc_feature_story', displayName: 'Feature Story', shape: 'round-rectangle', color: '#5b21b6', category: 'ipc_what', isGlobal: false },
	{ label: 'ipc_will_wont', displayName: "Will/Won't", shape: 'round-rectangle', color: '#4c1d95', category: 'ipc_what', isGlobal: false },
	{ label: 'ipc_product_owner', displayName: 'Product Owner', shape: 'round-rectangle', color: '#d97706', category: 'ipc_product', isGlobal: false },
	{ label: 'ipc_vision', displayName: 'Vision', shape: 'round-rectangle', color: '#b45309', category: 'ipc_product', isGlobal: false },
	{ label: 'ipc_tshirt_size', displayName: 'T-Shirt Size', shape: 'round-rectangle', color: '#92400e', category: 'ipc_product', isGlobal: false }
];

const relationshipTypes: RelationshipTypeDefinition[] = [
	{ label: 'answers', displayName: 'Answers', validSources: ['global_info_product'], validTargets: ['global_business_question'] },
	{ label: 'drives_action', displayName: 'Drives Action', validSources: ['global_business_question'], validTargets: ['ipc_action_outcome'] },
	{ label: 'consumed_by', displayName: 'Consumed By', validSources: ['global_info_product'], validTargets: ['global_persona'] },
	{ label: 'asks', displayName: 'Asks', validSources: ['global_persona'], validTargets: ['global_business_question'] },
	{ label: 'delivered_via', displayName: 'Delivered Via', validSources: ['global_info_product'], validTargets: ['ipc_delivery_type'] },
	{ label: 'synced_by', displayName: 'Synced By', validSources: ['global_info_product'], validTargets: ['ipc_data_sync'] },
	{ label: 'sourced_from', displayName: 'Sourced From', validSources: ['global_info_product'], validTargets: ['global_core_business_event'] },
	{ label: 'includes_feature', displayName: 'Includes Feature', validSources: ['global_info_product'], validTargets: ['ipc_feature_story'] },
	{ label: 'scoped_by', displayName: 'Scoped By', validSources: ['global_info_product'], validTargets: ['ipc_will_wont'] },
	{ label: 'owned_by', displayName: 'Owned By', validSources: ['global_info_product'], validTargets: ['ipc_product_owner'] },
	{ label: 'sized_as', displayName: 'Sized As', validSources: ['global_info_product'], validTargets: ['ipc_tshirt_size'] },
	{ label: 'fulfills_vision', displayName: 'Fulfills Vision', validSources: ['global_info_product'], validTargets: ['ipc_vision'] }
];

export const manifest: AppManifest = {
	id: 'information-product-canvas',
	name: 'Information Product Canvas',
	version: '0.1.0',
	canvasId: 'canvas_ipc',
	entityTypes,
	relationshipTypes,
	rootComponent: () => import('$lib/components/canvas/IPCLayout.svelte')
};
