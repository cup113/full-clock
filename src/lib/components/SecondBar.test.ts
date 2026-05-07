import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/svelte';
import { resetPrefs, prefs } from '../preferences.svelte';
import { removeSync } from '../time.svelte';
import SecondBar from './SecondBar.svelte';

beforeEach(() => {
	resetPrefs();
	removeSync();
	vi.useFakeTimers();
	vi.setSystemTime(new Date(2026, 4, 7, 14, 30, 45));
});

afterEach(() => {
	vi.useRealTimers();
});

describe('SecondBar', () => {
	it('renders fullscreen bar when secondStyle is fullscreen-bar', () => {
		prefs.secondStyle = 'fullscreen-bar';
		const { container } = render(SecondBar);
		expect(container.querySelector('.h-full')).toBeInTheDocument();
	});

	it('renders top bar when secondStyle is top-bar', () => {
		prefs.secondStyle = 'top-bar';
		const { container } = render(SecondBar);
		expect(container.querySelector('.h-12')).toBeInTheDocument();
	});

	it('does not render bar when secondStyle is off', () => {
		prefs.secondStyle = 'off';
		const { container } = render(SecondBar);
		expect(container.querySelector('.h-full')).toBeNull();
		expect(container.querySelector('.h-12')).toBeNull();
	});

	it('does not render bar when secondStyle is digital', () => {
		prefs.secondStyle = 'digital';
		const { container } = render(SecondBar);
		expect(container.querySelector('.h-full')).toBeNull();
		expect(container.querySelector('.h-12')).toBeNull();
	});

	it('calculates correct width percentage', () => {
		prefs.secondStyle = 'fullscreen-bar';
		const { container } = render(SecondBar);
		const bar = container.querySelector('.h-full') as HTMLElement;
		expect(bar).toHaveStyle('width: 75%');
	});
});
