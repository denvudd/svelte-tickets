import {
	createTicket,
	deleteTicket,
	editTicket,
	getAllTickets,
	getSingleTicket
} from '$lib/db/tickets';
import { zod as zodAdapter } from 'sveltekit-superforms/adapters';
import { message, superValidate } from 'sveltekit-superforms';
import type { Actions } from './$types.js';
import { CreateTicketSchema } from './schema.js';
import { ROUTES, TicketCategory, TicketPriority, TicketStatus } from '$lib/constants.js';
import { fail, redirect } from '@sveltejs/kit';
import type { TablesInsert, TablesUpdate } from '$lib/database.types.js';

export async function load({ locals: { supabase }, url, depends }) {
	depends('tickets');
	const ticketId = url.searchParams.get('ticketId');

	let ticket = null;

	if (ticketId) {
		const { data: ticketData, error: ticketError } = await getSingleTicket(supabase, ticketId);

		if (ticketError) {
			throw redirect(303, ROUTES.private.tickets);
		}

		ticket = ticketData;
	}

	const { data: tickets } = await getAllTickets(supabase, {
		sort: [{ column: 'created_at', order: 'desc' }]
	});

	const createTicketForm = await superValidate(
		{
			title: ticket?.title || '',
			description: ticket?.description || '',
			status: ticket?.status || TicketStatus.Open,
			priority: ticket?.priority || TicketPriority.Low,
			category: ticket?.category || TicketCategory.Bug
		},
		zodAdapter(CreateTicketSchema)
	);

	return {
		tickets: tickets || [],
		forms: {
			createTicketForm
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

		return message(form, { text: 'Ticket created successfully!', status: 201 });
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

		const { error: ticketError, data } = await editTicket(supabase, ticketId, payload);

		if (ticketError) {
			console.log('🚀 ~ editTicket: ~ ticketError:', ticketError);
			form.errors = { title: ['Failed to edit ticket. Please, try again later.'] };
			return fail(500, { form });
		}

		return message(form, { text: 'Ticket edited successfully!', status: 200 });
	},

	deleteTicket: async ({ locals: { supabase }, url }) => {
		const ticketIdParam = url.searchParams.get('ticketId');

		if (!ticketIdParam) {
			return {
				text: 'Invalid ticket ID',
				status: 500
			};
		}

		if (ticketIdParam.includes(',')) {
			const ticketIds = ticketIdParam
				.split(',')
				.map((id) => id.trim())
				.filter((id) => id.length > 0);

			if (ticketIds.length === 0) {
				return;
			}

			const { error: ticketError } = await deleteTicket(supabase, ticketIds);

			if (ticketError) {
				console.log('🚀 ~ deleteTicket: ~ ticketError:', ticketError);
				return { text: 'Failed to delete tickets', status: 500 };
			}
		} else {
			const { error: ticketError } = await deleteTicket(supabase, ticketIdParam);

			if (ticketError) {
				console.log('🚀 ~ deleteTicket: ~ ticketError:', ticketError);
				return { text: 'Failed to delete ticket', status: 500 };
			}
		}

		return { text: 'Ticket deleted successfully!', status: 200 };
	}
};
