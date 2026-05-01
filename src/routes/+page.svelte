<script lang="ts">
	import { prefs } from '$lib/preferences.svelte';
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

<div
	class="fixed inset-0 select-none"
	style="background: {prefs.background}; color: {prefs.foreground}; font-family: {prefs.fontFamily};"
>
	<TitleBar onOpenSettings={openSettings} onToggleFullscreen={toggleFullscreen} />
	<Clock secondStyle={prefs.secondStyle} />
	<SecondBar />
	<Settings open={showSettings} onClose={closeSettings} />
</div>
