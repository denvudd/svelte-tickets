import { superValidate } from 'sveltekit-superforms';
import { z } from 'zod';
import { zod as zodAdapter } from 'sveltekit-superforms/adapters';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { ROUTES } from '$lib/constants';

const ResetPasswordSchema = z
	.object({
		password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
		confirmPassword: z.string().min(6, { message: 'Password must be at least 6 characters' })
	})
	.refine((data) => data.password === data.confirmPassword, {
		path: ['confirmPassword'],
		message: 'Passwords do not match'
	});

export const actions: Actions = {
	resetPassword: async ({ request, locals: { supabase } }) => {
		const form = await superValidate(request, zodAdapter(ResetPasswordSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const { password } = form.data;

		const { error: resetPasswordError } = await supabase.auth.updateUser({ password });

		if (resetPasswordError) {
			console.log('Error reset password:', resetPasswordError);
			let errorMessage = 'Something went wrong. Please try again.';

			if (resetPasswordError?.message) {
				errorMessage = resetPasswordError.message;
			}

			form.errors = {
				confirmPassword: [errorMessage]
			};

			return fail(400, { form });
		}

		throw redirect(303, ROUTES.private.tickets);
	}
};
