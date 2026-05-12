<script lang="ts">
	import { prefs } from '../preferences.svelte';
	import { useTick, getNow } from '../tick.svelte';

	useTick();

	let adjusted = $derived(getNow());
	let seconds = $derived(new Date(adjusted).getSeconds());
	let pct = $derived((seconds / 60) * 100);
</script>

{#if prefs.secondStyle === 'bar'}
	{#if prefs.barPosition === 'fullscreen'}
		<div
			class="pointer-events-none absolute top-0 left-0 h-full transition-none"
			style="width: {pct}%; background: {prefs.colorProgress}; opacity: {prefs.progressOpacity /
				100};"
		></div>
	{:else if prefs.barPosition === 'top'}
		<div
			class="pointer-events-none absolute top-0 left-0 h-12 transition-none"
			style="width: {pct}%; background: {prefs.colorProgress}; opacity: {prefs.progressOpacity /
				100};"
		></div>
	{:else if prefs.barPosition === 'bottom'}
		<div
			class="pointer-events-none absolute bottom-0 left-0 h-12 transition-none"
			style="width: {pct}%; background: {prefs.colorProgress}; opacity: {prefs.progressOpacity /
				100};"
		></div>
	{/if}
{/if}
