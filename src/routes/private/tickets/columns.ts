import { renderComponent } from '$lib/components/ui/data-table';
import type { TicketCategory, TicketPriority, TicketStatus } from '$lib/constants';
import {
	createTicketCategoryIcon,
	createTicketPriorityIcon,
	createTicketStatusIcon,
	formatTicketCategoryLabel,
	formatTicketPriorityLabel,
	formatTicketStatusLabel
} from '$lib/utils';
import type { ColumnDef } from '@tanstack/table-core';
import DataTableCellWithIcon from './_components/data-table/data-table-cell-with-icon.svelte';
import DataTableActions from './_components/data-table/data-table-actions.svelte';
import DataTableTitleButton from './_components/data-table/data-table-title-button.svelte';
import { Checkbox } from '$lib/components/ui/checkbox';
import dayjs from 'dayjs';
import type { TicketsWithProfile } from './+page.server';

export const columns: ColumnDef<TicketsWithProfile>[] = [
	{
		id: 'select',
		size: 40,
		header: ({ table }) =>
			renderComponent(Checkbox, {
				checked: table.getIsAllPageRowsSelected(),
				indeterminate: table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected(),
				onCheckedChange: (value) => table.toggleAllPageRowsSelected(!!value),
				'aria-label': 'Select all'
			}),
		cell: ({ row }) =>
			renderComponent(Checkbox, {
				checked: row.getIsSelected(),
				onCheckedChange: (value) => row.toggleSelected(!!value),
				'aria-label': 'Select row'
			}),
		enableSorting: false,
		enableHiding: false
	},
	{
		accessorKey: 'id',
		header: 'ID',
		enableSorting: false
	},
	{
		accessorKey: 'title',
		header: ({ column }) =>
			renderComponent(DataTableTitleButton, {
				onclick: column.getToggleSortingHandler()
			})
	},
	{
		accessorKey: 'status',
		header: 'Status',
		cell: (info) => {
			const value = info.getValue() as TicketStatus;
			const text = formatTicketStatusLabel(value);
			const icon = createTicketStatusIcon(value);

			return renderComponent(DataTableCellWithIcon, {
				...icon,
				text,
				additionalClass: 'font-medium'
			});
		},
		filterFn: (row, id, value) => {
			return value.includes(row.getValue(id));
		}
	},
	{
		accessorKey: 'priority',
		header: 'Priority',
		cell: (info) => {
			const value = info.getValue() as TicketPriority;
			const text = formatTicketPriorityLabel(value);
			const icon = createTicketPriorityIcon(value);

			return renderComponent(DataTableCellWithIcon, {
				...icon,
				text,
				additionalClass: 'font-medium'
			});
		},
		filterFn: (row, id, value) => {
			return value.includes(row.getValue(id));
		}
	},
	{
		accessorKey: 'category',
		header: 'Category',
		cell: (info) => {
			const value = info.getValue() as TicketCategory;
			const text = formatTicketCategoryLabel(value);
			const icon = createTicketCategoryIcon(value);

			return renderComponent(DataTableCellWithIcon, {
				...icon,
				text,
				additionalClass: 'font-medium'
			});
		},
		filterFn: (row, id, value) => {
			return value.includes(row.getValue(id));
		}
	},
	{
		accessorKey: 'profiles.full_name',
		header: 'Creator',
		cell: (info) => {
			const value = info.getValue() as string;
			return value;
		}
	},
	{
		accessorKey: 'created_at',
		header: 'Created',
		cell: (info) => {
			const value = info.getValue() as string;
			return dayjs(value).format('DD/MM/YYYY HH:mm');
		}
	},
	{
		id: 'actions',
		header: 'Actions',
		cell: ({ row }) => {
			return renderComponent(DataTableActions, {
				id: row.original.id,
				owner_id: row.original.owner_id
			});
		}
	}
];
