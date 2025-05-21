<script lang="ts" generics="TData, TValue">
	import {
		type ColumnDef,
		type ColumnFiltersState,
		getCoreRowModel,
		getFilteredRowModel,
		getPaginationRowModel,
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
	import { Input } from '$lib/components/ui/input';
	import { Select, SelectContent, SelectItem, SelectTrigger } from '$lib/components/ui/select';
	import {
		DropdownMenu,
		DropdownMenuTrigger,
		DropdownMenuContent,
		DropdownMenuCheckboxItem
	} from '$lib/components/ui/dropdown-menu';
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
	import Settings2Icon from '@lucide/svelte/icons/settings-2';
	import TrashIcon from '@lucide/svelte/icons/trash';
	import { type Tables } from '$lib/database.types';
	import { applyAction, enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import { goto, invalidate } from '$app/navigation';
	import { page } from '$app/state';
	import DataTableToolbar from './data-table-toolbar.svelte';

	type DataTableProps<TData, TValue> = {
		columns: ColumnDef<TData, TValue>[];
		data: TData[];
		totalCount: number;
		pageSize?: number;
	};

	let { data, columns, totalCount, pageSize = 10 }: DataTableProps<TData, TValue> = $props();

	// Initialize pagination from URL search params
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

	// When pageSize changes, reset to first page if current page would be out of bounds
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

	let isDeleteDialogOpen = $state(false);

	const table = createSvelteTable({
		get data() {
			return data;
		},
		columns,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getSortedRowModel: getSortedRowModel(),
		manualPagination: true,
		onPaginationChange: (updater) => {
			if (typeof updater === 'function') {
				const newPagination = updater(pagination);
				pagination = newPagination;

				// Navigate to the new page
				const url = new URL(page.url);
				url.searchParams.set('page', (newPagination.pageIndex + 1).toString());

				// Add pageSize to URL if it changed from default
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

	const handleToggleDeleteDialog = () => (isDeleteDialogOpen = !isDeleteDialogOpen);

	const selectedRows = $derived(table.getFilteredSelectedRowModel().rows);

	const totalPages = $derived(Math.ceil(totalCount / pagination.pageSize));
	const currentPageIndex = $derived(pagination.pageIndex);
	const hasNextPage = $derived(currentPageIndex < totalPages - 1);
	const hasPreviousPage = $derived(currentPageIndex > 0);
</script>

<div class="space-y-4">
	<DataTableToolbar {table} />
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
						<TableCell colspan={columns.length} class="h-24 text-center">No results.</TableCell>
					</TableRow>
				{/each}
			</TableBody>
		</Table>
	</div>
	<div class="flex items-center justify-between space-x-2 py-4">
		<div class="text-muted-foreground flex-1 text-sm">
			{selectedRows.length} of {totalCount} row(s) total.
		</div>
		<div class="flex items-center space-x-6 lg:space-x-8">
			<div class="flex items-center gap-2">
				<p class="text-sm font-medium">Rows per page</p>
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
				Page {currentPageIndex + 1} of {totalPages || 1}
			</div>
			<div class="flex items-center space-x-2">
				<Button
					variant="outline"
					size="sm"
					onclick={() => table.previousPage()}
					disabled={!hasPreviousPage}
				>
					Previous
				</Button>
				<Button
					variant="outline"
					size="sm"
					onclick={() => table.nextPage()}
					disabled={!hasNextPage}
				>
					Next
				</Button>
			</div>
		</div>
	</div>
</div>

<AlertDialog open={isDeleteDialogOpen} onOpenChange={handleToggleDeleteDialog}>
	<AlertDialogContent>
		<form
			method="POST"
			use:enhance={({ formElement, formData, action, cancel }) => {
				return async ({ result }) => {
					console.log('🚀 ~ return ~ result:', result);
					if (result.status === 200) {
						toast.success('Tickets deleted successfully');
					} else {
						toast.error(
							(result as { data: { message?: string } }).data.message || 'Failed to delete tickets'
						);
					}

					isDeleteDialogOpen = false;
					rowSelection = {};
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
				<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
				<AlertDialogDescription>
					This action cannot be undone. This will permanently delete selected tickets and remove the
					data from our servers.
				</AlertDialogDescription>
			</AlertDialogHeader>
			<AlertDialogFooter>
				<AlertDialogCancel onclick={handleToggleDeleteDialog} type="button"
					>Cancel</AlertDialogCancel
				>
				<AlertDialogAction type="submit">Continue</AlertDialogAction>
			</AlertDialogFooter>
		</form>
	</AlertDialogContent>
</AlertDialog>
