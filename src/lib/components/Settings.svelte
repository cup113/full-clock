<script lang="ts">
	import { prefs, saveNow, defaults } from '../preferences.svelte';
	import { VERSION } from '$lib/version';
	import { m } from '$lib/paraglide/messages.js';
	import { getLocale, setLocale } from '$lib/paraglide/runtime.js';
	import { panelThemeVars } from '../color-utils';
	import { slide } from 'svelte/transition';
	import ColorConfig from './ColorConfig.svelte';
	import Icon from './Icon.svelte';
	import SegmentedControl from './SegmentedControl.svelte';
	import SyncSection from './SyncSection.svelte';

	let { open, onClose }: { open: boolean; onClose: () => void } = $props();

	/** Re-skins every `--color-*` token the panel uses, so the chrome follows the clock theme. */
	const themeVars = $derived(panelThemeVars(prefs.background, prefs.foreground));

	function handleLangChange(lang: 'en' | 'zh') {
		prefs.locale = lang;
		saveNow(prefs);
		setLocale(lang);
	}

	function handleReset() {
		if (window.confirm(m.resetConfirm())) {
			Object.assign(prefs, defaults);
		}
	}

	const timeFormatOptions = [
		{
			value: '12h' as const,
			label: () => m.timeFormat_12h(),
			attrs: { 'data-umami-event': 'set-timeformat-12h' },
		},
		{
			value: '24h' as const,
			label: () => m.timeFormat_24h(),
			attrs: { 'data-umami-event': 'set-timeformat-24h' },
		},
	];

	const secondStyleOptions = [
		{
			value: 'bar' as const,
			label: () => m.secondStyle_bar(),
			attrs: { 'data-umami-event': 'set-secondstyle-bar' },
		},
		{
			value: 'digital' as const,
			label: () => m.secondStyle_digital(),
			attrs: { 'data-umami-event': 'set-secondstyle-digital' },
		},
		{
			value: 'off' as const,
			label: () => m.secondStyle_off(),
			attrs: { 'data-umami-event': 'set-secondstyle-off' },
		},
	];

	const barPositionOptions = [
		{
			value: 'fullscreen' as const,
			label: () => m.barPosition_fullscreen(),
			attrs: { 'data-umami-event': 'set-barposition-fullscreen' },
		},
		{
			value: 'top' as const,
			label: () => m.barPosition_top(),
			attrs: { 'data-umami-event': 'set-barposition-top' },
		},
		{
			value: 'bottom' as const,
			label: () => m.barPosition_bottom(),
			attrs: { 'data-umami-event': 'set-barposition-bottom' },
		},
	];

	const titleStyleOptions = [
		{
			value: 'date' as const,
			label: () => m.titleStyle_date(),
			attrs: { 'data-umami-event': 'set-titlestyle-date' },
		},
		{
			value: 'custom' as const,
			label: () => m.titleStyle_custom(),
			attrs: { 'data-umami-event': 'set-titlestyle-custom' },
		},
		{
			value: 'off' as const,
			label: () => m.titleStyle_off(),
			attrs: { 'data-umami-event': 'set-titlestyle-off' },
		},
	];

	const langOptions = [
		{ value: 'en' as const, label: () => 'English', attrs: { 'data-umami-event': 'set-lang-en' } },
		{ value: 'zh' as const, label: () => '中文', attrs: { 'data-umami-event': 'set-lang-zh' } },
	];
</script>

