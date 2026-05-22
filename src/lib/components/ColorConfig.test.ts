import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import { resetPrefs, prefs } from '../preferences.svelte';
import ColorConfig from './ColorConfig.svelte';

beforeEach(() => {
	resetPrefs();
});

describe('ColorConfig', () => {
	it('renders theme section header', () => {
		render(ColorConfig);
		expect(screen.getByText('theme')).toBeInTheDocument();
	});

	it('renders all 6 color preset buttons', () => {
		render(ColorConfig);
		const titles = ['colorPresetClassic', 'colorPresetMidnight', 'colorPresetContrast', 'colorPresetSunset', 'colorPresetMatrix', 'colorPresetSlate'];
		for (const t of titles) {
			expect(screen.getByTitle(t)).toBeInTheDocument();
		}
	});

	it('clicking classic preset updates all three color prefs', () => {
		render(ColorConfig);
		fireEvent.click(screen.getByTitle('colorPresetClassic'));
		expect(prefs.background).toBe('#004400');
		expect(prefs.foreground).toBe('#FFFFFF');
		expect(prefs.colorProgress).toBe('#005500');
	});

	it('detail section is collapsed by default', () => {
		render(ColorConfig);
		expect(screen.queryByText('#004400')).not.toBeInTheDocument();
	});

	it('clicking detail toggle expands color pickers', async () => {
		const { container } = render(ColorConfig);
		const toggleBtn = container.querySelector('section > button')!;
		toggleBtn.click();
		await vi.waitFor(() => {
			expect(screen.getByText('#004400')).toBeInTheDocument();
		});
	});

	it('clicking detail toggle again collapses color pickers', async () => {
		const { container } = render(ColorConfig);
		const toggleBtn = container.querySelector('section > button')!;
		toggleBtn.click();
		await vi.waitFor(() => {
			expect(screen.getByText('#004400')).toBeInTheDocument();
		});
		toggleBtn.click();
		await vi.waitFor(() => {
			expect(screen.queryByText('#004400')).not.toBeInTheDocument();
		});
	});

	it('color picker code values reflect prefs changes', async () => {
		prefs.background = '#ff0000';
		prefs.foreground = '#00ff00';
		prefs.colorProgress = '#0000ff';
		const { container } = render(ColorConfig);
		const toggleBtn = container.querySelector('section > button')!;
		toggleBtn.click();
		await vi.waitFor(() => {
			expect(screen.getByText('#ff0000')).toBeInTheDocument();
		});
		expect(screen.getByText('#00ff00')).toBeInTheDocument();
		expect(screen.getByText('#0000ff')).toBeInTheDocument();
	});

	it('font select updates prefs.fontFamily', () => {
		render(ColorConfig);
		const select = screen.getByRole('combobox');
		fireEvent.change(select, { target: { value: 'Georgia' } });
		expect(prefs.fontFamily).toBe('Georgia');
	});

	it('preview shows 24h format by default', () => {
		render(ColorConfig);
		expect(screen.getByText('19:02')).toBeInTheDocument();
	});

	it('preview shows 12h format with AM/PM when timeFormat is 12h', () => {
		prefs.timeFormat = '12h';
		render(ColorConfig);
		expect(screen.getByText('07:02')).toBeInTheDocument();
		expect(screen.getByText('PM')).toBeInTheDocument();
	});

	it('preview shows bar overlay when secondStyle is bar', () => {
		prefs.secondStyle = 'bar';
		prefs.barPosition = 'fullscreen';
		const { container } = render(ColorConfig);
		const bar = container.querySelector('[style*="56.666"]');
		expect(bar).toBeInTheDocument();
	});

	it('preview shows digital seconds when secondStyle is digital', () => {
		prefs.secondStyle = 'digital';
		render(ColorConfig);
		expect(screen.getByText(':34')).toBeInTheDocument();
	});
});
