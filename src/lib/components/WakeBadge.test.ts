import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import { resetPrefs, prefs } from '../preferences.svelte';
import WakeBadge from './WakeBadge.svelte';

vi.mock('../wake-lock.svelte', () => ({
	getWakeLockStatus: vi.fn(),
}));
import { getWakeLockStatus } from '../wake-lock.svelte';

const mockGetWakeLockStatus = vi.mocked(getWakeLockStatus);

beforeEach(() => {
	resetPrefs();
	mockGetWakeLockStatus.mockReturnValue('inactive');
});

describe('WakeBadge', () => {
	it('is hidden when the browser does not support wake locks', () => {
		mockGetWakeLockStatus.mockReturnValue('unsupported');
		render(WakeBadge);
		expect(screen.queryByRole('button')).not.toBeInTheDocument();
	});

	it('renders off, dimmed, when keepScreenOn is false', () => {
		render(WakeBadge);
		const button = screen.getByRole('button');
		expect(button).toHaveAttribute('title', 'keepScreenOn');
		expect(button).toHaveAttribute('aria-pressed', 'false');
		expect(button.className).toContain('opacity-40');
	});

	it('toggling the badge updates keepScreenOn', () => {
		render(WakeBadge);
		fireEvent.click(screen.getByRole('button'));
		expect(prefs.keepScreenOn).toBe(true);
		fireEvent.click(screen.getByRole('button'));
		expect(prefs.keepScreenOn).toBe(false);
	});

	it('shows an active lock as fully opaque', () => {
		prefs.keepScreenOn = true;
		mockGetWakeLockStatus.mockReturnValue('active');
		render(WakeBadge);
		const button = screen.getByRole('button');
		expect(button).toHaveAttribute('title', 'screenWillStayOn');
		expect(button).toHaveAttribute('aria-pressed', 'true');
		expect(button.className).toContain('opacity-100');
	});

	it('shows a pending lock as dimmed and pulsing', () => {
		prefs.keepScreenOn = true;
		mockGetWakeLockStatus.mockReturnValue('inactive');
		render(WakeBadge);
		const button = screen.getByRole('button');
		expect(button).toHaveAttribute('title', 'wakeLockPending');
		expect(button.className).toContain('opacity-40');
		expect(button.className).toContain('animate-pulse');
	});

	it('shows a denied lock fully opaque with the denied label', () => {
		prefs.keepScreenOn = true;
		mockGetWakeLockStatus.mockReturnValue('denied');
		render(WakeBadge);
		const button = screen.getByRole('button');
		expect(button).toHaveAttribute('title', 'wakeLockDenied');
		expect(button.className).toContain('opacity-100');
	});
});
