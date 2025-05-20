import type { Tables, TablesInsert } from '$lib/database.types';
import type { SelectQueryOptions } from '$lib/utils';
import type { PostgrestSingleResponse, SupabaseClient } from '@supabase/supabase-js';

export const getMessagesList = async <Response = Tables<'messages'>>(
	supabase: SupabaseClient,
	options?: SelectQueryOptions
): Promise<PostgrestSingleResponse<Response[]>> => {
	const selectStr = options?.select || '*';

	let query = supabase.from('messages').select(selectStr as '*'); // https://github.com/supabase/supabase-js/issues/551

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
			} else if (filter.operator === 'not') {
				query = query.not(filter.column, 'eq', filter.value);
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

	const response: PostgrestSingleResponse<Response[]> = await query;

	return response;
};

export const createMessage = async (supabase: SupabaseClient, data: TablesInsert<'messages'> | TablesInsert<'messages'>[]) => {
	const response: PostgrestSingleResponse<Tables<'messages'>> = await supabase
		.from('messages')
		.insert(data)
		.select('*')
		.single();

	return response;
};

export const deleteMessage = async (
    supabase: SupabaseClient,
    id: string | string[]
): Promise<PostgrestSingleResponse<null>> => {
    let response;

    if (Array.isArray(id)) {
        response = await supabase.from('messages').delete().in('id', id);
    } else {
        response = await supabase.from('messages').delete().eq('id', id);
    }

    return response;
};