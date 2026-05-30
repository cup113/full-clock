const fontMetricsCache = new Map<string, { digitW: number; colonW: number; ampmW: number }>();

function measureFont(fontFamily: string) {
	const cached = fontMetricsCache.get(fontFamily);
	if (cached) return cached;

	const FALLBACK = { digitW: 0.62, colonW: 0.32, ampmW: 0.65 };

	const canvas = document.createElement('canvas');
	const ctx = canvas.getContext('2d');
	if (!ctx) {
		fontMetricsCache.set(fontFamily, FALLBACK);
		return FALLBACK;
	}

	ctx.font = `bold 100px ${fontFamily}`;
	const metrics = {
		digitW: ctx.measureText('0').width / 100,
		colonW: ctx.measureText(':').width / 100,
		ampmW: ctx.measureText('A').width / 100,
	};
	fontMetricsCache.set(fontFamily, metrics);
	return metrics;
}

export function calcFontSize(
	width: number,
	height: number,
	hasSeconds: boolean,
	hasAmpm: boolean,
	fontFamily: string,
): number {
	const { digitW, colonW, ampmW } = measureFont(fontFamily);
	const maxW = width * 0.92;
	const maxH = height * 0.88;
	const ls = 0.05;
	const digits = hasSeconds ? 6 : 4;
	const colons = hasSeconds ? 2 : 1;
	let chars = digits + colons;
	let textWidth = digits * digitW + colons * colonW + (chars - 1) * ls;
	if (hasAmpm) {
		chars += 2;
		textWidth += ampmW + 2 * ls + (chars - 2 - digits - colons) * ls;
	}
	const textHeight = 1;
	return Math.floor(100 * Math.min(maxW / textWidth, maxH / textHeight)) / 100;
}
