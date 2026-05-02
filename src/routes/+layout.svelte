<script lang="ts">
	import './layout.css';
	import { m } from '$lib/paraglide/messages.js';

	let { children } = $props();
</script>

<svelte:head>
	<title>{m.siteTitle()}</title>
	<link rel="icon" href="/favicon.png" />
	<script
		defer
		src="https://umami.cup11.top/script.js"
		data-website-id="5329e68a-1828-47c5-b2a9-7b9534f7827a"
	></script>
</svelte:head>

{@render children()}
