/**
 * True when the app runs inside the Tauri desktop shell.
 *
 * Tauri v2 installs `__TAURI_INTERNALS__` on `window` before any app code runs,
 * so a plain property check is enough — no import from `@tauri-apps/api` needed
 * on the web build.
 */
export function isTauri(): boolean {
	return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}
