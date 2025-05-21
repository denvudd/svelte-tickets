<script lang="ts" module>
	type TData = unknown;
</script>

<script lang="ts" generics="TData">
	import XIcon from '@lucide/svelte/icons/x';
	import type { Table } from '@tanstack/table-core';
	import { DataTableFacetedFilter, DataTableViewOptions } from './index.js';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { TICKET_CATEGORY_OPTIONS, TICKET_PRIORITY_OPTIONS, TICKETS_STATUS_OPTIONS } from '$lib/constants.js';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { onMount } from 'svelte';

	interface Props {
		table: Table<TData>;
	}

	let { table }: Props = $props();

	const isFiltered = $derived(table.getState().columnFilters.length > 0);
	const statusCol = $derived(table.getColumn('status'));
	const priorityCol = $derived(table.getColumn('priority'));
	const categoryCol = $derived(table.getColumn('category'));
	const titleCol = $derived(table.getColumn('title'));

	function updateSearchParams() {
		const url = new URL(window.location.href);
		const filters = table.getState().columnFilters;
		
		url.searchParams.delete('status');
		url.searchParams.delete('priority');
		url.searchParams.delete('category');
		url.searchParams.delete('title');
		
		filters.forEach(filter => {
			const columnId = filter.id;
			const value = filter.value;
			
			if (columnId === 'status' || columnId === 'priority' || columnId === 'category') {
				if (Array.isArray(value) && value.length > 0) {
					value.forEach(val => {
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
	})

	function resetFilters() {
		table.resetColumnFilters();
		updateSearchParams();
	}
</script>

<div class="flex items-center justify-between">
	<div class="flex flex-1 items-center space-x-2">
		<Input
			placeholder="Filter tickets..."
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

		{#if statusCol}
			<DataTableFacetedFilter column={statusCol} title="Status" options={TICKETS_STATUS_OPTIONS} />
		{/if}
		{#if priorityCol}
			<DataTableFacetedFilter
				column={priorityCol}
				title="Priority"
				options={TICKET_PRIORITY_OPTIONS}
			/>
		{/if}
		{#if categoryCol}
			<DataTableFacetedFilter
				column={categoryCol}
				title="Category"
				options={TICKET_CATEGORY_OPTIONS}
			/>
		{/if}

		{#if isFiltered}
			<Button variant="ghost" onclick={() => resetFilters()} class="h-8 px-2 lg:px-3">
				Reset
				<XIcon />
			</Button>
		{/if}
	</div>
	<DataTableViewOptions {table} />
</div>