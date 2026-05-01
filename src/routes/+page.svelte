<script lang="ts">
	import { prefs } from '$lib/preferences.svelte';
	import { m } from '$lib/paraglide/messages.js';
	import Clock from '$lib/components/Clock.svelte';
	import SecondBar from '$lib/components/SecondBar.svelte';
	import TitleBar from '$lib/components/TitleBar.svelte';
	import Settings from '$lib/components/Settings.svelte';

	let showSettings = $state(false);

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
</script>

<div class="clock-screen" style="background: {prefs.background}; color: {prefs.foreground}; font-family: {prefs.fontFamily};">
	<TitleBar onOpenSettings={openSettings} onToggleFullscreen={toggleFullscreen} />
	<Clock secondStyle={prefs.secondStyle} />
	<SecondBar />
	<Settings open={showSettings} onClose={closeSettings} />

	<div class="about-link">
		<a href="/about">{m.about()}</a>
	</div>
</div>

<style>
	.clock-screen {
		position: fixed;
		inset: 0;
	}
	.about-link {
		position: absolute;
		bottom: 8px;
		left: 50%;
		transform: translateX(-50%);
		z-index: 10;
		opacity: 0.3;
		font-size: 12px;
		transition: opacity 0.2s;
	}
	.about-link:hover {
		opacity: 0.8;
	}
	.about-link a {
		color: inherit;
		text-decoration: none;
	}
</style>
