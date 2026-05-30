import { describe, it, expect, beforeEach, vi } from 'vitest';

const mockSyncTime = vi.hoisted(() => vi.fn<(...args: unknown[]) => unknown>());

vi.mock('../time.ts', () => ({
	syncTime: mockSyncTime,
}));

import {
	getSyncState,
	getSyncedOffset,
	getSyncErrorMargin,
	isSyncApplied,
	getMode,
	setMode,
	sync,
	clearSync,
} from '../sync-manager.svelte';

describe('sync-manager', () => {
	beforeEach(() => {
		clearSync();
		mockSyncTime.mockReset();
		setMode('manual');
	});

	describe('initial state', () => {
		it('mode defaults to manual', () => {
			expect(getMode()).toBe('manual');
		});

		it('status is idle initially', () => {
			expect(getSyncState().status).toBe('idle');
		});

		it('offset is 0 and sync is not applied', () => {
			expect(getSyncedOffset()).toBe(0);
			expect(getSyncErrorMargin()).toBe(0);
			expect(isSyncApplied()).toBe(false);
		});
	});

	describe('setMode / getMode', () => {
		it('setMode updates the mode', () => {
			setMode('manual');
			expect(getMode()).toBe('manual');

			setMode('off');
			expect(getMode()).toBe('off');

			setMode('auto');
			expect(getMode()).toBe('auto');
		});

		it('persists mode to localStorage', () => {
			setMode('manual');
			expect(localStorage.getItem('FL_sync_mode')).toBe('manual');

			setMode('off');
			expect(localStorage.getItem('FL_sync_mode')).toBe('off');
		});

		it('setMode to off clears sync state', async () => {
			mockSyncTime.mockResolvedValue({ offset: 500, errorMargin: 50, serverTime: 5000 });
			await sync();
			expect(isSyncApplied()).toBe(true);

			setMode('off');
			expect(isSyncApplied()).toBe(false);
			expect(getSyncedOffset()).toBe(0);
			expect(getSyncState().status).toBe('idle');
		});
	});

	describe('sync', () => {
		it('transitions idle → syncing → synced on success', async () => {
			mockSyncTime.mockResolvedValue({ offset: 500, errorMargin: 50, serverTime: 5000 });

			const promise = sync();
			expect(getSyncState().status).toBe('syncing');

			await promise;

			expect(getSyncState().status).toBe('synced');
			expect(getSyncedOffset()).toBe(500);
			expect(getSyncErrorMargin()).toBe(50);
			expect(getSyncState().lastErrorTime).toBeNull();
		});

		it('transitions idle → syncing → error on failure', async () => {
			mockSyncTime.mockRejectedValue(new Error('Network error'));

			const promise = sync();
			expect(getSyncState().status).toBe('syncing');

			await promise;

			expect(getSyncState().status).toBe('error');
			expect(typeof getSyncState().lastErrorTime).toBe('number');
		});

		it('does nothing when mode is off', async () => {
			setMode('off');
			mockSyncTime.mockResolvedValue({ offset: 500, errorMargin: 50, serverTime: 5000 });

			await sync();

			expect(mockSyncTime).not.toHaveBeenCalled();
			expect(isSyncApplied()).toBe(false);
			expect(getSyncState().status).toBe('idle');
		});
	});

	describe('clearSync', () => {
		it('resets all sync state to defaults', () => {
			expect(getSyncedOffset()).toBe(0);
			expect(getSyncErrorMargin()).toBe(0);
			expect(isSyncApplied()).toBe(false);
			expect(getSyncState().status).toBe('idle');
			expect(getSyncState().lastErrorTime).toBeNull();
		});

		it('clears previously applied sync', async () => {
			mockSyncTime.mockResolvedValue({ offset: 500, errorMargin: 50, serverTime: 5000 });
			await sync();
			expect(isSyncApplied()).toBe(true);

			clearSync();

			expect(isSyncApplied()).toBe(false);
			expect(getSyncedOffset()).toBe(0);
			expect(getSyncState().status).toBe('idle');
		});
	});

	describe('getSyncState', () => {
		it('returns complete state snapshot', () => {
			const state = getSyncState();
			expect(state).toHaveProperty('mode');
			expect(state).toHaveProperty('status');
			expect(state).toHaveProperty('syncedOffset');
			expect(state).toHaveProperty('syncErrorMargin');
			expect(state).toHaveProperty('lastErrorTime');
		});
	});
});
