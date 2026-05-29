import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import { resetPrefs, prefs } from '../preferences.svelte';
import SecondsModeDemo from './SecondsModeDemo.svelte';

beforeEach(() => {
	resetPrefs();
	vi.useFakeTimers();
});

afterEach(() => {
	vi.useRealTimers();
});

describe('SecondsModeDemo', () => {
	it('renders all three mode labels', () => {
		render(SecondsModeDemo);
		expect(screen.getByText('secondStyle_off')).toBeInTheDocument();
		expect(screen.getByText('secondStyle_digital')).toBeInTheDocument();
		expect(screen.getByText('secondStyle_bar')).toBeInTheDocument();
	});

	it('renders demo clock with 12:34 in all three cards', () => {
		render(SecondsModeDemo);
		const clocks = screen.getAllByText('12:34');
		expect(clocks).toHaveLength(3);
	});

	it('applies foreground color from prefs', () => {
		prefs.foreground = '#ff0000';
		const { container } = render(SecondsModeDemo);
		const colored = container.querySelectorAll('[style*="color:"]');
		expect(colored.length).toBeGreaterThan(0);
	});

	it('renders bar demo with width element', () => {
		render(SecondsModeDemo);
		const bar = document.querySelector('[style*="width:"]');
		expect(bar).toBeInTheDocument();
	});
});
