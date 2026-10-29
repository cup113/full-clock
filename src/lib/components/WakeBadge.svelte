<script lang="ts">
	import { prefs } from '../preferences.svelte';
	import { m } from '$lib/paraglide/messages.js';
	import { getWakeLockStatus } from '../wake-lock.svelte';

	const status = $derived(getWakeLockStatus());

	// Same icon as the "keep screen on" switch in Settings: one concept, one metaphor.
	// A sun would read as a light/dark theme toggle.
	const label = $derived(
		!prefs.keepScreenOn
			? m.keepScreenOn()
			: status === 'active'
				? m.screenWillStayOn()
				: status === 'denied'
					? m.wakeLockDenied()
					: m.wakeLockPending(),
	);

	const dimmed = $derived(!prefs.keepScreenOn || status === 'inactive');
	const pending = $derived(prefs.keepScreenOn && status === 'inactive');
</script>

{#if status !== 'unsupported'}
	<button
		class="cursor-pointer rounded-lg border-none bg-transparent p-1.5 text-inherit transition-all duration-200 hover:bg-white/10 hover:opacity-100"
		class:opacity-40={dimmed}
		class:opacity-100={!dimmed}
		class:animate-pulse={pending}
		aria-label={label}
		title={label}
		aria-pressed={prefs.keepScreenOn}
		data-umami-event="toggle-keep-screen-on"
		onclick={() => (prefs.keepScreenOn = !prefs.keepScreenOn)}
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
			<path d="M18 8h1a4 4 0 0 1 0 8h-1" />
			<path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
			<line x1="6" y1="1" x2="6" y2="4" />
			<line x1="10" y1="1" x2="10" y2="4" />
			<line x1="14" y1="1" x2="14" y2="4" />
		</svg>
	</button>
{/if}
