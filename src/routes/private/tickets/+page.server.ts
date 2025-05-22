import {
	createTicket,
	deleteTicket,
	editTicket,
	getAllTickets,
	getSingleTicket
} from '$lib/db/tickets';
import { zod as zodAdapter, type Infer } from 'sveltekit-superforms/adapters';
import { message, superValidate } from 'sveltekit-superforms';
import type { Actions } from './$types.js';
import { CreateTicketSchema, type CreateTicketSchemaType } from './schema.js';
import { ROUTES, TicketCategory, TicketPriority, TicketStatus } from '$lib/constants.js';
import { fail, redirect } from '@sveltejs/kit';
import type { Tables, TablesInsert, TablesUpdate } from '$lib/database.types.js';
import type { SelectQueryOptions } from '$lib/utils.js';

export type TicketsWithProfile = Tables<'tickets'> & {
	profiles: Tables<'profiles'>;
};

export async function load({ locals: { supabase, profile }, url, depends }) {
	depends('tickets');

	if (!profile) throw redirect(303, ROUTES.auth.login);

	const page = parseInt(url.searchParams.get('page') || '1');
	const pageSize = parseInt(url.searchParams.get('pageSize') || '10');

	const offset = (page - 1) * pageSize;

	const ticketId = url.searchParams.get('ticketId');

	const statusFilters = url.searchParams.getAll('status');
	const priorityFilters = url.searchParams.getAll('priority');
	const categoryFilters = url.searchParams.getAll('category');
	const titleFilter = url.searchParams.get('title');

	let ticket = null;

	if (ticketId) {
		const { data: ticketData, error: ticketError } = await getSingleTicket<TicketsWithProfile>(
			supabase,
			ticketId,
			'id, title, description, status, priority, category, created_at, owner_id, profiles!tickets_owner_id_fkey(id, full_name)'
		);

		if (ticketError) {
			throw redirect(303, ROUTES.private.tickets);
		}

		ticket = ticketData;
	}

	let countQuery = supabase.from('tickets').select('*', { count: 'exact', head: true });

	if (statusFilters.length > 0) {
		countQuery = countQuery.in('status', statusFilters);
	}
	if (priorityFilters.length > 0) {
		countQuery = countQuery.in('priority', priorityFilters);
	}
	if (categoryFilters.length > 0) {
		countQuery = countQuery.in('category', categoryFilters);
	}
	if (titleFilter) {
		countQuery = countQuery.ilike('title', `%${titleFilter}%`);
	}

	const { count } = await countQuery;

	const filters: SelectQueryOptions['filters'] = [];

	if (statusFilters.length > 0) {
		filters.push({
			column: 'status',
			operator: 'in',
			value: statusFilters
		});
	}

	if (priorityFilters.length > 0) {
		filters.push({
			column: 'priority',
			operator: 'in',
			value: priorityFilters
		});
	}

	if (categoryFilters.length > 0) {
		filters.push({
			column: 'category',
			operator: 'in',
			value: categoryFilters
		});
	}

	if (titleFilter) {
		filters.push({
			column: 'title',
			operator: 'ilike',
			value: `%${titleFilter}%`
		});
	}

	console.log('🚀 ~ load ~ filters:', filters);

	const { data: tickets } = await getAllTickets<TicketsWithProfile>(supabase, {
		select:
			'id, title, description, status, priority, category, created_at, owner_id, profiles!tickets_owner_id_fkey(id, full_name)',
		sort: [{ column: 'created_at', order: 'desc' }],
		limit: pageSize,
		offset: offset,
		filters: filters
	});
	console.log('🚀 ~ load ~ tickets:', tickets);

	const isEditableTicket = ticketId ? ticket && ticket.owner_id === profile.id : true;

	const createTicketForm = await superValidate(
		{
			title: ticket?.title || '',
			description: ticket?.description || '',
			status: ticket?.status || TicketStatus.Open,
			priority: ticket?.priority || TicketPriority.Low,
			category: ticket?.category || TicketCategory.Bug,
			author: ticket?.profiles.full_name,
			_authorId: ticket?.profiles.id,
			_isEditable: isEditableTicket
		} as Infer<CreateTicketSchemaType>,
		zodAdapter(CreateTicketSchema)
	);

	return {
		tickets: tickets || [],
		totalCount: count || 0,
		currentPage: page,
		pageSize,
		forms: {
			createTicketForm
		},
		appliedFilters: {
			status: statusFilters,
			priority: priorityFilters,
			category: categoryFilters,
			title: titleFilter
		}
	};
}

