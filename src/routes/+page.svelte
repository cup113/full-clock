<script lang="ts">
	import { prefs } from '$lib/preferences.svelte';
	import { getLocale, setLocale } from '$lib/paraglide/runtime.js';
	import { enableWakeLock, disableWakeLock } from '$lib/wake-lock.svelte';
	import Clock from '$lib/components/Clock.svelte';
	import SecondBar from '$lib/components/SecondBar.svelte';
	import TitleBar from '$lib/components/TitleBar.svelte';
	import Settings from '$lib/components/Settings.svelte';

	let showSettings = $state(false);

	$effect(() => {
		const hasLocaleCookie = document.cookie.includes('PARAGLIDE_LOCALE=');
		if (hasLocaleCookie) return;

		const hasChineseLang = navigator.languages?.some((l) => l.startsWith('zh'));
		if (hasChineseLang && getLocale() !== 'zh') {
			window.umami?.track('auto-redirect-zh');
			setLocale('zh');
		}
	});

	function toggleFullscreen() {
		if (!document.fullscreenElement) {
			document.documentElement.requestFullscreen();
		} else {
			document.exitFullscreen();
		}
	}

	function openSettings() {
		showSettings = true;
	}

	function closeSettings() {
		showSettings = false;
	}

	$effect(() => {
		if (prefs.keepScreenOn) {
			enableWakeLock();
			return () => {
				disableWakeLock();
			};
		}
	});
</script>

<div
	role="application"
	class="fixed inset-0 select-none"
	ondblclick={() => { if (!showSettings) toggleFullscreen(); }}
	style="background: {prefs.background}; color: {prefs.foreground}; font-family: {prefs.fontFamily};"
>
	<TitleBar onOpenSettings={openSettings} onToggleFullscreen={toggleFullscreen} />
	<Clock secondStyle={prefs.secondStyle} />
	<SecondBar />
	<Settings open={showSettings} onClose={closeSettings} />
</div>
