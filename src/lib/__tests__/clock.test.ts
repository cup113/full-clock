import { describe, it, expect } from 'vitest';
import { calcFontSize } from '../clock';

describe('calcFontSize', () => {
	it('returns smaller font for narrower container', () => {
		const small = calcFontSize(300, 400, false, false);
		const large = calcFontSize(600, 400, false, false);
		expect(small).toBeLessThan(large);
	});

	it('returns smaller font when seconds are displayed', () => {
		const withoutSec = calcFontSize(400, 400, false, false);
		const withSec = calcFontSize(400, 400, true, false);
		expect(withSec).toBeLessThan(withoutSec);
	});

	it('returns smaller font in 12h mode due to AM/PM', () => {
		const h24 = calcFontSize(400, 400, false, false);
		const h12 = calcFontSize(400, 400, false, true);
		expect(h12).toBeLessThan(h24);
	});

	it('returns 0 for zero width', () => {
		expect(calcFontSize(0, 400, false, false)).toBe(0);
	});

	it('returns 0 for zero height', () => {
		expect(calcFontSize(400, 0, false, false)).toBe(0);
	});

	it('is constrained by height for wide containers', () => {
		const result = calcFontSize(2000, 100, false, false);
		expect(result).toBeGreaterThan(0);
		expect(result).toBeLessThanOrEqual(88);
	});

	it('produces a reasonable font size for 1080p display without seconds', () => {
		const result = calcFontSize(1920, 1080, false, false);
		expect(result).toBeGreaterThan(500);
		expect(result).toBeLessThan(650);
	});

	it('produces a reasonable font size for 1080p display with seconds', () => {
		const result = calcFontSize(1920, 1080, true, false);
		expect(result).toBeGreaterThan(300);
		expect(result).toBeLessThan(450);
	});
});
