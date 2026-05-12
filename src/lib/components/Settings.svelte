<script lang="ts">
	import { prefs, save, defaults } from '../preferences.svelte';
	import { VERSION } from '$lib/version';
	import { m } from '$lib/paraglide/messages.js';
	import { getLocale, setLocale } from '$lib/paraglide/runtime.js';
	import {
		syncTime,
		applySync,
		isSyncApplied,
		type SyncResult
	} from '../time.svelte';
	import { panelBg, activeStyle } from '../color-utils';
	import ColorConfig from './ColorConfig.svelte';
	import SyncSection from './SyncSection.svelte';

	let { open, onClose }: { open: boolean; onClose: () => void } = $props();

	let syncStatus = $state<'idle' | 'computing' | 'done' | 'applied'>('idle');
	let syncResult = $state<SyncResult | null>(null);
	let unreliable = $derived(syncResult ? 2 * syncResult.errorMargin > Math.abs(syncResult.offset) : false);

	const NEGLIGIBLE_THRESHOLD = 500;

	$effect(() => {
		if (open) {
			if (isSyncApplied()) {
				syncStatus = 'applied';
				syncResult = null;
			} else {
				autoSync();
			}
		}
	});

	$effect(() => {
		save(prefs);
	});

	async function autoSync() {
		syncStatus = 'computing';
		syncResult = null;
		try {
			const result = await syncTime();
			syncResult = result;
			if (Math.abs(result.offset) < NEGLIGIBLE_THRESHOLD) {
				applySync(result);
				syncStatus = 'applied';
			} else {
				syncStatus = 'done';
			}
		} catch {
			syncStatus = 'idle';
		}
	}

	function handleApply() {
		if (syncResult) {
			applySync(syncResult);
			syncStatus = 'applied';
		}
	}

	function handleLangChange(lang: 'en' | 'zh') {
		setLocale(lang);
	}

	function handleReset() {
		if (window.confirm(m.resetConfirm())) {
			Object.assign(prefs, defaults);
		}
	}

	const bg = $derived(panelBg(prefs.background));
</script>

