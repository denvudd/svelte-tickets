<script lang="ts">
	import { cn } from '$lib/utils';
	import { type IconProps } from '@lucide/svelte';
	import type { Component } from 'svelte';

	interface Props {
		Icon: Component<IconProps, {}, ''>;
		iconColor: string;
		text: string;
        additionalClass?: string;
	}

	const { Icon, iconColor, text, additionalClass }: Props = $props();
</script>

<div class={cn("flex items-center gap-2", additionalClass)}>
	<Icon class={cn('size-4', iconColor)} />
	<span>{text}</span>
</div>
