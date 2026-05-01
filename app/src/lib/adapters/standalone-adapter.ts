import type { DataAdapter, ContextNode, ContextLink } from '$lib/cp-shared';

/**
 * Full DataAdapter for IPC standalone mode.
 * Delegates all operations to the store via callbacks.
 */
export function createStandaloneAdapter(callbacks: {
  getModel: () => { nodes: ContextNode[]; links: ContextLink[] };
  onUpdateNode: (id: string, updates: Partial<ContextNode>) => void;
  onCreateNode: (node: Partial<ContextNode>) => Promise<ContextNode>;
  onDeleteNode: (id: string) => Promise<void>;
  onCreateLink: (link: Partial<ContextLink>) => Promise<ContextLink>;
  onDeleteLink: (id: string) => Promise<void>;
}): DataAdapter {
  return {
    async getNodes() {
      return callbacks.getModel().nodes;
    },
    async getNode(id: string) {
      return callbacks.getModel().nodes.find((n) => n.id === id) ?? null;
    },
    async createNode(node) {
      return callbacks.onCreateNode(node);
    },
    async updateNode(id, updates) {
      callbacks.onUpdateNode(id, updates);
      return { id, label: '', name: '', ...updates } as ContextNode;
    },
    async deleteNode(id) {
      await callbacks.onDeleteNode(id);
    },
    async getLinks() {
      return callbacks.getModel().links;
    },
    async createLink(link) {
      return callbacks.onCreateLink(link);
    },
    async deleteLink(id) {
      await callbacks.onDeleteLink(id);
    },
    async exportAll() {
      return callbacks.getModel();
    },
    async importAll() {}
  };
}
