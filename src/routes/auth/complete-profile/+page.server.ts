import { superValidate } from 'sveltekit-superforms';
import { z } from 'zod';
import { zod as zodAdapter } from 'sveltekit-superforms/adapters';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { ROUTES } from '$lib/constants';
import { UserRole } from '$lib/role-manager';

const CompleteProfileSchema = z.object({
	name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
});

export const actions: Actions = {
	completeProfile: async ({ request, locals: { supabase } }) => {
		const form = await superValidate(request, zodAdapter(CompleteProfileSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const {
			data: { user }
		} = await supabase.auth.getUser();

		if (!user) {
			throw redirect(303, ROUTES.auth.login);
		}

		const { error } = await supabase.from('profiles').insert({
			user_id: user.id,
			full_name: form.data.name,
			role: UserRole.User
		});

		if (error) {
			form.errors = { name: ['Failed to complete profile. Try again later.'] };
			return fail(500, { form });
		}

		throw redirect(303, ROUTES.private.tickets);
	}
};
