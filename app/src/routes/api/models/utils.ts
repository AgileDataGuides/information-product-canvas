import { json } from '@sveltejs/kit';
import path from 'path';

export const DATA_DIR = path.resolve(process.cwd(), '..', 'data');

/** Max accepted request body size for model writes (POST + PUT). */
export const MAX_BODY_BYTES = 5 * 1024 * 1024;

export function safeFilePath(id: string): string | null {
	if (!/^[a-z0-9][a-z0-9-]*$/i.test(id)) return null;
	const filePath = path.join(DATA_DIR, `${id}.json`);
	if (!path.resolve(filePath).startsWith(path.resolve(DATA_DIR))) return null;
	return filePath;
}

/**
 * Read a request body as text with a hard byte cap. Returns either a parsed
 * JSON value or a `Response` to propagate back to the client.
 *
 * Why not trust `Content-Length`? It's client-supplied. Chunked requests
 * report `0` and skip the check. Reading the body server-side and counting
 * bytes ourselves is the only reliable way to enforce a payload limit on a
 * Web/Fetch-style `Request`. We read as text first (cheap, single pass) and
 * fail fast if it's too big — this loads up to MAX_BODY_BYTES into memory
 * which is fine for a local-only dev tool.
 */
export async function readJsonBody(
	request: Request
): Promise<{ ok: true; value: unknown } | { ok: false; response: Response }> {
	const text = await request.text();
	// One UTF-16 code unit ≈ one byte for ASCII-heavy JSON; for non-ASCII
	// content this is a slight under-count but still safely above the byte
	// length, so the cap is conservative.
	if (text.length > MAX_BODY_BYTES) {
		return { ok: false, response: json({ error: 'Payload too large' }, { status: 413 }) };
	}
	try {
		return { ok: true, value: JSON.parse(text) };
	} catch {
		return { ok: false, response: json({ error: 'Invalid JSON' }, { status: 400 }) };
	}
}

/**
 * Server-side trust boundary for incoming model writes. We only validate the
 * top-level shape — the client does deeper shape repair below this level,
 * and a stricter API would break legacy-file recovery. The goal here is just
 * to stop a malformed POST from writing a non-array into `informationProducts`
 * and crashing the GET listing later.
 */
export function isValidModel(data: unknown): data is {
	id: string;
	name: string;
	informationProducts: unknown[];
	[key: string]: unknown;
} {
	if (typeof data !== 'object' || data === null) return false;
	const obj = data as Record<string, unknown>;
	if (typeof obj.id !== 'string' || obj.id.length === 0) return false;
	if (typeof obj.name !== 'string') return false;
	if (!Array.isArray(obj.informationProducts)) return false;
	if (obj.informationProducts.length > 100) return false;
	// Optional metadata arrays — must actually be arrays if present.
	if (obj.tags !== undefined && !Array.isArray(obj.tags)) return false;
	return true;
}
