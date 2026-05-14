# Service Worker Strategy — `$service-worker` over `vite-plugin-pwa`

We started with `vite-plugin-pwa` (Workbox) for PWA support. It failed in production: Workbox's glob-based precaching runs during the Vite build phase, but SvelteKit's static adapter hasn't generated prerendered HTML files yet. Every prerendered route (`/`, `/about`, `/zh/`, `/en/`, etc.) was missing from the precache manifest, causing `non-precached-url` errors on navigation. `navigateFallback` couldn't work around this because the fallback target itself wasn't precached.

We replaced Workbox entirely with SvelteKit's native `$service-worker` module. SvelteKit populates the `prerendered`, `build`, and `files` arrays after the adapter finishes, so all HTML paths are available for caching. The custom SW is ~1.3KB with zero extra dependencies (previously ~5KB + workbox-*.js).

Update flow: the new SW installs but stays in `waiting` state. `+page.svelte` detects `reg.waiting` and shows a "new version available" banner. On user confirmation, it posts a `SKIP_WAITING` message to the SW, then reloads the page. Background updates are checked every 10 minutes.
