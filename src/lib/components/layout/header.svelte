<script lang="ts">
	import ColorThemeToggle from '$lib/components/color-theme-toggle.svelte';
	import HeaderProfileDropdown from './header-profile-dropdown.svelte';
	import TicketIcon from '@lucide/svelte/icons/ticket';
	import PresentationIcon from '@lucide/svelte/icons/presentation';
	import type { Tables } from '$lib/database.types';
	import { ROUTES } from '$lib/constants';

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
							Tickets
						</a>
					</li>
					<li class="text-sm font-medium">
						<a href={ROUTES.private.projects} class="flex items-center gap-2">
							<PresentationIcon class="h-4 w-4" />
							Projects
						</a>
					</li>
				</ul>
			{/if}
		</nav>
		<div class="flex items-center gap-4">
			<ColorThemeToggle />
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
						<li class="text-sm font-medium"><a href={ROUTES.auth.login}>Login</a></li>
						<li class="text-sm font-medium"><a href={ROUTES.auth.signUp}>Sign up</a></li>
					</ul>
				</nav>
			{/if}
		</div>
	</div>
</header>
