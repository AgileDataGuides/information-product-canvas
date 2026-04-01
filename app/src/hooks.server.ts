import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const origin = event.request.headers.get('origin');

	// Block cross-origin requests to API routes
	if (event.url.pathname.startsWith('/api/') && origin) {
		const url = new URL(event.request.url);
		const allowedOrigin = `${url.protocol}//${url.host}`;
		if (origin !== allowedOrigin) {
			return new Response('Forbidden', { status: 403 });
		}
	}

	const response = await resolve(event);

	// Content Security Policy
	response.headers.set(
		'Content-Security-Policy',
		"default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self';"
	);

	return response;
};
