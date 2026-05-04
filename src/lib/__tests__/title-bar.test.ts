import { describe, it, expect } from 'vitest';
import { formatDate } from '../title-bar';

describe('formatDate', () => {
	it('formats date in Chinese', () => {
		const d = new Date(2026, 4, 4);
		expect(formatDate(d, 'zh')).toBe('2026年5月4日 星期一');
	});

	it('formats date in English', () => {
		const d = new Date(2026, 4, 4);
		const result = formatDate(d, 'en');
		expect(result).toContain('May');
		expect(result).toContain('4');
		expect(result).toContain('2026');
		expect(result).toContain('Monday');
	});

	it('handles Chinese weekdays correctly', () => {
		const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
		// 2026-05-03 is Sunday
		const d = new Date(2026, 4, 3);
		expect(formatDate(d, 'zh')).toBe(`2026年5月3日 ${weekdays[0]}`);
	});

	it('handles end of month correctly in Chinese', () => {
		// April 30, 2026
		const d = new Date(2026, 3, 30);
		expect(formatDate(d, 'zh')).toBe('2026年4月30日 星期四');
	});

	it('handles leap year February in English', () => {
		// Feb 29, 2024 (leap year)
		const d = new Date(2024, 1, 29);
		const result = formatDate(d, 'en');
		expect(result).toContain('February');
		expect(result).toContain('29');
		expect(result).toContain('2024');
	});
});