{#if open}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
		onclick={onClose}
		onkeydown={(e) => e.key === 'Escape' && onClose()}
		role="dialog"
		tabindex="-1"
	>
		<div
			class="flex max-h-[85vh] w-[90%] max-w-lg flex-col overflow-hidden rounded-xl shadow-2xl"
			style="font-family: system-ui, sans-serif"
			onclick={(e) => e.stopPropagation()}
			role="presentation"
		>
			<div
				class="flex shrink-0 items-center justify-between border-b border-white/10 px-5 py-4"
				style="background: {bg}"
			>
				<h2 class="m-0 text-lg font-semibold text-gray-200">{m.settings()}</h2>
				<button
					class="cursor-pointer rounded border-none bg-transparent p-1 text-gray-400 transition-colors hover:text-white"
					onclick={onClose}
					aria-label={m.close()}
				>
					<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<path d="M18 6L6 18M6 6l12 12" />
					</svg>
				</button>
			</div>

			<div class="flex-1 space-y-4 overflow-y-auto px-5 py-4" style="background: {bg}">
				<!-- FORMAT -->
				<section class="rounded-xl px-4 py-4" style="background: {bg}">
					<h3 class="mb-4 text-[11px] font-bold tracking-wider text-white/40 uppercase">{m.format()}</h3>

					<div class="mb-3 flex flex-wrap items-center justify-between gap-y-2">
						<span class="shrink-0 text-xs text-white/60">{m.timeFormat()}</span>
						<div class="inline-flex overflow-hidden rounded-lg border border-white/15 divide-x divide-white/15">
							<button
								class={"px-3 py-1 text-xs font-medium transition-all duration-150" + (prefs.timeFormat === '12h' ? '' : ' bg-transparent text-white/50')}
								style={prefs.timeFormat === '12h' ? activeStyle(prefs.foreground, prefs.background) : ''}
								onclick={() => prefs.timeFormat = '12h'}
							>{m.timeFormat_12h()}</button>
							<button
								class={"px-3 py-1 text-xs font-medium transition-all duration-150" + (prefs.timeFormat === '24h' ? '' : ' bg-transparent text-white/50')}
								style={prefs.timeFormat === '24h' ? activeStyle(prefs.foreground, prefs.background) : ''}
								onclick={() => prefs.timeFormat = '24h'}
							>{m.timeFormat_24h()}</button>
						</div>
					</div>

					<div class="flex flex-wrap items-center justify-between gap-y-2">
						<span class="shrink-0 text-xs text-white/60">{m.showSeconds()}</span>
						<div class="inline-flex overflow-hidden rounded-lg border border-white/15 divide-x divide-white/15">
							<button
								class={"px-3 py-1 text-xs font-medium transition-all duration-150" + (prefs.secondStyle === 'bar' ? '' : ' bg-transparent text-white/50')}
								style={prefs.secondStyle === 'bar' ? activeStyle(prefs.foreground, prefs.background) : ''}
								onclick={() => prefs.secondStyle = 'bar'}
							>{m.secondStyle_bar()}</button>
							<button
								class={"px-3 py-1 text-xs font-medium transition-all duration-150" + (prefs.secondStyle === 'digital' ? '' : ' bg-transparent text-white/50')}
								style={prefs.secondStyle === 'digital' ? activeStyle(prefs.foreground, prefs.background) : ''}
								onclick={() => prefs.secondStyle = 'digital'}
							>{m.secondStyle_digital()}</button>
							<button
								class={"px-3 py-1 text-xs font-medium transition-all duration-150" + (prefs.secondStyle === 'off' ? '' : ' bg-transparent text-white/50')}
								style={prefs.secondStyle === 'off' ? activeStyle(prefs.foreground, prefs.background) : ''}
								onclick={() => prefs.secondStyle = 'off'}
							>{m.secondStyle_off()}</button>
						</div>
					</div>

					{#if prefs.secondStyle === 'bar'}
						<div class="mt-3 flex flex-col gap-2">
							<div class="flex items-center gap-2">
								<span class="shrink-0 text-[11px] text-white/50">{m.barPosition()}</span>
								<div class="inline-flex overflow-hidden rounded-md border border-white/15 divide-x divide-white/15">
									<button
										class={"px-2 py-0.5 text-[11px] font-medium transition-all duration-150" + (prefs.barPosition === 'fullscreen' ? '' : ' bg-transparent text-white/50')}
										style={prefs.barPosition === 'fullscreen' ? activeStyle(prefs.foreground, prefs.background) : ''}
										onclick={() => prefs.barPosition = 'fullscreen'}
									>{m.barPosition_fullscreen()}</button>
									<button
										class={"px-2 py-0.5 text-[11px] font-medium transition-all duration-150" + (prefs.barPosition === 'top' ? '' : ' bg-transparent text-white/50')}
										style={prefs.barPosition === 'top' ? activeStyle(prefs.foreground, prefs.background) : ''}
										onclick={() => prefs.barPosition = 'top'}
									>{m.barPosition_top()}</button>
									<button
										class={"px-2 py-0.5 text-[11px] font-medium transition-all duration-150" + (prefs.barPosition === 'bottom' ? '' : ' bg-transparent text-white/50')}
										style={prefs.barPosition === 'bottom' ? activeStyle(prefs.foreground, prefs.background) : ''}
										onclick={() => prefs.barPosition = 'bottom'}
									>{m.barPosition_bottom()}</button>
								</div>
							</div>
							<div class="flex items-center gap-2 sm:ml-auto">
								<span class="shrink-0 text-[11px] text-white/50">{m.progressOpacity()}</span>
								<input
									type="range"
									min="0"
									max="100"
									bind:value={prefs.progressOpacity}
									class="w-20 accent-blue-500 appearance-none cursor-pointer"
								/>
								<span class="w-6 text-right text-[11px] tabular-nums text-white/60">{prefs.progressOpacity}%</span>
							</div>
						</div>
					{/if}

				
					<div class="mt-3 flex flex-wrap items-center justify-between gap-y-2">
						<span class="shrink-0 text-xs text-white/60">{m.titleBar()}</span>
						<div class="inline-flex overflow-hidden rounded-lg border border-white/15 divide-x divide-white/15">
							<button
								class={"px-3 py-1 text-xs font-medium transition-all duration-150" + (prefs.titleStyle === 'date' ? '' : ' bg-transparent text-white/50')}
								style={prefs.titleStyle === 'date' ? activeStyle(prefs.foreground, prefs.background) : ''}
								onclick={() => prefs.titleStyle = 'date'}
							>{m.titleStyle_date()}</button>
							<button
								class={"px-3 py-1 text-xs font-medium transition-all duration-150" + (prefs.titleStyle === 'custom' ? '' : ' bg-transparent text-white/50')}
								style={prefs.titleStyle === 'custom' ? activeStyle(prefs.foreground, prefs.background) : ''}
								onclick={() => prefs.titleStyle = 'custom'}
							>{m.titleStyle_custom()}</button>
							<button
								class={"px-3 py-1 text-xs font-medium transition-all duration-150" + (prefs.titleStyle === 'off' ? '' : ' bg-transparent text-white/50')}
								style={prefs.titleStyle === 'off' ? activeStyle(prefs.foreground, prefs.background) : ''}
								onclick={() => prefs.titleStyle = 'off'}
							>{m.titleStyle_off()}</button>
						</div>
					</div>
					{#if prefs.titleStyle === 'custom'}
						<div class="mt-2">
							<input
								type="text"
								bind:value={prefs.titleCustomized}
								placeholder={m.titleCustomized()}
								class="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-xs text-white/80 outline-none transition-colors focus:border-white/40"
							/>
						</div>
					{/if}
				</section>

				<ColorConfig />

				<SyncSection {syncStatus} {syncResult} {unreliable} onAutoSync={autoSync} onApply={handleApply} />

				<!-- LANGUAGE -->
				<section class="rounded-xl px-4 py-4" style="background: {bg}">
					<h3 class="mb-4 text-[11px] font-bold tracking-wider text-white/40 uppercase">{m.language()}</h3>
					<div class="inline-flex overflow-hidden rounded-lg border border-white/15 divide-x divide-white/15">
						<button
							class={"px-3 py-1 text-xs font-medium transition-all duration-150" + (getLocale() === 'en' ? '' : ' bg-transparent text-white/50')}
							style={getLocale() === 'en' ? activeStyle(prefs.foreground, prefs.background) : ''}
							onclick={() => handleLangChange('en')}
						>English</button>
						<button
							class={"px-3 py-1 text-xs font-medium transition-all duration-150" + (getLocale() === 'zh' ? '' : ' bg-transparent text-white/50')}
							style={getLocale() === 'zh' ? activeStyle(prefs.foreground, prefs.background) : ''}
							onclick={() => handleLangChange('zh')}
						>中文</button>
					</div>
				</section>
			</div>

			<div
				class="flex shrink-0 items-center border-t border-white/10 px-5 py-3"
				style="background: {bg}; font-family: system-ui, sans-serif"
			>
				<button
					class="cursor-pointer rounded-lg border border-red-500/40 bg-transparent px-5 py-2 text-xs text-red-400 transition-colors hover:bg-red-500/10"
					onclick={handleReset}
					data-umami-event="reset-settings"
				>{m.reset()}</button>
				<span class="flex-1 text-center text-[10px] text-white/30">v{VERSION}</span>
				<button
					class="cursor-pointer rounded-lg border-none bg-blue-600 px-5 py-2 text-xs text-gray-200 transition-colors hover:bg-blue-700"
					onclick={onClose}
					data-umami-event="close-settings"
				>{m.close()}</button>
			</div>
		</div>
	</div>
{/if}

<style>
	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	input[type='range']::-webkit-slider-runnable-track {
		height: 6px;
		border-radius: 999px;
		background: rgba(255,255,255,0.15);
	}
	input[type='range']::-moz-range-track {
		height: 6px;
		border-radius: 999px;
		background: rgba(255,255,255,0.15);
	}
	input[type='range']::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 14px;
		height: 14px;
		border-radius: 999px;
		background: #3b82f6;
		border: 2px solid #1a1a2e;
		margin-top: -4px;
		cursor: pointer;
	}
</style>
