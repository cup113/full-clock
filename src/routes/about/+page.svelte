<script lang="ts">
	import { m } from '$lib/paraglide/messages.js';
	import { localizeHref } from '$lib/paraglide/runtime.js';
</script>

<svelte:head>
	<title>{m.aboutTitle()}</title>
</svelte:head>

<div
	class="fixed inset-0 flex items-center justify-center overflow-y-auto bg-[#004400] font-[Arial,等线,sans-serif] text-white"
>
	<div class="max-w-lg px-8 py-10 text-center">
		<h1 class="m-0 mb-8 text-2xl font-bold">{m.aboutTitle()}</h1>

		<div class="mb-8 flex flex-col gap-6">
			<div>
				<h2 class="m-0 mb-2 text-lg font-semibold">{m.aboutFeature1()}</h2>
				<p class="m-0 text-sm leading-relaxed opacity-80">{m.aboutFeature1Desc()}</p>
			</div>
			<div>
				<h2 class="m-0 mb-2 text-lg font-semibold">{m.aboutFeature2()}</h2>
				<p class="m-0 text-sm leading-relaxed opacity-80">{m.aboutFeature2Desc()}</p>
			</div>
			<div>
				<h2 class="m-0 mb-2 text-lg font-semibold">{m.aboutFeature3()}</h2>
				<p class="m-0 text-sm leading-relaxed opacity-80">{m.aboutFeature3Desc()}</p>
			</div>
		</div>

		<div class="mb-8 space-y-1 text-xs opacity-70">
			<p class="m-0">
				{m.aboutCredit()} (<a
					href="https://www.freepik.com"
					target="_blank"
					rel="noopener"
					data-umami-event="click-about-favicon"
					class="text-[#88bbff] no-underline hover:underline">Freepik</a
				>)
			</p>
			<p class="m-0">
				{m.aboutRepo()}:
				<a
					href="https://github.com/cup113/full-clock"
					target="_blank"
					rel="noopener"
					data-umami-event="click-about-repo"
					class="text-[#88bbff] no-underline hover:underline">github.com/cup113/full-clock</a
				>
			</p>
			<p class="m-0">
				{m.aboutTimeApi()}:
				<a
					href="https://api.shijian.online"
					target="_blank"
					rel="noopener"
					data-umami-event="click-about-timeapi"
					class="text-[#88bbff] no-underline hover:underline">api.shijian.online</a
				>
			</p>
			<p class="m-0">
				{m.aboutFeedback()}:
				<a
					href="https://f.kdocs.cn/g/iuGauWIo/"
					target="_blank"
					rel="noopener"
					data-umami-event="click-about-feedback"
					class="text-[#88bbff] no-underline hover:underline">f.kdocs.cn/g/iuGauWIo/</a
				>
			</p>
		</div>

		<a
			href={localizeHref('/')}
			class="inline-block rounded-lg border border-white/30 px-8 py-2.5 text-sm text-white no-underline transition-colors hover:bg-white/10"
			>{m.backToHome()}</a
		>
	</div>
</div>
