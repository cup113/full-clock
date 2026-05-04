<script lang="ts">
	import { prefs } from '../preferences.svelte';
	import { m } from '$lib/paraglide/messages.js';
	import { getLocale, setLocale, localizeHref } from '$lib/paraglide/runtime.js';
	import { goto } from '$app/navigation';
	import { formatDate } from '../title-bar';

	let {
		onOpenSettings,
		onToggleFullscreen
	}: { onOpenSettings: () => void; onToggleFullscreen: () => void } = $props();

	let dateStr = $state('');

	$effect(() => {
		const update = () => {
			dateStr = formatDate(new Date(), getLocale());
		};
		update();
		const interval = setInterval(update, 60000);
		return () => clearInterval(interval);
	});

	let isFullscreen = $state(false);

	$effect(() => {
		const handler = () => {
			isFullscreen = !!document.fullscreenElement;
		};
		document.addEventListener('fullscreenchange', handler);
		return () => document.removeEventListener('fullscreenchange', handler);
	});

	function handleLang(lang: 'en' | 'zh') {
		setLocale(lang);
		if (lang === 'en') {
			localStorage.setItem('FL_locale_choice', 'en');
		} else {
			localStorage.removeItem('FL_locale_choice');
		}
	}

	function handleAbout() {
		goto(localizeHref('/about'));
	}
</script>

<div
	class="pointer-events-none absolute top-0 right-0 left-0 z-20 flex items-start justify-between px-3 py-2"
>
	<div class="pointer-events-auto flex items-center gap-1">
		<button
			onclick={onOpenSettings}
			class="cursor-pointer rounded-lg border-none bg-transparent p-1.5 text-inherit opacity-60 transition-all duration-200 hover:bg-white/10 hover:opacity-100"
			aria-label={m.settings()}
			title={m.settings()}
			data-umami-event="open-settings"
		>
			<svg
				viewBox="0 0 24 24"
				width="22"
				height="22"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<circle cx="12" cy="12" r="3" />
				<path
					d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
				/>
			</svg>
		</button>
		<button
			onclick={handleAbout}
			class="cursor-pointer rounded-lg border-none bg-transparent p-1.5 text-inherit opacity-60 transition-all duration-200 hover:bg-white/10 hover:opacity-100"
			aria-label={m.about()}
			title={m.about()}
			data-umami-event="open-about"
		>
			<svg
				viewBox="0 0 24 24"
				width="22"
				height="22"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<circle cx="12" cy="12" r="10" />
				<path d="M12 16v-4" />
				<circle cx="12" cy="8" r="0.5" fill="currentColor" />
			</svg>
		</button>
	</div>

	<div class="pointer-events-auto flex-1 px-3 text-center">
		{#if prefs.titleStyle === 'date'}
			<span class="text-2xl font-bold opacity-80">{dateStr}</span>
		{:else if prefs.titleStyle === 'custom' && prefs.titleCustomized}
			<span class="text-2xl font-bold opacity-80">{prefs.titleCustomized}</span>
		{/if}
	</div>

	<div class="pointer-events-auto flex items-center gap-0.5">
		<button
			onclick={() => handleLang('zh')}
			class="cursor-pointer rounded-lg border-none bg-transparent px-1.5 py-1 text-inherit text-sm font-bold transition-all duration-200 hover:bg-white/10"
			class:opacity-40={getLocale() !== 'zh'}
			class:opacity-100={getLocale() === 'zh'}
			title="中文"
			data-umami-event="switch-lang-zh"
		>中</button>
		<button
			onclick={() => handleLang('en')}
			class="cursor-pointer rounded-lg border-none bg-transparent px-1.5 py-1 text-inherit text-sm font-bold transition-all duration-200 hover:bg-white/10"
			class:opacity-40={getLocale() !== 'en'}
			class:opacity-100={getLocale() === 'en'}
			title="English"
			data-umami-event="switch-lang-en"
		>EN</button>
		<div class="mx-1 h-5 w-px bg-white/20"></div>
		<button
			onclick={onToggleFullscreen}
			class="cursor-pointer rounded-lg border-none bg-transparent p-1.5 text-inherit opacity-80 transition-all duration-200 hover:bg-white/10 hover:opacity-100"
			aria-label={isFullscreen ? m.exitFullscreen() : m.fullscreen()}
			title={isFullscreen ? m.exitFullscreen() : m.fullscreen()}
			data-umami-event="toggle-fullscreen"
		>
			<svg
				viewBox="0 0 24 24"
				width="22"
				height="22"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				{#if isFullscreen}
					<path
						d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"
					/>
				{:else}
					<path
						d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"
					/>
				{/if}
			</svg>
		</button>
	</div>
</div>
