import { describe, it, expect, beforeEach, vi } from 'vitest';
import { syncTime } from '../time';
import {
	applySync,
	removeSync,
	getSyncedOffset,
	getSyncErrorMargin,
	isSyncApplied
} from '../time.svelte';

beforeEach(() => {
	removeSync();
});

describe('applySync / removeSync', () => {
	it('applySync sets the sync state', () => {
		expect(isSyncApplied()).toBe(false);

		applySync({ offset: 500, errorMargin: 50, serverTime: 5000 });

		expect(isSyncApplied()).toBe(true);
		expect(getSyncedOffset()).toBe(500);
		expect(getSyncErrorMargin()).toBe(50);
	});

	it('removeSync resets the sync state to defaults', () => {
		applySync({ offset: 500, errorMargin: 50, serverTime: 5000 });
		removeSync();

		expect(isSyncApplied()).toBe(false);
		expect(getSyncedOffset()).toBe(0);
		expect(getSyncErrorMargin()).toBe(0);
	});
});

describe('getters', () => {
	it('return zero / false when no sync has been applied', () => {
		expect(isSyncApplied()).toBe(false);
		expect(getSyncedOffset()).toBe(0);
		expect(getSyncErrorMargin()).toBe(0);
	});
});

describe('syncTime', () => {
	it('fetches server time and calculates offset', async () => {
		vi.spyOn(Date, 'now').mockReturnValue(1000);

		const fetchMock = vi.fn().mockResolvedValue({
			json: () => Promise.resolve({ data: { timestamp: 2000 } })
		});
		vi.stubGlobal('fetch', fetchMock);

		const result = await syncTime();

		expect(result.serverTime).toBe(2000);
		expect(result.offset).toBe(1000);
		expect(result.errorMargin).toBe(0);
	});

	it('creates non-zero error margin when request takes time', async () => {
		const dateNowMock = vi
			.spyOn(Date, 'now')
			.mockReturnValueOnce(1000)
			.mockReturnValueOnce(1500);

		const fetchMock = vi.fn().mockResolvedValue({
			json: () => Promise.resolve({ data: { timestamp: 2000 } })
		});
		vi.stubGlobal('fetch', fetchMock);

		const result = await syncTime();

		expect(result.serverTime).toBe(2000);
		expect(result.offset).toBe(750);
		expect(result.errorMargin).toBe(250);
	});
});
