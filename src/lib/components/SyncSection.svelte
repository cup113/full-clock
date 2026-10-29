<script lang="ts">
	import { prefs } from '../preferences.svelte';
	import { m } from '$lib/paraglide/messages.js';
	import { getWakeLockStatus } from '../wake-lock.svelte';
	import { syncPrecisionColor } from '../color-utils';
	import { getSyncState, setMode, sync } from '../sync-manager.svelte';
	import { slide } from 'svelte/transition';
	import Icon from './Icon.svelte';
	import SegmentedControl from './SegmentedControl.svelte';

	const state = $derived(getSyncState());

	function toggleKeepScreenOn() {
		prefs.keepScreenOn = !prefs.keepScreenOn;
	}

	const wakeLock: { text: () => string; tone: string } = $derived.by(() => {
		if (!prefs.keepScreenOn) return { text: () => m.secondStyle_off(), tone: 'text-ink-faint' };
		switch (getWakeLockStatus()) {
			case 'active':
				return { text: () => m.screenWillStayOn(), tone: 'text-emerald-300' };
			case 'unsupported':
				return { text: () => m.wakeLockUnsupported(), tone: 'text-amber-300' };
			case 'denied':
				return { text: () => m.wakeLockDenied(), tone: 'text-red-400' };
			default:
				return { text: () => m.wakeLockPending(), tone: 'text-ink-faint' };
		}
	});

	const modeOptions = [
		{
			value: 'auto' as const,
			label: () => m.syncMode_auto(),
			attrs: { 'data-umami-event': 'set-sync-mode', 'data-umami-event-mode': 'auto' },
		},
		{
			value: 'manual' as const,
			label: () => m.syncMode_manual(),
			attrs: { 'data-umami-event': 'set-sync-mode', 'data-umami-event-mode': 'manual' },
		},
		{
			value: 'off' as const,
			label: () => m.syncMode_off(),
			attrs: { 'data-umami-event': 'set-sync-mode', 'data-umami-event-mode': 'off' },
		},
	];
</script>

<section class="overflow-hidden rounded-xl border border-surface-line bg-surface-card">
	<div class="divide-y divide-surface-line">
		<!-- KEEP SCREEN ON -->
		<button
			type="button"
			class="flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-raised/50"
			aria-pressed={prefs.keepScreenOn}
			onclick={toggleKeepScreenOn}
		>
			<span class="flex flex-1 flex-wrap items-center gap-x-2 gap-y-0.5">
				<Icon name="monitor" />
				<span class="text-sm text-ink">{m.keepScreenOn()}</span>
				<span class="text-xs {wakeLock.tone}">{wakeLock.text()}</span>
			</span>
			<span
				class={'relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border transition-colors ' +
					(prefs.keepScreenOn
						? 'border-accent bg-accent/70'
						: 'border-surface-line bg-surface-line')}
			>
				<span
					class={'absolute left-0.5 h-3.5 w-3.5 rounded-full transition-transform duration-200 ' +
						(prefs.keepScreenOn ? 'translate-x-4 bg-accent-fg' : 'translate-x-0 bg-ink-faint')}
				></span>
			</span>
		</button>

		<!-- TIME SYNC -->
		<div>
			<div class="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
				<span class="flex items-center gap-2 text-sm text-ink">
					<Icon name="refresh" />
					{m.timeSync()}
				</span>
				<SegmentedControl options={modeOptions} value={state.mode} onchange={(v) => setMode(v)} />
			</div>

			{#if state.mode !== 'off'}
				<div class="px-4 pb-3" transition:slide={{ duration: 200 }}>
					<div class="flex items-center gap-3">
						<button
							class="flex-1 cursor-pointer rounded-lg border border-surface-line bg-surface-raised px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-accent/60 disabled:cursor-default disabled:opacity-60"
							disabled={state.status === 'syncing'}
							onclick={() => sync()}
							data-umami-event="sync-now"
						>
							{#if state.status === 'syncing'}
								<span
									class="mr-2 inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent align-middle"
								></span>
								{m.timeSyncComputing()}
							{:else}
								{m.syncNow()}
							{/if}
						</button>

						<span class="shrink-0 text-xs">
							{#if state.status === 'synced'}
								<span class="text-emerald-300">
									{m.syncLatest({ error: state.syncErrorMargin.toFixed(0) })}
									<span
										class="ml-1.5 inline-block h-2 w-2 rounded-full {syncPrecisionColor(
											state.syncErrorMargin,
										)}"
									></span>
								</span>
							{:else if state.status === 'error'}
								<span class="text-red-400">{m.syncFailed()}</span>
							{:else if state.status === 'idle'}
								<span class="text-ink-faint">{m.syncIdle()}</span>
							{/if}
						</span>
					</div>
				</div>
			{/if}
		</div>
	</div>
</section>
