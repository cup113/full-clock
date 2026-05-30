<script lang="ts">
	import { VERSION } from '$lib/version';
	import { prefs } from '$lib/preferences.svelte';
	import { m } from '$lib/paraglide/messages.js';
	import { localizeHref } from '$lib/paraglide/runtime.js';
	import { colorWithOpacity } from '$lib/color-utils';
	import SecondsModeDemo from '$lib/components/SecondsModeDemo.svelte';

	let faqItems = $derived([
		{ q: m.helpQA1Q(), a: m.helpQA1A() },
		{ q: m.helpQA2Q(), a: m.helpQA2A() },
		{ q: m.helpQA3Q(), a: m.helpQA3A() },
		{ q: m.helpQA4Q(), a: m.helpQA4A() },
		{ q: m.helpQA5Q(), a: m.helpQA5A() },
		{ q: m.helpQA6Q(), a: m.helpQA6A() },
		{ q: m.helpQA7Q(), a: m.helpQA7A() },
	]);

	$effect(() => {
		function onKey(e: KeyboardEvent) {
			if (e.key === 'Escape') {
				window.location.href = localizeHref('/');
			}
		}
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	});

	function handleBackdrop(e: Event) {
		if (e.target === e.currentTarget) {
			window.location.href = localizeHref('/');
		}
	}
</script>

<svelte:head>
	<title>{m.helpTitle()}</title>
</svelte:head>

<div
	class="fixed inset-0 overflow-y-auto"
	style="background: {prefs.background}; color: {prefs.foreground}; --about-fg: {prefs.foreground}; --about-bg: {prefs.background}"
	onclick={handleBackdrop}
	onkeydown={(e) => {
		if (e.key === 'Enter') handleBackdrop(e);
	}}
	role="presentation"
>
	<div class="flex min-h-full items-center justify-center">
		<a
			href={localizeHref('/')}
			class="about-back absolute top-4 left-4 flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm no-underline"
			data-umami-event="back-from-help"
		>
			← {m.backToHome()}
		</a>

		<div class="max-w-lg px-8 py-10 text-center">
			<h1 class="m-0 mb-8 text-2xl font-bold">{m.helpTitle()}</h1>

			<div class="mb-8 flex flex-col gap-6 text-left">
				{#each faqItems as item, i (i)}
					<div>
						<h2 class="m-0 mb-2 text-base font-semibold">{i + 1}. {item.q}</h2>
						<div class="m-0 text-sm leading-relaxed opacity-80">{@html item.a}</div>
						{#if i === 1}
							<SecondsModeDemo />
						{/if}
					</div>
				{/each}
			</div>

			<p class="mb-4 text-xs" style="color: {colorWithOpacity(prefs.foreground, 0.4)}">
				v{VERSION}
			</p>

			<div class="mb-8 space-y-1 text-xs opacity-70">
				<p class="m-0">
					{m.helpRepo()}:
					<a
						href="https://github.com/cup113/full-clock"
						target="_blank"
						rel="noopener"
						data-umami-event="click-help-repo"
						style="color: {colorWithOpacity(prefs.foreground, 0.8)}"
						class="no-underline hover:underline">github.com/cup113/full-clock</a
					>
				</p>
				<p class="m-0">
					{m.helpFeedback()}:
					<a
						href="https://f.kdocs.cn/g/iuGauWIo/"
						target="_blank"
						rel="noopener"
						data-umami-event="click-help-feedback"
						style="color: {colorWithOpacity(prefs.foreground, 0.8)}"
						class="no-underline hover:underline">f.kdocs.cn/g/iuGauWIo/</a
					>
				</p>
			</div>

			<a
				href={localizeHref('/')}
				class="about-btn inline-block rounded-lg border px-8 py-2.5 text-sm no-underline"
				style="border-color: {colorWithOpacity(prefs.foreground, 0.3)}">{m.backToHome()}</a
			>
		</div>
	</div>
</div>

<style>
	.about-back {
		opacity: 0.7;
		transition:
			opacity 0.15s,
			background 0.15s;
	}
	.about-back:hover {
		opacity: 1;
		background: color-mix(in srgb, var(--about-fg) 10%, var(--about-bg));
	}
	.about-btn {
		transition: background 0.15s;
	}
	.about-btn:hover {
		background: color-mix(in srgb, var(--about-fg) 10%, var(--about-bg));
	}
</style>
