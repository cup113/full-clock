import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import { resetPrefs, prefs } from '../preferences.svelte';
import { removeSync, applySync } from '../time.svelte';
import SyncSection from './SyncSection.svelte';

vi.mock('../wake-lock.svelte', () => ({
	getWakeLockStatus: vi.fn()
}));
import { getWakeLockStatus } from '../wake-lock.svelte';

const mockGetWakeLockStatus = vi.mocked(getWakeLockStatus);

function findActionBtn(container: HTMLElement): HTMLButtonElement | null {
	return container.querySelector('button[data-umami-event="apply-time-sync"]');
}

const defaultProps = {
	syncStatus: 'idle' as const,
	syncResult: null,
	unreliable: false,
	onAutoSync: vi.fn(),
	onApply: vi.fn()
};

beforeEach(() => {
	resetPrefs();
	removeSync();
	mockGetWakeLockStatus.mockReturnValue('inactive');
});

describe('SyncSection', () => {
	it('renders utilities section header', () => {
		render(SyncSection, defaultProps);
		expect(screen.getByText('utilities')).toBeInTheDocument();
	});

	it('renders keepScreenOn toggle button', () => {
		render(SyncSection, defaultProps);
		expect(screen.getByText('keepScreenOn')).toBeInTheDocument();
	});

	it('toggling keepScreenOn updates prefs', () => {
		render(SyncSection, defaultProps);
		fireEvent.click(screen.getByText('keepScreenOn'));
		expect(prefs.keepScreenOn).toBe(true);
		fireEvent.click(screen.getByText('keepScreenOn'));
		expect(prefs.keepScreenOn).toBe(false);
	});

	it('shows wake lock active message', () => {
		prefs.keepScreenOn = true;
		mockGetWakeLockStatus.mockReturnValue('active');
		render(SyncSection, defaultProps);
		expect(screen.getByText('screenWillStayOn')).toBeInTheDocument();
	});

	it('shows wake lock unsupported message', () => {
		prefs.keepScreenOn = true;
		mockGetWakeLockStatus.mockReturnValue('unsupported');
		render(SyncSection, defaultProps);
		expect(screen.getByText('wakeLockUnsupported')).toBeInTheDocument();
	});

	it('shows wake lock denied message', () => {
		prefs.keepScreenOn = true;
		mockGetWakeLockStatus.mockReturnValue('denied');
		render(SyncSection, defaultProps);
		expect(screen.getByText('wakeLockDenied')).toBeInTheDocument();
	});

	it('shows wake lock pending message for unknown status', () => {
		prefs.keepScreenOn = true;
		mockGetWakeLockStatus.mockReturnValue('inactive');
		render(SyncSection, defaultProps);
		expect(screen.getByText('wakeLockPending')).toBeInTheDocument();
	});

	it('shows off text when keepScreenOn is false', () => {
		prefs.keepScreenOn = false;
		render(SyncSection, defaultProps);
		expect(screen.getByText('secondStyle_off')).toBeInTheDocument();
	});

	it('shows action button with timeSyncApply when idle', () => {
		render(SyncSection, defaultProps);
		expect(screen.getByText('timeSyncApply')).toBeInTheDocument();
	});

	it('shows computing state with disabled action button', () => {
		const { container } = render(SyncSection, { ...defaultProps, syncStatus: 'computing' });
		expect(screen.getByText('timeSyncComputing')).toBeInTheDocument();
		const btn = findActionBtn(container);
		expect(btn).toBeDisabled();
	});

	it('shows done state with sync result', () => {
		const syncResult = { offset: 500, errorMargin: 100, serverTime: Date.now() };
		render(SyncSection, { ...defaultProps, syncStatus: 'done', syncResult });
		expect(screen.getByText('timeSyncSlower')).toBeInTheDocument();
	});

	it('shows unreliable warning when done and unreliable', () => {
		const syncResult = { offset: 500, errorMargin: 2000, serverTime: Date.now() };
		const { container } = render(SyncSection, {
			...defaultProps, syncStatus: 'done', syncResult, unreliable: true
		});
		expect(screen.getByText('timeSyncImprecise')).toBeInTheDocument();
		const btn = findActionBtn(container);
		expect(btn).toHaveTextContent(/timeSyncRecalibrate/);
	});

	it('shows applied state with synced message', () => {
		applySync({ offset: 100, errorMargin: 200, serverTime: Date.now() });
		const { container } = render(SyncSection, { ...defaultProps, syncStatus: 'applied' });
		const btn = findActionBtn(container);
		expect(btn).toHaveTextContent(/timeSyncSynced/);
		expect(screen.getByText(/200/)).toBeInTheDocument();
	});

	it('action button calls onApply when done and reliable', () => {
		const onApply = vi.fn();
		const syncResult = { offset: 500, errorMargin: 100, serverTime: Date.now() };
		const { container } = render(SyncSection, {
			...defaultProps, syncStatus: 'done', syncResult, onApply, unreliable: false
		});
		fireEvent.click(findActionBtn(container)!);
		expect(onApply).toHaveBeenCalledOnce();
	});

	it('action button calls onAutoSync when unreliable', () => {
		const onAutoSync = vi.fn();
		const syncResult = { offset: 500, errorMargin: 2000, serverTime: Date.now() };
		const { container } = render(SyncSection, {
			...defaultProps, syncStatus: 'done', syncResult, onAutoSync, unreliable: true
		});
		fireEvent.click(findActionBtn(container)!);
		expect(onAutoSync).toHaveBeenCalledOnce();
	});

	it('action button is disabled when computing', () => {
		const { container } = render(SyncSection, { ...defaultProps, syncStatus: 'computing' });
		expect(findActionBtn(container)).toBeDisabled();
	});

	it('action button is disabled when applied', () => {
		applySync({ offset: 100, errorMargin: 200, serverTime: Date.now() });
		const { container } = render(SyncSection, { ...defaultProps, syncStatus: 'applied' });
		expect(findActionBtn(container)).toBeDisabled();
	});
});
