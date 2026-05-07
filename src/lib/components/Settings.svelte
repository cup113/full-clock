<script lang="ts">
	import { prefs, save, defaults } from '../preferences.svelte';
	import { getWakeLockStatus } from '../wake-lock.svelte';
	import { m } from '$lib/paraglide/messages.js';
	import { getLocale, setLocale } from '$lib/paraglide/runtime.js';
	import {
		syncTime,
		applySync,
		removeSync,
		getSyncErrorMargin,
		isSyncApplied,
		type SyncResult
	} from '../time.svelte';

	let { open, onClose }: { open: boolean; onClose: () => void } = $props();

	let syncStatus = $state<'idle' | 'computing' | 'done' | 'negligible' | 'applied'>('idle');
	let syncResult = $state<SyncResult | null>(null);

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

	const fontGroups = [
		{
			label: 'Western',
			fonts: ['Arial', 'Helvetica', 'Verdana', 'Georgia', 'Times New Roman', 'sans-serif']
		},
		{
			label: 'CJK',
			fonts: ['等线', '微软雅黑', '宋体', '黑体', '楷体', 'SimSun', 'Microsoft YaHei']
		},
		{
			label: 'Monospace',
			fonts: ['Courier New', 'Consolas', 'Cascadia Code', 'monospace']
		}
	];

	let expandedGroups = $state<Record<string, boolean>>({
		Western: true,
		CJK: false,
		Monospace: false
	});

	function toggleGroup(label: string) {
		expandedGroups[label] = !expandedGroups[label];
	}

	let colorsExpanded = $state(false);
	let fontExpanded = $state(false);

	function isFontActive(font: string): boolean {
		return prefs.fontFamily.split(',').some((s) => s.trim().toLowerCase() === font.toLowerCase());
	}

	function pushFont(font: string) {
		const parts = prefs.fontFamily.split(',').map((s) => s.trim()).filter(Boolean);
		const idx = parts.findIndex((p) => p.toLowerCase() === font.toLowerCase());
		if (idx === 0) return;
		if (idx > 0) parts.splice(idx, 1);
		parts.unshift(font);
		prefs.fontFamily = parts.join(', ');
	}

	function panelBackground(hex: string): string {
		const r = parseInt(hex.slice(1, 3), 16);
		const g = parseInt(hex.slice(3, 5), 16);
		const b = parseInt(hex.slice(5, 7), 16);
		const nr = Math.round(r * 0.3 + 20 * 0.7);
		const ng = Math.round(g * 0.3 + 20 * 0.7);
		const nb = Math.round(b * 0.3 + 30 * 0.7);
		return `rgb(${nr}, ${ng}, ${nb})`;
	}

	function handleResetFont() {
		prefs.fontFamily = defaults.fontFamily;
	}

	function syncPrecisionColor(errorMargin: number) {
		if (errorMargin < 300) return 'bg-green-500';
		if (errorMargin < 1000) return 'bg-yellow-500';
		return 'bg-red-500';
	}

	const secondStyleLabels: Record<string, () => string> = {
		'fullscreen-bar': m.secondStyle_fullscreenBar,
		'top-bar': m.secondStyle_topBar,
		digital: m.secondStyle_digital,
		off: m.secondStyle_off
	};

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
			if (Math.abs(result.offset) < 300) {
				syncStatus = 'negligible';
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

	function handleRemoveSync() {
		removeSync();
		syncStatus = 'idle';
		syncResult = null;
	}

	function handleLangChange(lang: 'en' | 'zh') {
		setLocale(lang);
	}

	function handleReset() {
		if (window.confirm(m.resetConfirm())) {
			Object.assign(prefs, defaults);
		}
	}
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
			class="flex max-h-[85vh] w-[90%] max-w-lg flex-col overflow-hidden rounded-xl text-gray-200 shadow-2xl" style="background: {panelBackground(prefs.background)}; font-family: initial"
			onclick={(e) => e.stopPropagation()}
			role="presentation"
		>
			<div class="flex items-center justify-between border-b border-gray-700 px-5 py-4">
				<h2 class="m-0 text-lg font-semibold">{m.settings()}</h2>
				<button
					class="cursor-pointer rounded border-none bg-transparent p-1 text-gray-400 transition-colors hover:text-white"
					onclick={onClose}
					aria-label={m.close()}
				>
					<svg
						viewBox="0 0 24 24"
						width="20"
						height="20"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<path d="M18 6L6 18M6 6l12 12" />
					</svg>
				</button>
			</div>

			<div class="flex-1 space-y-5 overflow-y-auto px-5 py-4">
				<!-- Colors -->
				<section>
					<button
						class="mb-2 flex cursor-pointer items-center gap-1 text-sm font-medium opacity-80 transition-opacity hover:opacity-100"
						onclick={() => colorsExpanded = !colorsExpanded}
					>
						<span class="transition-transform {colorsExpanded ? 'rotate-90' : ''}">&#x25B6;</span>
						{m.colors()}
					</button>
					{#if colorsExpanded}
					<h4 class="mb-2 text-[11px] font-medium tracking-wide opacity-60 uppercase">{m.colorPresets()}</h4>
					<div class="mb-4 flex flex-wrap gap-2">
						{#each colorPresets as p (p.id)}
							<button
								class="flex cursor-pointer items-center gap-1.5 rounded-md border border-gray-600 px-2.5 py-1.5 text-[11px] text-gray-300 transition-colors hover:border-gray-400 hover:text-white"
								onclick={() => applyColorPreset(p)}
								data-umami-event="apply-color-preset"
								data-umami-event-preset={p.id}
							>
								<span class="inline-flex gap-0.5">
									<span class="h-3 w-3 rounded-sm" style="background:{p.background}"></span>
									<span class="h-3 w-3 rounded-sm" style="background:{p.foreground}"></span>
									<span class="h-3 w-3 rounded-sm" style="background:{p.colorProgress}"></span>
								</span>
								{p.label()}
							</button>
						{/each}
					</div>

					<h4 class="mb-2 text-[11px] font-medium tracking-wide opacity-60 uppercase">Custom</h4>
					<div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
						<div class="flex flex-col items-center gap-1.5">
							<span class="text-[11px] font-medium opacity-70">{m.background()}</span>
							<input
								type="color"
								bind:value={prefs.background}
								class="h-12 w-full cursor-pointer rounded-md border-0 p-0.5"
							/>
							<code class="font-mono text-[10px] opacity-60">{prefs.background}</code>
						</div>
						<div class="flex flex-col items-center gap-1.5">
							<span class="text-[11px] font-medium opacity-70">{m.foreground()}</span>
							<input
								type="color"
								bind:value={prefs.foreground}
								class="h-12 w-full cursor-pointer rounded-md border-0 p-0.5"
							/>
							<code class="font-mono text-[10px] opacity-60">{prefs.foreground}</code>
						</div>
						<div class="flex flex-col items-center gap-1.5">
							<span class="text-[11px] font-medium opacity-70">{m.colorProgress()}</span>
							<input
								type="color"
								bind:value={prefs.colorProgress}
								class="h-12 w-full cursor-pointer rounded-md border-0 p-0.5"
							/>
							<code class="font-mono text-[10px] opacity-60">{prefs.colorProgress}</code>
						</div>
					</div>
				{/if}
				</section>

				<!-- Font -->
				<section>
					<div class="mb-2 flex items-center justify-between">
						<button
							class="flex cursor-pointer items-center gap-1 text-sm font-medium opacity-80 transition-opacity hover:opacity-100"
							onclick={() => fontExpanded = !fontExpanded}
						>
							<span class="transition-transform {fontExpanded ? 'rotate-90' : ''}">&#x25B6;</span>
							{m.fontFamily()}
						</button>
						{#if fontExpanded}
						<button
							class="cursor-pointer rounded border border-gray-600 bg-transparent px-2 py-0.5 text-[10px] text-gray-400 transition-colors hover:border-gray-400 hover:text-gray-200"
							onclick={handleResetFont}
						>&#x21BA; {m.reset()}</button>
						{/if}
					</div>
					{#if fontExpanded}
					<p class="mb-2 text-xs opacity-50">{m.fontFamilyHint()}</p>
					<input
						class="box-border w-full rounded-md border border-gray-600 bg-gray-800 px-2.5 py-2 text-xs text-gray-200"
						type="text"
						bind:value={prefs.fontFamily}
					/>
					{#each fontGroups as group (group.label)}
						<div class="mt-2">
							<button
								class="flex cursor-pointer items-center gap-1 text-[11px] font-medium tracking-wide opacity-60 uppercase transition-opacity hover:opacity-100"
								onclick={() => toggleGroup(group.label)}
							>
								<span class="transition-transform {expandedGroups[group.label] ? 'rotate-90' : ''}">&#x25B6;</span>
								{group.label}
							</button>
							{#if expandedGroups[group.label]}
								<div class="mt-1 flex flex-wrap gap-1.5">
									{#each group.fonts as font (font)}
										<button
											class="cursor-pointer rounded-md border px-2 py-0.5 text-[11px] transition-colors {isFontActive(font) ? 'border-blue-500 bg-blue-500/15 text-blue-400' : 'border-gray-600 text-gray-400 hover:border-gray-400 hover:text-gray-200'}"
											onclick={() => pushFont(font)}
										>{font}</button>
									{/each}
								</div>
							{/if}
						</div>
					{/each}
					<div class="mt-3 rounded-md border border-gray-700 bg-gray-800/50 px-3 py-2">
						<p class="mb-1 text-[10px] opacity-40">{m.fontPreview()}</p>
						<p class="text-sm leading-relaxed" style="font-family: {prefs.fontFamily}">
							Aa 自信自强 The quick brown fox jumps 012345
						</p>
					</div>
				{/if}
				</section>

				<!-- Title Style -->
				<section>
					<h3 class="mb-2 text-sm font-medium opacity-80">{m.titleStyle()}</h3>
					<div class="flex flex-wrap gap-2">
						<label class="flex cursor-pointer items-center gap-1.5 text-xs">
							<input
								type="radio"
								name="titleStyle"
								value="date"
								bind:group={prefs.titleStyle}
								class="peer sr-only"
							/>
							<span
								class="h-4 w-4 rounded-full border border-gray-500 transition-colors peer-checked:border-blue-500 peer-checked:bg-blue-500"
							></span>
							<span>{m.titleStyle_date()}</span>
						</label>
						<label class="flex cursor-pointer items-center gap-1.5 text-xs">
							<input
								type="radio"
								name="titleStyle"
								value="custom"
								bind:group={prefs.titleStyle}
								class="peer sr-only"
							/>
							<span
								class="h-4 w-4 rounded-full border border-gray-500 transition-colors peer-checked:border-blue-500 peer-checked:bg-blue-500"
							></span>
							<span>{m.titleStyle_custom()}</span>
						</label>
						<label class="flex cursor-pointer items-center gap-1.5 text-xs">
							<input
								type="radio"
								name="titleStyle"
								value="off"
								bind:group={prefs.titleStyle}
								class="peer sr-only"
							/>
							<span
								class="h-4 w-4 rounded-full border border-gray-500 transition-colors peer-checked:border-blue-500 peer-checked:bg-blue-500"
							></span>
							<span>{m.titleStyle_off()}</span>
						</label>
					</div>
					{#if prefs.titleStyle === 'custom'}
						<input
							class="mt-2 box-border w-full rounded-md border border-gray-600 bg-gray-800 px-2.5 py-2 text-xs text-gray-200"
							type="text"
							bind:value={prefs.titleCustomized}
							placeholder={m.titleCustomized()}
						/>
					{/if}
				</section>

				<!-- Seconds Display -->
				<section>
					<h3 class="mb-2 text-sm font-medium opacity-80">{m.secondStyle()}</h3>
					<div class="flex flex-wrap gap-2">
						{#each ['fullscreen-bar', 'top-bar', 'digital', 'off'] as val (val)}
							<label class="flex cursor-pointer items-center gap-1.5 text-xs">
								<input
									type="radio"
									name="secondStyle"
									value={val}
									bind:group={prefs.secondStyle}
									class="peer sr-only"
								/>
								<span
									class="h-4 w-4 rounded-full border border-gray-500 transition-colors peer-checked:border-blue-500 peer-checked:bg-blue-500"
								></span>
								<span>{secondStyleLabels[val]()}</span>
							</label>
						{/each}
					</div>
					{#if prefs.secondStyle === 'fullscreen-bar' || prefs.secondStyle === 'top-bar'}
						<div class="mt-3">
							<h4 class="mb-1 text-xs font-medium opacity-70">{m.progressOpacity()}</h4>
							<div class="flex items-center gap-3">
								<input
									type="range"
									min="0"
									max="100"
									bind:value={prefs.progressOpacity}
									class="flex-1 accent-blue-500 appearance-none cursor-pointer"
								/>
								<span class="w-8 text-right text-xs tabular-nums">{prefs.progressOpacity}%</span>
							</div>
						</div>
					{/if}
				</section>

				<!-- Keep Screen On -->
				<section>
					<h3 class="mb-2 text-sm font-medium opacity-80">{m.keepScreenOn()}</h3>
					<div class="flex items-center gap-3">
						<label class="relative inline-flex cursor-pointer items-center">
							<input type="checkbox" bind:checked={prefs.keepScreenOn} class="peer sr-only" />
							<span class="h-5 w-9 rounded-full bg-gray-600 transition-colors peer-checked:bg-blue-600 after:absolute after:top-0.5 after:left-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-4"></span>
						</label>
						{#if prefs.keepScreenOn}
							{@const s = getWakeLockStatus()}
							{#if s === 'active'}
								<span class="inline-flex items-center gap-1 rounded-full bg-green-500/15 px-2 py-0.5 text-[10px] text-green-400">
									<span class="h-1.5 w-1.5 rounded-full bg-green-400"></span>
									{m.screenWillStayOn()}
								</span>
							{:else if s === 'unsupported'}
								<span class="inline-flex items-center gap-1 rounded-full bg-yellow-500/15 px-2 py-0.5 text-[10px] text-yellow-400">
									<span class="h-1.5 w-1.5 rounded-full bg-yellow-400"></span>
									{m.wakeLockUnsupported()}
								</span>
							{:else if s === 'denied'}
								<span class="inline-flex items-center gap-1 rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] text-red-400">
									<span class="h-1.5 w-1.5 rounded-full bg-red-400"></span>
									{m.wakeLockDenied()}
								</span>
							{/if}
						{:else}
							<span class="inline-flex items-center gap-1 rounded-full bg-gray-500/15 px-2 py-0.5 text-[10px] text-gray-400">
								<span class="h-1.5 w-1.5 rounded-full bg-gray-400"></span>
								Off
							</span>
						{/if}
					</div>
				</section>

				<!-- Time Sync -->
				<section>
					<h3 class="mb-2 text-sm font-medium opacity-80">{m.timeSync()}</h3>
					<p class="mb-2 text-xs opacity-50">{m.timeSyncDesc()}</p>

					{#if syncStatus === 'computing'}
						<div class="flex items-center gap-2 rounded-md border border-gray-700 bg-gray-800/50 px-3 py-2.5">
							<span class="inline-block h-4 w-4 rounded-full border-2 border-gray-500 border-t-blue-500" style="animation: spin 0.8s linear infinite"></span>
							<span class="text-xs opacity-70">{m.timeSyncComputing()}</span>
						</div>

					{:else if syncStatus === 'negligible'}
						<div class="rounded-md border border-gray-700 bg-gray-800/50 px-3 py-2.5">
							<p class="text-xs opacity-80">{m.timeSyncNegligible()}</p>
						</div>

					{:else if syncStatus === 'done' && syncResult}
						{@const badge = syncPrecisionColor(syncResult.errorMargin)}
						<div class="rounded-md border border-gray-700 bg-gray-800/50 px-3 py-2.5">
							<p class="mb-1 text-xs opacity-80">
								{syncResult.offset > 0
									? m.timeSyncSlower({
											offset: Math.abs(syncResult.offset).toFixed(0),
											error: syncResult.errorMargin.toFixed(0)
										})
									: m.timeSyncFaster({
											offset: Math.abs(syncResult.offset).toFixed(0),
											error: syncResult.errorMargin.toFixed(0)
										})}
							</p>
							<p class="mb-3 text-xs opacity-60">
								{m.timeSyncError()}: &plusmn;{syncResult.errorMargin.toFixed(0)}ms
								<span class="ml-1.5 inline-block h-2 w-2 rounded-full {badge}"></span>
							</p>
							{#if syncResult.errorMargin > 1000}
								<p class="mb-2 text-xs text-yellow-400">{m.timeSyncImprecise()}</p>
								<div class="flex gap-2">
									<button
										class="cursor-pointer rounded-md border border-yellow-600 bg-yellow-600/20 px-5 py-2 text-xs text-yellow-400 transition-colors hover:bg-yellow-600/30"
										onclick={autoSync}
										data-umami-event="recalibrate-time-sync">{m.timeSyncRecalibrate()}</button
									>
									<button
										class="cursor-pointer rounded-md border border-gray-500 bg-gray-700 px-5 py-2 text-xs text-gray-200 transition-colors hover:bg-gray-600"
										onclick={handleApply}
										data-umami-event="apply-time-sync">{m.timeSyncApply()}</button
									>
								</div>
							{:else}
								<button
									class="cursor-pointer rounded-md border-none bg-blue-600 px-5 py-2 text-xs text-gray-200 transition-colors hover:bg-blue-700"
									onclick={handleApply}
									data-umami-event="apply-time-sync">{m.timeSyncApply()}</button
								>
							{/if}
						</div>

					{:else if syncStatus === 'applied'}
						{@const badge = syncPrecisionColor(getSyncErrorMargin())}
						<div class="rounded-md border border-gray-700 bg-gray-800/50 px-3 py-2.5">
							<p class="mb-1 text-xs">
								<span class="text-green-400">{m.timeSyncDone()}</span>
								<span class="opacity-60"> ({m.timeSyncError()}: &plusmn;{getSyncErrorMargin().toFixed(0)}ms
									<span class="ml-1.5 inline-block h-2 w-2 rounded-full {badge}"></span>)
								</span>
							</p>
							<button
								class="cursor-pointer rounded-md border border-gray-500 bg-gray-700 px-5 py-2 text-xs text-gray-200 transition-colors hover:bg-gray-600"
								onclick={handleRemoveSync}
								data-umami-event="remove-time-sync">{m.timeSyncRemove()}</button
							>
						</div>

					{:else if syncStatus === 'idle'}
						<button
							class="cursor-pointer rounded-md border border-gray-500 bg-gray-700 px-5 py-2 text-xs text-gray-200 transition-colors hover:bg-gray-600"
							onclick={autoSync}>{m.timeSyncApply()}</button
						>
					{/if}
				</section>

				<!-- Language -->
				<section>
					<h3 class="mb-2 text-sm font-medium opacity-80">{m.language()}</h3>
					<div class="flex flex-wrap gap-2">
						<label class="flex cursor-pointer items-center gap-1.5 text-xs">
							<input
								type="radio"
								name="lang"
								value="zh"
								checked={getLocale() === 'zh'}
								onchange={() => handleLangChange('zh')}
								class="peer sr-only"
							/>
							<span
								class="h-4 w-4 rounded-full border border-gray-500 transition-colors peer-checked:border-blue-500 peer-checked:bg-blue-500"
							></span>
							<span>中文</span>
						</label>
						<label class="flex cursor-pointer items-center gap-1.5 text-xs">
							<input
								type="radio"
								name="lang"
								value="en"
								checked={getLocale() === 'en'}
								onchange={() => handleLangChange('en')}
								class="peer sr-only"
							/>
							<span
								class="h-4 w-4 rounded-full border border-gray-500 transition-colors peer-checked:border-blue-500 peer-checked:bg-blue-500"
							></span>
							<span>English</span>
						</label>
					</div>
				</section>
			</div>

			<div class="flex items-center justify-between border-t border-gray-700 px-5 py-3">
				<button
					class="cursor-pointer rounded-md border border-red-500/50 bg-transparent px-5 py-2 text-xs text-red-400 transition-colors hover:bg-red-500/10"
					onclick={handleReset}
					data-umami-event="reset-settings">{m.reset()}</button
				>
				<button
					class="cursor-pointer rounded-md border-none bg-blue-600 px-5 py-2 text-xs text-gray-200 transition-colors hover:bg-blue-700"
					onclick={onClose}
					data-umami-event="close-settings">{m.close()}</button
				>
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
		background: #4a4a6a;
	}
	input[type='range']::-moz-range-track {
		height: 6px;
		border-radius: 999px;
		background: #4a4a6a;
	}
	input[type='range']::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 16px;
		height: 16px;
		border-radius: 999px;
		background: #3b82f6;
		border: 2px solid #1a1a2e;
		margin-top: -5px;
		cursor: pointer;
	}
</style>
