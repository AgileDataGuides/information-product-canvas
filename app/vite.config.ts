import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	server: {
		port: 5115,
		// SECURITY: bind to loopback only. This app has no auth and writes to the
		// filesystem. Do NOT change to '0.0.0.0' or `true` — see SECURITY.md.
		host: '127.0.0.1'
	},
	resolve: {
		alias: {
			'$data': path.resolve('..', 'data')
		}
	}
});
