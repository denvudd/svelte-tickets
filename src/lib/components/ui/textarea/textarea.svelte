<script lang="ts">
	import type { WithElementRef, WithoutChildren } from 'bits-ui';
	import type { HTMLTextareaAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils.js';

	type Props = WithoutChildren<WithElementRef<HTMLTextareaAttributes>> & {
		error?: string[] | false | null;
	};

	let {
		ref = $bindable(null),
		value = $bindable(),
		class: className,
		error,
		...restProps
	}: Props = $props();
</script>

<div class="flex w-full flex-col gap-1.5">
	<textarea
		bind:this={ref}
		class={cn(
			'border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[80px] w-full rounded-md border px-3 py-2 text-base focus-visible:ring-1 focus-visible:ring-offset-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
			className
		)}
		bind:value
		{...restProps}
	></textarea>
	{#if error}
		<span class="animate-in fade-in-30 slide-in-from-top flex flex-col gap-1 text-xs text-red-400">
			{error[0]}
		</span>
	{/if}
</div>
