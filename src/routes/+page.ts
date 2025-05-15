import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
	const { session, profile } = await parent();

	if (session && profile) {
		redirect(303, ROUTES.private.tickets);
	}

	if (!session || !profile) {
		redirect(303, ROUTES.auth.login);
	}
};
