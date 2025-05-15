import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { ROUTES } from '$lib/routes';

export const load: PageServerLoad = async ({ url, locals: { session } }) => {
    if (!session) {
        throw redirect(303, ROUTES.auth.login);
    }

	const reason = url.searchParams.get('reason');

	return {
		reason
	};
};
