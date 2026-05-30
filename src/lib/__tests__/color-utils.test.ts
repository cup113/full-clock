import { describe, it, expect } from 'vitest';
import { panelBg, syncPrecisionColor, activeStyle, colorWithOpacity } from '../color-utils';

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
		expect(activeStyle('#ff0000', '#0000ff')).toBe(
			'background:#ff0000;color:#0000ff;border-color:#ff0000',
		);
	});
});

describe('colorWithOpacity', () => {
	it('returns rgba string for a given hex and opacity', () => {
		expect(colorWithOpacity('#ff0000', 0.5)).toBe('rgba(255,0,0,0.5)');
	});

	it('handles #000000', () => {
		expect(colorWithOpacity('#000000', 1)).toBe('rgba(0,0,0,1)');
	});

	it('handles #FFFFFF at 0 opacity', () => {
		expect(colorWithOpacity('#FFFFFF', 0)).toBe('rgba(255,255,255,0)');
	});

	it('handles #004400 at 0.6', () => {
		expect(colorWithOpacity('#004400', 0.6)).toBe('rgba(0,68,0,0.6)');
	});
});
