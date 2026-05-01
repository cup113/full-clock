export interface SyncResult {
	offset: number;      // server - local (ms), positive means local is behind
	errorMargin: number; // ±ms
	serverTime: number;
}

export async function syncTime(): Promise<SyncResult> {
	const localBefore = Date.now();
	const res = await fetch('https://api.shijian.online/timestamp/');
	const json = await res.json();
	const localAfter = Date.now();

	const serverTime = json.data.timestamp;
	const localMidpoint = (localBefore + localAfter) / 2;
	const offset = serverTime - localMidpoint;
	const errorMargin = (localAfter - localBefore) / 2;

	return { offset, errorMargin, serverTime };
}

let syncedOffset = $state(0);
let syncErrorMargin = $state(0);
let syncApplied = $state(false);

export function getSyncedOffset() { return syncedOffset; }
export function getSyncErrorMargin() { return syncErrorMargin; }
export function isSyncApplied() { return syncApplied; }

export function applySync(result: SyncResult) {
	syncedOffset = result.offset;
	syncErrorMargin = result.errorMargin;
	syncApplied = true;
}

export function removeSync() {
	syncedOffset = 0;
	syncErrorMargin = 0;
	syncApplied = false;
}
