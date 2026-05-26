<script lang="ts">
	import { m } from '$lib/paraglide/messages.js';
	import { prefs } from '$lib/preferences.svelte';
	import { colorWithOpacity, panelBg } from '$lib/color-utils';

	let fakeSeconds = $state(0);
	let i: ReturnType<typeof setInterval>;

	$effect(() => {
		i = setInterval(() => { fakeSeconds = (fakeSeconds + 1) % 60; }, 1000);
		return () => clearInterval(i);
	});

	let sec = $derived(String(fakeSeconds).padStart(2, '0'));
	let pct = $derived((fakeSeconds / 60) * 100);
</script>

<div class="mt-4 grid grid-cols-3 gap-3 select-none">
	<div class="relative overflow-hidden rounded-lg p-4 text-center" style="background: {panelBg(prefs.background)}">
		<div class="flex h-14 items-center justify-center font-mono text-2xl font-bold tracking-wider" style="color: {prefs.foreground}">
			12:34
		</div>
		<p class="mt-2 text-xs" style="color: {colorWithOpacity(prefs.foreground, 0.6)}">{m.secondStyle_off()}</p>
	</div>

	<div class="relative overflow-hidden rounded-lg p-4 text-center" style="background: {panelBg(prefs.background)}">
		<div class="flex h-14 items-center justify-center font-mono text-2xl font-bold tracking-wider" style="color: {prefs.foreground}">
			12:34<span class="text-base opacity-80">:{sec}</span>
		</div>
		<p class="mt-2 text-xs" style="color: {colorWithOpacity(prefs.foreground, 0.6)}">{m.secondStyle_digital()}</p>
	</div>

	<div class="relative overflow-hidden rounded-lg p-4 text-center" style="background: {panelBg(prefs.background)}">
		<div
			class="pointer-events-none absolute top-0 left-0 h-full transition-none"
			style="width: {pct}%; background: {colorWithOpacity(prefs.foreground, 0.15)};"
		></div>
		<div class="relative flex h-14 items-center justify-center font-mono text-2xl font-bold tracking-wider" style="color: {prefs.foreground}">
			12:34
		</div>
		<p class="relative mt-2 text-xs" style="color: {colorWithOpacity(prefs.foreground, 0.6)}">{m.secondStyle_bar()}</p>
	</div>
</div>
