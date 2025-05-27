import { message, superValidate } from 'sveltekit-superforms';
import { zod as zodAdapter } from 'sveltekit-superforms/adapters';
import { error, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { EmailManagementSchema, PasswordManagementSchema } from './schema';
import { PUBLIC_DOMAIN, PUBLIC_SUPABASE_URL } from '$env/static/public';
import { SUPABASE_SERVICE_ROLE_KEY } from '$env/static/private';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '$lib/database.types';
import { ROUTES } from '$lib/constants';

export const load: PageServerLoad = async () => {
	const passwordForm = await superValidate(
		{
			new_password: '',
			confirm_password: '',
			current_password: ''
		},
		zodAdapter(PasswordManagementSchema)
	);
	const emailForm = await superValidate(
		{
			new_email: ''
		},
		zodAdapter(EmailManagementSchema)
	);

	return { passwordForm, emailForm };
};

export const actions: Actions = {
	password: async ({ request, locals: { supabase, session, user } }) => {
		const form = await superValidate(request, zodAdapter(PasswordManagementSchema));

		if (!form.valid) return fail(400, { form });
		if (!session || !user) throw redirect(401, ROUTES.auth.login);

		const { error: authError } = await supabase.auth.signInWithPassword({
			email: user.email!,
			password: form.data.current_password
		});

		if (authError) {
			form.errors = { current_password: ['Invalid current password'] };
			return fail(400, { form });
		}

		const { error: updateError } = await supabase.auth.updateUser({
			password: form.data.new_password
		});

		if (updateError) {
			form.errors = { current_password: ['Failed to update password. Please, try again later'] };
			return fail(500, { form });
		}

		return message(form, 'Form posted successfully!');
	},

	email: async ({ request, locals: { supabase, session, user } }) => {
		const form = await superValidate(request, zodAdapter(EmailManagementSchema));

		if (!form.valid) return fail(400, { form });
		if (!session || !user) throw redirect(401, ROUTES.auth.login);

		const { error: updateError } = await supabase.auth.updateUser(
			{
				email: form.data.new_email
			},
			{
				emailRedirectTo: `${PUBLIC_DOMAIN}${ROUTES.auth.emailChanging}`
			}
		);

		if (updateError) {
			form.errors = { new_email: ['Failed to update email. Please, try again later'] };
			return fail(500, { form });
		}

		return message(form, { text: 'Form posted successfully!', status: 201 });
	},

	deleteAccount: async ({ locals: { session, user } }) => {
		if (!session || !user) throw redirect(401, ROUTES.auth.login);

		const adminSupabase = createClient<Database>(PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

		const { data: profile } = await adminSupabase
			.from('profiles')
			.select('id')
			.eq('user_id', user.id)
			.single();

		if (profile) {
			const { error: messagesError } = await adminSupabase
				.from('messages')
				.delete()
				.eq('profile_id', profile.id);

			if (messagesError) {
				console.log('Messages deletion error:', messagesError);
			}
		}

		const { error: profileError } = await adminSupabase
			.from('profiles')
			.delete()
			.eq('user_id', user.id);

		if (profileError) {
			console.log('Profile deletion error:', profileError);
		}

		const { error: deleteError } = await adminSupabase.auth.admin.deleteUser(user.id, false);

		if (deleteError) {
			console.log('🚀 ~ deleteAccount: ~ deleteError:', deleteError);
			throw error(500, 'Failed to delete account. Please, try again later');
		}

		throw redirect(303, ROUTES.auth.login);
	}
};
