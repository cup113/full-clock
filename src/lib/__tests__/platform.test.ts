import { describe, it, expect, afterEach } from 'vitest';
import { isTauri } from '../platform';

afterEach(() => {
	delete (window as unknown as Record<string, unknown>).__TAURI_INTERNALS__;
});

describe('isTauri', () => {
	it('is false in a plain browser', () => {
		expect(isTauri()).toBe(false);
	});

	it('is true once the Tauri runtime is present', () => {
		(window as unknown as Record<string, unknown>).__TAURI_INTERNALS__ = {};
		expect(isTauri()).toBe(true);
	});
});
