type WakeLockStatus = 'inactive' | 'active' | 'unsupported' | 'denied';

let wakeLockStatus = $state<WakeLockStatus>('inactive');
let _sentinel: WakeLockSentinel | null = null;
let _requestInFlight = false;
let _requestToken = 0;

export function getWakeLockStatus() {
	return wakeLockStatus;
}

export function enableWakeLock() {
	if (typeof navigator === 'undefined' || !navigator.wakeLock) {
		wakeLockStatus = 'unsupported';
		return;
	}

	// Only one lock may be held and only one request may be in flight: a second
	// request while active would orphan the first sentinel without releasing it.
	if (_sentinel || _requestInFlight) return;

	const token = ++_requestToken;
	_requestInFlight = true;

	navigator.wakeLock
		.request('screen')
		.then((s) => {
			if (token !== _requestToken) {
				// The preference was turned off while the request was in flight.
				s.release();
				return;
			}
			_sentinel = s;
			wakeLockStatus = 'active';
			s.addEventListener('release', () => {
				_sentinel = null;
				wakeLockStatus = 'inactive';
			});
		})
		.catch(() => {
			if (token === _requestToken) wakeLockStatus = 'denied';
		})
		.finally(() => {
			if (token === _requestToken) _requestInFlight = false;
		});
}

export function disableWakeLock() {
	// Invalidate any in-flight request so it cannot activate after this point.
	_requestToken++;
	_requestInFlight = false;
	if (_sentinel) {
		_sentinel.release();
		_sentinel = null;
	}
	wakeLockStatus = 'inactive';
}

export function resetWakeLock() {
	_requestToken++;
	_requestInFlight = false;
	_sentinel = null;
	wakeLockStatus = 'inactive';
}

/**
 * Hold the screen on for as long as the caller keeps the lifecycle alive.
 *
 * The browser drops the lock whenever the document is hidden and never
 * re-acquires it on its own, so the visibility listener is part of holding it,
 * not an optional extra: without it the preference stays on while the screen
 * quietly goes back to sleep.
 *
 * Returns a teardown that releases the lock and stops listening.
 */
export function startWakeLockLifecycle() {
	enableWakeLock();

	const reacquire = () => {
		if (document.visibilityState === 'visible') enableWakeLock();
	};
	document.addEventListener('visibilitychange', reacquire);

	return () => {
		document.removeEventListener('visibilitychange', reacquire);
		disableWakeLock();
	};
}
