import { describe, it, expect } from 'vitest';
import { panelBg, syncPrecisionColor, activeStyle } from '../color-utils';

describe('panelBg', () => {
	it('darkens #000000 with base tint', () => {
		expect(panelBg('#000000')).toBe('rgb(14, 14, 21)');
	});

	it('darkens #FFFFFF', () => {
		expect(panelBg('#FFFFFF')).toBe('rgb(91, 91, 98)');
	});

	it('computes #004400 correctly', () => {
		expect(panelBg('#004400')).toBe('rgb(14, 34, 21)');
	});
});

describe('syncPrecisionColor', () => {
	it('returns green for errorMargin < 500', () => {
		expect(syncPrecisionColor(0)).toBe('bg-green-500');
		expect(syncPrecisionColor(499)).toBe('bg-green-500');
	});

	it('returns yellow for errorMargin 500-999', () => {
		expect(syncPrecisionColor(500)).toBe('bg-yellow-500');
		expect(syncPrecisionColor(999)).toBe('bg-yellow-500');
	});

	it('returns red for errorMargin >= 1000', () => {
		expect(syncPrecisionColor(1000)).toBe('bg-red-500');
		expect(syncPrecisionColor(5000)).toBe('bg-red-500');
	});
});

describe('activeStyle', () => {
	it('interleaves foreground and background', () => {
		expect(activeStyle('#ff0000', '#0000ff')).toBe('background:#ff0000;color:#0000ff;border-color:#ff0000');
	});
});
