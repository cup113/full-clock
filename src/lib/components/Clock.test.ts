import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import { resetPrefs } from '../preferences.svelte';
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
	it('renders time in HH:MM format', () => {
		render(Clock, { secondStyle: 'off' });
		expect(screen.getByText('14:30')).toBeInTheDocument();
	});

	it('shows digital seconds when secondStyle is digital', () => {
		render(Clock, { secondStyle: 'digital' });
		expect(screen.getByText(':45')).toBeInTheDocument();
	});

	it('does not show seconds when secondStyle is not digital', () => {
		render(Clock, { secondStyle: 'fullscreen-bar' });
		expect(screen.queryByText(':45')).not.toBeInTheDocument();
	});

	it('applies font-family from prefs', () => {
		const { container } = render(Clock, { secondStyle: 'off' });
		const innerDiv = container.querySelector('[style*="font-family"]');
		expect(innerDiv).toHaveStyle('font-family: Arial, 等线, sans-serif');
	});

	it('applies foreground color from prefs', () => {
		const { container } = render(Clock, { secondStyle: 'off' });
		const innerDiv = container.querySelector('[style*="color"]');
		expect(innerDiv).toHaveStyle('color: #FFFFFF');
	});
});
