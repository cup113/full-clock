import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
	getWakeLockStatus,
	enableWakeLock,
	disableWakeLock,
	resetWakeLock,
	startWakeLockLifecycle,
} from '../wake-lock.svelte';

beforeEach(() => {
	resetWakeLock();
	vi.unstubAllGlobals();
});

describe('wake-lock', () => {
	it('starts as inactive', () => {
		expect(getWakeLockStatus()).toBe('inactive');
	});

	it('marks unsupported when navigator.wakeLock is absent', () => {
		enableWakeLock();
		expect(getWakeLockStatus()).toBe('unsupported');
	});

	it('becomes active after successful request', async () => {
		const sentinel = { release: vi.fn(), addEventListener: vi.fn() };
		vi.stubGlobal('navigator', {
			...navigator,
			wakeLock: { request: vi.fn().mockResolvedValue(sentinel) },
		});

		enableWakeLock();
		await vi.waitFor(() => {
			expect(getWakeLockStatus()).toBe('active');
		});
	});

	it('becomes denied when request is rejected', async () => {
		vi.stubGlobal('navigator', {
			...navigator,
			wakeLock: { request: vi.fn().mockRejectedValue(new Error('denied')) },
		});

		enableWakeLock();
		await vi.waitFor(() => {
			expect(getWakeLockStatus()).toBe('denied');
		});
	});

	it('returns to inactive when sentinel fires release event', async () => {
		let releaseHandler: () => void = () => {};
		const sentinel = {
			release: vi.fn(),
			addEventListener: vi.fn((_event: string, handler: () => void) => {
				releaseHandler = handler;
			}),
		};
		vi.stubGlobal('navigator', {
			...navigator,
			wakeLock: { request: vi.fn().mockResolvedValue(sentinel) },
		});

		enableWakeLock();
		await vi.waitFor(() => expect(getWakeLockStatus()).toBe('active'));

		releaseHandler();
		expect(getWakeLockStatus()).toBe('inactive');
	});

	it('disableWakeLock releases sentinel and resets to inactive', async () => {
		const mockRelease = vi.fn();
		const sentinel = { release: mockRelease, addEventListener: vi.fn() };
		vi.stubGlobal('navigator', {
			...navigator,
			wakeLock: { request: vi.fn().mockResolvedValue(sentinel) },
		});

		enableWakeLock();
		await vi.waitFor(() => expect(getWakeLockStatus()).toBe('active'));

		disableWakeLock();
		expect(mockRelease).toHaveBeenCalledOnce();
		expect(getWakeLockStatus()).toBe('inactive');
	});

	it('disableWakeLock does nothing when no sentinel', () => {
		disableWakeLock();
		expect(getWakeLockStatus()).toBe('inactive');
	});

	it('resetWakeLock resets to inactive from any state', async () => {
		const sentinel = { release: vi.fn(), addEventListener: vi.fn() };
		vi.stubGlobal('navigator', {
			...navigator,
			wakeLock: { request: vi.fn().mockResolvedValue(sentinel) },
		});

		enableWakeLock();
		await vi.waitFor(() => expect(getWakeLockStatus()).toBe('active'));

		resetWakeLock();
		expect(getWakeLockStatus()).toBe('inactive');
	});

	it('does not request again while a lock is already held', async () => {
		const sentinel = { release: vi.fn(), addEventListener: vi.fn() };
		const request = vi.fn().mockResolvedValue(sentinel);
		vi.stubGlobal('navigator', { ...navigator, wakeLock: { request } });

		enableWakeLock();
		await vi.waitFor(() => expect(getWakeLockStatus()).toBe('active'));

		enableWakeLock();
		expect(request).toHaveBeenCalledOnce();
	});

	it('does not issue a second request while one is in flight', async () => {
		const sentinel = { release: vi.fn(), addEventListener: vi.fn() };
		let resolveRequest: (s: typeof sentinel) => void = () => {};
		const request = vi.fn(
			() =>
				new Promise<typeof sentinel>((resolve) => {
					resolveRequest = resolve;
				}),
		);
		vi.stubGlobal('navigator', { ...navigator, wakeLock: { request } });

		enableWakeLock();
		enableWakeLock();
		expect(request).toHaveBeenCalledOnce();

		resolveRequest(sentinel);
		await vi.waitFor(() => expect(getWakeLockStatus()).toBe('active'));
	});

	it('re-acquires the lock after the browser releases it', async () => {
		let releaseHandler: () => void = () => {};
		const sentinel = {
			release: vi.fn(),
			addEventListener: vi.fn((_event: string, handler: () => void) => {
				releaseHandler = handler;
			}),
		};
		const request = vi.fn().mockResolvedValue(sentinel);
		vi.stubGlobal('navigator', { ...navigator, wakeLock: { request } });

		enableWakeLock();
		await vi.waitFor(() => expect(getWakeLockStatus()).toBe('active'));

		// What the browser does when the document is hidden.
		releaseHandler();
		expect(getWakeLockStatus()).toBe('inactive');

		enableWakeLock();
		await vi.waitFor(() => expect(getWakeLockStatus()).toBe('active'));
		expect(request).toHaveBeenCalledTimes(2);
	});

	it('retries after a denied request', async () => {
		const sentinel = { release: vi.fn(), addEventListener: vi.fn() };
		const request = vi
			.fn()
			.mockRejectedValueOnce(new Error('not allowed'))
			.mockResolvedValue(sentinel);
		vi.stubGlobal('navigator', { ...navigator, wakeLock: { request } });

		enableWakeLock();
		await vi.waitFor(() => expect(getWakeLockStatus()).toBe('denied'));

		enableWakeLock();
		await vi.waitFor(() => expect(getWakeLockStatus()).toBe('active'));
	});

	it('releases a lock that resolves after disableWakeLock', async () => {
		const sentinel = { release: vi.fn(), addEventListener: vi.fn() };
		let resolveRequest: (s: typeof sentinel) => void = () => {};
		vi.stubGlobal('navigator', {
			...navigator,
			wakeLock: {
				request: vi.fn(
					() =>
						new Promise<typeof sentinel>((resolve) => {
							resolveRequest = resolve;
						}),
				),
			},
		});

		enableWakeLock();
		disableWakeLock();
		resolveRequest(sentinel);

		await vi.waitFor(() => expect(sentinel.release).toHaveBeenCalledOnce());
		expect(getWakeLockStatus()).toBe('inactive');
	});
});

