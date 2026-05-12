<script lang="ts">
	import { prefs } from '$lib/preferences.svelte';
	import { getLocale, setLocale } from '$lib/paraglide/runtime.js';
	import { enableWakeLock, disableWakeLock } from '$lib/wake-lock.svelte';
	import Clock from '$lib/components/Clock.svelte';
	import SecondBar from '$lib/components/SecondBar.svelte';
	import TitleBar from '$lib/components/TitleBar.svelte';
	import Settings from '$lib/components/Settings.svelte';

	let showSettings = $state(false);
	let swUpdateReady = $state(false);

	$effect(() => {
		const hasLocaleCookie = document.cookie.includes('PARAGLIDE_LOCALE=');
		if (hasLocaleCookie) return;

		const hasChineseLang = navigator.languages?.some((l) => l.startsWith('zh'));
		if (hasChineseLang && getLocale() !== 'zh') {
			window.umami?.track('auto-redirect-zh');
			setLocale('zh');
		}
	});

	$effect(() => {
		if (!('serviceWorker' in navigator)) return;

		let reg: ServiceWorkerRegistration | null = null;
		let disposed = false;

		async function init() {
			reg = await navigator.serviceWorker.getRegistration();
			if (!reg || disposed) return;

			if (reg.waiting && navigator.serviceWorker.controller) {
				swUpdateReady = true;
			}

			reg.addEventListener('updatefound', () => {
				reg!.installing?.addEventListener('statechange', () => {
					if (reg!.waiting && navigator.serviceWorker.controller && !disposed) {
						swUpdateReady = true;
					}
				});
			});
		}

		init();

		const interval = setInterval(() => {
			navigator.serviceWorker.getRegistration().then((r) => r?.update());
		}, 600000);

		return () => {
			disposed = true;
			clearInterval(interval);
		};
	});

	function applySWUpdate() {
		navigator.serviceWorker.getRegistration().then((reg) => {
			reg?.waiting?.postMessage({ type: 'SKIP_WAITING' });
		});
		window.location.reload();
	}

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

	{#if swUpdateReady}
		<div
			class="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 flex items-center gap-3 rounded-xl bg-white/10 px-5 py-3 shadow-2xl backdrop-blur-md"
		>
			<span class="text-sm text-white/90">新版本可用</span>
			<button
				onclick={applySWUpdate}
				class="cursor-pointer rounded-lg bg-blue-600 px-4 py-1.5 text-sm text-white transition-colors hover:bg-blue-700"
			>
				立即更新
			</button>
		</div>
	{/if}
</div>
