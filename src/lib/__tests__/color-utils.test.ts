import { describe, it, expect } from 'vitest';
import {
	panelBg,
	syncPrecisionColor,
	colorWithOpacity,
	mixHex,
	contrastRatio,
	panelPalette,
	panelThemeVars,
} from '../color-utils';

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

describe('mixHex', () => {
	it('returns the endpoints unchanged', () => {
		expect(mixHex('#004400', '#ffffff', 0)).toBe('#004400');
		expect(mixHex('#004400', '#ffffff', 1)).toBe('#ffffff');
	});

	it('blends the midpoint', () => {
		expect(mixHex('#000000', '#ffffff', 0.5)).toBe('#808080');
	});

	it('is case-insensitive on input and emits lowercase', () => {
		expect(mixHex('#000000', '#FFFFFF', 0.5)).toBe('#808080');
	});
});

describe('contrastRatio', () => {
	it('is 21 for black on white and 1 for identical colours', () => {
		expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 5);
		expect(contrastRatio('#123456', '#123456')).toBeCloseTo(1, 5);
	});

	it('is symmetric', () => {
		expect(contrastRatio('#004400', '#ffffff')).toBeCloseTo(
			contrastRatio('#ffffff', '#004400'),
			10,
		);
	});
});

const PRESETS: [string, string, string?][] = [
	['classic', '#004400', '#FFFFFF'],
	['midnight', '#0a0a23', '#e0e0ff'],
	['contrast', '#000000', '#00ff00'],
	['sunset', '#2d1b00', '#ffd699'],
	['matrix', '#000000', '#00ff41'],
	['slate', '#1e293b', '#e2e8f0'],
];

function channels(hex: string): [number, number, number] {
	return [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)) as [number, number, number];
}

describe('panelPalette', () => {
	it('keeps every preset readable on its own card surface', () => {
		for (const [id, bg, fg] of PRESETS) {
			const p = panelPalette(bg, fg ?? '#FFFFFF');
			expect(contrastRatio(p.ink, p.card), `${id}: ink on card`).toBeGreaterThanOrEqual(7);
			expect(contrastRatio(p.inkMuted, p.card), `${id}: muted ink on card`).toBeGreaterThanOrEqual(
				4.5,
			);
			// The accent fills chips and the switch track, so it is a UI component
			// (WCAG 3:1) rather than text.
			expect(contrastRatio(p.accentFg, p.accent), `${id}: accent foreground`).toBeGreaterThanOrEqual(
				3,
			);
			expect(contrastRatio(p.accent, p.card), `${id}: accent on card`).toBeGreaterThanOrEqual(2.5);
		}
	});

	it('takes the card hue from the theme background, not a fixed skin', () => {
		const green = channels(panelPalette('#004400', '#FFFFFF').card);
		const slate = channels(panelPalette('#1e293b', '#e2e8f0').card);
		expect(green[1]).toBeGreaterThan(green[0]);
		expect(green[1]).toBeGreaterThan(green[2]);
		expect(slate[2]).toBeGreaterThan(slate[0]);
		expect(slate[2]).toBeGreaterThan(slate[1]);
	});

	it('tints a white foreground instead of reusing pure white', () => {
		const p = panelPalette('#004400', '#FFFFFF');
		expect(p.ink.toLowerCase()).not.toBe('#ffffff');
		expect(p.inkMuted.toLowerCase()).not.toBe('#ffffff');
	});

	it('keeps surfaces ordered backdrop < card < raised', () => {
		const p = panelPalette('#1e293b', '#e2e8f0');
		const lum = (hex: string) => contrastRatio(hex, '#000000');
		expect(lum(p.backdrop)).toBeLessThan(lum(p.card));
		expect(lum(p.card)).toBeLessThan(lum(p.raised));
	});
});

describe('panelThemeVars', () => {
	it('emits every colour token the panel classes reference', () => {
		const vars = panelThemeVars('#004400', '#FFFFFF');
		for (const token of [
			'--color-surface-backdrop',
			'--color-surface-card',
			'--color-surface-raised',
			'--color-surface-line',
			'--color-accent',
			'--color-accent-fg',
			'--color-ink',
			'--color-ink-muted',
			'--color-ink-faint',
		]) {
			expect(vars).toContain(`${token}:`);
		}
	});
});
