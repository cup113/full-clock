import { getSyncedOffset, isSyncApplied } from './time.svelte';

let now = $state(Date.now());

export function useTick() {
	$effect(() => {
		const interval = setInterval(() => {
			now = Date.now();
		}, 100);
		return () => clearInterval(interval);
	});
}

export function getNow() {
	return isSyncApplied() ? now + getSyncedOffset() : now;
}

/** Reset the tick timestamp (for testing). */
export function resetTick() {
	now = Date.now();
}
