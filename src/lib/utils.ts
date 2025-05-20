import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Database, TablesInsert, TablesUpdate } from './database.types';
import { TicketCategory, TicketPriority, TicketStatus } from './constants';

import Circle from '@lucide/svelte/icons/circle';
import CircleDashed from '@lucide/svelte/icons/circle-dashed';
import Ban from '@lucide/svelte/icons/ban';

import SignalLowIcon from '@lucide/svelte/icons/signal-low';
import SignalMediumIcon from '@lucide/svelte/icons/signal-medium';
import SignalHighIcon from '@lucide/svelte/icons/signal-high';

import BugIcon from '@lucide/svelte/icons/bug';
import GitBranchIcon from '@lucide/svelte/icons/git-branch';
import CircleHelpIcon from '@lucide/svelte/icons/circle-help';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const zodEnum = <T>(arr: T[]): [T, ...T[]] => arr as [T, ...T[]];

type DefaultSchema = Database[Extract<keyof Database, 'public'>];

type TableKeys = keyof DefaultSchema['Tables'];

export type TablesInsertWithoutId<T extends TableKeys> = Omit<TablesInsert<T>, 'id'>;
export type TablesUpdateWithoutId<T extends TableKeys> = Omit<TablesUpdate<T>, 'id'>;

export type SelectQueryOptions = {
	filters?: {
		column: string;
		operator: 'eq' | 'neq' | 'gt' | 'lt' | 'gte' | 'lte' | 'like' | 'ilike' | 'in' | 'is' | 'not';
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		value: any;
	}[];
	sort?: {
		column: string;
		order?: 'asc' | 'desc';
	}[];
	select?: string;
	limit?: number;
	offset?: number;
};

export const formatTicketStatusLabel = (status: TicketStatus) => {
	switch (status) {
		case TicketStatus.Open:
			return 'Open';
		case TicketStatus.InProgress:
			return 'In Progress';
		case TicketStatus.Closed:
			return 'Closed';
	}
};

export const createTicketStatusIcon = (status: TicketStatus) => {
	switch (status) {
		case TicketStatus.Open:
			return {
				Icon: Circle,
				iconColor: 'text-green-500'
			};
		case TicketStatus.InProgress:
			return {
				Icon: CircleDashed,
				iconColor: 'text-yellow-500'
			};
		case TicketStatus.Closed:
			return {
				Icon: Ban,
				iconColor: 'text-red-500'
			};
	}
};

export const formatTicketPriorityLabel = (status: TicketPriority) => {
	switch (status) {
		case TicketPriority.Low:
			return 'Low';
		case TicketPriority.Medium:
			return 'Medium';
		case TicketPriority.High:
			return 'High';
	}
};

export const createTicketPriorityIcon = (status: TicketPriority) => {
	switch (status) {
		case TicketPriority.Low:
			return {
				Icon: SignalLowIcon,
				iconColor: 'text-green-500'
			};
		case TicketPriority.Medium:
			return {
				Icon: SignalMediumIcon,
				iconColor: 'text-yellow-500'
			};
		case TicketPriority.High:
			return {
				Icon: SignalHighIcon,
				iconColor: 'text-red-500'
			};
	}
};

export const formatTicketCategoryLabel = (status: TicketCategory) => {
	switch (status) {
		case TicketCategory.Bug:
			return 'Bug';
		case TicketCategory.Feature:
			return 'Feature';
		case TicketCategory.Question:
			return 'Question';
	}
};

export const createTicketCategoryIcon = (status: TicketCategory) => {
	switch (status) {
		case TicketCategory.Bug:
			return {
				Icon: BugIcon,
				iconColor: 'text-red-500'
			};
		case TicketCategory.Feature:
			return {
				Icon: GitBranchIcon,
				iconColor: 'text-green-500'
			};
		case TicketCategory.Question:
			return {
				Icon: CircleHelpIcon,
				iconColor: 'text-yellow-500'
			};
	}
};
