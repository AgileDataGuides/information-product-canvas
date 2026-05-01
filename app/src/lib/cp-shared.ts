// Shared types — bundled locally for standalone distribution
// These types are the contract between the canvas components and the data layer.

export interface ContextNode {
  id: string;
  label: string;          // Context type(s), comma-separated
  name: string;
  description?: string | null;
  properties?: Record<string, unknown> | null;
  created_at?: string;
  updated_at?: string;
}

export interface ContextLink {
  id: string;
  source_id: string;
  destination_id: string;
  label: string;          // Relationship type
  properties?: Record<string, unknown> | null;
  created_at?: string;
  updated_at?: string;
}

/** Parse comma-separated label string into array */
export function getNodeLabels(node: { label: string }): string[] {
  return node.label.split(",").map((l) => l.trim()).filter(Boolean);
}

/** Check if a node has a given label */
export function nodeHasLabel(node: { label: string }, label: string): boolean {
  return getNodeLabels(node).includes(label);
}

export interface DataAdapter {
  // Node operations
  getNodes(filter?: { label?: string }): Promise<ContextNode[]>;
  getNode(id: string): Promise<ContextNode | null>;
  createNode(node: Omit<ContextNode, "id" | "created_at" | "updated_at">): Promise<ContextNode>;
  updateNode(id: string, updates: Partial<ContextNode>): Promise<ContextNode>;
  deleteNode(id: string): Promise<void>;

  // Link operations
  getLinks(filter?: { label?: string; source_id?: string; destination_id?: string }): Promise<ContextLink[]>;
  createLink(link: Omit<ContextLink, "id" | "created_at" | "updated_at">): Promise<ContextLink>;
  deleteLink(id: string): Promise<void>;

  // Bulk operations (for import/export)
  exportAll(): Promise<{ nodes: ContextNode[]; links: ContextLink[] }>;
  importAll(data: { nodes: ContextNode[]; links: ContextLink[] }): Promise<void>;
}

export interface EntityTypeDefinition {
  label: string;
  displayName: string;
  shape: string;
  color: string;
  category: string;
  isGlobal: boolean;
}

export interface RelationshipTypeDefinition {
  label: string;
  displayName: string;
  validSources: string[];
  validTargets: string[];
}

export interface AppManifest {
  id: string;
  name: string;
  version: string;
  canvasId: string;
  entityTypes: EntityTypeDefinition[];
  relationshipTypes: RelationshipTypeDefinition[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rootComponent: () => Promise<{ default: any }>;
}
