export function panelBg(hex: string): string {
	const r = parseInt(hex.slice(1, 3), 16);
	const g = parseInt(hex.slice(3, 5), 16);
	const b = parseInt(hex.slice(5, 7), 16);
	return `rgb(${Math.round(r * 0.3 + 20 * 0.7)}, ${Math.round(g * 0.3 + 20 * 0.7)}, ${Math.round(b * 0.3 + 30 * 0.7)})`;
}

export function syncPrecisionColor(errorMargin: number): string {
	if (errorMargin < 500) return 'bg-green-500';
	if (errorMargin < 1000) return 'bg-yellow-500';
	return 'bg-red-500';
}

export function activeStyle(foreground: string, background: string): string {
	return `background:${foreground};color:${background};border-color:${foreground}`;
}
