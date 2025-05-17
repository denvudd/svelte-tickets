import type { Tables, TablesInsert, TablesUpdate } from '$lib/database.types';
import type {
	PostgrestResponse,
	PostgrestSingleResponse,
	SupabaseClient
} from '@supabase/supabase-js';

export const getAllTickets = async (
	supabase: SupabaseClient,
	options?: {
		filters?: {
			column: string;
			operator: 'eq' | 'neq' | 'gt' | 'lt' | 'gte' | 'lte' | 'like' | 'ilike' | 'in' | 'is';
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			value: any;
		}[];
		sort?: {
			column: string;
			order?: 'asc' | 'desc';
		}[];
		limit?: number;
		offset?: number;
	}
) => {
	let query = supabase.from('tickets').select('*');

	if (options?.filters && options.filters.length > 0) {
		options.filters.forEach((filter) => {
			if (filter.operator === 'eq') {
				query = query.eq(filter.column, filter.value);
			} else if (filter.operator === 'neq') {
				query = query.neq(filter.column, filter.value);
			} else if (filter.operator === 'gt') {
				query = query.gt(filter.column, filter.value);
			} else if (filter.operator === 'lt') {
				query = query.lt(filter.column, filter.value);
			} else if (filter.operator === 'gte') {
				query = query.gte(filter.column, filter.value);
			} else if (filter.operator === 'lte') {
				query = query.lte(filter.column, filter.value);
			} else if (filter.operator === 'like') {
				query = query.like(filter.column, filter.value);
			} else if (filter.operator === 'ilike') {
				query = query.ilike(filter.column, filter.value);
			} else if (filter.operator === 'in') {
				query = query.in(filter.column, filter.value);
			} else if (filter.operator === 'is') {
				query = query.is(filter.column, filter.value);
			}
		});
	}

	if (options?.sort && options.sort.length > 0) {
		options.sort.forEach((sort) => {
			query = query.order(sort.column, { ascending: sort.order !== 'desc' });
		});
	}

	if (options?.limit) {
		query = query.limit(options.limit);
	}

	if (options?.offset) {
		query = query.range(options.offset, options.offset + (options?.limit || 10) - 1);
	}

	const { data: tickets }: PostgrestResponse<Tables<'tickets'>> = await query;

	return tickets;
};

export const getSingleTicket = async (supabase: SupabaseClient, id: string) => {
	const response: PostgrestSingleResponse<Tables<'tickets'>> = await supabase
		.from('tickets')
		.select('*')
		.eq('id', id)
		.single();

	return response;
};

export const createTicket = async (supabase: SupabaseClient, data: TablesInsert<'tickets'>) => {
	const response: PostgrestSingleResponse<Tables<'tickets'>> = await supabase
		.from('tickets')
		.insert(data)
		.eq('id', data.owner_id)
		.select('*')
		.single();

	return response;
};

export const editTicket = async (
	supabase: SupabaseClient,
	id: string,
	data: TablesUpdate<'tickets'>
): Promise<PostgrestSingleResponse<Tables<'tickets'>>> => {
	const response = await supabase.from('tickets').update(data).eq('id', id).select('*').single();

	return response;
};

export const deleteTicket = async (
	supabase: SupabaseClient,
	id: string | string[]
): Promise<PostgrestSingleResponse<null>> => {
	console.log('🚀 ~ id:', id);
	let response;

	if (Array.isArray(id)) {
		response = await supabase.from('tickets').delete().in('id', id).select('*');
	} else {
		response = await supabase.from('tickets').delete().eq('id', id).select('*').single();
	}

	return response;
};
