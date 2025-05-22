import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const reason = url.searchParams.get('reason');

	return {
		reason
	};
};
