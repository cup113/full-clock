<script lang="ts">
	import { prefs } from '../preferences.svelte';
	import { getSyncedOffset, isSyncApplied } from '../time.svelte';

	let now = $state(Date.now());

	$effect(() => {
		const interval = setInterval(() => {
			now = Date.now();
		}, 100);
		return () => clearInterval(interval);
	});

	let adjusted = $derived(isSyncApplied() ? now + getSyncedOffset() : now);
	let seconds = $derived(new Date(adjusted).getSeconds());
	let pct = $derived((seconds / 60) * 100);
</script>

{#if prefs.secondStyle === 'fullscreen-bar'}
	<div
		class="pointer-events-none absolute top-0 left-0 h-full transition-none"
		style="width: {pct}%; background: {prefs.colorProgress}; opacity: {prefs.progressOpacity /
			100};"
	></div>
{:else if prefs.secondStyle === 'top-bar'}
	<div
		class="pointer-events-none absolute top-0 left-0 h-1.5 transition-none"
		style="width: {pct}%; background: {prefs.colorProgress}; opacity: {prefs.progressOpacity /
			100};"
	></div>
{/if}
