<script lang="ts">
	import { prefs, save, defaults } from '../preferences.svelte';
	import { getWakeLockStatus } from '../wake-lock.svelte';
	import { VERSION } from '$lib/version';
	import { m } from '$lib/paraglide/messages.js';
	import { getLocale, setLocale } from '$lib/paraglide/runtime.js';
	import {
		syncTime,
		applySync,
		getSyncedOffset,
		getSyncErrorMargin,
		isSyncApplied,
		type SyncResult
	} from '../time.svelte';

	let { open, onClose }: { open: boolean; onClose: () => void } = $props();

	let syncStatus = $state<'idle' | 'computing' | 'done' | 'applied'>('idle');
	let syncResult = $state<SyncResult | null>(null);
	let unreliable = $derived(syncResult ? 2 * syncResult.errorMargin > Math.abs(syncResult.offset) : false);

	const PREVIEW_DATE = new Date(2024, 0, 1, 19, 2, 34);

	let colorDetailExpanded = $state(false);

	const commonFonts = [
		'Arial', 'Helvetica', 'Verdana', 'Georgia', 'Times New Roman', 'sans-serif',
		'等线', '微软雅黑', '宋体', '黑体', '楷体',
		'Courier New', 'Consolas', 'Cascadia Code', 'monospace'
	];

	const colorPresets: {
		id: string;
		label: () => string;
		background: string;
		foreground: string;
		colorProgress: string;
	}[] = [
		{ id: 'classic', label: m.colorPresetClassic, background: '#004400', foreground: '#FFFFFF', colorProgress: '#005500' },
		{ id: 'midnight', label: m.colorPresetMidnight, background: '#0a0a23', foreground: '#e0e0ff', colorProgress: '#1a1a5e' },
		{ id: 'contrast', label: m.colorPresetContrast, background: '#000000', foreground: '#00ff00', colorProgress: '#00aa00' },
		{ id: 'sunset', label: m.colorPresetSunset, background: '#2d1b00', foreground: '#ffd699', colorProgress: '#cc5500' },
		{ id: 'matrix', label: m.colorPresetMatrix, background: '#000000', foreground: '#00ff41', colorProgress: '#003b00' },
		{ id: 'slate', label: m.colorPresetSlate, background: '#1e293b', foreground: '#e2e8f0', colorProgress: '#475569' }
	];

	function applyColorPreset(p: (typeof colorPresets)[number]) {
		prefs.background = p.background;
		prefs.foreground = p.foreground;
		prefs.colorProgress = p.colorProgress;
	}

	function panelBg(hex: string): string {
		const r = parseInt(hex.slice(1, 3), 16);
		const g = parseInt(hex.slice(3, 5), 16);
		const b = parseInt(hex.slice(5, 7), 16);
		return `rgb(${Math.round(r * 0.3 + 20 * 0.7)}, ${Math.round(g * 0.3 + 20 * 0.7)}, ${Math.round(b * 0.3 + 30 * 0.7)})`;
	}

	const NEGLIGIBLE_THRESHOLD = 500;

	function syncPrecisionColor(errorMargin: number) {
		if (errorMargin < NEGLIGIBLE_THRESHOLD) return 'bg-green-500';
		if (errorMargin < 1000) return 'bg-yellow-500';
		return 'bg-red-500';
	}

	let previewRawHours = $derived(PREVIEW_DATE.getHours());
	let previewMinutes = $derived(PREVIEW_DATE.getMinutes().toString().padStart(2, '0'));
	let previewHours = $derived(
		prefs.timeFormat === '12h'
			? (previewRawHours % 12 || 12).toString().padStart(2, '0')
			: previewRawHours.toString().padStart(2, '0')
	);
	let previewAmpm = $derived(prefs.timeFormat === '12h' ? (previewRawHours < 12 ? 'AM' : 'PM') : '');
	let previewSeconds = $derived(PREVIEW_DATE.getSeconds().toString().padStart(2, '0'));

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

	function toggleKeepScreenOn() {
		prefs.keepScreenOn = !prefs.keepScreenOn;
	}

	function activeStyle(): string {
		return `background:${prefs.foreground};color:${prefs.background};border-color:${prefs.foreground}`;
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
								style={prefs.timeFormat === '12h' ? activeStyle() : ''}
								onclick={() => prefs.timeFormat = '12h'}
							>{m.timeFormat_12h()}</button>
							<button
								class={"px-3 py-1 text-xs font-medium transition-all duration-150" + (prefs.timeFormat === '24h' ? '' : ' bg-transparent text-white/50')}
								style={prefs.timeFormat === '24h' ? activeStyle() : ''}
								onclick={() => prefs.timeFormat = '24h'}
							>{m.timeFormat_24h()}</button>
						</div>
					</div>

					<div class="flex flex-wrap items-center justify-between gap-y-2">
						<span class="shrink-0 text-xs text-white/60">{m.showSeconds()}</span>
						<div class="inline-flex overflow-hidden rounded-lg border border-white/15 divide-x divide-white/15">
							<button
								class={"px-3 py-1 text-xs font-medium transition-all duration-150" + (prefs.secondStyle === 'bar' ? '' : ' bg-transparent text-white/50')}
								style={prefs.secondStyle === 'bar' ? activeStyle() : ''}
								onclick={() => prefs.secondStyle = 'bar'}
							>{m.secondStyle_bar()}</button>
							<button
								class={"px-3 py-1 text-xs font-medium transition-all duration-150" + (prefs.secondStyle === 'digital' ? '' : ' bg-transparent text-white/50')}
								style={prefs.secondStyle === 'digital' ? activeStyle() : ''}
								onclick={() => prefs.secondStyle = 'digital'}
							>{m.secondStyle_digital()}</button>
							<button
								class={"px-3 py-1 text-xs font-medium transition-all duration-150" + (prefs.secondStyle === 'off' ? '' : ' bg-transparent text-white/50')}
								style={prefs.secondStyle === 'off' ? activeStyle() : ''}
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
										style={prefs.barPosition === 'fullscreen' ? activeStyle() : ''}
										onclick={() => prefs.barPosition = 'fullscreen'}
									>{m.barPosition_fullscreen()}</button>
									<button
										class={"px-2 py-0.5 text-[11px] font-medium transition-all duration-150" + (prefs.barPosition === 'top' ? '' : ' bg-transparent text-white/50')}
										style={prefs.barPosition === 'top' ? activeStyle() : ''}
										onclick={() => prefs.barPosition = 'top'}
									>{m.barPosition_top()}</button>
									<button
										class={"px-2 py-0.5 text-[11px] font-medium transition-all duration-150" + (prefs.barPosition === 'bottom' ? '' : ' bg-transparent text-white/50')}
										style={prefs.barPosition === 'bottom' ? activeStyle() : ''}
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
								style={prefs.titleStyle === 'date' ? activeStyle() : ''}
								onclick={() => prefs.titleStyle = 'date'}
							>{m.titleStyle_date()}</button>
							<button
								class={"px-3 py-1 text-xs font-medium transition-all duration-150" + (prefs.titleStyle === 'custom' ? '' : ' bg-transparent text-white/50')}
								style={prefs.titleStyle === 'custom' ? activeStyle() : ''}
								onclick={() => prefs.titleStyle = 'custom'}
							>{m.titleStyle_custom()}</button>
							<button
								class={"px-3 py-1 text-xs font-medium transition-all duration-150" + (prefs.titleStyle === 'off' ? '' : ' bg-transparent text-white/50')}
								style={prefs.titleStyle === 'off' ? activeStyle() : ''}
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

				<!-- THEME -->
				<section class="rounded-xl px-4 py-4" style="background: {bg}">
					<h3 class="mb-4 text-[11px] font-bold tracking-wider text-white/40 uppercase">{m.theme()}</h3>

					<span class="mb-2 block text-xs text-white/60">{m.colors()}</span>
					<div class="mb-3 grid grid-cols-6 gap-1.5">
						{#each colorPresets as p (p.id)}
							<button
								class="flex cursor-pointer items-center justify-center gap-0.5 rounded-md border border-white/10 px-1 py-1.5 text-[10px] text-white/50 transition-colors hover:border-white/30 hover:text-white/70"
								onclick={() => applyColorPreset(p)}
								data-umami-event="apply-color-preset"
								data-umami-event-preset={p.id}
								title={p.label()}
							>
								<span class="inline-flex gap-px">
									<span class="h-3 w-3 rounded-sm" style="background:{p.background}"></span>
									<span class="h-3 w-3 rounded-sm" style="background:{p.foreground}"></span>
									<span class="h-3 w-3 rounded-sm" style="background:{p.colorProgress}"></span>
								</span>
							</button>
						{/each}
					</div>

					<button
						class={"mb-3 flex w-full cursor-pointer items-center gap-4 rounded-lg border px-4 py-3 text-left transition-colors " + (colorDetailExpanded ? "border-white/20" : "border-white/10 hover:border-white/20")}
						onclick={() => colorDetailExpanded = !colorDetailExpanded}
					>
						<div
							class="relative overflow-hidden flex items-center gap-4 rounded-md px-4 py-3"
							style="background:{prefs.background}"
						>
							{#if prefs.secondStyle === 'bar'}
								{#if prefs.barPosition === 'fullscreen'}
									<div class="absolute top-0 left-0 bottom-0 pointer-events-none" style="width:56.666%; background:{prefs.colorProgress}; opacity:{prefs.progressOpacity / 100};"></div>
								{:else if prefs.barPosition === 'top'}
									<div class="absolute top-0 left-0 pointer-events-none" style="width:56.666%; height:8px; background:{prefs.colorProgress}; opacity:{prefs.progressOpacity / 100};"></div>
								{:else}
									<div class="absolute bottom-0 left-0 pointer-events-none" style="width:56.666%; height:8px; background:{prefs.colorProgress}; opacity:{prefs.progressOpacity / 100};"></div>
								{/if}
							{/if}
							<div class="flex items-end gap-2">
								<span class="text-4xl font-bold leading-none" style="color:{prefs.foreground}; font-family:{prefs.fontFamily}">
									{previewHours}:{previewMinutes}
								</span>
		{#if prefs.secondStyle === 'digital'}
			<span class="inline-flex flex-col items-end leading-none">
				{#if prefs.timeFormat === '12h'}
					<span class="text-[0.3em] font-normal opacity-60">{previewAmpm}</span>
				{/if}
				<span class="text-[0.5em] font-normal opacity-70">:{previewSeconds}</span>
			</span>
		{:else if prefs.timeFormat === '12h'}
			<span class="text-[0.3em] font-normal opacity-60 align-top">{previewAmpm}</span>
		{/if}
							</div>
							<div class="flex flex-col gap-1">
								<span class="h-3 w-5 rounded-sm border border-white/10" style="background:{prefs.background}"></span>
								<span class="h-3 w-5 rounded-sm" style="background:{prefs.foreground}"></span>
								<span class="h-3 w-5 rounded-sm" style="background:{prefs.colorProgress}"></span>
							</div>
						</div>
						<span class={"ml-auto text-xs text-white/30 transition-transform" + (colorDetailExpanded ? " rotate-180" : "")}>▾</span>
					</button>

					{#if colorDetailExpanded}
						<div class="mb-3 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-lg bg-white/5 px-3 py-2">
							<div class="flex items-center gap-1">
								<input type="color" bind:value={prefs.background} class="h-7 w-7 cursor-pointer rounded border-0 p-0" />
								<code class="font-mono text-[10px] text-white/50">{prefs.background}</code>
							</div>
							<div class="flex items-center gap-1">
								<input type="color" bind:value={prefs.foreground} class="h-7 w-7 cursor-pointer rounded border-0 p-0" />
								<code class="font-mono text-[10px] text-white/50">{prefs.foreground}</code>
							</div>
							<div class="flex items-center gap-1">
								<input type="color" bind:value={prefs.colorProgress} class="h-7 w-7 cursor-pointer rounded border-0 p-0" />
								<code class="font-mono text-[10px] text-white/50">{prefs.colorProgress}</code>
							</div>
						</div>
					{/if}

					<span class="mb-2 mt-1 block text-xs text-white/60">{m.font()}</span>
					<select
						bind:value={prefs.fontFamily}
						class="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-xs text-white/80 outline-none transition-colors focus:border-white/40"
					>
						{#each commonFonts as font (font)}
							<option value={font} class="text-gray-900">{font}</option>
						{/each}
					</select>
				</section>

				<!-- UTILITIES -->
				<section class="rounded-xl px-4 py-4" style="background: {bg}">
					<h3 class="mb-4 text-[11px] font-bold tracking-wider text-white/40 uppercase">{m.utilities()}</h3>

					<button
						class="mb-1 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all duration-150"
						style={prefs.keepScreenOn
							? activeStyle()
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
								: activeStyle()}
						disabled={syncStatus === 'applied' || syncStatus === 'computing'}
						onclick={unreliable ? autoSync : handleApply}
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

				<!-- LANGUAGE -->
				<section class="rounded-xl px-4 py-4" style="background: {bg}">
					<h3 class="mb-4 text-[11px] font-bold tracking-wider text-white/40 uppercase">{m.language()}</h3>
					<div class="inline-flex overflow-hidden rounded-lg border border-white/15 divide-x divide-white/15">
						<button
							class={"px-3 py-1 text-xs font-medium transition-all duration-150" + (getLocale() === 'en' ? '' : ' bg-transparent text-white/50')}
							style={getLocale() === 'en' ? activeStyle() : ''}
							onclick={() => handleLangChange('en')}
						>English</button>
						<button
							class={"px-3 py-1 text-xs font-medium transition-all duration-150" + (getLocale() === 'zh' ? '' : ' bg-transparent text-white/50')}
							style={getLocale() === 'zh' ? activeStyle() : ''}
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
