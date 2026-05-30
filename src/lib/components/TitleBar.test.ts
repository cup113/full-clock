import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import { resetPrefs, prefs } from '../preferences.svelte';
import TitleBar from './TitleBar.svelte';

beforeEach(() => {
	resetPrefs();
	vi.useFakeTimers();
	vi.setSystemTime(new Date(2026, 4, 7, 14, 30, 0));
});

afterEach(() => {
	vi.useRealTimers();
});

describe('TitleBar', () => {
	it('settings button triggers onOpenSettings', async () => {
		const onOpenSettings = vi.fn();
		render(TitleBar, { onOpenSettings, onToggleFullscreen: vi.fn() });

		await fireEvent.click(screen.getByLabelText('settings'));
		expect(onOpenSettings).toHaveBeenCalledOnce();
	});

	it('help button is present', () => {
		render(TitleBar, { onOpenSettings: vi.fn(), onToggleFullscreen: vi.fn() });
		expect(screen.getByLabelText('help')).toBeInTheDocument();
	});

	it('fullscreen button shows correct aria-label', () => {
		render(TitleBar, { onOpenSettings: vi.fn(), onToggleFullscreen: vi.fn() });
		expect(screen.getByLabelText('fullscreen')).toBeInTheDocument();
	});

	it('displays date when titleStyle is date', () => {
		render(TitleBar, { onOpenSettings: vi.fn(), onToggleFullscreen: vi.fn() });
		expect(screen.getByText(/2026/)).toBeInTheDocument();
	});

	it('displays custom text when titleStyle is custom', () => {
		prefs.titleStyle = 'custom';
		prefs.titleCustomized = 'Hello World';
		render(TitleBar, { onOpenSettings: vi.fn(), onToggleFullscreen: vi.fn() });
		expect(screen.getByText('Hello World')).toBeInTheDocument();
	});

	it('does not display title when titleStyle is off', () => {
		prefs.titleStyle = 'off';
		const { container } = render(TitleBar, {
			onOpenSettings: vi.fn(),
			onToggleFullscreen: vi.fn(),
		});
		const titleSpans = container.querySelectorAll('.text-2xl');
		expect(titleSpans.length).toBe(0);
	});

	it('language buttons exist', () => {
		render(TitleBar, { onOpenSettings: vi.fn(), onToggleFullscreen: vi.fn() });
		expect(screen.getByText('EN')).toBeInTheDocument();
		expect(screen.getByText('中')).toBeInTheDocument();
	});

	it('does not display title when titleStyle is custom with empty text', () => {
		prefs.titleStyle = 'custom';
		prefs.titleCustomized = '';
		const { container } = render(TitleBar, {
			onOpenSettings: vi.fn(),
			onToggleFullscreen: vi.fn(),
		});
		const titleSpans = container.querySelectorAll('.text-3xl');
		expect(titleSpans.length).toBe(0);
	});

	it('clicking EN button updates locale', async () => {
		render(TitleBar, { onOpenSettings: vi.fn(), onToggleFullscreen: vi.fn() });
		await fireEvent.click(screen.getByText('EN'));
		expect(prefs.locale).toBe('en');
	});

	it('clicking 中 button updates locale', async () => {
		render(TitleBar, { onOpenSettings: vi.fn(), onToggleFullscreen: vi.fn() });
		await fireEvent.click(screen.getByText('中'));
		expect(prefs.locale).toBe('zh');
	});

	it('shows exit fullscreen icon when in fullscreen mode', async () => {
		const fakeElement = document.createElement('div');
		Object.defineProperty(document, 'fullscreenElement', {
			configurable: true,
			get: () => fakeElement,
		});

		render(TitleBar, { onOpenSettings: vi.fn(), onToggleFullscreen: vi.fn() });
		document.dispatchEvent(new Event('fullscreenchange'));

		await vi.waitFor(() => {
			expect(screen.getByLabelText('exitFullscreen')).toBeInTheDocument();
		});

		Object.defineProperty(document, 'fullscreenElement', {
			configurable: true,
			get: () => null,
		});
	});
});
