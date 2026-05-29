<script lang="ts">
	import { prefs } from '../preferences.svelte';
	import { m } from '$lib/paraglide/messages.js';
	import { getWakeLockStatus } from '../wake-lock.svelte';
	import { activeStyle, panelBg, syncPrecisionColor } from '../color-utils';
	import { getSyncState, setMode, sync } from '../sync-manager.svelte';

	const bg = $derived(panelBg(prefs.background));
	const state = $derived(getSyncState());

	function toggleKeepScreenOn() {
		prefs.keepScreenOn = !prefs.keepScreenOn;
	}

	const modeOptions = [
		{ value: 'auto' as const, label: () => m.syncMode_auto() },
		{ value: 'manual' as const, label: () => m.syncMode_manual() },
		{ value: 'off' as const, label: () => m.syncMode_off() },
	];
</script>

<section class="rounded-xl px-4 py-4" style="background: {bg}">
	<h3 class="mb-4 text-[11px] font-bold tracking-wider text-white/40 uppercase">{m.utilities()}</h3>

	<button
		class="mb-3 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all duration-150"
		style={prefs.keepScreenOn
			? activeStyle(prefs.foreground, prefs.background)
			: 'background:transparent;color:rgba(255,255,255,0.5);border-color:rgba(255,255,255,0.15)'}
		onclick={toggleKeepScreenOn}
	>
		<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			<path d="M18 8h1a4 4 0 0 1 0 8h-1" />
			<path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
			<line x1="6" y1="1" x2="6" y2="4" />
			<line x1="10" y1="1" x2="10" y2="4" />
			<line x1="14" y1="1" x2="14" y2="4" />
		</svg>
		{m.keepScreenOn()}
	</button>
	<div class="mb-4 min-h-[1.25rem] text-center">
		{#if prefs.keepScreenOn}
			{@const s = getWakeLockStatus()}
			{#if s === 'active'}
				<p class="text-xs text-green-400">{m.screenWillStayOn()}</p>
			{:else if s === 'unsupported'}
				<p class="text-xs text-yellow-400">{m.wakeLockUnsupported()}</p>
			{:else if s === 'denied'}
				<p class="text-xs text-red-400">{m.wakeLockDenied()}</p>
			{:else}
				<p class="text-xs text-white/30">{m.wakeLockPending()}</p>
			{/if}
		{:else}
			<p class="text-xs text-white/30">{m.secondStyle_off()}</p>
		{/if}
	</div>

	<div class="mb-3 flex items-center justify-between gap-y-2">
		<span class="shrink-0 text-xs text-white/60">{m.timeSync()}</span>
		<div class="inline-flex divide-x divide-white/15 overflow-hidden rounded-lg border border-white/15">
			{#each modeOptions as opt (opt.value)}
				<button
					class={'px-3 py-1 text-xs font-medium transition-all duration-150' +
						(state.mode === opt.value ? '' : ' bg-transparent text-white/50')}
					style={state.mode === opt.value ? activeStyle(prefs.foreground, prefs.background) : ''}
					onclick={() => setMode(opt.value)}
					data-umami-event="set-sync-mode"
					data-umami-event-mode={opt.value}
				>{opt.label()}</button
				>
			{/each}
		</div>
	</div>

	{#if state.mode !== 'off'}
		<button
			class="mb-3 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all duration-150"
			style={state.status === 'syncing'
				? `background:${prefs.foreground}22;color:${prefs.foreground};border-color:${prefs.foreground}44`
				: activeStyle(prefs.foreground, prefs.background)}
			disabled={state.status === 'syncing'}
			onclick={() => sync()}
			data-umami-event="sync-now"
		>
			{#if state.status === 'syncing'}
				<span class="inline-block h-4 w-4 rounded-full border-2 border-current border-t-transparent" style="animation: spin 0.8s linear infinite"></span>
				{m.timeSyncComputing()}
			{:else}
				{m.syncNow()}
			{/if}
		</button>

		<div class="min-h-[1.25rem] text-center">
			{#if state.status === 'synced'}
				<p class="text-xs text-green-400">
					{m.syncLatest({ error: state.syncErrorMargin.toFixed(0) })}
					<span class="ml-1.5 inline-block h-2 w-2 rounded-full {syncPrecisionColor(state.syncErrorMargin)}"></span>
				</p>
			{:else if state.status === 'error'}
				<p class="text-xs text-red-400">{m.syncFailed()}</p>
			{:else if state.status === 'idle'}
				<p class="text-xs text-white/30">{m.syncIdle()}</p>
			{/if}
		</div>
	{/if}
</section>
