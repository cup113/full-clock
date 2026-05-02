const STORAGE_KEY = 'FL_preferences';

export interface Preferences {
	background: string;
	foreground: string;
	fontFamily: string;
	secondStyle: 'fullscreen-bar' | 'top-bar' | 'digital' | 'off';
	colorProgress: string;
	progressOpacity: number;
	titleStyle: 'date' | 'custom' | 'off';
	titleCustomized: string;
	keepScreenOn: boolean;
}

export const defaults: Preferences = {
	background: '#004400',
	foreground: '#FFFFFF',
	fontFamily: 'Arial, 等线, sans-serif',
	secondStyle: 'fullscreen-bar',
	colorProgress: '#005500',
	progressOpacity: 20,
	titleStyle: 'date',
	titleCustomized: '',
	keepScreenOn: false
};

function load(): Preferences {
	if (typeof localStorage === 'undefined') return { ...defaults };
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (raw) {
			const parsed = JSON.parse(raw);
			return { ...defaults, ...parsed };
		}
	} catch {
		/* ignore */
	}
	return { ...defaults };
}

export function save(prefs: Preferences) {
	if (typeof localStorage === 'undefined') return;
	localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}

export const prefs = $state(load());
