import { superValidate } from 'sveltekit-superforms';
import { z } from 'zod';
import { zod as zodAdapter } from 'sveltekit-superforms/adapters';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

const LoginSchema = z.object({
	email: z.string().email({ message: 'Invalid email address' }),
	password: z.string().min(6, { message: 'Password must be at least 6 characters' })
});

export const actions: Actions = {
	login: async ({ request, locals: { supabase } }) => {
		const form = await superValidate(request, zodAdapter(LoginSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const { email, password } = form.data;

		const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });

		if (loginError) {
			console.log('Error logging in:', loginError);
			let errorMessage = 'Invalid email or password';

			if (loginError?.message) {
				errorMessage = loginError.message;
			}

			form.errors = {
				password: [errorMessage]
			};

			return fail(400, { form });
		}

		throw redirect(303, '/tickets');
	}
};