{#if open}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
		style={themeVars}
		onclick={onClose}
		onkeydown={(e) => e.key === 'Escape' && onClose()}
		role="dialog"
		tabindex="-1"
	>
		<div
			class="flex max-h-[85vh] w-[90%] max-w-lg flex-col overflow-hidden rounded-xl border border-surface-line bg-surface-backdrop shadow-2xl"
			style="font-family: system-ui, sans-serif"
			onclick={(e) => e.stopPropagation()}
			role="presentation"
		>
			<div
				class="flex shrink-0 items-center justify-between border-b border-surface-line px-5 py-4"
			>
				<h2 class="m-0 text-base font-semibold text-ink">{m.settings()}</h2>
				<button
					class="cursor-pointer rounded-md border-none bg-transparent p-1 text-ink-muted transition-colors hover:text-ink"
					onclick={onClose}
					aria-label={m.close()}
				>
					<svg
						viewBox="0 0 24 24"
						width="18"
						height="18"
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

			<div class="settings-scroll flex-1 space-y-3 overflow-y-auto px-4 py-4">
				<!-- FORMAT -->
				<section class="overflow-hidden rounded-xl border border-surface-line bg-surface-card">
					<div class="divide-y divide-surface-line">
						<div class="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
							<span class="flex items-center gap-2 text-sm text-ink">
								<Icon name="clock" />
								{m.timeFormat()}
							</span>
							<SegmentedControl
								options={timeFormatOptions}
								value={prefs.timeFormat}
								onchange={(v) => (prefs.timeFormat = v)}
							/>
						</div>

						<div>
							<div class="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
								<span class="flex items-center gap-2 text-sm text-ink">
									<Icon name="timer" />
									{m.showSeconds()}
								</span>
								<SegmentedControl
									options={secondStyleOptions}
									value={prefs.secondStyle}
									onchange={(v) => (prefs.secondStyle = v)}
								/>
							</div>

							{#if prefs.secondStyle === 'bar'}
								<div class="px-4 pb-3" transition:slide={{ duration: 200 }}>
									<div class="ml-2 space-y-2.5 border-l-2 border-accent/60 pl-3">
										<div class="flex flex-wrap items-center justify-between gap-3">
											<span class="flex items-center gap-2 text-sm text-ink">
												<Icon name="bar-position" />
												{m.barPosition()}
											</span>
											<SegmentedControl
												options={barPositionOptions}
												value={prefs.barPosition}
												onchange={(v) => (prefs.barPosition = v)}
											/>
										</div>

										<div class="flex flex-wrap items-center justify-between gap-3">
											<span class="flex items-center gap-2 text-sm text-ink">
												<Icon name="opacity" />
												{m.progressOpacity()}
											</span>
											<span class="flex items-center gap-2">
												<input
													type="range"
													min="0"
													max="100"
													bind:value={prefs.progressOpacity}
													class="w-28 cursor-pointer"
													aria-label={m.progressOpacity()}
												/>
												<span class="w-10 text-right text-sm text-ink-muted tabular-nums"
													>{prefs.progressOpacity}%</span
												>
											</span>
										</div>
									</div>
								</div>
							{/if}
						</div>

						<div>
							<div class="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
								<span class="flex items-center gap-2 text-sm text-ink">
									<Icon name="panel-top" />
									{m.titleBar()}
								</span>
								<SegmentedControl
									options={titleStyleOptions}
									value={prefs.titleStyle}
									onchange={(v) => (prefs.titleStyle = v)}
								/>
							</div>

							{#if prefs.titleStyle === 'custom'}
								<div class="px-4 pb-3" transition:slide={{ duration: 200 }}>
									<label class="flex items-center gap-2">
										<Icon name="pencil" />
										<input
											type="text"
											bind:value={prefs.titleCustomized}
											placeholder={m.titleCustomized()}
											class="w-full rounded-lg border border-surface-line bg-surface-raised px-3 py-1.5 text-sm text-ink transition-colors outline-none placeholder:text-ink-faint focus:border-accent"
											data-umami-event="edit-title-custom"
										/>
									</label>
								</div>
							{/if}
						</div>
					</div>
				</section>

				<ColorConfig />

				<SyncSection />

				<!-- LANGUAGE -->
				<section
					class="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-surface-line bg-surface-card px-4 py-3"
				>
					<span class="flex items-center gap-2 text-sm text-ink">
						<Icon name="globe" />
						{m.language()}
					</span>
					<SegmentedControl options={langOptions} value={getLocale()} onchange={handleLangChange} />
				</section>
			</div>

			<div class="flex shrink-0 items-center gap-3 border-t border-surface-line px-4 py-3">
				<button
					class="cursor-pointer rounded-lg border border-red-500/40 bg-transparent px-4 py-2 text-xs text-red-400 transition-colors hover:bg-red-500/10"
					onclick={handleReset}
					data-umami-event="reset-settings">{m.reset()}</button
				>
				<span class="flex-1 text-center text-[10px] text-ink-faint">v{VERSION}</span>
				<button
					class="cursor-pointer rounded-lg border border-accent/50 bg-accent/25 px-4 py-2 text-xs text-ink transition-colors hover:bg-accent/40"
					onclick={onClose}
					data-umami-event="close-settings">{m.close()}</button
				>
			</div>
		</div>
	</div>
{/if}
