import {
	getSyncedOffset,
	getSyncErrorMargin,
	isSyncApplied,
	applySync,
	clearSync,
	syncTime,
	type SyncResult,
} from './sync-manager.svelte';

export { getSyncedOffset, getSyncErrorMargin, isSyncApplied, applySync, syncTime };
export type { SyncResult };

export const removeSync = clearSync;
