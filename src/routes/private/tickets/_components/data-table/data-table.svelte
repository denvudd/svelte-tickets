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
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';

	type DataTableProps<TData, TValue> = {
		columns: ColumnDef<TData, TValue>[];
		data: TData[];
	};

	let { data, columns }: DataTableProps<TData, TValue> = $props();

	let pagination = $state<PaginationState>({ pageIndex: 0, pageSize: 10 });
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
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		onPaginationChange: (updater) => {
			if (typeof updater === 'function') {
				pagination = updater(pagination);
			} else {
				pagination = updater;
			}
		},
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
	const totalRows = $derived(table.getFilteredRowModel().rows);
	const columnsNamesWithoutActions = table
		.getAllColumns()
		.filter((col) => col.getCanHide())
		.slice(0, -1);
</script>

<div>
	<div class="flex items-center pb-4">
		<div class="flex items-center gap-2">
			<Input
				placeholder="Filter tickets..."
				value={(table.getColumn('title')?.getFilterValue() as string) ?? ''}
				onchange={(e) => {
					table.getColumn('title')?.setFilterValue(e.currentTarget.value);
				}}
				oninput={(e) => {
					table.getColumn('title')?.setFilterValue(e.currentTarget.value);
				}}
			/>
			{#if selectedRows.length}
				<TooltipProvider delayDuration={100}>
					<Tooltip>
						<TooltipTrigger>
							<Button
								onclick={() => (isDeleteDialogOpen = true)}
								variant="outline"
								size="icon"
								class="flex-shrink-0"
							>
								<TrashIcon />
							</Button>
						</TooltipTrigger>
						<TooltipContent class="max-w-xs">Delete selected rows</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			{/if}
		</div>
		<DropdownMenu>
			<DropdownMenuTrigger>
				{#snippet child({ props })}
					<Button {...props} variant="outline" class="ml-auto">
						<Settings2Icon class="size-4" />
						View
					</Button>
				{/snippet}
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				{#each columnsNamesWithoutActions as column (column.id)}
					<DropdownMenuCheckboxItem
						class="capitalize"
						bind:checked={() => column.getIsVisible(), (v) => column.toggleVisibility(!!v)}
					>
						{typeof column.columnDef.header === 'string' ? column.columnDef.header : column.id}
					</DropdownMenuCheckboxItem>
				{/each}
			</DropdownMenuContent>
		</DropdownMenu>
	</div>
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
			{selectedRows.length} of {totalRows.length} row(s) selected.
		</div>
		<div class="flex items-center gap-2">
			<Button
				variant="outline"
				size="sm"
				onclick={() => table.previousPage()}
				disabled={!table.getCanPreviousPage()}
			>
				Previous
			</Button>
			<Button
				variant="outline"
				size="sm"
				onclick={() => table.nextPage()}
				disabled={!table.getCanNextPage()}
			>
				Next
			</Button>
		</div>
	</div>
</div>

<AlertDialog open={isDeleteDialogOpen} onOpenChange={handleToggleDeleteDialog}>
	<AlertDialogContent>
		<form
			method="POST"
			use:enhance
			action={`?/deleteTicket&ticketId=${selectedRows.map((row) => (row.original as Tables<'tickets'>).id)}`}
			onsubmit={() => {
				isDeleteDialogOpen = false;
				toast.success('Tickets deleted successfully');
			}}
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
