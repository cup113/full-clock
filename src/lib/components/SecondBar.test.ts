import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/svelte';
import { resetPrefs, prefs } from '../preferences.svelte';
import { removeSync } from '../time.svelte';
import { resetTick } from '../tick.svelte';
import SecondBar from './SecondBar.svelte';

beforeEach(() => {
	resetPrefs();
	removeSync();
	vi.useFakeTimers();
	vi.setSystemTime(new Date(2026, 4, 7, 14, 30, 45));
	resetTick();
});

afterEach(() => {
	vi.useRealTimers();
});

describe('SecondBar', () => {
	it('renders fullscreen bar when secondStyle is bar with fullscreen position', () => {
		prefs.secondStyle = 'bar';
		prefs.barPosition = 'fullscreen';
		const { container } = render(SecondBar);
		expect(container.querySelector('.h-full')).toBeInTheDocument();
	});

	it('renders top bar when secondStyle is bar with top position', () => {
		prefs.secondStyle = 'bar';
		prefs.barPosition = 'top';
		const { container } = render(SecondBar);
		expect(container.querySelector('.h-12')).toBeInTheDocument();
	});

	it('renders bottom bar when secondStyle is bar with bottom position', () => {
		prefs.secondStyle = 'bar';
		prefs.barPosition = 'bottom';
		const { container } = render(SecondBar);
		const bar = container.querySelector('.bottom-0');
		expect(bar).toBeInTheDocument();
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
		prefs.secondStyle = 'bar';
		prefs.barPosition = 'fullscreen';
		const { container } = render(SecondBar);
		const bar = container.querySelector('.h-full') as HTMLElement;
		expect(bar).toHaveStyle('width: 75%');
	});
});
