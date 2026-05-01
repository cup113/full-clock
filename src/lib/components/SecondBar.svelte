<script lang="ts">
	import { prefs } from '../preferences.svelte';
	import { getSyncedOffset, isSyncApplied } from '../time.svelte';

	let now = $state(Date.now());

	$effect(() => {
		const interval = setInterval(() => { now = Date.now(); }, 100);
		return () => clearInterval(interval);
	});

	let adjusted = $derived(isSyncApplied() ? now + getSyncedOffset() : now);
	let seconds = $derived(new Date(adjusted).getSeconds());
	let pct = $derived((seconds / 60) * 100);
</script>

{#if prefs.secondStyle === 'fullscreen-bar'}
	<div class="bar fullscreen" style="width: {pct}%; background: {prefs.colorProgress};"></div>
{:else if prefs.secondStyle === 'top-bar'}
	<div class="bar top" style="width: {pct}%; background: {prefs.colorProgress};"></div>
{/if}

<style>
	.bar {
		position: absolute;
		pointer-events: none;
	}
	.bar.fullscreen {
		top: 0;
		left: 0;
		height: 100%;
	}
	.bar.top {
		top: 0;
		left: 0;
		height: 6px;
	}
</style>
