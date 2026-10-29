import { isTauri } from './platform';

/** `http(s)` hrefs point outside the app; every in-app link is written relative. */
const EXTERNAL_HREF = /^https?:\/\//i;

/**
 * True for a link that leaves the app.
 *
 * The check reads the raw `href` attribute on purpose: inside the shell the
 * document is served from `http://tauri.localhost`, so a resolved internal link
 * (`/zh` → `http://tauri.localhost/zh`) would look external and be sent to the
 * browser.
 */
export function isExternalHref(href: string): boolean {
	return EXTERNAL_HREF.test(href.trim());
}

/**
 * Hands a URL to the system browser.
 *
 * The plugin is imported lazily so the web build never evaluates it — the same
 * reason `time.ts` loads `@tauri-apps/api` that way.
 */
export async function openExternal(href: string): Promise<void> {
	const { openUrl } = await import('@tauri-apps/plugin-opener');
	await openUrl(href);
}

/**
 * Routes external link clicks to the system browser in the desktop shell, and
 * does nothing on the web, where `target="_blank"` already opens a tab.
 *
 * WebView2 reports `target="_blank"` as a new-window request and wry drops it
 * silently when the app registered no handler, so every external anchor is
 * inert by default — including the four inside the FAQ answers rendered with
 * `{@html}`. Listening on the document covers those without touching each link.
 *
 * Middle-click (`auxclick`) is not handled.
 *
 * @returns a disposer that removes the listener
 */
export function interceptExternalLinks(open: (href: string) => void = openExternal): () => void {
	if (!isTauri()) return () => {};

	function onClick(event: MouseEvent) {
		const target = event.target;
		if (!(target instanceof Element)) return;
		const anchor = target.closest('a[href]');
		if (!(anchor instanceof HTMLAnchorElement)) return;
		if (!isExternalHref(anchor.getAttribute('href') ?? '')) return;

		event.preventDefault();
		open(anchor.href);
	}

	document.addEventListener('click', onClick);
	return () => document.removeEventListener('click', onClick);
}
