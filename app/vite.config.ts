import adapterAuto from '@sveltejs/adapter-auto';
import adapterStatic from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import path from 'path';

const isDemo = process.env.DEMO_BUILD === 'true';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit({
			dynamicCompileOptions: ({ filename }) => filename.includes('node_modules') ? undefined : { runes: true },

			adapter: isDemo
				? adapterStatic({
					pages: 'build',
					assets: 'build',
					fallback: 'index.html' /* SPA mode — all routes handled client-side */,
					precompress: false,
					strict: false
				})
				: adapterAuto(),

			paths: isDemo
				? { base: '/information-product-canvas' } /* GitHub Pages repo path */
				: {}
		})
	],
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
