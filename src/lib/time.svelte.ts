import { type SyncResult, syncTime } from './time.ts';
export { type SyncResult, syncTime };

let syncedOffset = $state(0);
let syncErrorMargin = $state(0);
let syncApplied = $state(false);

export function getSyncedOffset() {
	return syncedOffset;
}
export function getSyncErrorMargin() {
	return syncErrorMargin;
}
export function isSyncApplied() {
	return syncApplied;
}

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
