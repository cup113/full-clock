<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.ico';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<script
		defer
		src="https://umami.cup11.top/script.js"
		data-website-id="5329e68a-1828-47c5-b2a9-7b9534f7827a"
	></script>
</svelte:head>

{@render children()}
