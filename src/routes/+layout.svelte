<script lang="ts">
	import './layout.css';
	import { m } from '$lib/paraglide/messages.js';
	import { getLocale } from '$lib/paraglide/runtime.js';

	let { children } = $props();

	let locale = $derived(getLocale());
	let canonical = $derived(locale === 'en' ? 'https://clock.cup11.top' : `https://clock.cup11.top/${locale}`);
	let ogLocale = $derived(locale === 'zh' ? 'zh_CN' : 'en_US');
</script>

<svelte:head>
	<title>{m.siteTitle()}</title>
	<link rel="icon" href="/favicon.png" />
	<meta name="description" content={m.siteDescription()} />
	<link rel="canonical" href={canonical} />
	<meta property="og:type" content="website" />
	<meta property="og:title" content={m.siteTitle()} />
	<meta property="og:description" content={m.siteDescription()} />
	<meta property="og:url" content={canonical} />
	<meta property="og:locale" content={ogLocale} />
	<meta property="og:image" content="https://clock.cup11.top/og_image.png" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={m.siteTitle()} />
	<meta name="twitter:description" content={m.siteDescription()} />
	<meta name="twitter:image" content="https://clock.cup11.top/og_image.png" />
	<script
		defer
		src="https://umami.cup11.top/script.js"
		data-website-id="5329e68a-1828-47c5-b2a9-7b9534f7827a"
	></script>
</svelte:head>

{@render children()}
