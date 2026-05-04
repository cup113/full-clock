import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';
import { load, save, defaults } from '../preferences';

beforeAll(() => {
	vi.stubGlobal('localStorage', (() => {
		let store: Record<string, string> = {};
		return {
			getItem: vi.fn((key: string) => store[key] ?? null),
			setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
			removeItem: vi.fn((key: string) => { delete store[key]; }),
			clear: vi.fn(() => { store = {}; }),
			get length() { return Object.keys(store).length; },
			key: vi.fn((i: number) => Object.keys(store)[i] ?? null)
		};
	})());
});

beforeEach(() => {
	localStorage.clear();
	vi.clearAllMocks();
});

describe('save', () => {
	it('writes preferences to localStorage as JSON', () => {
		const customPrefs = { ...defaults, background: '#ff0000', foreground: '#00ff00' };

		save(customPrefs);

		const call = vi.mocked(localStorage.setItem).mock.lastCall;
		expect(call?.[0]).toBe('FL_preferences');
		const stored = JSON.parse(call?.[1] as string);
		expect(stored.background).toBe('#ff0000');
		expect(stored.foreground).toBe('#00ff00');
	});

	it('persists all default preference fields', () => {
		save(defaults);

		const call = vi.mocked(localStorage.setItem).mock.lastCall;
		expect(call?.[0]).toBe('FL_preferences');
		const stored = JSON.parse(call?.[1] as string);
		expect(stored).toEqual(defaults);
	});
});

describe('load', () => {
	it('returns defaults when localStorage is empty', () => {
		const result = load();
		expect(result).toEqual(defaults);
	});

	it('returns defaults when localStorage is undefined', () => {
		const origLocalStorage = (globalThis as any).localStorage;
		delete (globalThis as any).localStorage;

		const result = load();

		(globalThis as any).localStorage = origLocalStorage;
		expect(result).toEqual(defaults);
	});

	it('merges stored partial data with defaults', () => {
		localStorage.setItem('FL_preferences', JSON.stringify({ background: '#ff0000' }));

		const result = load();
		expect(result.background).toBe('#ff0000');
		expect(result.foreground).toBe(defaults.foreground);
		expect(result.fontFamily).toBe(defaults.fontFamily);
	});

	it('handles corrupted JSON gracefully', () => {
		localStorage.setItem('FL_preferences', '{invalid json');

		const result = load();
		expect(result).toEqual(defaults);
	});
});
