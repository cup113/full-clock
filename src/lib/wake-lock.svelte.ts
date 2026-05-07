let wakeLockStatus = $state<'inactive' | 'active' | 'unsupported' | 'denied'>('inactive');
let _sentinel: WakeLockSentinel | null = null;

export function getWakeLockStatus() {
	return wakeLockStatus;
}

export function enableWakeLock() {
	if (typeof navigator === 'undefined' || !navigator.wakeLock) {
		wakeLockStatus = 'unsupported';
		return;
	}

	navigator.wakeLock.request('screen').then((s) => {
		_sentinel = s;
		wakeLockStatus = 'active';
		s.addEventListener('release', () => {
			_sentinel = null;
			wakeLockStatus = 'inactive';
		});
	}).catch(() => {
		wakeLockStatus = 'denied';
	});
}

export function disableWakeLock() {
	if (_sentinel) {
		_sentinel.release();
		_sentinel = null;
	}
	wakeLockStatus = 'inactive';
}

export function resetWakeLock() {
	wakeLockStatus = 'inactive';
	_sentinel = null;
}
