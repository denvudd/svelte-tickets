import { superValidate } from 'sveltekit-superforms';
import { z } from 'zod';
import { zod as zodAdapter } from 'sveltekit-superforms/adapters';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { UserRoleManager, UserRole } from '$lib/role-manager';
import { zodEnum } from '$lib/utils';
import type { TablesInsert } from '$lib/database.types';

const defaultRoles = UserRoleManager.getAllRolesExcept(UserRole.Admin);

const SignUpSchema = z.object({
	name: z
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
	role: z.enum(zodEnum(defaultRoles), {
		message: 'Role is required'
	})
});

export const actions: Actions = {
	signup: async ({ request, locals: { supabase } }) => {
		const form = await superValidate(request, zodAdapter(SignUpSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const { email, password, role } = form.data;

		const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
			email,
			password
		});
		console.log('🚀 ~ signup: ~ signUpData:', signUpData.session);
		console.log('🚀 ~ signup: ~ signUpData:', signUpData.user);

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
				full_name: form.data.name,
				role: role
			});

		if (profileError) {
			console.log('🚀 ~ signup: ~ profileError:', profileError);

			form.errors = {
				role: ['Account created, but profile setup failed. Please contact support.']
			};

			return fail(400, { form });
		}

		throw redirect(303, '/private');
	}
};
