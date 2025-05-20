import { nanoid } from 'nanoid';
import type { Tables, TablesUpdate } from '$lib/database.types';
import type { PostgrestSingleResponse, SupabaseClient } from '@supabase/supabase-js';
import type { SelectQueryOptions } from '$lib/utils';

export async function updateProfile(
	supabase: SupabaseClient,
	profileId: string,
	data: TablesUpdate<'profiles'>
) {
	const response: PostgrestSingleResponse<Tables<'profiles'>> = await supabase
		.from('profiles')
		.update(data)
		.eq('id', profileId)
		.select()
		.single();

	return response;
}

export async function uploadProfileAvatar(supabase: SupabaseClient, userId: string, file: File) {
	const fileExt = file.name.split('.').pop();
	const fileName = nanoid();
	const filePath = `${userId}/${fileName}.${fileExt}`;

	const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, {
		upsert: true,
		contentType: file.type
	});

	if (uploadError) return { error: uploadError };

	const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);

	return { data: urlData, error: null };
}

export const getProfileList = async <Response = Tables<'profiles'>>(
	supabase: SupabaseClient,
	options?: SelectQueryOptions
): Promise<PostgrestSingleResponse<Response[]>> => {
	const selectStr = options?.select || '*';

	let query = supabase.from('profiles').select(selectStr as '*'); // https://github.com/supabase/supabase-js/issues/551

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
