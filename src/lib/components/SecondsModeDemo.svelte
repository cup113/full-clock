<script lang="ts">
	import { m } from '$lib/paraglide/messages.js';

	let fakeSeconds = $state(0);
	let i: ReturnType<typeof setInterval>;

	$effect(() => {
		i = setInterval(() => { fakeSeconds = (fakeSeconds + 1) % 60; }, 1000);
		return () => clearInterval(i);
	});

	let sec = $derived(String(fakeSeconds).padStart(2, '0'));
	let pct = $derived((fakeSeconds / 60) * 100);
</script>

<div class="mt-4 grid grid-cols-3 gap-3 select-none">
	<div class="relative overflow-hidden rounded-lg bg-[#005500] p-4 text-center">
		<div class="flex h-14 items-center justify-center font-mono text-2xl font-bold tracking-wider text-white">
			12:34
		</div>
		<p class="mt-2 text-xs text-white/60">{m.secondStyle_off()}</p>
	</div>

	<div class="relative overflow-hidden rounded-lg bg-[#005500] p-4 text-center">
		<div class="flex h-14 items-center justify-center font-mono text-2xl font-bold tracking-wider text-white">
			12:34<span class="text-base opacity-80">:{sec}</span>
		</div>
		<p class="mt-2 text-xs text-white/60">{m.secondStyle_digital()}</p>
	</div>

	<div class="relative overflow-hidden rounded-lg bg-[#005500] p-4 text-center">
		<div
			class="pointer-events-none absolute top-0 left-0 h-full transition-none"
			style="width: {pct}%; background: rgba(255,255,255,0.15);"
		></div>
		<div class="relative flex h-14 items-center justify-center font-mono text-2xl font-bold tracking-wider text-white">
			12:34
		</div>
		<p class="relative mt-2 text-xs text-white/60">{m.secondStyle_bar()}</p>
	</div>
</div>
