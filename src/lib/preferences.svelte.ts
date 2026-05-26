import { load, type Preferences, defaults, save as saveRaw } from './preferences.ts';

export { type Preferences, defaults };

export const prefs = $state(load());

export function resetPrefs() {
	Object.assign(prefs, defaults);
}

let _saveTimer: ReturnType<typeof setTimeout> | undefined;

export function save(p: Preferences): void {
	clearTimeout(_saveTimer);
	_saveTimer = setTimeout(() => saveRaw(p), 100);
}

export function saveNow(p: Preferences): void {
	clearTimeout(_saveTimer);
	saveRaw(p);
}
