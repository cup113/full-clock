<script lang="ts">
	import { prefs } from '../preferences.svelte';
	import { m } from '$lib/paraglide/messages.js';
	import { formatTime } from '../format-time';
	import { slide } from 'svelte/transition';
	import Icon from './Icon.svelte';

	const PREVIEW_DATE = new Date(2024, 0, 1, 19, 2, 34);

	let colorDetailExpanded = $state(false);

	const commonFonts = [
		'等线',
		'微软雅黑',
		'宋体',
		'黑体',
		'楷体',
		'Cascadia Code',
		'Consolas',
		'Courier New',
		'Fira Code',
		'JetBrains Mono',
		'monospace',
		'Arial',
	];

	const colorPresets: {
		id: string;
		label: () => string;
		background: string;
		foreground: string;
		colorProgress: string;
	}[] = [
		{
			id: 'classic',
			label: m.colorPresetClassic,
			background: '#004400',
			foreground: '#FFFFFF',
			colorProgress: '#005500',
		},
		{
			id: 'midnight',
			label: m.colorPresetMidnight,
			background: '#0a0a23',
			foreground: '#e0e0ff',
			colorProgress: '#1a1a5e',
		},
		{
			id: 'contrast',
			label: m.colorPresetContrast,
			background: '#000000',
			foreground: '#00ff00',
			colorProgress: '#00aa00',
		},
		{
			id: 'sunset',
			label: m.colorPresetSunset,
			background: '#2d1b00',
			foreground: '#ffd699',
			colorProgress: '#cc5500',
		},
		{
			id: 'matrix',
			label: m.colorPresetMatrix,
			background: '#000000',
			foreground: '#00ff41',
			colorProgress: '#003b00',
		},
		{
			id: 'slate',
			label: m.colorPresetSlate,
			background: '#1e293b',
			foreground: '#e2e8f0',
			colorProgress: '#475569',
		},
	];

	function applyColorPreset(p: (typeof colorPresets)[number]) {
		prefs.background = p.background;
		prefs.foreground = p.foreground;
		prefs.colorProgress = p.colorProgress;
	}

	function isActivePreset(p: (typeof colorPresets)[number]): boolean {
		return (
			prefs.background.toLowerCase() === p.background.toLowerCase() &&
			prefs.foreground.toLowerCase() === p.foreground.toLowerCase() &&
			prefs.colorProgress.toLowerCase() === p.colorProgress.toLowerCase()
		);
	}

	let previewFmt = $derived(formatTime(PREVIEW_DATE, prefs.timeFormat));
</script>

