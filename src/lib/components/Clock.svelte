<script lang="ts">
	import { prefs } from '../preferences.svelte';
	import { getSyncedOffset, isSyncApplied } from '../time.svelte';

	let { secondStyle }: { secondStyle: string } = $props();

	let now = $state(Date.now());
	let container: HTMLDivElement;
	let fontSize = $state(200);

	$effect(() => {
		const interval = setInterval(() => {
			now = Date.now();
		}, 100);
		return () => clearInterval(interval);
	});

	let adjusted = $derived(isSyncApplied() ? now + getSyncedOffset() : now);

	let date = $derived(new Date(adjusted));
	let hours = $derived(date.getHours().toString().padStart(2, '0'));
	let minutes = $derived(date.getMinutes().toString().padStart(2, '0'));
	let seconds = $derived(date.getSeconds());
	let secondsStr = $derived(seconds.toString().padStart(2, '0'));

	function computeFontSize() {
		if (!container) return;
		const { width, height } = container.getBoundingClientRect();
		if (width === 0 || height === 0) return;
		const maxW = width * 0.92;
		const maxH = height * 0.88;
		// Digits and colon width estimates at font-size 1px
		const digitW = 0.62;
		const colonW = 0.32;
		const ls = 0.05;
		const isDigital = secondStyle === 'digital';
		const digits = isDigital ? 6 : 4;
		const colons = isDigital ? 2 : 1;
		const chars = digits + colons;
		const textWidth = digits * digitW + colons * colonW + (chars - 1) * ls;
		const textHeight = 1;
		fontSize = Math.floor(100 * Math.min(maxW / textWidth, maxH / textHeight)) / 100;
	}

	$effect(() => {
		if (!container) return;
		const ro = new ResizeObserver(computeFontSize);
		ro.observe(container);
		computeFontSize();
		return () => ro.disconnect();
	});
</script>

<div
	bind:this={container}
	class="absolute inset-0 flex items-center justify-center overflow-hidden select-none"
>
	<div
		class="inline-flex leading-none tracking-wider whitespace-nowrap"
		style="font-size: {fontSize}px; font-family: {prefs.fontFamily}; color: {prefs.foreground};"
	>
		<span class="font-bold">{hours}:{minutes}</span>
		{#if secondStyle === 'digital'}
			<span class="font-normal opacity-80">:{secondsStr}</span>
		{/if}
	</div>
</div>
