<script lang="ts">
	import type { PageData } from './$types';
	import TicketForm from './_components/ticket-form.svelte';
	import DataTable from './_components/data-table/data-table.svelte';
	import { columns } from './columns.js';
	import * as m from '$lib/paraglide/messages.js';

	let { data }: { data: PageData } = $props();
	let { tickets, forms, totalCount, pageSize } = $derived(data);
	let { createTicketForm } = $derived(forms);
</script>

<main class="flex flex-col gap-4">
	<div class="flex items-center justify-between">
		<h1 class="text-lg font-medium">{m.tickets_title()}</h1>
		<div class="align-items flex gap-2">
			<TicketForm serverForm={createTicketForm}/>
		</div>
	</div>
	<DataTable data={tickets} {columns} {totalCount} {pageSize} />
</main>