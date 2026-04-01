import path from 'path';

export const DATA_DIR = path.resolve(process.cwd(), '..', 'data');

export function safeFilePath(id: string): string | null {
	if (!/^[a-z0-9][a-z0-9-]*$/i.test(id)) return null;
	const filePath = path.join(DATA_DIR, `${id}.json`);
	if (!path.resolve(filePath).startsWith(path.resolve(DATA_DIR))) return null;
	return filePath;
}

export function isValidModel(data: unknown): data is { id: string; [key: string]: unknown } {
	if (typeof data !== 'object' || data === null) return false;
	const obj = data as Record<string, unknown>;
	if (typeof obj.id !== 'string' || obj.id.length === 0) return false;
	if (typeof obj.name !== 'string') return false;
	if (!Array.isArray(obj.informationProducts)) return false;
	if (obj.informationProducts.length > 100) return false;
	return true;
}
