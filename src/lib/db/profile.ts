import { nanoid } from 'nanoid';
import type { Tables, TablesUpdate } from '$lib/database.types';
import type { PostgrestSingleResponse, SupabaseClient } from '@supabase/supabase-js';

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
