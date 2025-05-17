import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { ROUTES } from '$lib/constants';

export const load: PageServerLoad = async ({ locals: { session }, url }) => {
	if (!session) throw redirect(303, ROUTES.auth.login);

	const message = url.searchParams.get('message');
	const errorDescription = url.searchParams.get('error_description');
	const code = url.searchParams.get('code');

	if (code) {
		redirect(303, ROUTES.auth.callback);
	}

	return {
		message,
		errorDescription
	};
};
