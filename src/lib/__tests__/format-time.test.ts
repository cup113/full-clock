import { describe, it, expect } from 'vitest';
import { formatTime } from '../format-time';

describe('formatTime', () => {
	it('formats midnight in 24h mode', () => {
		const d = new Date(2026, 4, 22, 0, 0, 0);
		expect(formatTime(d, '24h')).toEqual({ hours: '00', minutes: '00', seconds: '00', ampm: '' });
	});

	it('formats afternoon time in 24h mode', () => {
		const d = new Date(2026, 4, 22, 14, 5, 9);
		expect(formatTime(d, '24h')).toEqual({ hours: '14', minutes: '05', seconds: '09', ampm: '' });
	});

	it('formats midnight as 12 AM in 12h mode', () => {
		const d = new Date(2026, 4, 22, 0, 30, 0);
		expect(formatTime(d, '12h')).toMatchObject({ hours: '12', minutes: '30', ampm: 'AM' });
	});

	it('formats noon as 12 PM in 12h mode', () => {
		const d = new Date(2026, 4, 22, 12, 30, 0);
		expect(formatTime(d, '12h')).toMatchObject({ hours: '12', minutes: '30', ampm: 'PM' });
	});

	it('formats afternoon as 01 PM in 12h mode', () => {
		const d = new Date(2026, 4, 22, 13, 1, 2);
		expect(formatTime(d, '12h')).toMatchObject({ hours: '01', minutes: '01', seconds: '02', ampm: 'PM' });
	});

	it('returns AM for hours 0-11 and PM for hours 12-23', () => {
		const am = [0, 1, 6, 11].map((h) => formatTime(new Date(2026, 4, 22, h, 0), '12h').ampm);
		const pm = [12, 13, 18, 23].map((h) => formatTime(new Date(2026, 4, 22, h, 0), '12h').ampm);
		expect(am.every((v) => v === 'AM')).toBe(true);
		expect(pm.every((v) => v === 'PM')).toBe(true);
	});

	it('returns empty ampm in 24h mode', () => {
		for (let h = 0; h < 24; h++) {
			const d = new Date(2026, 4, 22, h, 0);
			expect(formatTime(d, '24h').ampm).toBe('');
		}
	});

	it('pads single-digit minutes and seconds', () => {
		for (let m = 0; m < 10; m++) {
			for (let s = 0; s < 10; s++) {
				const d = new Date(2026, 4, 22, 10, m, s);
				const result = formatTime(d, '24h');
				expect(result.minutes).toBe(m.toString().padStart(2, '0'));
				expect(result.seconds).toBe(s.toString().padStart(2, '0'));
			}
		}
	});
});
