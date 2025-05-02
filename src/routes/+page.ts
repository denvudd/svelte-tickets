import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
	const { session, profile } = await parent();

	if (session && profile) {
		redirect(303, '/private/tickets');
	}

	if (!session || !profile) {
		redirect(303, '/auth/login');
	}
};
