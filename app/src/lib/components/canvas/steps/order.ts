import type { ContextNode } from '$lib/cp-shared';

/** The grid's card order, lowest `properties.order` first, the same sort the shared CanvasSection uses */
export function byOrder(a: ContextNode, b: ContextNode): number {
	return ((a.properties?.order as number) || 0) - ((b.properties?.order as number) || 0);
}
