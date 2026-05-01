<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.ico';
	import { page } from '$app/state';
	import { locales, localizeHref } from '$lib/paraglide/runtime';
	import { m } from '$lib/paraglide/messages.js';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<script defer src="https://umami.cup11.top/script.js" data-website-id="5329e68a-1828-47c5-b2a9-7b9534f7827a"></script>
</svelte:head>

<nav aria-label={m.language()}>
	{#each locales as locale}
		<a
			href={localizeHref(page.url.pathname, { locale })}
			data-sveltekit-reload
		>
			{locale === 'en' ? 'English' : '中文'}
		</a>
	{/each}
</nav>

{@render children()}
