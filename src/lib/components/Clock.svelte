<script lang="ts">
	import { prefs } from '../preferences.svelte';
	import { getSyncedOffset, isSyncApplied } from '../time.svelte';
	import { calcFontSize } from '../clock';

	let { secondStyle }: { secondStyle: string } = $props();

	let now = $state(Date.now());
	let container: HTMLDivElement;
	let fontSize = $state(200);
	let roTimer: ReturnType<typeof setTimeout> | undefined;

	$effect(() => {
		const interval = setInterval(() => {
			now = Date.now();
		}, 100);
		return () => clearInterval(interval);
	});

	let adjusted = $derived(isSyncApplied() ? now + getSyncedOffset() : now);

	let date = $derived(new Date(adjusted));
	let rawHours = $derived(date.getHours());
	let minutes = $derived(date.getMinutes().toString().padStart(2, '0'));
	let seconds = $derived(date.getSeconds());
	let secondsStr = $derived(seconds.toString().padStart(2, '0'));

	let hours = $derived(
		prefs.timeFormat === '12h'
			? (rawHours % 12 || 12).toString().padStart(2, '0')
			: rawHours.toString().padStart(2, '0')
	);
	let ampm = $derived(prefs.timeFormat === '12h' ? (rawHours < 12 ? 'AM' : 'PM') : '');

	function doCalcFontSize() {
		if (!container) return;
		const { width, height } = container.getBoundingClientRect();
		if (width === 0 || height === 0) return;
		fontSize = calcFontSize(width, height, secondStyle === 'digital', prefs.timeFormat === '12h');
	}

	$effect(() => {
		if (!container) return;
		const ro = new ResizeObserver(() => {
			clearTimeout(roTimer);
			roTimer = setTimeout(doCalcFontSize, 200);
		});
		ro.observe(container);
		doCalcFontSize();
		return () => {
			ro.disconnect();
			clearTimeout(roTimer);
		};
	});

	$effect(() => {
		prefs.fontFamily;
		prefs.timeFormat;
		secondStyle;
		doCalcFontSize();
	});
</script>

<div
	bind:this={container}
	class="absolute inset-0 flex items-center justify-center overflow-hidden select-none"
>
	<div
		class="inline-flex items-end leading-none tracking-wider whitespace-nowrap"
		style="font-size: {fontSize}px; font-family: {prefs.fontFamily}; color: {prefs.foreground}; transition: font-size 0.2s ease;"
	>
		<span class="font-bold">{hours}:{minutes}</span>
		{#if secondStyle === 'digital'}
			<span class="inline-flex flex-col items-end leading-none">
				{#if prefs.timeFormat === '12h'}
					<span class="text-[0.3em] font-normal opacity-60">{ampm}</span>
				{/if}
				<span class="text-[0.5em] opacity-80">:{secondsStr}</span>
			</span>
		{:else if prefs.timeFormat === '12h'}
			<span class="ml-1 text-[0.35em] font-normal opacity-60 align-top">{ampm}</span>
		{/if}
	</div>
</div>
