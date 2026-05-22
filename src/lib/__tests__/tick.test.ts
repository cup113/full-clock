import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getNow, resetTick } from '../tick.svelte';
import { applySync, removeSync } from '../time.svelte';

beforeEach(() => {
	vi.useFakeTimers();
	vi.setSystemTime(new Date(2026, 4, 7, 14, 30, 45));
	removeSync();
	resetTick();
});

afterEach(() => {
	vi.useRealTimers();
});

describe('getNow', () => {
	it('returns current time when no sync is applied', () => {
		expect(getNow()).toBe(Date.now());
	});

	it('includes synced offset when sync is applied', () => {
		applySync({ offset: 500, errorMargin: 50, serverTime: Date.now() });
		expect(getNow()).toBe(Date.now() + 500);
	});

	it('reverts after removeSync', () => {
		applySync({ offset: 500, errorMargin: 50, serverTime: Date.now() });
		removeSync();
		expect(getNow()).toBe(Date.now());
	});
});

describe('resetTick', () => {
	it('updates internal time to new Date.now()', () => {
		vi.setSystemTime(new Date(2027, 0, 1, 0, 0, 0));
		resetTick();
		expect(getNow()).toBe(Date.now());
	});
});
