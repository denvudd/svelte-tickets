import Circle from '@lucide/svelte/icons/circle';
import CircleDashed from '@lucide/svelte/icons/circle-dashed';
import Ban from '@lucide/svelte/icons/ban';

import SignalLowIcon from '@lucide/svelte/icons/signal-low';
import SignalMediumIcon from '@lucide/svelte/icons/signal-medium';
import SignalHighIcon from '@lucide/svelte/icons/signal-high';

import BugIcon from '@lucide/svelte/icons/bug';
import GitBranchIcon from '@lucide/svelte/icons/git-branch';
import CircleHelpIcon from '@lucide/svelte/icons/circle-help';

export const OAUTH_PROVIDERS = ['google'];

export const ROUTES = {
	private: {
		tickets: '/private/tickets',
		projects: '/private/projects',
		messages: '/private/messages',
		account: {
			profile: '/private/account/profile',
			settings: '/private/account/settings',
			appearence: '/private/account/appearance'
		}
	},
	auth: {
		login: '/auth/login',
		signUp: '/auth/sign-up',
		completeProfile: '/auth/complete-profile',
		checkEmail: '/auth/check-email',
		forgotPassword: '/auth/forgot-password',
		resetPassword: '/auth/reset-password',
		callback: '/auth/callback',
		confirm: '/auth/confirm',
		emailChanging: '/auth/email-changing',
		error: '/auth/error'
	}
} as const;

export enum TicketStatus {
	Open = 'open',
	InProgress = 'in_progress',
	Closed = 'closed'
}

export enum TicketPriority {
	Low = 'low',
	Medium = 'medium',
	High = 'high'
}

export enum TicketCategory {
	Bug = 'bug',
	Feature = 'feature',
	Question = 'question'
}

export const TICKETS_STATUS_OPTIONS = [
	{
		value: TicketStatus.Open,
		label: 'Open',
        Icon: Circle,
        iconColor: "text-green-500",
	},
	{
		value: TicketStatus.InProgress,
		label: 'In Progress',
        Icon: CircleDashed,
        iconColor: "text-yellow-500",
	},
	{
		value: TicketStatus.Closed,
		label: 'Closed',
        Icon: Ban,
        iconColor: "text-red-500",
	}
];

export const TICKET_PRIORITY_OPTIONS = [
	{
		value: TicketPriority.Low,
		label: 'Low',
        Icon: SignalLowIcon,
        iconColor: "text-green-500",
	},
	{
		value: TicketPriority.Medium,
		label: 'Medium',
        Icon: SignalMediumIcon,
        iconColor: "text-yellow-500",
	},
	{
		value: TicketPriority.High,
		label: 'High',
        Icon: SignalHighIcon,
        iconColor: "text-red-500",
	}
];

export const TICKET_CATEGORY_OPTIONS = [
	{
		value: TicketCategory.Bug,
		label: 'Bug',
         Icon: BugIcon,
        iconColor: "text-red-500",
	},
	{
		value: TicketCategory.Feature,
		label: 'Feature',
         Icon: GitBranchIcon,
        iconColor: "text-green-500",
	},
	{
		value: TicketCategory.Question,
		label: 'Question',
         Icon: CircleHelpIcon,
        iconColor: "text-yellow-500",
	}
];
