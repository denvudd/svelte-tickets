<script lang="ts" module>
	type TData = unknown;
</script>

<script lang="ts" generics="TData">
	import Settings2Icon from '@lucide/svelte/icons/settings-2';
	import type { Table } from '@tanstack/table-core';
	import { buttonVariants } from '$lib/components/ui/button';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import * as m from '$lib/paraglide/messages.js';

	let { table }: { table: Table<TData> } = $props();

	const columnsNamesWithoutActions = table
		.getAllColumns()
		.filter((col) => col.getCanHide())
		.slice(0, -1);
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger
		class={buttonVariants({
			variant: 'outline',
			size: 'sm',
			class: 'ml-auto hidden h-8 lg:flex'
		})}
	>
		<Settings2Icon />
		{m.tickets_view()}
	</DropdownMenu.Trigger>
	<DropdownMenu.Content>
		<DropdownMenu.Group>
			<DropdownMenu.Label>{m.tickets_toggle_columns()}</DropdownMenu.Label>
			<DropdownMenu.Separator />
			{#each columnsNamesWithoutActions as column (column)}
				<DropdownMenu.CheckboxItem
					bind:checked={() => column.getIsVisible(), (v) => column.toggleVisibility(!!v)}
					class="capitalize"
				>
					{typeof column.columnDef.header === 'string' ? column.columnDef.header : column.id}
				</DropdownMenu.CheckboxItem>
			{/each}
		</DropdownMenu.Group>
	</DropdownMenu.Content>
</DropdownMenu.Root>
