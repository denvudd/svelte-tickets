import { UserRole } from '$lib/role-manager';

export const USER_ROLES_DESCRIPTION = [
	{
		role: UserRole.User,
		label: 'User',
		description: [
			'Can create new tickets, view only their own tickets, edit them up to the first agent comment, add comments within their own ticket.',
			"Cannot see other people's tickets and cannot change statuses."
		]
	},
	{
		role: UserRole.Agent,
		label: 'Agent',
		description: [
			'Sees all open tickets, can change their status, add comments to any ticket, and assign priorities.',
			'Has access to filtering/pagination of all queries.'
		]
	}
];
