<script lang="ts" generics="TData, TValue">
	import {
		type ColumnDef,
		type ColumnFiltersState,
		getCoreRowModel,
		getFilteredRowModel,
		getSortedRowModel,
		type PaginationState,
		type RowSelectionState,
		type SortingState,
		type VisibilityState
	} from '@tanstack/table-core';
	import { createSvelteTable, FlexRender } from '$lib/components/ui/data-table';
	import {
		Table,
		TableBody,
		TableCell,
		TableHead,
		TableHeader,
		TableRow
	} from '$lib/components/ui/table';
	import { Button } from '$lib/components/ui/button';
	import * as m from '$lib/paraglide/messages.js';
	import { Select, SelectContent, SelectItem, SelectTrigger } from '$lib/components/ui/select';
	import DataTableToolbar from './data-table-toolbar.svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	type DataTableProps<TData, TValue> = {
		columns: () => ColumnDef<TData, TValue>[];
		data: TData[];
		totalCount: number;
		pageSize?: number;
	};

	let { data, columns, totalCount, pageSize = 10 }: DataTableProps<TData, TValue> = $props();

	const currentPage = page.url.searchParams.get('page')
		? parseInt(page.url.searchParams.get('page') || '1') - 1
		: 0;
	const urlPageSize = page.url.searchParams.get('pageSize')
		? parseInt(page.url.searchParams.get('pageSize') || '10')
		: pageSize;

	let pagination = $state<PaginationState>({
		pageIndex: currentPage,
		pageSize: urlPageSize
	});

	$effect(() => {
		const maxPage = Math.ceil(totalCount / pagination.pageSize) - 1;
		if (pagination.pageIndex > maxPage && maxPage >= 0) {
			table.setPageIndex(0);
		}
	});

	let sorting = $state<SortingState>([]);
	let columnFilters = $state<ColumnFiltersState>([]);
	let columnVisibility = $state<VisibilityState>({});
	let rowSelection = $state<RowSelectionState>({});

	const table = createSvelteTable({
		get data() {
			return data;
		},
		columns: columns(),
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getSortedRowModel: getSortedRowModel(),
		manualPagination: true,
		onPaginationChange: (updater) => {
			if (typeof updater === 'function') {
				const newPagination = updater(pagination);
				pagination = newPagination;

				const url = new URL(page.url);
				url.searchParams.set('page', (newPagination.pageIndex + 1).toString());

				if (newPagination.pageSize !== 10) {
					url.searchParams.set('pageSize', newPagination.pageSize.toString());
				} else {
					url.searchParams.delete('pageSize');
				}

				goto(url.toString(), { replaceState: true });
			} else {
				pagination = updater;
			}
		},
		pageCount: Math.ceil(totalCount / pagination.pageSize),
		onSortingChange: (updater) => {
			if (typeof updater === 'function') {
				sorting = updater(sorting);
			} else {
				sorting = updater;
			}
		},
		onColumnFiltersChange: (updater) => {
			if (typeof updater === 'function') {
				columnFilters = updater(columnFilters);
			} else {
				columnFilters = updater;
			}
		},
		onColumnVisibilityChange: (updater) => {
			if (typeof updater === 'function') {
				columnVisibility = updater(columnVisibility);
			} else {
				columnVisibility = updater;
			}
		},
		onRowSelectionChange: (updater) => {
			if (typeof updater === 'function') {
				rowSelection = updater(rowSelection);
			} else {
				rowSelection = updater;
			}
		},
		state: {
			get pagination() {
				return pagination;
			},
			get sorting() {
				return sorting;
			},
			get columnFilters() {
				return columnFilters;
			},
			get columnVisibility() {
				return columnVisibility;
			},
			get rowSelection() {
				return rowSelection;
			}
		}
	});

	const selectedRows = $derived(table.getFilteredSelectedRowModel().rows);

	const totalPages = $derived(Math.ceil(totalCount / pagination.pageSize));
	const currentPageIndex = $derived(pagination.pageIndex);
	const hasNextPage = $derived(currentPageIndex < totalPages - 1);
	const hasPreviousPage = $derived(currentPageIndex > 0);
</script>

<div class="space-y-4">
	<DataTableToolbar {table} resetSelectedRows={() => (rowSelection = {})} />
	<div class="rounded-md border">
		<Table>
			<TableHeader>
				{#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
					<TableRow>
						{#each headerGroup.headers as header (header.id)}
							<TableHead>
								{#if !header.isPlaceholder}
									<FlexRender
										content={header.column.columnDef.header}
										context={header.getContext()}
									/>
								{/if}
							</TableHead>
						{/each}
					</TableRow>
				{/each}
			</TableHeader>
			<TableBody>
				{#each table.getRowModel().rows as row (row.id)}
					<TableRow data-state={row.getIsSelected() && 'selected'}>
						{#each row.getVisibleCells() as cell (cell.id)}
							<TableCell>
								<FlexRender content={cell.column.columnDef.cell} context={cell.getContext()} />
							</TableCell>
						{/each}
					</TableRow>
				{:else}
					<TableRow>
						<TableCell colspan={columns.length} class="h-24 text-center"
							>{m.tickets_empty()}</TableCell
						>
					</TableRow>
				{/each}
			</TableBody>
		</Table>
	</div>
	<div class="flex items-center justify-between space-x-2 py-4">
		<div class="text-muted-foreground flex-1 text-sm">
			{m.tickets_selected_rows_counter({
				selectedRows: selectedRows.length,
				totalCount: totalCount
			})}
		</div>
		<div class="flex items-center space-x-6 lg:space-x-8">
			<div class="flex items-center gap-2">
				<p class="text-sm font-medium">{m.tickets_rows_per_page()}</p>
				<Select
					type="single"
					allowDeselect={false}
					value={`${table.getState().pagination.pageSize}`}
					onValueChange={(value) => {
						table.setPageSize(Number(value));
					}}
				>
					<SelectTrigger rootClass="h-8 w-[70px]" class="h-8 w-[70px]">
						{String(table.getState().pagination.pageSize)}
					</SelectTrigger>
					<SelectContent side="top">
						{#each [10, 20, 30, 40, 50] as pageSizeOption (pageSizeOption)}
							<SelectItem value={`${pageSizeOption}`}>
								{pageSizeOption}
							</SelectItem>
						{/each}
					</SelectContent>
				</Select>
			</div>
			<div class="flex w-[100px] items-center justify-center text-sm font-medium">
				{m.tickets_page_of({
					currentPage: currentPageIndex + 1,
					totalPages: totalPages || 1
				})}
			</div>
			<div class="flex items-center space-x-2">
				<Button
					variant="outline"
					size="sm"
					onclick={() => table.previousPage()}
					disabled={!hasPreviousPage}
				>
					{m.tickets_prev()}
				</Button>
				<Button
					variant="outline"
					size="sm"
					onclick={() => table.nextPage()}
					disabled={!hasNextPage}
				>
					{m.tickets_next()}
				</Button>
			</div>
		</div>
	</div>
</div>
