import { type SyncResult, syncTime } from './time.ts';
export { type SyncResult, syncTime };

const STORAGE_KEY = 'FL_sync_mode';

let mode = $state<'auto' | 'manual' | 'off'>(loadMode());
let status = $state<'idle' | 'syncing' | 'synced' | 'error'>('idle');
let syncedOffset = $state(0);
let syncErrorMargin = $state(0);
let lastErrorTime = $state<number | null>(null);

function loadMode(): 'auto' | 'manual' | 'off' {
	if (typeof localStorage === 'undefined') return 'manual';
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (raw === 'auto' || raw === 'manual' || raw === 'off') return raw;
	} catch { /* ignore */ }
	return 'manual';
}

function saveMode(m: 'auto' | 'manual' | 'off') {
	if (typeof localStorage === 'undefined') return;
	localStorage.setItem(STORAGE_KEY, m);
}

export function getSyncState() {
	return { mode, status, syncedOffset, syncErrorMargin, lastErrorTime };
}

export function getSyncedOffset() {
	return syncedOffset;
}

export function getSyncErrorMargin() {
	return syncErrorMargin;
}

export function isSyncApplied() {
	return status === 'synced';
}

export function getMode() {
	return mode;
}

export function setMode(m: 'auto' | 'manual' | 'off') {
	mode = m;
	saveMode(m);
	if (m === 'off') {
		clearSync();
	}
}

export function applySync(result: SyncResult) {
	syncedOffset = result.offset;
	syncErrorMargin = result.errorMargin;
	lastErrorTime = null;
	status = 'synced';
}

export function clearSync() {
	syncedOffset = 0;
	syncErrorMargin = 0;
	lastErrorTime = null;
	status = 'idle';
}

export async function sync() {
	if (mode === 'off') return;
	status = 'syncing';
	try {
		const result = await syncTime();
		applySync(result);
	} catch {
		lastErrorTime = Date.now();
		status = 'error';
	}
}
