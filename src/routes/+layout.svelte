<script lang="ts">
	import { onMount } from 'svelte';
	import { ParaglideJS } from '@inlang/paraglide-sveltekit';
	import { i18n } from '$lib/i18n';
	import { goto, invalidate } from '$app/navigation';
	import { ModeWatcher } from 'mode-watcher';
	import Header from '$lib/components/layout/header.svelte';
	import '../app.css';
	import { Toaster } from '$lib/components/ui/sonner';
	import { ROUTES } from '$lib/constants';

	let { data, children } = $props();
	let { session, supabase, profile } = $derived(data);

	onMount(() => {
		const { data: authStateListener } = supabase.auth.onAuthStateChange((authEvent, newSession) => {
			if (newSession?.expires_at !== session?.expires_at) {
				invalidate('supabase:auth');
			}
		});

		return () => authStateListener.subscription.unsubscribe();
	});

	const handleLogout = async () => {
		const { error } = await supabase.auth.signOut();

		if (error) {
			console.error('🚀 ~ handleLogout ~ error:', error);
			return;
		}

		goto(ROUTES.auth.login);
	};
</script>

<ParaglideJS {i18n}>
	<ModeWatcher />
	<Toaster closeButton richColors />
	<Header {handleLogout} {profile} />
	<div class="flex h-[calc(100vh-73px)] w-full">
		{@render children()}
	</div>
</ParaglideJS>
