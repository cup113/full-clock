<script lang="ts">
	export type IconName =
		| 'clock'
		| 'timer'
		| 'panel-top'
		| 'swatch'
		| 'type'
		| 'eye'
		| 'monitor'
		| 'refresh'
		| 'globe'
		| 'bar-position'
		| 'opacity'
		| 'pencil';

	let { name, size = 15 }: { name: IconName; size?: number } = $props();
</script>

<svg
	viewBox="0 0 24 24"
	width={size}
	height={size}
	class="shrink-0 text-ink-muted"
	fill="none"
	stroke="currentColor"
	stroke-width="2"
	stroke-linecap="round"
	stroke-linejoin="round"
	aria-hidden="true"
>
	{#if name === 'clock'}
		<circle cx="12" cy="12" r="9" />
		<path d="M12 7v5l3.5 2" />
	{:else if name === 'timer'}
		<circle cx="12" cy="14" r="8" />
		<path d="M12 14v-4" />
		<path d="M9 2h6" />
	{:else if name === 'panel-top'}
		<rect x="3" y="3" width="18" height="18" rx="2" />
		<path d="M3 9h18" />
	{:else if name === 'swatch'}
		<rect x="3" y="3" width="7.5" height="7.5" rx="1.5" />
		<rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5" />
		<rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5" />
		<rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5" />
	{:else if name === 'type'}
		<path d="M4 7V4h16v3" />
		<path d="M9 20h6" />
		<path d="M12 4v16" />
	{:else if name === 'eye'}
		<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" />
		<circle cx="12" cy="12" r="3" />
	{:else if name === 'monitor'}
		<path d="M18 8h1a4 4 0 0 1 0 8h-1" />
		<path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
		<path d="M6 1v3" />
		<path d="M10 1v3" />
		<path d="M14 1v3" />
	{:else if name === 'refresh'}
		<path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
		<path d="M21 3v5h-5" />
		<path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
		<path d="M3 21v-5h5" />
	{:else if name === 'globe'}
		<circle cx="12" cy="12" r="9" />
		<path d="M3 12h18" />
		<path d="M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18" />
	{:else if name === 'bar-position'}
		<rect x="3" y="3" width="18" height="18" rx="3" />
		<path d="M3 16h18" />
	{:else if name === 'opacity'}
		<circle cx="12" cy="12" r="9" />
		<path d="M12 3a9 9 0 0 0 0 18z" fill="currentColor" stroke="none" />
	{:else if name === 'pencil'}
		<path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
	{/if}
</svg>
