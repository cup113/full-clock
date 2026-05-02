<script lang="ts">
	import { prefs, save, defaults } from '../preferences.svelte';
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
		if (lang === 'en') {
			localStorage.setItem('FL_locale_choice', 'en');
		} else {
			localStorage.removeItem('FL_locale_choice');
		}
	}

	function handleReset() {
		Object.assign(prefs, defaults);
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
			class="flex max-h-[85vh] w-[90%] max-w-lg flex-col overflow-hidden rounded-xl bg-[#1a1a2e] text-gray-200 shadow-2xl"
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

				<!-- Colors -->
				<section>
					<h3 class="mb-2 text-sm font-medium opacity-80">{m.colors()}</h3>
					<div class="flex flex-col gap-2">
						<label class="flex items-center gap-2.5 text-xs">
							<span>{m.background()}</span>
							<input
								type="color"
								bind:value={prefs.background}
								class="h-7.5 w-10 cursor-pointer border-none bg-transparent p-0"
							/>
						</label>
						<label class="flex items-center gap-2.5 text-xs">
							<span>{m.foreground()}</span>
							<input
								type="color"
								bind:value={prefs.foreground}
								class="h-7.5 w-10 cursor-pointer border-none bg-transparent p-0"
							/>
						</label>
						<label class="flex items-center gap-2.5 text-xs">
							<span>{m.colorProgress()}</span>
							<input
								type="color"
								bind:value={prefs.colorProgress}
								class="h-7.5 w-10 cursor-pointer border-none bg-transparent p-0"
							/>
						</label>
					</div>
				</section>


				<!-- Font -->
				<section>
					<h3 class="mb-2 text-sm font-medium opacity-80">{m.fontFamily()}</h3>
					<p class="mb-2 text-xs opacity-50">{m.fontFamilyHint()}</p>
					<input
						class="box-border w-full rounded-md border border-gray-600 bg-gray-800 px-2.5 py-2 text-xs text-gray-200"
						type="text"
						bind:value={prefs.fontFamily}
					/>
				</section>

				<!-- Time Sync -->
				<section>
					<h3 class="mb-2 text-sm font-medium opacity-80">{m.timeSync()}</h3>
					<p class="mb-2 text-xs opacity-50">{m.timeSyncDesc()}</p>
					{#if syncStatus === 'computing'}
						<p class="mb-2 text-xs opacity-70">{m.timeSyncComputing()}</p>
					{:else if syncStatus === 'negligible'}
						<p class="mb-2 text-xs opacity-80">{m.timeSyncNegligible()}</p>
					{:else if syncStatus === 'done' && syncResult}
						<p class="mb-2 text-xs opacity-80">
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
						<button
							class="cursor-pointer rounded-md border-none bg-blue-600 px-5 py-2 text-xs text-gray-200 transition-colors hover:bg-blue-700"
							onclick={handleApply}
							data-umami-event="apply-time-sync">{m.timeSyncApply()}</button
						>
					{:else if syncStatus === 'applied'}
						<p class="mb-2 text-xs opacity-70">
							{m.timeSyncDone()} ({m.timeSyncError()}: &plusmn;{getSyncErrorMargin().toFixed(0)}ms)
						</p>
						<button
							class="cursor-pointer rounded-md border border-gray-500 bg-gray-700 px-5 py-2 text-xs text-gray-200 transition-colors hover:bg-gray-600"
							onclick={handleRemoveSync}
							data-umami-event="remove-time-sync">{m.timeSyncRemove()}</button
						>
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
