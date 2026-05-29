import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('../preferences', async (importOriginal) => {
	const actual = await importOriginal<typeof import('../preferences')>();
	return { ...actual, save: vi.fn() };
});

import { save, saveNow, defaults } from '../preferences.svelte';
import { save as _rawSave } from '../preferences';

const rawSave = vi.mocked(_rawSave);

beforeEach(() => {
	vi.useFakeTimers();
	rawSave.mockClear();
});

afterEach(() => {
	vi.useRealTimers();
});

describe('save (debounced)', () => {
	it('does not call raw save immediately', () => {
		save({ ...defaults, background: '#ff0000' });
		expect(rawSave).not.toHaveBeenCalled();
	});

	it('calls raw save after 100ms debounce', () => {
		save({ ...defaults, background: '#ff0000' });
		vi.advanceTimersByTime(100);
		expect(rawSave).toHaveBeenCalledTimes(1);
		expect(rawSave).toHaveBeenCalledWith(expect.objectContaining({ background: '#ff0000' }));
	});

	it('cancels previous pending save on rapid calls', () => {
		save({ ...defaults, background: '#111' });
		save({ ...defaults, background: '#222' });
		save({ ...defaults, background: '#333' });
		vi.advanceTimersByTime(100);
		expect(rawSave).toHaveBeenCalledTimes(1);
		expect(rawSave).toHaveBeenCalledWith(expect.objectContaining({ background: '#333' }));
	});
});

describe('saveNow', () => {
	it('calls raw save immediately', () => {
		saveNow({ ...defaults, background: '#ff0000' });
		expect(rawSave).toHaveBeenCalledTimes(1);
	});

	it('clears any pending debounced save', () => {
		save({ ...defaults, background: '#111' });
		saveNow({ ...defaults, background: '#222' });
		expect(rawSave).toHaveBeenCalledTimes(1);
		vi.advanceTimersByTime(100);
		expect(rawSave).toHaveBeenCalledTimes(1);
	});
});
