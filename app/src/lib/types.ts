// IPC standalone types — mirrors the nested JSON schema

export interface IPCModel {
	version: string;
	id: string;
	name: string;
	description: string;
	informationProducts: InformationProduct[];
	sharedPersonas: IPCItem[];
	sharedBusinessQuestions: IPCItem[];
	sharedCoreBusinessEvents: IPCItem[];
}

export interface InformationProduct {
	id: string;
	name: string;
	description: string;
	productOwner: string;
	tshirtSize: string;
	/** @deprecated Use visions[] instead — kept for migration from old single-value format */
	vision?: string;
	/** @deprecated Use deliveryTypes[] instead — kept for migration from old single-value format */
	deliveryType?: string;
	/** @deprecated Use dataSyncs[] instead — kept for migration from old single-value format */
	dataSync?: string;
	visions: IPCItem[];
	deliveryTypes: IPCItem[];
	dataSyncs: IPCItem[];
	actionOutcomes: IPCItem[];
	personas: IPCItem[];
	businessQuestions: BusinessQuestion[];
	coreBusinessEvents: IPCItem[];
	featureStories: IPCItem[];
	willWont: IPCItem[];
	order?: number;
}

export interface IPCItem {
	id: string;
	name: string;
	description: string;
	order?: number;
}

export interface BusinessQuestion extends IPCItem {
	actionOutcome: string;
}

// Entity type config for the standalone app (subset of Context Plane's full entity type system)
export interface ContextTypeConfig {
	label: string;
	displayName: string;
	color: string;
	shape: string;
	description: string;
}

// Node representation used by canvas components (flat, adapter-compatible)
export interface IPCNode {
	id: string;
	label: string;
	name: string;
	description?: string;
	properties?: Record<string, unknown>;
}
