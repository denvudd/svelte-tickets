<script lang="ts">
	import ColorThemeToggle from '$lib/components/color-theme-toggle.svelte';
	import HeaderProfileDropdown from './header-profile-dropdown.svelte';
	import TicketIcon from '@lucide/svelte/icons/ticket';
	import type { Tables } from '$lib/database.types';
	import { ROUTES } from '$lib/constants';
	import * as m from '$lib/paraglide/messages.js';
	import LanguageSwitcher from '../language-switcher.svelte';

	interface Props {
		handleLogout: () => Promise<void>;
		profile: Tables<'profiles'> | null;
	}

	let { handleLogout, profile }: Props = $props();
</script>

<header class="border-accent w-full border-b py-4">
	<div class="container flex items-center justify-between gap-8">
		<nav>
			{#if profile}
				<ul class="flex items-center gap-4">
					<li class="text-sm font-medium">
						<a href={ROUTES.private.tickets} class="flex items-center gap-2">
							<TicketIcon class="h-4 w-4" />
							{m.header_tickets()}
						</a>
					</li>
				</ul>
			{/if}
		</nav>
		<div class="flex items-center gap-2">
			<div class="flex items-center">
				<LanguageSwitcher />
				<ColorThemeToggle />
			</div>
			{#if profile}
				<div class="flex items-center gap-2">
					{#if profile.full_name}
						<span class="font-medium">{profile.full_name}</span>
					{/if}
					<HeaderProfileDropdown {handleLogout} {profile} />
				</div>
			{:else}
				<nav>
					<ul class="flex items-center gap-4">
						<li class="text-sm font-medium"><a href={ROUTES.auth.login}>{m.header_login()}</a></li>
						<li class="text-sm font-medium">
							<a href={ROUTES.auth.signUp}>{m.header_signup()}</a>
						</li>
					</ul>
				</nav>
			{/if}
		</div>
	</div>
</header>
