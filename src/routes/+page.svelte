<script lang="ts">
	import { prefs } from '$lib/preferences.svelte';
	import { getLocale, setLocale } from '$lib/paraglide/runtime.js';
	import Clock from '$lib/components/Clock.svelte';
	import SecondBar from '$lib/components/SecondBar.svelte';
	import TitleBar from '$lib/components/TitleBar.svelte';
	import Settings from '$lib/components/Settings.svelte';

	let showSettings = $state(false);
	let checkedLang = $state(false);

	$effect(() => {
		if (checkedLang) return;
		checkedLang = true;

		const userChoice = localStorage.getItem('FL_locale_choice');
		if (userChoice) return;

		const hasChineseLang = navigator.languages?.some((l) => l.startsWith('zh'));
		if (hasChineseLang && getLocale() === 'en' && !window.location.pathname.startsWith('/zh')) {
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

	let wakeLockSentinel: WakeLockSentinel | null = $state(null);

	$effect(() => {
		if (prefs.keepScreenOn) {
			let cancelled = false;
			navigator.wakeLock.request('screen').then((s) => {
				if (cancelled) { s.release(); return; }
				s.addEventListener('release', () => { wakeLockSentinel = null; });
				wakeLockSentinel = s;
			}).catch(() => { wakeLockSentinel = null; });
			return () => {
				cancelled = true;
				if (wakeLockSentinel) {
					wakeLockSentinel.release();
					wakeLockSentinel = null;
				}
			};
		} else if (wakeLockSentinel) {
			wakeLockSentinel.release();
			wakeLockSentinel = null;
		}
	});
</script>

<div
	class="fixed inset-0 select-none"
	style="background: {prefs.background}; color: {prefs.foreground}; font-family: {prefs.fontFamily};"
>
	<TitleBar onOpenSettings={openSettings} onToggleFullscreen={toggleFullscreen} />
	<Clock secondStyle={prefs.secondStyle} />
	<SecondBar />
	<Settings open={showSettings} onClose={closeSettings} />
</div>
