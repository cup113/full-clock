<script lang="ts">
	import { prefs } from '../preferences.svelte';
	import { getSyncedOffset, isSyncApplied } from '../time.svelte';
	import { calcFontSize } from '../clock';

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

	$effect(() => {
		if (!container) return;
		const ro = new ResizeObserver(() => {
			const { width, height } = container.getBoundingClientRect();
			if (width === 0 || height === 0) return;
			fontSize = calcFontSize(width, height, secondStyle === 'digital');
		});
		ro.observe(container);
		{
			const { width, height } = container.getBoundingClientRect();
			if (width > 0 && height > 0) {
				fontSize = calcFontSize(width, height, secondStyle === 'digital');
			}
		}
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