export const actions: Actions = {
	createTicket: async ({ request, locals: { supabase, profile } }) => {
		if (!profile) throw redirect(303, ROUTES.auth.login);

		const form = await superValidate(request, zodAdapter(CreateTicketSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const payload: TablesInsert<'tickets'> = {
			owner_id: profile.id,
			title: form.data.title,
			status: form.data.status,
			priority: form.data.priority,
			category: form.data.category
		};

		const { error: ticketError } = await createTicket(supabase, payload);

		if (ticketError) {
			console.log('🚀 ~ createTicket: ~ ticketError:', ticketError);
			form.errors = { title: ['Failed to create ticket. Please, try again later.'] };
			return fail(500, { form });
		}

		return message(form, { message: 'Ticket created successfully!', status: 201 });
	},

	editTicket: async ({ request, locals: { supabase, profile }, url }) => {
		if (!profile) throw redirect(303, ROUTES.auth.login);

		const form = await superValidate(request, zodAdapter(CreateTicketSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const ticketId = url.searchParams.get('ticketId');

		if (!ticketId) {
			return fail(400, { form });
		}

		const payload: TablesUpdate<'tickets'> = {
			title: form.data.title,
			description: form.data.description,
			status: form.data.status,
			priority: form.data.priority,
			category: form.data.category
		};

		const { error: ticketError } = await editTicket(supabase, ticketId, payload);

		if (ticketError) {
			console.log('🚀 ~ editTicket: ~ ticketError:', ticketError);
			form.errors = { title: ['Failed to edit ticket. Please, try again later.'] };
			return fail(500, { form });
		}

		return message(form, { message: 'Ticket edited successfully!', status: 200 });
	},

	deleteTicket: async ({ locals: { supabase, profile }, url }) => {
		if (!profile) throw redirect(303, ROUTES.auth.login);

		const ticketIdParam = url.searchParams.get('ticketId');

		if (!ticketIdParam) {
			return fail(404, {
				message: 'Ticket not found'
			});
		}

		if (ticketIdParam.includes(',')) {
			const ticketIds = ticketIdParam
				.split(',')
				.map((id) => id.trim())
				.filter((id) => id.length > 0);

			if (ticketIds.length === 0) {
				return;
			}

			const { data: tickets } = await getAllTickets(supabase, {
				select: 'owner_id',
				filters: [
					{
						column: 'id',
						operator: 'in',
						value: ticketIds
					}
				]
			});

			if (!tickets || tickets.length === 0) {
				return fail(404, {
					message: 'Tickets not found'
				});
			}

			const isCurrentProfileOwner = tickets?.some((ticket) => ticket.owner_id === profile.id);

			if (!isCurrentProfileOwner) {
				return fail(403, {
					message: 'You cannot delete tickets that are not yours.'
				});
			}

			const { error: ticketError } = await deleteTicket(supabase, ticketIds);

			if (ticketError) {
				console.log('🚀 ~ deleteTicket (multiple): ~ ticketError:', ticketError);
				return fail(500, {
					message: 'Failed to delete tickets'
				});
			}
		} else {
			const { data: ticket } = await getSingleTicket(supabase, ticketIdParam);

			if (!ticket) {
				return fail(404, {
					message: 'Ticket not found'
				});
			}

			const isCurrentProfileOwner = ticket.owner_id === profile.id;

			if (!isCurrentProfileOwner) {
				return fail(403, {
					message: 'You cannot delete tickets that are not yours.'
				});
			}

			const { error: ticketError } = await deleteTicket(supabase, ticketIdParam);

			if (ticketError) {
				console.log('🚀 ~ deleteTicket: ~ ticketError:', ticketError);
				return fail(500, {
					message: 'Failed to delete ticket'
				});
			}
		}

		return { message: 'Ticket deleted successfully!' };
	}
};