describe('startWakeLockLifecycle', () => {
	function setVisibility(state: 'visible' | 'hidden') {
		Object.defineProperty(document, 'visibilityState', {
			configurable: true,
			get: () => state,
		});
	}

	afterEach(() => {
		setVisibility('visible');
	});

	it('re-acquires the lock when the document becomes visible again', async () => {
		const releaseHandler: { current: () => void } = { current: () => {} };
		const sentinel = {
			release: vi.fn(),
			addEventListener: vi.fn((_event: string, handler: () => void) => {
				releaseHandler.current = handler;
			}),
		};
		const request = vi.fn().mockResolvedValue(sentinel);
		vi.stubGlobal('navigator', { ...navigator, wakeLock: { request } });

		const stop = startWakeLockLifecycle();
		await vi.waitFor(() => expect(getWakeLockStatus()).toBe('active'));

		// Exactly what the browser does when the tab is backgrounded.
		setVisibility('hidden');
		releaseHandler.current();
		expect(getWakeLockStatus()).toBe('inactive');

		// Coming back must re-request; otherwise the preference stays on while the
		// lock is gone, and the settings panel shows "requesting…" forever.
		setVisibility('visible');
		document.dispatchEvent(new Event('visibilitychange'));
		await vi.waitFor(() => expect(getWakeLockStatus()).toBe('active'));
		expect(request).toHaveBeenCalledTimes(2);

		stop();
	});

	it('stops listening and releases the lock on teardown', async () => {
		const sentinel = { release: vi.fn(), addEventListener: vi.fn() };
		const request = vi.fn().mockResolvedValue(sentinel);
		vi.stubGlobal('navigator', { ...navigator, wakeLock: { request } });

		const stop = startWakeLockLifecycle();
		await vi.waitFor(() => expect(getWakeLockStatus()).toBe('active'));

		stop();
		expect(sentinel.release).toHaveBeenCalledOnce();
		expect(getWakeLockStatus()).toBe('inactive');

		setVisibility('visible');
		document.dispatchEvent(new Event('visibilitychange'));
		expect(request).toHaveBeenCalledOnce();
	});
});
