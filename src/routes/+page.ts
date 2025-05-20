import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { ROUTES } from '$lib/constants';

export const load: PageLoad = async ({ parent }) => {
	const { session, profile } = await parent();

	if (session && profile) {
		redirect(303, ROUTES.private.tickets);
	}

	if (!session || !profile) {
		redirect(303, ROUTES.auth.login);
	}
};
