import { superValidate } from 'sveltekit-superforms';
import { z } from 'zod';
import { zod as zodAdapter } from 'sveltekit-superforms/adapters';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { ROUTES } from '$lib/constants';

const ForgotPasswordSchema = z.object({
	email: z.string().email({ message: 'Invalid email address' })
});

export const actions: Actions = {
	forgotPassword: async ({ request, locals: { supabase } }) => {
		const form = await superValidate(request, zodAdapter(ForgotPasswordSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const { email } = form.data;

		const { error: forgotPasswordError } = await supabase.auth.resetPasswordForEmail(email, {
			redirectTo: 'http://localhost:5173/auth/reset-password'
		});

		if (forgotPasswordError) {
			console.log('Error forgot password:', forgotPasswordError);
			let errorMessage = 'Something went wrong. Please try again.';

			if (forgotPasswordError?.message) {
				errorMessage = forgotPasswordError.message;
			}

			form.errors = {
				email: [errorMessage]
			};

			return fail(400, { form });
		}

		throw redirect(303, `${ROUTES.auth.checkEmail}?reason=forgot-password`);
	}
};
