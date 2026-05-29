import { describe, it, expect, beforeEach, vi } from 'vitest';
import { syncTime, timeapiFetch } from '../time';
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
	function timeapiJson(tsSec: number) {
		const d = new Date(tsSec * 1000);
		return {
			year: d.getUTCFullYear(),
			month: d.getUTCMonth() + 1,
			day: d.getUTCDate(),
			hour: d.getUTCHours(),
			minute: d.getUTCMinutes(),
			seconds: d.getUTCSeconds(),
			milliSeconds: d.getUTCMilliseconds(),
		};
	}

	it('fetches server time and calculates offset', async () => {
		vi.spyOn(Date, 'now').mockReturnValue(1000);

		const fetchMock = vi.fn((url: string) => {
			if (url.includes('shijian')) {
				return Promise.resolve({ ok: true, json: () => Promise.resolve({ data: { timestamp: 2000 } }) });
			}
			if (url.includes('timeapi')) {
				return Promise.resolve({ ok: true, json: () => Promise.resolve(timeapiJson(2)) });
			}
			return Promise.resolve({ ok: true, json: () => Promise.resolve({ unixtime: 2 }) });
		});
		vi.stubGlobal('fetch', fetchMock);

		const result = await syncTime();

		expect(result.serverTime).toBe(2000);
		expect(result.offset).toBe(1000);
	});

	it('handles one failed provider gracefully', async () => {
		vi.spyOn(Date, 'now').mockReturnValue(2000);

		const fetchMock = vi.fn((url: string) => {
			if (url.includes('shijian')) {
				return Promise.resolve({ ok: false, status: 500 });
			}
			if (url.includes('timeapi')) {
				return Promise.resolve({ ok: true, json: () => Promise.resolve(timeapiJson(3)) });
			}
			return Promise.resolve({ ok: true, json: () => Promise.resolve({ unixtime: 3 }) });
		});
		vi.stubGlobal('fetch', fetchMock);

		const result = await syncTime();
		expect(result.offset).toBe(1000);
	});

	it('timeapiFetch returns UTC timestamp independent of local timezone', async () => {
		vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
			ok: true,
			json: () => Promise.resolve({
				year: 2026, month: 6, day: 15,
				hour: 10, minute: 30, seconds: 0, milliSeconds: 0
			})
		}));

		const ts = await timeapiFetch(new AbortController().signal);
		expect(ts).toBe(Date.UTC(2026, 5, 15, 10, 30, 0, 0));

		vi.unstubAllGlobals();
	});
});
