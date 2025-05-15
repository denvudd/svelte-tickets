import { createServerClient } from '@supabase/ssr';
import { type Handle, redirect } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { i18n } from '$lib/i18n';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import type { Database, Tables } from '$lib/database.types';
import type { PostgrestSingleResponse } from '@supabase/supabase-js';
import { ROUTES } from '$lib/routes';

/**
 * Supabase init hook: creates a server client per request
 */
const supabaseInit: Handle = async ({ event, resolve }) => {
	event.locals.supabase = createServerClient<Database>(
		PUBLIC_SUPABASE_URL,
		PUBLIC_SUPABASE_ANON_KEY,
		{
			cookies: {
				getAll: () => event.cookies.getAll(),
				setAll: (cookiesToSet) => {
					cookiesToSet.forEach(({ name, value, options }) => {
						event.cookies.set(name, value, { ...options, path: '/' });
					});
				}
			}
		}
	);

	// Safe session retrieval and JWT validation
	event.locals.safeGetSession = async () => {
		const {
			data: { session }
		} = await event.locals.supabase.auth.getSession();

		if (!session) return { session: null, user: null };

		const {
			data: { user },
			error
		} = await event.locals.supabase.auth.getUser();

		if (error) return { session: null, user: null };

		return { session, user };
	};

	return resolve(event, {
		filterSerializedResponseHeaders: (name) =>
			name === 'content-range' || name === 'x-supabase-api-version'
	});
};

/**
 * Auth guard hook: protect routes under /private and redirect
 */
const authGuard: Handle = async ({ event, resolve }) => {
	const { session, user } = await event.locals.safeGetSession();
	event.locals.session = session;
	event.locals.user = user;

	if (!session && event.url.pathname.startsWith('/private')) {
		throw redirect(303, ROUTES.auth.login);
	}

	if (session && event.url.pathname === ROUTES.auth.login) {
		throw redirect(303, ROUTES.private.tickets);
	}

	const profile: PostgrestSingleResponse<Tables<'profiles'>> = await event.locals.supabase
		.from('profiles')
		.select('*')
		.eq('user_id', user?.id)
		.single();

	event.locals.profile = profile.data;

	if (
		session &&
		event.url.pathname !== ROUTES.auth.completeProfile &&
		(!profile.data?.full_name || !profile.data?.role)
	) {
		throw redirect(303, ROUTES.auth.completeProfile);
	}

	return resolve(event);
};

const i18nHandle = i18n.handle();

export const handle: Handle = sequence(supabaseInit, authGuard, i18nHandle);
