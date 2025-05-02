import { redirect } from '@sveltejs/kit';

export const GET = async ({ url, locals: { supabase } }) => {
	const code = url.searchParams.get('code');

	if (code) {
		const { error } = await supabase.auth.exchangeCodeForSession(code);

		if (error) {
			console.error('OAuth callback error:', error.message);
			throw redirect(303, '/auth/error');
		}
	}

	const {
		data: { user }
	} = await supabase.auth.getUser();

	if (!user) {
		throw redirect(303, '/auth/login');
	}

	const { data: profile } = await supabase
		.from('profiles')
		.select('id')
		.eq('user_id', user.id)
		.single();

	if (!profile) {
		throw redirect(303, '/auth/complete-profile');
	}

	throw redirect(303, '/private/tickets');
};
