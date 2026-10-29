import adapter from '@sveltejs/adapter-static';

// Tauri injects TAURI_ENV_* into beforeDevCommand/beforeBuildCommand. The desktop
// shell embeds the assets in the executable, so the cache-first service worker
// would only pin stale files across app updates — register it for the web only.
const isDesktopBuild = Boolean(process.env.TAURI_ENV_PLATFORM);

/** @type {import('@sveltejs/kit').Config} */
const config = {
	compilerOptions: {
		// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
		runes: ({ filename }) => (filename.split(/[/\\]/).includes('node_modules') ? undefined : true),
	},
	kit: {
		adapter: adapter(),
		paths: { relative: false },
		prerender: {
			entries: ['/', '/about', '/zh/', '/en/', '/zh/about', '/en/about'],
		},
		output: {
			// no bundleStrategy — let SvelteKit split by route
		},
		serviceWorker: isDesktopBuild ? { register: false } : undefined,
	},
};

export default config;
