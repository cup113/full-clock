<script lang="ts">
	import { m } from '$lib/paraglide/messages.js';
	import { getSyncState, sync } from '../sync-manager.svelte';

	const state = $derived(getSyncState());

	const badgeTitle = $derived(
		state.status === 'syncing' ? m.syncSyncing() :
		state.status === 'synced' ? m.syncLatest({ error: state.syncErrorMargin.toFixed(0) }) :
		state.status === 'error' ? m.syncFailed() :
		m.syncIdle()
	);
</script>

{#if state.mode !== 'off'}
	<button
		class="sync-badge cursor-pointer rounded-lg border-none bg-transparent p-1.5 text-inherit opacity-60 transition-all duration-200 hover:bg-white/10 hover:opacity-100"
		title={badgeTitle}
		data-umami-event="sync-badge"
		onclick={() => sync()}
	>
		<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"
			stroke-linecap="round" stroke-linejoin="round"
			style={state.status === 'syncing' ? 'animation: spin 1s linear infinite;' : ''}
		>
			{#if state.status === 'synced'}
				<path d="M20 6L9 17l-5-5" stroke-width="2.5" />
			{:else if state.status === 'error'}
				<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
				<path d="M12 9v4" />
				<path d="M12 17h.01" />
			{:else}
				<path d="M18.5249 9.46C18.8317 10.2474 19 11.1041 19 12C19 15.866 15.866 19 12 19H9M5.47507 14.54C5.16832 13.7526 5 12.8959 5 12C5 8.13401 8.13401 5 12 5H15M15 5L12 2M15 5L12 8M9 19L12 16M9 19L12 22" />
			{/if}
		</svg>
	</button>
{/if}

<style>
	@keyframes spin {
		to { transform: rotate(360deg); }
	}
</style>
