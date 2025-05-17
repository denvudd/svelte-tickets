<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import ArrowUpDown from '@lucide/svelte/icons/arrow-up-down';
	import { Button } from '$lib/components/ui/button/index.js';

	let { variant = 'ghost', ...restProps }: ComponentProps<typeof Button> = $props();
</script>

<div class="flex items-center gap-1">
	Title
	<Button {variant} size="icon" class="size-7" {...restProps}>
		<ArrowUpDown />
	</Button>
</div>
