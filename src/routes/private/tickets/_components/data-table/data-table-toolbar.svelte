<script lang="ts" module>
	type TData = unknown;
</script>

<script lang="ts" generics="TData">
	import XIcon from '@lucide/svelte/icons/x';
	import type { Table } from '@tanstack/table-core';
	import { DataTableFacetedFilter, DataTableViewOptions } from './index.js';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import {
		Tooltip,
		TooltipContent,
		TooltipProvider,
		TooltipTrigger
	} from '$lib/components/ui/tooltip';
	import {
		AlertDialog,
		AlertDialogAction,
		AlertDialogCancel,
		AlertDialogContent,
		AlertDialogDescription,
		AlertDialogFooter,
		AlertDialogHeader,
		AlertDialogTitle
	} from '$lib/components/ui/alert-dialog';
	import TrashIcon from '@lucide/svelte/icons/trash';
	import { type Tables } from '$lib/database.types';
	import { applyAction, enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import {
		TICKET_CATEGORY_OPTIONS,
		TICKET_PRIORITY_OPTIONS,
		TICKETS_STATUS_OPTIONS
	} from '$lib/constants.js';
	import { goto, invalidate } from '$app/navigation';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import * as m from '$lib/paraglide/messages.js';

	interface Props {
		table: Table<TData>;
		resetSelectedRows: () => void;
	}

	let { table, resetSelectedRows }: Props = $props();

	let isDeleteDialogOpen = $state(false);

	const isFiltered = $derived(table.getState().columnFilters.length > 0);
	const statusCol = $derived(table.getColumn('status'));
	const priorityCol = $derived(table.getColumn('priority'));
	const categoryCol = $derived(table.getColumn('category'));
	const titleCol = $derived(table.getColumn('title'));

	const selectedRows = $derived(table.getFilteredSelectedRowModel().rows);

	function updateSearchParams() {
		const url = new URL(window.location.href);
		const filters = table.getState().columnFilters;

		url.searchParams.delete('status');
		url.searchParams.delete('priority');
		url.searchParams.delete('category');
		url.searchParams.delete('title');

		filters.forEach((filter) => {
			const columnId = filter.id;
			const value = filter.value;

			if (columnId === 'status' || columnId === 'priority' || columnId === 'category') {
				if (Array.isArray(value) && value.length > 0) {
					value.forEach((val) => {
						url.searchParams.append(columnId, val);
					});
				}
			} else if (columnId === 'title' && value) {
				url.searchParams.set(columnId, value as string);
			}
		});

		goto(url.toString(), { replaceState: true, noScroll: true });
	}

	onMount(() => {
		const searchParams = page.url.searchParams;

		const statusValues = searchParams.getAll('status');
		if (statusValues.length > 0 && statusCol) {
			statusCol.setFilterValue(statusValues);
		}

		const priorityValues = searchParams.getAll('priority');
		if (priorityValues.length > 0 && priorityCol) {
			priorityCol.setFilterValue(priorityValues);
		}

		const categoryValues = searchParams.getAll('category');
		if (categoryValues.length > 0 && categoryCol) {
			categoryCol.setFilterValue(categoryValues);
		}

		const titleValue = searchParams.get('title');
		if (titleValue && titleCol) {
			titleCol.setFilterValue(titleValue);
		}
	});

	$effect(() => {
		if (table) {
			const filters = table.getState().columnFilters;
			updateSearchParams();
		}
	});

	function resetFilters() {
		table.resetColumnFilters();
		updateSearchParams();
	}

	const handleToggleDeleteDialog = () => (isDeleteDialogOpen = !isDeleteDialogOpen);
</script>

<div class="flex items-center justify-between">
	<div class="flex flex-1 items-center space-x-2">
		<Input
			placeholder={m.tickets_search_placeholder()}
			value={(titleCol?.getFilterValue() as string) ?? ''}
			oninput={(e) => {
				titleCol?.setFilterValue(e.currentTarget.value);
			}}
			onchange={(e) => {
				titleCol?.setFilterValue(e.currentTarget.value);
			}}
			rootClass="w-[150px] lg:w-[250px]"
			class="h-8"
		/>

		{#if selectedRows.length}
			<TooltipProvider delayDuration={100}>
				<Tooltip>
					<TooltipTrigger>
						<Button
							onclick={() => (isDeleteDialogOpen = true)}
							variant="outline"
							size="icon"
							class="size-8 flex-shrink-0"
						>
							<TrashIcon />
						</Button>
					</TooltipTrigger>
					<TooltipContent class="max-w-xs">{m.tickets_delete_selected()}</TooltipContent>
				</Tooltip>
			</TooltipProvider>
		{/if}

		{#if statusCol}
			<DataTableFacetedFilter
				column={statusCol}
				title={m.tickets_status()}
				options={TICKETS_STATUS_OPTIONS()}
			/>
		{/if}
		{#if priorityCol}
			<DataTableFacetedFilter
				column={priorityCol}
				title={m.tickets_priority()}
				options={TICKET_PRIORITY_OPTIONS()}
			/>
		{/if}
		{#if categoryCol}
			<DataTableFacetedFilter
				column={categoryCol}
				title={m.tickets_category()}
				options={TICKET_CATEGORY_OPTIONS()}
			/>
		{/if}

		{#if isFiltered}
			<Button variant="ghost" onclick={() => resetFilters()} class="h-8 px-2 lg:px-3">
				{m.tickets_reset()}
				<XIcon />
			</Button>
		{/if}
	</div>
	<DataTableViewOptions {table} />
</div>

<AlertDialog open={isDeleteDialogOpen} onOpenChange={handleToggleDeleteDialog}>
	<AlertDialogContent>
		<form
			method="POST"
			use:enhance={({ formElement, formData, action, cancel }) => {
				return async ({ result }) => {
					console.log('🚀 ~ return ~ result:', result);
					if (result.status === 200) {
						toast.success(m.tickets_delete_success());
					} else {
						toast.error(
							(result as { data: { message?: string } }).data.message || m.tickets_delete_failed()
						);
					}

					isDeleteDialogOpen = false;
					resetSelectedRows();
					invalidate('tickets');

					if (result.type === 'redirect') {
						goto(result.location);
					} else {
						await applyAction(result);
					}
				};
			}}
			action={`?/deleteTicket&ticketId=${selectedRows.map((row) => (row.original as Tables<'tickets'>).id)}`}
		>
			<AlertDialogHeader>
				<AlertDialogTitle>{m.tickets_delete_confirm_title()}</AlertDialogTitle>
				<AlertDialogDescription>
					{m.tickets_delete_confirm_description()}
				</AlertDialogDescription>
			</AlertDialogHeader>
			<AlertDialogFooter>
				<AlertDialogCancel onclick={handleToggleDeleteDialog} type="button"
					>{m.tickets_delete_confirm_cancel()}</AlertDialogCancel
				>
				<AlertDialogAction type="submit">{m.tickets_delete_confirm_confirm()}</AlertDialogAction>
			</AlertDialogFooter>
		</form>
	</AlertDialogContent>
</AlertDialog>
