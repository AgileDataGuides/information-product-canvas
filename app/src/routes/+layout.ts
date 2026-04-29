// Conditionally disable SSR only for the demo build (GitHub Pages / adapter-static).
// Normal dev + adapter-auto builds keep SSR on so the Tailwind + SvelteKit CSS
// pipeline runs as expected.
const demoMode = import.meta.env.VITE_DEMO_MODE === 'true';

export const ssr = !demoMode;
export const prerender = false;
