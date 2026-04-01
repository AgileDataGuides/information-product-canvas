import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import fs from 'fs';
import path from 'path';
import { DATA_DIR, safeFilePath, isValidModel } from './utils';

function ensureDataDir() {
	if (!fs.existsSync(DATA_DIR)) {
		fs.mkdirSync(DATA_DIR, { recursive: true });
	}
}

export const GET: RequestHandler = async () => {
	ensureDataDir();
	const files = fs.readdirSync(DATA_DIR).filter((f) => f.endsWith('.json') && !f.includes('.deleted-'));
	const models = files
		.map((f) => {
			try {
				const raw = fs.readFileSync(path.join(DATA_DIR, f), 'utf-8');
				return JSON.parse(raw);
			} catch {
				console.error(`Skipping malformed file: ${f}`);
				return null;
			}
		})
		.filter(Boolean);
	return json(models);
};

export const POST: RequestHandler = async ({ request }) => {
	ensureDataDir();

	const contentLength = parseInt(request.headers.get('content-length') || '0', 10);
	if (contentLength > 5 * 1024 * 1024) {
		return json({ error: 'Payload too large' }, { status: 413 });
	}

	const model = await request.json();
	if (!isValidModel(model)) {
		return json({ error: 'Invalid model data' }, { status: 400 });
	}

	const filePath = safeFilePath(model.id);
	if (!filePath) {
		return json({ error: 'Invalid model id' }, { status: 400 });
	}

	fs.writeFileSync(filePath, JSON.stringify(model, null, 2));
	return json({ ok: true, id: model.id });
};
