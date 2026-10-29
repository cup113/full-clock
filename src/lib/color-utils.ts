function parseHex(hex: string): [number, number, number] {
	return [
		parseInt(hex.slice(1, 3), 16),
		parseInt(hex.slice(3, 5), 16),
		parseInt(hex.slice(5, 7), 16),
	];
}

function toHex(rgb: [number, number, number]): string {
	return '#' + rgb.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
}

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

export function colorWithOpacity(hex: string, opacity: number): string {
	const r = parseInt(hex.slice(1, 3), 16);
	const g = parseInt(hex.slice(3, 5), 16);
	const b = parseInt(hex.slice(5, 7), 16);
	return `rgba(${r},${g},${b},${opacity})`;
}

/** Mixes `to` into `from`; `amount` 0 keeps `from`, 1 returns `to`. */
export function mixHex(from: string, to: string, amount: number): string {
	const a = parseHex(from);
	const b = parseHex(to);
	return toHex([0, 1, 2].map((i) => a[i] + (b[i] - a[i]) * amount) as [number, number, number]);
}

function relativeLuminance(hex: string): number {
	const [r, g, b] = parseHex(hex).map((v) => {
		const c = v / 255;
		return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
	});
	return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio (1–21) between two hex colours. */
export function contrastRatio(a: string, b: string): number {
	const la = relativeLuminance(a);
	const lb = relativeLuminance(b);
	return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

export interface PanelPalette {
	backdrop: string;
	card: string;
	raised: string;
	line: string;
	accent: string;
	accentFg: string;
	ink: string;
	inkMuted: string;
	inkFaint: string;
}

/** Neutral dark the panel surfaces sink toward, so a saturated theme keeps its hue without glowing. */
const PANEL_BASE = '#121418';

/** Mixes `colour` toward `toward` until it clears `min` contrast against `surface`. */
function untilVisible(colour: string, toward: string, surface: string, min: number): string {
	let result = colour;
	for (let step = 1; step <= 20 && contrastRatio(result, surface) < min; step += 1) {
		result = mixHex(colour, toward, step * 0.05);
	}
	return result;
}

/**
 * Chrome palette for the settings panel, derived from the clock's own colours so
 * the panel follows the selected theme instead of sitting on it as a fixed skin.
 * Surfaces pull the theme background toward a neutral dark (hue kept, saturation
 * and lightness dropped), so a green theme gets a deep green panel and a slate
 * theme a navy one. Text is the theme foreground pulled slightly toward that
 * background, so a white foreground reads as a pale tint of its own hue.
 */
export function panelPalette(background: string, foreground: string): PanelPalette {
	const card = mixHex(background, PANEL_BASE, 0.55);
	const ink = mixHex(foreground, background, 0.12);
	// Keeps the theme's hue, then nudges it up only as far as it must go to read
	// as a highlight on the card (a neon-on-black theme has far darker accents
	// than a green one).
	const accent = untilVisible(mixHex(background, foreground, 0.18), ink, card, 2.8);

	return {
		backdrop: mixHex(card, '#000000', 0.45),
		card,
		raised: mixHex(card, ink, 0.1),
		line: mixHex(card, ink, 0.2),
		accent,
		accentFg: contrastRatio(ink, accent) >= contrastRatio(card, accent) ? ink : card,
		ink,
		inkMuted: mixHex(foreground, background, 0.4),
		inkFaint: mixHex(foreground, background, 0.6),
	};
}

/** `--color-*` custom-property block that re-skins the panel for a theme. */
export function panelThemeVars(background: string, foreground: string): string {
	const p = panelPalette(background, foreground);
	return [
		`--color-surface-backdrop:${p.backdrop}`,
		`--color-surface-card:${p.card}`,
		`--color-surface-raised:${p.raised}`,
		`--color-surface-line:${p.line}`,
		`--color-accent:${p.accent}`,
		`--color-accent-fg:${p.accentFg}`,
		`--color-ink:${p.ink}`,
		`--color-ink-muted:${p.inkMuted}`,
		`--color-ink-faint:${p.inkFaint}`,
	].join(';');
}
