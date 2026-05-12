export interface FormattedTime {
	hours: string;
	minutes: string;
	seconds: string;
	ampm: string;
}

export function formatTime(date: Date, timeFormat: '12h' | '24h'): FormattedTime {
	const rawHours = date.getHours();
	const minutes = date.getMinutes().toString().padStart(2, '0');
	const seconds = date.getSeconds().toString().padStart(2, '0');
	const hours =
		timeFormat === '12h'
			? (rawHours % 12 || 12).toString().padStart(2, '0')
			: rawHours.toString().padStart(2, '0');
	const ampm = timeFormat === '12h' ? (rawHours < 12 ? 'AM' : 'PM') : '';
	return { hours, minutes, seconds, ampm };
}
