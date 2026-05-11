import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import { resetPrefs, prefs } from '../preferences.svelte';
import { removeSync } from '../time.svelte';
import Clock from './Clock.svelte';

beforeEach(() => {
	resetPrefs();
	removeSync();
	vi.useFakeTimers();
	vi.setSystemTime(new Date(2026, 4, 7, 14, 30, 45));
});

afterEach(() => {
	vi.useRealTimers();
});

describe('Clock', () => {
	it('renders time in HH:MM format (24h default)', () => {
		render(Clock, { secondStyle: 'off' });
		expect(screen.getByText('14:30')).toBeInTheDocument();
	});

	it('renders time in 12h format when set', () => {
		prefs.timeFormat = '12h';
		render(Clock, { secondStyle: 'off' });
		expect(screen.getByText('02:30')).toBeInTheDocument();
		expect(screen.getByText('PM')).toBeInTheDocument();
	});

	it('shows digital seconds when secondStyle is digital', () => {
		render(Clock, { secondStyle: 'digital' });
		expect(screen.getByText(':45')).toBeInTheDocument();
	});

	it('does not show seconds when secondStyle is not digital', () => {
		render(Clock, { secondStyle: 'bar' });
		expect(screen.queryByText(':45')).not.toBeInTheDocument();
	});

	it('applies font-family from prefs', () => {
		const { container } = render(Clock, { secondStyle: 'off' });
		const innerDiv = container.querySelector('[style*="font-family"]');
		expect(innerDiv).toHaveStyle('font-family: Arial');
	});

	it('applies foreground color from prefs', () => {
		const { container } = render(Clock, { secondStyle: 'off' });
		const innerDiv = container.querySelector('[style*="color"]');
		expect(innerDiv).toHaveStyle('color: #FFFFFF');
	});
});
