<script lang="ts">
	import { prefs } from '../preferences.svelte';
	import { m } from '$lib/paraglide/messages.js';
	import { getWakeLockStatus } from '../wake-lock.svelte';
	import { activeStyle, syncPrecisionColor, panelBg } from '../color-utils';
	import { getSyncErrorMargin } from '../time.svelte';

	const bg = $derived(panelBg(prefs.background));

	let {
		syncStatus,
		syncResult,
		unreliable,
		onAutoSync,
		onApply
	}: {
		syncStatus: 'idle' | 'computing' | 'done' | 'applied';
		syncResult: { offset: number; errorMargin: number; serverTime: number } | null;
		unreliable: boolean;
		onAutoSync: () => void;
		onApply: () => void;
	} = $props();

	function toggleKeepScreenOn() {
		prefs.keepScreenOn = !prefs.keepScreenOn;
	}
</script>

<section class="rounded-xl px-4 py-4" style="background: {bg}">
	<h3 class="mb-4 text-[11px] font-bold tracking-wider text-white/40 uppercase">{m.utilities()}</h3>

	<button
		class="mb-1 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all duration-150"
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

	{#if syncStatus === 'computing'}
		<div class="mb-2 flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
			<span class="inline-block h-4 w-4 shrink-0 rounded-full border-2 border-white/30 border-t-blue-500" style="animation: spin 0.8s linear infinite"></span>
			<span class="text-xs text-white/50">{m.timeSyncComputing()}</span>
		</div>
	{:else if syncStatus === 'done' && syncResult}
		<div class="mb-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
			<p class="text-xs text-white/70">
				{syncResult.offset > 0
					? m.timeSyncSlower({ offset: Math.abs(syncResult.offset).toFixed(0), error: syncResult.errorMargin.toFixed(0) })
					: m.timeSyncFaster({ offset: Math.abs(syncResult.offset).toFixed(0), error: syncResult.errorMargin.toFixed(0) })}
			</p>
			<p class="mt-0.5 text-xs text-white/40">
				{m.timeSyncError()}: &plusmn;{syncResult.errorMargin.toFixed(0)}ms
				<span class="ml-1.5 inline-block h-2 w-2 rounded-full {syncPrecisionColor(syncResult.errorMargin)}"></span>
			</p>
			{#if unreliable}
				<p class="mt-1 text-xs text-yellow-400">{m.timeSyncImprecise()}</p>
			{/if}
		</div>
	{:else if syncStatus === 'applied'}
		<div class="mb-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
			<p class="text-xs text-green-400">
				{m.timeSyncDone()}
				<span class="text-white/40"> ({m.timeSyncError()}: &plusmn;{getSyncErrorMargin().toFixed(0)}ms
					<span class="ml-1.5 inline-block h-2 w-2 rounded-full {syncPrecisionColor(getSyncErrorMargin())}"></span>)
				</span>
			</p>
		</div>
	{/if}

	<button
		class="flex w-full cursor-pointer items-center justify-center rounded-lg border px-4 py-2.5 text-sm font-medium transition-all duration-150"
		style={syncStatus === 'applied' || syncStatus === 'computing'
			? `background:${prefs.foreground}22;color:${prefs.foreground};border-color:${prefs.foreground}44`
			: syncStatus === 'done' && unreliable
				? 'background:#92400f22;color:#fbbf24;border-color:#fbbf24'
				: activeStyle(prefs.foreground, prefs.background)}
		disabled={syncStatus === 'applied' || syncStatus === 'computing'}
		onclick={unreliable ? onAutoSync : onApply}
		data-umami-event="apply-time-sync"
	>
		{#if syncStatus === 'computing'}
			<span class="inline-block h-4 w-4 rounded-full border-2 border-current border-t-transparent" style="animation: spin 0.8s linear infinite"></span>
		{:else if syncStatus === 'applied'}
			{m.timeSyncSynced()} ✓
		{:else if syncStatus === 'done' && unreliable}
			{m.timeSyncRecalibrate()} ↻
		{:else}
			{m.timeSyncApply()}
		{/if}
	</button>
</section>
