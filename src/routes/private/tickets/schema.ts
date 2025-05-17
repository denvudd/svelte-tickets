import { TicketCategory, TicketPriority, TicketStatus } from '$lib/constants';
import { zodEnum } from '$lib/utils';
import { z } from 'zod';

export const CreateTicketSchema = z.object({
	title: z
		.string({
			required_error: 'Title is required'
		})
		.min(2, { message: 'Title must be at least 2 characters' })
		.max(255, { message: 'Title must be at most 255 characters' }),
	description: z.string().max(1500, { message: 'Description must be at most 1500 characters' }),
	status: z.enum(zodEnum(Object.values(TicketStatus)), {
		errorMap: () => ({ message: 'Please select a status' })
	}),
	priority: z.enum(zodEnum(Object.values(TicketPriority)), {
		errorMap: () => ({ message: 'Please select a priority' })
	}),
	category: z.enum(zodEnum(Object.values(TicketCategory)), {
		errorMap: () => ({ message: 'Please select a category' })
	})
});

export type CreateTicketSchemaType = typeof CreateTicketSchema;
