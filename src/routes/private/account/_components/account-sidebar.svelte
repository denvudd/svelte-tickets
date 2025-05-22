<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { page } from '$app/state';
	import { cn } from '$lib/utils';
	import { ROUTES } from '$lib/constants';
	import * as m from '$lib/paraglide/messages';

	const NAVIGATION_OPTIONS = [
		{
			label: m.account_sidebar_profile(),
			href: ROUTES.private.account.profile
		},
		{
			label: m.account_sidebar_account(),
			href: ROUTES.private.account.settings
		},
		{
			label: m.account_sidebar_appearance(),
			href: ROUTES.private.account.appearence
		}
	];

	const isParamMatch = (href: string) => {
		const urlWithoutLocale = page.url.pathname.split('/').slice(2).join('/');

		return href.includes(urlWithoutLocale);
	};
</script>

{#snippet listItem({ href, label }: (typeof NAVIGATION_OPTIONS)[0])}
	<li
		class={cn('hover:bg-muted rounded-md px-4 py-2 text-base font-medium transition-colors', {
			'bg-muted': isParamMatch(href)
		})}
	>
		<a class="block w-full" {href}>{label}</a>
	</li>
{/snippet}

<Card class="h-full w-full max-w-full">
	<CardHeader>
		<CardTitle>{m.account_sidebar_title()}</CardTitle>
	</CardHeader>
	<CardContent>
		<nav>
			<ul class="space-y-2">
				{#each NAVIGATION_OPTIONS as option}
					{@render listItem(option)}
				{/each}
			</ul>
		</nav>
	</CardContent>
</Card>
