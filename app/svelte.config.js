import adapterAuto from '@sveltejs/adapter-auto';
import adapterStatic from '@sveltejs/adapter-static';

const isDemo = process.env.DEMO_BUILD === 'true';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: isDemo
			? adapterStatic({
				pages: 'build',
				assets: 'build',
				fallback: 'index.html',  // SPA mode — all routes handled client-side
				precompress: false,
				strict: false
			})
			: adapterAuto(),
		paths: isDemo
			? { base: '/information-product-canvas' }  // GitHub Pages repo path
			: {}
	},
	vitePlugin: {
		dynamicCompileOptions: ({ filename }) =>
			filename.includes('node_modules') ? undefined : { runes: true }
	}
};

export default config;
