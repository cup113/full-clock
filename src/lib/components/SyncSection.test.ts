import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import { resetPrefs, prefs } from '../preferences.svelte';
import SyncSection from './SyncSection.svelte';

vi.mock('../wake-lock.svelte', () => ({
	getWakeLockStatus: vi.fn(),
}));
import { getWakeLockStatus } from '../wake-lock.svelte';

const mockGetWakeLockStatus = vi.mocked(getWakeLockStatus);

let mockState: ReturnType<typeof import('../sync-manager.svelte').getSyncState>;

vi.mock('../sync-manager.svelte', async () => {
	const actual = await vi.importActual('../sync-manager.svelte');
	return {
		...actual,
		getSyncState: vi.fn(() => mockState),
		setMode: vi.fn(),
		sync: vi.fn(),
	};
});

import { getSyncState, setMode, sync } from '../sync-manager.svelte';
const mockGetSyncState = vi.mocked(getSyncState);
const mockSetMode = vi.mocked(setMode);
const mockSync = vi.mocked(sync);

function defaultState() {
	return {
		mode: 'auto' as const,
		status: 'idle' as const,
		syncedOffset: 0,
		syncErrorMargin: 0,
		lastErrorTime: null,
	};
}

beforeEach(() => {
	resetPrefs();
	mockGetWakeLockStatus.mockReturnValue('inactive');
	mockState = defaultState();
});

describe('SyncSection', () => {
	it('renders keepScreenOn toggle button', () => {
		render(SyncSection);
		expect(screen.getByText('keepScreenOn')).toBeInTheDocument();
	});

	it('toggling keepScreenOn updates prefs', () => {
		render(SyncSection);
		fireEvent.click(screen.getByText('keepScreenOn'));
		expect(prefs.keepScreenOn).toBe(true);
		fireEvent.click(screen.getByText('keepScreenOn'));
		expect(prefs.keepScreenOn).toBe(false);
	});

	it('shows wake lock active message', () => {
		prefs.keepScreenOn = true;
		mockGetWakeLockStatus.mockReturnValue('active');
		render(SyncSection);
		expect(screen.getByText('screenWillStayOn')).toBeInTheDocument();
	});

	it('shows wake lock unsupported message', () => {
		prefs.keepScreenOn = true;
		mockGetWakeLockStatus.mockReturnValue('unsupported');
		render(SyncSection);
		expect(screen.getByText('wakeLockUnsupported')).toBeInTheDocument();
	});

	it('shows wake lock denied message', () => {
		prefs.keepScreenOn = true;
		mockGetWakeLockStatus.mockReturnValue('denied');
		render(SyncSection);
		expect(screen.getByText('wakeLockDenied')).toBeInTheDocument();
	});

	it('shows wake lock pending message for unknown status', () => {
		prefs.keepScreenOn = true;
		mockGetWakeLockStatus.mockReturnValue('inactive');
		render(SyncSection);
		expect(screen.getByText('wakeLockPending')).toBeInTheDocument();
	});

	it('shows off text when keepScreenOn is false', () => {
		prefs.keepScreenOn = false;
		render(SyncSection);
		expect(screen.getByText('secondStyle_off')).toBeInTheDocument();
	});

	it('shows three sync mode buttons', () => {
		render(SyncSection);
		expect(screen.getByText('syncMode_auto')).toBeInTheDocument();
		expect(screen.getByText('syncMode_manual')).toBeInTheDocument();
		expect(screen.getByText('syncMode_off')).toBeInTheDocument();
	});

	it('calls setMode when a sync mode button is clicked', () => {
		render(SyncSection);
		fireEvent.click(screen.getByText('syncMode_manual'));
		expect(mockSetMode).toHaveBeenCalledWith('manual');
	});

	it('shows Sync Now button when mode is not off', () => {
		mockState = { ...defaultState(), mode: 'auto' };
		render(SyncSection);
		expect(screen.getByText('syncNow')).toBeInTheDocument();
	});

	it('hides sync controls when mode is off', () => {
		mockState = { ...defaultState(), mode: 'off' };
		render(SyncSection);
		expect(screen.queryByText('syncNow')).not.toBeInTheDocument();
	});

	it('calls sync when Sync Now is clicked', () => {
		mockState = { ...defaultState(), mode: 'manual' };
		render(SyncSection);
		fireEvent.click(screen.getByText('syncNow'));
		expect(mockSync).toHaveBeenCalledOnce();
	});

	it('shows syncing state with disabled button', () => {
		mockState = { ...defaultState(), mode: 'auto', status: 'syncing' };
		render(SyncSection);
		expect(screen.getByText('timeSyncComputing')).toBeInTheDocument();
		expect(screen.getByText('timeSyncComputing').closest('button')).toBeDisabled();
	});

	it('shows synced state with error margin', () => {
		mockState = { ...defaultState(), mode: 'auto', status: 'synced', syncErrorMargin: 120 };
		render(SyncSection);
		expect(screen.getByText('syncLatest')).toBeInTheDocument();
	});

	it('shows error state text', () => {
		mockState = { ...defaultState(), mode: 'auto', status: 'error' };
		render(SyncSection);
		expect(screen.getByText('syncFailed')).toBeInTheDocument();
	});

	it('shows idle state text when manual and unsynced', () => {
		mockState = { ...defaultState(), mode: 'manual', status: 'idle' };
		render(SyncSection);
		expect(screen.getByText('syncIdle')).toBeInTheDocument();
	});
});
