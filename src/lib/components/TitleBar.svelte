<script lang="ts">
	import { prefs } from '../preferences.svelte';
	import { m } from '$lib/paraglide/messages.js';
	import { getLocale } from '$lib/paraglide/runtime.js';

	let { onOpenSettings, onToggleFullscreen }: { onOpenSettings: () => void; onToggleFullscreen: () => void } = $props();

	let dateStr = $state('');

	$effect(() => {
		const update = () => {
			const d = new Date();
			if (getLocale() === 'zh') {
				const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
				dateStr = `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 ${weekdays[d.getDay()]}`;
			} else {
				dateStr = d.toLocaleDateString('en', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
			}
		};
		update();
		const interval = setInterval(update, 60000);
		return () => clearInterval(interval);
	});

	let isFullscreen = $state(false);

	$effect(() => {
		const handler = () => { isFullscreen = !!document.fullscreenElement; };
		document.addEventListener('fullscreenchange', handler);
		return () => document.removeEventListener('fullscreenchange', handler);
	});
</script>

<div class="title-bar">
	<button class="corner-btn left" onclick={onOpenSettings} aria-label={m.settings()}>
		<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
			<circle cx="12" cy="12" r="3"/>
			<path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
		</svg>
	</button>

	<div class="title-center">
		{#if prefs.titleStyle === 'date'}
			<span class="title-text">{dateStr}</span>
		{:else if prefs.titleStyle === 'custom' && prefs.titleCustomized}
			<span class="title-text">{prefs.titleCustomized}</span>
		{/if}
	</div>

	<button class="corner-btn right" onclick={onToggleFullscreen} aria-label={isFullscreen ? m["exitFullscreen"]() : m.fullscreen()}>
		<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
			{#if isFullscreen}
				<path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/>
			{:else}
				<path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
			{/if}
		</svg>
	</button>
</div>

<style>
	.title-bar {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		padding: 8px 12px;
		z-index: 20;
		pointer-events: none;
	}
	.corner-btn {
		pointer-events: auto;
		background: none;
		border: none;
		cursor: pointer;
		padding: 6px;
		border-radius: 6px;
		opacity: 0.7;
		transition: opacity 0.2s;
		color: inherit;
	}
	.corner-btn:hover {
		opacity: 1;
	}
	.title-center {
		pointer-events: auto;
		flex: 1;
		text-align: center;
		padding: 0 12px;
	}
	.title-text {
		font-size: 14px;
		opacity: 0.8;
	}
</style>
