import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import fs from 'fs';
import { safeFilePath, isValidModel } from '../utils';

export const GET: RequestHandler = async ({ params }) => {
	const filePath = safeFilePath(params.id);
	if (!filePath) {
		return json({ error: 'Invalid id' }, { status: 400 });
	}
	if (!fs.existsSync(filePath)) {
		return json({ error: 'Not found' }, { status: 404 });
	}
	const raw = fs.readFileSync(filePath, 'utf-8');
	try {
		return json(JSON.parse(raw));
	} catch {
		return json({ error: 'Corrupted model file' }, { status: 500 });
	}
};

export const PUT: RequestHandler = async ({ params, request }) => {
	const filePath = safeFilePath(params.id);
	if (!filePath) {
		return json({ error: 'Invalid id' }, { status: 400 });
	}

	const text = await request.text();
	if (text.length > 5 * 1024 * 1024) {
		return json({ error: 'Payload too large' }, { status: 413 });
	}

	const model = JSON.parse(text);
	if (!isValidModel(model)) {
		return json({ error: 'Invalid model data' }, { status: 400 });
	}

	fs.writeFileSync(filePath, JSON.stringify(model, null, 2));
	return json({ ok: true });
};

export const DELETE: RequestHandler = async ({ params }) => {
	const filePath = safeFilePath(params.id);
	if (!filePath) {
		return json({ error: 'Invalid id' }, { status: 400 });
	}
	if (fs.existsSync(filePath)) {
		const archivePath = filePath.replace('.json', `.deleted-${Date.now()}.json`);
		fs.renameSync(filePath, archivePath);
	}
	return json({ ok: true });
};
