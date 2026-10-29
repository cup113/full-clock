<script lang="ts" generics="T extends string">
	interface SegmentOption {
		value: T;
		label: () => string;
		attrs?: Record<string, string>;
	}

	let {
		options,
		value,
		onchange,
	}: { options: SegmentOption[]; value: T; onchange: (value: T) => void } = $props();
</script>

<div
	class="inline-flex divide-x divide-surface-line overflow-hidden rounded-lg border border-surface-line"
>
	{#each options as opt (opt.value)}
		<button
			type="button"
			class={[
				'cursor-pointer px-3 py-1 text-xs font-medium transition-colors duration-150',
				value === opt.value
					? 'bg-accent/30 text-ink'
					: 'bg-transparent text-ink-muted hover:text-ink',
			]}
			aria-pressed={value === opt.value}
			{...opt.attrs ?? {}}
			onclick={() => onchange(opt.value)}>{opt.label()}</button
		>
	{/each}
</div>
