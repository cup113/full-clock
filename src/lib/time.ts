import { isTauri } from './platform.ts';

export interface SyncResult {
	offset: number;
	errorMargin: number;
	serverTime: number;
}

interface Measurement {
	offset: number;
	errorMargin: number;
}

interface Provider {
	name: string;
	fetch?(signal: AbortSignal): Promise<number>;
	/**
	 * Providers that time the exchange themselves (e.g. SNTP over UDP in the
	 * desktop shell) report the offset directly instead of a server timestamp.
	 */
	measure?(signal: AbortSignal): Promise<Measurement>;
}

async function shijianFetch(signal: AbortSignal): Promise<number> {
	const res = await fetch('https://api.shijian.online/timestamp/', { signal });
	if (!res.ok) throw new Error(`shijian.online ${res.status}`);
	const json = await res.json();
	const ts = json.data?.timestamp;
	if (typeof ts !== 'number') throw new Error('shijian.online: invalid timestamp');
	return ts;
}

async function worldtimeFetch(signal: AbortSignal): Promise<number> {
	const res = await fetch('https://worldtimeapi.org/api/timezone/etc/UTC', { signal });
	if (!res.ok) throw new Error(`worldtimeapi ${res.status}`);
	const json = await res.json();
	const ts = json.unixtime;
	if (typeof ts !== 'number') throw new Error('worldtimeapi: invalid unixtime');
	return ts * 1000;
}

export async function timeapiFetch(signal: AbortSignal): Promise<number> {
	const res = await fetch('https://timeapi.io/api/Time/current/zone?timeZone=UTC', { signal });
	if (!res.ok) throw new Error(`timeapi.io ${res.status}`);
	const json = await res.json();
	const ts = Date.UTC(
		json.year,
		json.month - 1,
		json.day,
		json.hour,
		json.minute,
		json.seconds,
		json.milliSeconds ?? 0,
	);
	if (isNaN(ts)) throw new Error('timeapi.io: invalid dateTime');
	return ts;
}

const httpProviders: Provider[] = [
	{ name: 'shijian', fetch: shijianFetch },
	{ name: 'worldtime', fetch: worldtimeFetch },
	{ name: 'timeapi', fetch: timeapiFetch },
];

/** SNTP servers queried by the desktop shell (browsers cannot open UDP 123). */
export const NTP_SERVERS = [
	'ntp.aliyun.com',
	'ntp.tencent.com',
	'time.windows.com',
	'pool.ntp.org',
];

function withAbort<T>(promise: Promise<T>, signal: AbortSignal): Promise<T> {
	if (signal.aborted) return Promise.reject(new Error('aborted'));
	return new Promise<T>((resolve, reject) => {
		const onAbort = () => reject(new Error('aborted'));
		signal.addEventListener('abort', onAbort, { once: true });
		promise.then(
			(value) => {
				signal.removeEventListener('abort', onAbort);
				resolve(value);
			},
			(error) => {
				signal.removeEventListener('abort', onAbort);
				reject(error);
			},
		);
	});
}

async function ntpMeasure(server: string, signal: AbortSignal): Promise<Measurement> {
	// Imported lazily so the web bundle never evaluates the Tauri client.
	const { invoke } = await import('@tauri-apps/api/core');
	const result = await withAbort(
		invoke<{ offsetMs: number; rttMs: number }>('ntp_query', { server }),
		signal,
	);
	return { offset: result.offsetMs, errorMargin: Math.max(result.rttMs / 2, 1) };
}

function ntpProviders(): Provider[] {
	return NTP_SERVERS.map((server) => ({
		name: `ntp:${server}`,
		measure: (signal: AbortSignal) => ntpMeasure(server, signal),
	}));
}

/**
 * All time sources for the current runtime: the HTTP APIs everywhere, plus the
 * SNTP servers when running inside the desktop shell.
 */
export function getProviders(): Provider[] {
	return isTauri() ? [...httpProviders, ...ntpProviders()] : httpProviders;
}

async function measureProvider(p: Provider, signal: AbortSignal): Promise<Measurement> {
	if (p.measure) return p.measure(signal);
	if (!p.fetch) throw new Error(`${p.name}: provider has no measurement`);

	const localBefore = Date.now();
	const serverTime = await p.fetch(signal);
	const localAfter = Date.now();
	const localMidpoint = (localBefore + localAfter) / 2;
	return {
		offset: serverTime - localMidpoint,
		errorMargin: (localAfter - localBefore) / 2,
	};
}

export async function syncTime(): Promise<SyncResult> {
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), 1500);

	const results = await Promise.allSettled(
		getProviders().map((p) => measureProvider(p, controller.signal)),
	);
	clearTimeout(timeout);

	const succeeded: Measurement[] = [];
	for (const r of results) {
		if (r.status === 'fulfilled') succeeded.push(r.value);
	}

	if (succeeded.length === 0) throw new Error('All time providers failed');

	const perfect = succeeded.find((r) => r.errorMargin === 0);
	if (perfect) {
		return { offset: perfect.offset, errorMargin: 0, serverTime: Date.now() + perfect.offset };
	}

	const wSum = succeeded.reduce((s, r) => s + 1 / r.errorMargin ** 2, 0);
	const offset = succeeded.reduce((s, r) => s + r.offset / r.errorMargin ** 2, 0) / wSum;
	const errorMargin = 1 / Math.sqrt(wSum);

	return { offset, errorMargin, serverTime: Date.now() + offset };
}
