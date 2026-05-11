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
});
