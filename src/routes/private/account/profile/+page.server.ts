import { message, superValidate, withFiles } from 'sveltekit-superforms';
import { zod as zodAdapter } from 'sveltekit-superforms/adapters';
import { error, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { updateProfile, uploadProfileAvatar } from '$lib/db/profile';
import { ProfileSchema } from './schema';
import type { TablesUpdate } from '$lib/database.types';

export const load: PageServerLoad = async ({ locals: { session, profile } }) => {
	if (!session || !profile) throw redirect(303, '/auth/login');

	const form = await superValidate(
		{
			full_name: profile?.full_name ?? '',
			occupation: profile?.occupation ?? ''
		},
		zodAdapter(ProfileSchema)
	);

	return { form, profile };
};

export const actions: Actions = {
	default: async ({ request, locals: { supabase, session, profile, user } }) => {
		const form = await superValidate(request, zodAdapter(ProfileSchema));

		if (!form.valid) return fail(400, withFiles({ form }));
		if (!session || !profile || !user) throw error(401, 'Unauthorized');

		const file = form.data.avatar as File | null;
		let avatar_url: string | undefined;

		if (file && file.size > 0) {
			const { data, error: uploadError } = await uploadProfileAvatar(supabase, user.id, file);

			if (uploadError) {
				form.errors = { avatar: ['Upload failed. Please, try again later.'] };
				return fail(400, withFiles({ form }));
			}

			avatar_url = data?.publicUrl;
		}

		const payload: TablesUpdate<'profiles'> = {
			full_name: form.data.full_name,
			occupation: form.data.occupation,
			...(avatar_url ? { avatar_url } : {})
		};

		const { error: updateError } = await updateProfile(supabase, profile.id, payload);

		if (updateError) {
			form.errors = { full_name: ['Update failed. Please, try again later.'] };
			return fail(400, withFiles({ form }));
		}

		return message(form, 'Form posted successfully!');
	}
};
