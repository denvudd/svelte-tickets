<script lang="ts">
	import { Select as SelectPrimitive, type WithoutChild } from 'bits-ui';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import { cn } from '$lib/utils.js';

	type Props = WithoutChild<SelectPrimitive.TriggerProps> & { error?: string[] | false | null };

	let { ref = $bindable(null), class: className, children, error, ...restProps }: Props = $props();
</script>

<div class="flex w-full flex-col gap-1.5">
	<SelectPrimitive.Trigger
		bind:ref
		class={cn(
			'border-input bg-background ring-offset-background data-[placeholder]:text-muted-foreground focus:ring-ring flex h-10 w-full items-center justify-between rounded-md border px-3 py-2 text-sm focus:ring-1 focus:ring-offset-1 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1',
			className
		)}
		{...restProps}
	>
		{@render children?.()}
		<ChevronDown class="size-4 opacity-50" />
	</SelectPrimitive.Trigger>
	{#if error}
		<span class="animate-in fade-in-30 slide-in-from-top flex flex-col gap-1 text-xs text-red-400">
			{error[0]}
		</span>
	{/if}
</div>
