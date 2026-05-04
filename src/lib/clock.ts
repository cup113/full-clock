export function calcFontSize(width: number, height: number, hasSeconds: boolean): number {
	const maxW = width * 0.92;
	const maxH = height * 0.88;
	const digitW = 0.62;
	const colonW = 0.32;
	const ls = 0.05;
	const digits = hasSeconds ? 6 : 4;
	const colons = hasSeconds ? 2 : 1;
	const chars = digits + colons;
	const textWidth = digits * digitW + colons * colonW + (chars - 1) * ls;
	const textHeight = 1;
	return Math.floor(100 * Math.min(maxW / textWidth, maxH / textHeight)) / 100;
}
