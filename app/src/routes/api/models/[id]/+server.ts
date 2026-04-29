import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import fs from 'fs';
import { safeFilePath, isValidModel, readJsonBody } from '../utils';

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

	const body = await readJsonBody(request);
	if (!body.ok) return body.response;
	const model = body.value;
	if (!isValidModel(model)) {
		return json({ error: 'Invalid model data' }, { status: 400 });
	}

	// Force the saved model's id to match the URL param. The two can drift
	// (legacy files where the internal id no longer matches the filename);
	// re-saves should always converge on the URL id rather than persisting
	// whatever the client had cached.
	model.id = params.id as string;

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
