import { superValidate } from 'sveltekit-superforms';
import { z } from 'zod';
import { zod as zodAdapter } from 'sveltekit-superforms/adapters';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import type { Provider } from '@supabase/supabase-js';
import { OAUTH_PROVIDERS } from '$lib/constants';

const LoginSchema = z.object({
	email: z.string().email({ message: 'Invalid email address' }),
	password: z.string().min(6, { message: 'Password must be at least 6 characters' })
});

export const actions: Actions = {
	login: async ({ request, locals: { supabase }, url }) => {
		const form = await superValidate(request, zodAdapter(LoginSchema));
		const provider = url.searchParams.get('provider') as Provider;

		if (provider) {
			if (!OAUTH_PROVIDERS.includes(provider)) {
				return fail(400, {
					error: 'Provider not supported.'
				});
			}

			const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
				provider: provider, 
				options: {
					redirectTo: 'http://localhost:5173/auth/callback'
				}
			});

			if (oauthError) {
				console.log('Error logging in via oauth:', oauthError);
				let errorMessage = 'Something went wrong. Please try again.';

				if (oauthError?.message) {
					errorMessage = oauthError.message;
				}

				form.errors = {
					password: [errorMessage]
				};

				return fail(400, { form });
			}

			throw redirect(303, data.url);
		}

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

		throw redirect(303, '/private/tickets');
	}
};
