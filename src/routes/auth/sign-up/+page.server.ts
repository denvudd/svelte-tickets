import { superValidate } from 'sveltekit-superforms';
import { z } from 'zod';
import { zod as zodAdapter } from 'sveltekit-superforms/adapters';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { UserRole } from '$lib/role-manager';
import type { TablesInsert } from '$lib/database.types';
import { OAUTH_PROVIDERS } from '$lib/constants';
import type { Provider } from '@supabase/supabase-js';
import { ROUTES } from '$lib/constants';
import { PUBLIC_DOMAIN } from '$env/static/public';


const SignUpSchema = z.object({
	full_name: z
		.string({
			required_error: 'Name is required'
		})
		.min(2, { message: 'Name must be at least 2 characters' }),
	email: z
		.string({
			required_error: 'Email is required'
		})
		.email({ message: 'Invalid email address' }),
	password: z
		.string({
			required_error: 'Password is required'
		})
		.min(6, { message: 'Password must be at least 6 characters' }),
});

export const actions: Actions = {
	signup: async ({ request, locals: { supabase }, url }) => {
		const form = await superValidate(request, zodAdapter(SignUpSchema));

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
					redirectTo: `${PUBLIC_DOMAIN}${ROUTES.auth.callback}`
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

		const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
			email,
			password
		});

		if (signUpError || !signUpData.user) {
			console.error('Error signing up:', signUpError);

			let errorMessage = 'Invalid email or password';

			if (signUpError?.message) {
				errorMessage = signUpError.message;
			}

			form.errors = {
				email: [errorMessage],
				password: [errorMessage]
			};

			return fail(400, { form });
		}

		const userId = signUpData.user.id;

		const { error: profileError } = await supabase
			.from('profiles')
			.insert<TablesInsert<'profiles'>>({
				user_id: userId,
				full_name: form.data.full_name,
				role: UserRole.User,
			});

		if (profileError) {
			console.log('🚀 ~ signup: ~ profileError:', profileError);

			form.errors = {
				password: ['Account created, but profile setup failed. Please contact support.']
			};

			return fail(400, { form });
		}

		throw redirect(303, `${ROUTES.auth.checkEmail}?reason=verify-email`);
	}
};
