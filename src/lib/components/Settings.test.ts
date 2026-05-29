import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import { resetPrefs, prefs } from '../preferences.svelte';
import Settings from './Settings.svelte';

beforeEach(() => {
	resetPrefs();
});

describe('Settings', () => {
	it('does not render when closed', () => {
		render(Settings, { open: false, onClose: () => {} });
		expect(screen.queryByText('settings')).not.toBeInTheDocument();
	});

	it('renders when open', () => {
		render(Settings, { open: true, onClose: () => {} });
		expect(screen.getByText('settings')).toBeInTheDocument();
	});

	it('close button triggers onClose', async () => {
		const onClose = vi.fn();
		render(Settings, { open: true, onClose });

		const [closeButton] = screen.getAllByLabelText('close');
		await fireEvent.click(closeButton);
		expect(onClose).toHaveBeenCalledOnce();
	});

	it('backdrop click triggers onClose', async () => {
		const onClose = vi.fn();
		render(Settings, { open: true, onClose });

		await fireEvent.click(screen.getByRole('dialog'));
		expect(onClose).toHaveBeenCalledOnce();
	});

	it('Escape key triggers onClose', async () => {
		const onClose = vi.fn();
		render(Settings, { open: true, onClose });

		const dialog = screen.getByRole('dialog');
		dialog.focus();
		await fireEvent.keyDown(dialog, { key: 'Escape' });
		expect(onClose).toHaveBeenCalledOnce();
	});

	it('reset button shows confirm dialog', async () => {
		const confirmMock = vi.fn(() => true);
		vi.stubGlobal('confirm', confirmMock);

		render(Settings, { open: true, onClose: () => {} });

		await fireEvent.click(screen.getByText('reset'));
		expect(confirmMock).toHaveBeenCalledWith('resetConfirm');

		vi.unstubAllGlobals();
	});

	it('second style button updates preferences', async () => {
		render(Settings, { open: true, onClose: () => {} });

		const digitalBtn = screen.getByText('secondStyle_digital');
		await fireEvent.click(digitalBtn);

		expect(prefs.secondStyle).toBe('digital');
	});

	it('triggers auto-sync computing state then falls back to idle on fetch failure', async () => {
		vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('network error'))));

		render(Settings, { open: true, onClose: () => {} });

		expect(await screen.findByText('timeSyncComputing', {}, { timeout: 3000 })).toBeInTheDocument();
		expect(await screen.findByText('timeSyncApply', {}, { timeout: 15000 })).toBeInTheDocument();
		expect(screen.queryByText('timeSyncComputing')).not.toBeInTheDocument();

		vi.unstubAllGlobals();
	});

	it('shows bar position options when secondStyle is bar', () => {
		prefs.secondStyle = 'bar';
		render(Settings, { open: true, onClose: () => {} });
		expect(screen.getByText('barPosition_fullscreen')).toBeInTheDocument();
		expect(screen.getByText('barPosition_top')).toBeInTheDocument();
		expect(screen.getByText('barPosition_bottom')).toBeInTheDocument();
		expect(screen.getByText('progressOpacity')).toBeInTheDocument();
	});

	it('hides bar position options when secondStyle is not bar', () => {
		prefs.secondStyle = 'off';
		render(Settings, { open: true, onClose: () => {} });
		expect(screen.queryByText('barPosition_fullscreen')).not.toBeInTheDocument();
		expect(screen.queryByText('progressOpacity')).not.toBeInTheDocument();
	});

	it('shows custom title input when titleStyle is custom', () => {
		prefs.titleStyle = 'custom';
		render(Settings, { open: true, onClose: () => {} });
		expect(screen.getByPlaceholderText('titleCustomized')).toBeInTheDocument();
	});

	it('hides custom title input when titleStyle is not custom', () => {
		prefs.titleStyle = 'date';
		render(Settings, { open: true, onClose: () => {} });
		expect(screen.queryByPlaceholderText('titleCustomized')).not.toBeInTheDocument();
	});

	it('reset button cancels on confirm false', async () => {
		const confirmMock = vi.fn(() => false);
		vi.stubGlobal('confirm', confirmMock);

		const origBackground = prefs.background;
		prefs.background = '#ff0000';
		render(Settings, { open: true, onClose: () => {} });

		await fireEvent.click(screen.getByText('reset'));
		expect(confirmMock).toHaveBeenCalledWith('resetConfirm');
		expect(prefs.background).toBe('#ff0000');

		vi.unstubAllGlobals();
	});
});
