<script lang="ts">
	import { prefs } from '../preferences.svelte';
	import { m } from '$lib/paraglide/messages.js';
	import { formatTime } from '../format-time';
	import { panelBg } from '../color-utils';

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

	let previewFmt = $derived(formatTime(PREVIEW_DATE, prefs.timeFormat));
	const bg = $derived(panelBg(prefs.background));
</script>

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
					<span class="text-[0.3em] font-normal opacity-60 align-top">{previewFmt.ampm}</span>
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
