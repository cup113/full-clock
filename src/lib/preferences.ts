const STORAGE_KEY = 'FL_preferences';

export interface Preferences {
	background: string;
	foreground: string;
	fontFamily: string;
	secondStyle: 'bar' | 'digital' | 'off';
	barPosition: 'fullscreen' | 'top' | 'bottom';
	colorProgress: string;
	progressOpacity: number;
	timeFormat: '12h' | '24h';
	titleStyle: 'date' | 'custom' | 'off';
	titleCustomized: string;
	keepScreenOn: boolean;
}

export const defaults: Preferences = {
	background: '#004400',
	foreground: '#FFFFFF',
	fontFamily: 'Arial',
	secondStyle: 'bar',
	barPosition: 'fullscreen',
	colorProgress: '#005500',
	progressOpacity: 20,
	timeFormat: '24h',
	titleStyle: 'date',
	titleCustomized: '',
	keepScreenOn: false,
};

export function load(): Preferences {
	if (typeof localStorage === 'undefined') return { ...defaults };
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (raw) {
			const parsed = JSON.parse(raw);
			const migrated = { ...defaults, ...parsed };
			if (parsed.secondStyle === 'fullscreen-bar') {
				migrated.secondStyle = 'bar';
				migrated.barPosition = 'fullscreen';
			} else if (parsed.secondStyle === 'top-bar') {
				migrated.secondStyle = 'bar';
				migrated.barPosition = 'top';
			}
			return migrated;
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
