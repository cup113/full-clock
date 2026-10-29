import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import { getProviders, NTP_SERVERS, syncTime, timeapiFetch } from '../time';
import {
	applySync,
	removeSync,
	getSyncedOffset,
	getSyncErrorMargin,
	isSyncApplied,
} from '../time.svelte';

/**
 * Installs (or removes) a fake Tauri runtime. `@tauri-apps/api`'s `invoke` is a
 * thin forwarder to `window.__TAURI_INTERNALS__.invoke`, so this exercises the
 * real client instead of mocking the module.
 */
function setTauri(active: boolean, invoke = vi.fn()) {
	const w = window as unknown as Record<string, unknown>;
	if (active) w.__TAURI_INTERNALS__ = { invoke };
	else delete w.__TAURI_INTERNALS__;
	return invoke;
}

beforeEach(() => {
	removeSync();
	setTauri(false);
});

afterEach(() => {
	setTauri(false);
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
				return Promise.resolve({
					ok: true,
					json: () => Promise.resolve({ data: { timestamp: 2000 } }),
				});
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
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue({
				ok: true,
				json: () =>
					Promise.resolve({
						year: 2026,
						month: 6,
						day: 15,
						hour: 10,
						minute: 30,
						seconds: 0,
						milliSeconds: 0,
					}),
			}),
		);

		const ts = await timeapiFetch(new AbortController().signal);
		expect(ts).toBe(Date.UTC(2026, 5, 15, 10, 30, 0, 0));

		vi.unstubAllGlobals();
	});
});

describe('getProviders', () => {
	it('only queries the HTTP APIs in a browser', () => {
		const providers = getProviders();

		expect(providers).toHaveLength(3);
		expect(providers.map((p) => p.name)).toEqual(['shijian', 'worldtime', 'timeapi']);
		expect(providers.every((p) => typeof p.fetch === 'function')).toBe(true);
	});

	it('adds one SNTP provider per server inside the desktop shell', () => {
		setTauri(true);

		const providers = getProviders();
		const ntp = providers.filter((p) => p.name.startsWith('ntp:'));

		expect(providers).toHaveLength(3 + NTP_SERVERS.length);
		expect(ntp.map((p) => p.name)).toEqual(NTP_SERVERS.map((s) => `ntp:${s}`));
		expect(ntp.every((p) => typeof p.measure === 'function')).toBe(true);
	});
});

describe('syncTime with NTP', () => {
	/** Date.now that advances 200ms per call, so each HTTP sample has a 100ms margin. */
	function slowClock() {
		let t = 10_000;
		return vi.spyOn(Date, 'now').mockImplementation(() => {
			t += 200;
			return t;
		});
	}

	function stubHttpFetch(serverTime: number) {
		const fetchMock = vi.fn((url: string) => {
			if (url.includes('shijian')) {
				return Promise.resolve({
					ok: true,
					json: () => Promise.resolve({ data: { timestamp: serverTime } }),
				});
			}
			if (url.includes('worldtime')) {
				return Promise.resolve({
					ok: true,
					json: () => Promise.resolve({ unixtime: serverTime / 1000 }),
				});
			}
			return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
		});
		vi.stubGlobal('fetch', fetchMock);
		return fetchMock;
	}

	it('lets precise SNTP measurements dominate the weighted average', async () => {
		const invoke = setTauri(true);
		slowClock();
		stubHttpFetch(Date.now() + 1000);
		invoke.mockResolvedValue({ offsetMs: 30, rttMs: 4 });

		const result = await syncTime();

		expect(invoke).toHaveBeenCalledTimes(NTP_SERVERS.length);
		expect(invoke).toHaveBeenCalledWith('ntp_query', { server: NTP_SERVERS[0] }, undefined);
		// 4 NTP samples at ±2ms outweigh 3 HTTP samples at ±100ms
		expect(Math.abs(result.offset - 30)).toBeLessThan(1);
		expect(result.errorMargin).toBeLessThan(2);
	});

	it('falls back to the HTTP APIs when every SNTP query fails', async () => {
		const invoke = setTauri(true);
		vi.spyOn(Date, 'now').mockReturnValue(1000);
		stubHttpFetch(2000);
		invoke.mockRejectedValue(new Error('udp blocked'));

		const result = await syncTime();

		expect(invoke).toHaveBeenCalledTimes(NTP_SERVERS.length);
		expect(result.offset).toBe(1000);
	});

	it('keeps the HTTP-only behaviour when not in the desktop shell', async () => {
		const invoke = setTauri(false);
		vi.spyOn(Date, 'now').mockReturnValue(1000);
		stubHttpFetch(2000);

		await syncTime();

		expect(invoke).not.toHaveBeenCalled();
	});
});
