import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getWakeLockStatus, enableWakeLock, disableWakeLock, resetWakeLock } from '../wake-lock.svelte';

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
			wakeLock: { request: vi.fn().mockResolvedValue(sentinel) }
		});

		enableWakeLock();
		await vi.waitFor(() => {
			expect(getWakeLockStatus()).toBe('active');
		});
	});

	it('becomes denied when request is rejected', async () => {
		vi.stubGlobal('navigator', {
			...navigator,
			wakeLock: { request: vi.fn().mockRejectedValue(new Error('denied')) }
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
			})
		};
		vi.stubGlobal('navigator', {
			...navigator,
			wakeLock: { request: vi.fn().mockResolvedValue(sentinel) }
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
			wakeLock: { request: vi.fn().mockResolvedValue(sentinel) }
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
			wakeLock: { request: vi.fn().mockResolvedValue(sentinel) }
		});

		enableWakeLock();
		await vi.waitFor(() => expect(getWakeLockStatus()).toBe('active'));

		resetWakeLock();
		expect(getWakeLockStatus()).toBe('inactive');
	});
});
