import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	compilerOptions: {
		// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
		runes: ({ filename }) => (filename.split(/[/\\]/).includes('node_modules') ? undefined : true)
	},
	kit: {
		adapter: adapter(),
		paths: { relative: false },
		prerender: {
			entries: ['/', '/about', '/zh/', '/en/', '/zh/about', '/en/about']
		},
		output: {
			// no bundleStrategy — let SvelteKit split by route
		}
	}
};

export default config;
