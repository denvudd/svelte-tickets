<script lang="ts">
	import type { HTMLInputAttributes, HTMLInputTypeAttribute } from 'svelte/elements';
	import type { WithElementRef } from 'bits-ui';
	import { cn } from '$lib/utils.js';
	import EyeIcon from '@lucide/svelte/icons/eye';
	import EyeOffIcon from '@lucide/svelte/icons/eye-off';

	type InputType = Exclude<HTMLInputTypeAttribute, 'file'>;

	type Props = WithElementRef<
		Omit<HTMLInputAttributes, 'type'> &
			({ type: 'file'; files?: FileList } | { type?: InputType; files?: undefined })
	> & {
		error?: string[] | false | null;
		rootClass?: string;
	};

	let {
		ref = $bindable(null),
		value = $bindable(),
		type,
		files = $bindable(),
		class: className,
		error,
		rootClass,
		...restProps
	}: Props = $props();

	let showPassword = $state(false);
	let inputType = $derived(type === 'password' ? (showPassword ? 'text' : 'password') : type)
</script>

<div class={cn("flex w-full flex-col gap-1.5", rootClass)}>
	{#if type === 'file'}
		<input
			bind:this={ref}
			class={cn(
				'border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-base file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-1 focus-visible:ring-offset-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
				className
			)}
			type="file"
			bind:files
			bind:value
			{...restProps}
		/>
	{:else if type === 'password'}
		<div class="relative">
			<input
				bind:this={ref}
				class={cn(
					'border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border pl-3 pr-6 py-2 pr-10 text-base focus-visible:ring-1 focus-visible:ring-offset-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
					className
				)}
				type={inputType}
				bind:value
				{...restProps}
			/>

			<button
				type="button"
				class="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 transition cursor-pointer"
				onclick={() => (showPassword = !showPassword)}
				tabindex="-1"
			>
				{#if showPassword}
					<EyeOffIcon class="h-5 w-5" />
				{:else}
					<EyeIcon class="h-5 w-5" />
				{/if}
			</button>
		</div>
	{:else}
		<input
			bind:this={ref}
			class={cn(
				'border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-base focus-visible:ring-1 focus-visible:ring-offset-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
				className
			)}
			type={inputType}
			bind:value
			{...restProps}
		/>
	{/if}

	{#if error}
		<span class="animate-in fade-in-30 slide-in-from-top flex flex-col gap-1 text-xs text-red-400">
			{error[0]}
		</span>
	{/if}
</div>
