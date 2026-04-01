import type { ContextTypeConfig } from '$lib/types';

export const CONTEXT_TYPES: Record<string, ContextTypeConfig> = {
	global_info_product: {
		label: 'global_info_product',
		displayName: 'Information Product',
		color: '#0ea5e9',
		shape: 'diamond',
		description: 'The name of the Information Product'
	},
	global_business_question: {
		label: 'global_business_question',
		displayName: 'Business Question',
		color: '#7c3aed',
		shape: 'round-rectangle',
		description: 'The business questions that will be answered by using the information'
	},
	global_persona: {
		label: 'global_persona',
		displayName: 'Persona',
		color: '#f97316',
		shape: 'round-rectangle',
		description: 'The audience (personas) that will use the Information Product'
	},
	global_core_business_event: {
		label: 'global_core_business_event',
		displayName: 'Core Business Event',
		color: '#16a34a',
		shape: 'diamond',
		description: 'A core business event — something that happens at a point in time'
	},
	ipc_action_outcome: {
		label: 'ipc_action_outcome',
		displayName: 'Action/Outcome',
		color: '#7c3aed',
		shape: 'round-rectangle',
		description: 'The action that will be taken and the business outcome that will be achieved'
	},
	ipc_delivery_type: {
		label: 'ipc_delivery_type',
		displayName: 'Delivery Type',
		color: '#f97316',
		shape: 'round-rectangle',
		description: 'The output mechanisms the Information Product will deliver'
	},
	ipc_data_sync: {
		label: 'ipc_data_sync',
		displayName: 'Data Sync',
		color: '#f97316',
		shape: 'round-rectangle',
		description: 'When does the data in the Information Product need to be refreshed by'
	},
	ipc_feature_story: {
		label: 'ipc_feature_story',
		displayName: 'Feature Story',
		color: '#f97316',
		shape: 'round-rectangle',
		description: 'Key features users will require, expressed using the user story pattern'
	},
	ipc_will_wont: {
		label: 'ipc_will_wont',
		displayName: "Will/Won't",
		color: '#f97316',
		shape: 'round-rectangle',
		description: 'Statement of scope boundary and high level acceptance criteria'
	},
	ipc_product_owner: {
		label: 'ipc_product_owner',
		displayName: 'Product Owner',
		color: '#0ea5e9',
		shape: 'round-rectangle',
		description: 'Who will make the trade off decisions'
	},
	ipc_vision: {
		label: 'ipc_vision',
		displayName: 'Vision',
		color: '#0ea5e9',
		shape: 'round-rectangle',
		description: 'The elevator pitch for the Information Product'
	},
	ipc_tshirt_size: {
		label: 'ipc_tshirt_size',
		displayName: 'T-Shirt Size',
		color: '#0ea5e9',
		shape: 'round-rectangle',
		description: 'The guesstimate of effort to deliver the Information Product'
	}
};

export function getContextType(label: string): ContextTypeConfig | undefined {
	return CONTEXT_TYPES[label];
}