<section class="overflow-hidden rounded-xl border border-surface-line bg-surface-card">
	<div class="divide-y divide-surface-line">
		<!-- COLORS (expands to presets + pickers) -->
		<div>
			<button
				type="button"
				class="flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-raised/50"
				aria-expanded={colorDetailExpanded}
				data-umami-event="toggle-color-detail"
				onclick={() => (colorDetailExpanded = !colorDetailExpanded)}
			>
				<span class="flex items-center gap-2 text-sm text-ink">
					<Icon name="swatch" />
					{m.colors()}
				</span>
				<span class="flex items-center gap-2.5">
					<span class="inline-flex gap-1">
						<span
							class="h-3.5 w-3.5 rounded-sm border border-black/40"
							style="background:{prefs.background}"
						></span>
						<span
							class="h-3.5 w-3.5 rounded-sm border border-black/40"
							style="background:{prefs.foreground}"
						></span>
						<span
							class="h-3.5 w-3.5 rounded-sm border border-black/40"
							style="background:{prefs.colorProgress}"
						></span>
					</span>
					<svg
						viewBox="0 0 24 24"
						width="16"
						height="16"
						class={'shrink-0 text-ink-muted transition-transform duration-200 ' +
							(colorDetailExpanded ? 'rotate-180' : '')}
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<path d="M6 9l6 6 6-6" />
					</svg>
				</span>
			</button>

			{#if colorDetailExpanded}
				<div class="px-4 pb-4" transition:slide={{ duration: 200 }}>
					<div class="ml-2 space-y-3 border-l-2 border-accent/60 pl-3">
						<div class="grid grid-cols-3 gap-1.5">
							{#each colorPresets as p (p.id)}
								<button
									type="button"
									class={[
										'flex cursor-pointer items-center gap-1.5 rounded-md border px-1.5 py-1.5 transition-colors',
										isActivePreset(p)
											? 'border-accent/70 bg-accent/20'
											: 'border-surface-line hover:border-accent/50',
									]}
									onclick={() => applyColorPreset(p)}
									data-umami-event="apply-color-preset"
									data-umami-event-preset={p.id}
									title={p.label()}
								>
									<span class="inline-flex shrink-0 gap-px">
										<span class="h-2.5 w-2.5 rounded-sm" style="background:{p.background}"></span>
										<span class="h-2.5 w-2.5 rounded-sm" style="background:{p.foreground}"></span>
										<span class="h-2.5 w-2.5 rounded-sm" style="background:{p.colorProgress}"
										></span>
									</span>
									<span class="truncate text-xs text-ink-muted">{p.label()}</span>
								</button>
							{/each}
						</div>

						<div class="flex flex-wrap items-center gap-x-4 gap-y-2">
							<label class="flex items-center gap-1.5">
								<input type="color" bind:value={prefs.background} />
								<code class="font-mono text-xs text-ink-muted">{prefs.background}</code>
							</label>
							<label class="flex items-center gap-1.5">
								<input type="color" bind:value={prefs.foreground} />
								<code class="font-mono text-xs text-ink-muted">{prefs.foreground}</code>
							</label>
							<label class="flex items-center gap-1.5">
								<input type="color" bind:value={prefs.colorProgress} />
								<code class="font-mono text-xs text-ink-muted">{prefs.colorProgress}</code>
							</label>
						</div>
					</div>
				</div>
			{/if}
		</div>

		<!-- FONT -->
		<div class="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
			<span class="flex items-center gap-2 text-sm text-ink">
				<Icon name="type" />
				{m.font()}
			</span>
			<select
				bind:value={prefs.fontFamily}
				class="max-w-[60%] cursor-pointer rounded-lg border border-surface-line bg-surface-raised px-3 py-1.5 text-sm text-ink transition-colors outline-none focus:border-accent"
			>
				{#each commonFonts as font (font)}
					<option value={font} class="text-gray-900">{font}</option>
				{/each}
			</select>
		</div>

		<!-- PREVIEW -->
		<div class="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
			<span class="flex items-center gap-2 text-sm text-ink">
				<Icon name="eye" />
				{m.fontPreview()}
			</span>
			<div
				class="relative flex items-center gap-2.5 overflow-hidden rounded-lg border border-surface-line px-3.5 py-2"
				style="background:{prefs.background}"
			>
				{#if prefs.secondStyle === 'bar'}
					{#if prefs.barPosition === 'fullscreen'}
						<div
							class="pointer-events-none absolute top-0 bottom-0 left-0"
							style="width:56.666%; background:{prefs.colorProgress}; opacity:{prefs.progressOpacity /
								100};"
						></div>
					{:else if prefs.barPosition === 'top'}
						<div
							class="pointer-events-none absolute top-0 left-0"
							style="width:56.666%; height:8px; background:{prefs.colorProgress}; opacity:{prefs.progressOpacity /
								100};"
						></div>
					{:else}
						<div
							class="pointer-events-none absolute bottom-0 left-0"
							style="width:56.666%; height:8px; background:{prefs.colorProgress}; opacity:{prefs.progressOpacity /
								100};"
						></div>
					{/if}
				{/if}
				<div class="relative flex items-end gap-1.5">
					<span
						class="text-3xl leading-none font-bold"
						style="color:{prefs.foreground}; font-family:{prefs.fontFamily}"
					>
						{previewFmt.hours}:{previewFmt.minutes}
					</span>
					{#if prefs.secondStyle === 'digital'}
						<span class="inline-flex flex-col items-end leading-none">
							{#if prefs.timeFormat === '12h'}
								<span class="text-[0.3em] font-normal opacity-60">{previewFmt.ampm}</span>
							{/if}
							<span class="text-[0.5em] font-normal opacity-70">:{previewFmt.seconds}</span>
						</span>
					{:else if prefs.timeFormat === '12h'}
						<span class="align-top text-[0.3em] font-normal opacity-60">{previewFmt.ampm}</span>
					{/if}
				</div>
			</div>
		</div>
	</div>
</section>
