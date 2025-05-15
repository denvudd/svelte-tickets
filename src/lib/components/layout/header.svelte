<script lang="ts">
	import ColorThemeToggle from '$lib/components/color-theme-toggle.svelte';
	import HeaderProfileDropdown from './header-profile-dropdown.svelte';
	import type { Tables } from '$lib/database.types';

	interface Props {
		handleLogout: () => Promise<void>;
		profile: Tables<'profiles'> | null;
	}

	let { handleLogout, profile }: Props = $props();
</script>

<header class="border-accent w-full border-b py-4">
	<div class="container flex items-center justify-end gap-8">
		<div class="flex items-center gap-4">
			<ColorThemeToggle />
			{#if profile}
				<HeaderProfileDropdown {handleLogout} {profile} />
			{:else}
				<nav>
					<ul class="flex items-center gap-4">
						<li class="text-sm font-medium"><a href="/auth/login">Login</a></li>
						<li class="text-sm font-medium"><a href="/auth/sign-up">Sign up</a></li>
					</ul>
				</nav>
			{/if}
		</div>
	</div>
</header>
