import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { session }, url }) => {
	if (!session) throw redirect(303, '/auth/login');

	const message = url.searchParams.get('message');
	const errorDescription = url.searchParams.get('error_description');
	const code = url.searchParams.get('code');

	if (code) {
		redirect(303, '/auth/callback');
	}

	return {
		message,
		errorDescription
	};
};
