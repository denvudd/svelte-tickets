<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import ArrowUpDown from '@lucide/svelte/icons/arrow-up-down';
	import { Button } from '$lib/components/ui/button/index.js';

	import * as m from '$lib/paraglide/messages.js';

	let { variant = 'ghost', ...restProps }: ComponentProps<typeof Button> = $props();
</script>

<div class="flex items-center gap-1">
	{m.tickets_col_title()}
	<Button {variant} size="icon" class="size-7" {...restProps}>
		<ArrowUpDown />
	</Button>
</div>
