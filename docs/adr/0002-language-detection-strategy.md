# Language Detection — Inline IIFE in `app.html`

The app supports zh and en locales via Paraglide JS. The naive approach (call `setLocale()` in a Svelte `$effect` after mount) causes a visible flash of the wrong locale before hydration — the page renders in the base locale (en), then switches.

We inject an inline IIFE in `app.html:<head>` that runs synchronously during HTML parsing, before any SvelteKit code mounts. It reads the `PARAGLIDE_LOCALE` cookie first — if the user has manually chosen a language, it exits. Otherwise it checks `navigator.languages` for a `zh`-prefix entry and hard-redirects to `/zh/` via `location.replace()`. Both `/zh/` and `/en/` paths are prerendered, so the redirect lands on a fully built page in the correct locale.

Trade-off: a hard navigation (with a brief blank) instead of a soft client-side switch. Acceptable because: (a) the redirect happens before any paint, so there's no wrong-locale flash, and (b) redirects only occur on first visit or after clearing the locale cookie, not on every navigation.
