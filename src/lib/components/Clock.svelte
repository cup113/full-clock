<script lang="ts">
	import { prefs } from '../preferences.svelte';
	import { getSyncedOffset, isSyncApplied } from '../time.svelte';

	let { secondStyle }: { secondStyle: string } = $props();

	let now = $state(Date.now());
	let container: HTMLDivElement;
	let fontSize = $state(200);

	$effect(() => {
		const interval = setInterval(() => { now = Date.now(); }, 100);
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
		const ro = new ResizeObserver(([entry]) => {
			const { width, height } = entry.contentRect;
			const ratio = secondStyle === 'digital' ? 0.55 : 0.45;
			const fromWidth = width * ratio;
			const fromHeight = height * 0.6;
			fontSize = Math.min(fromWidth, fromHeight) / 3;
		});
		ro.observe(container);
		return () => ro.disconnect();
	});
</script>

<div bind:this={container} class="clock-container">
	<div class="clock-display" style="font-size: {fontSize}px; font-family: {prefs.fontFamily}; color: {prefs.foreground};">
		<span class="time">{hours}:{minutes}</span>
		{#if secondStyle === 'digital'}
			<span class="seconds">:{secondsStr}</span>
		{/if}
	</div>
</div>

<style>
	.clock-container {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
	}
	.clock-display {
		line-height: 1;
		white-space: nowrap;
		user-select: none;
		letter-spacing: 0.05em;
	}
	.time {
		font-weight: bold;
	}
	.seconds {
		font-weight: normal;
		opacity: 0.8;
	}
</style>
