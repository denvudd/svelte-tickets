<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { page } from '$app/stores';
	import { cn } from '$lib/utils';

	const NAVIGATION_OPTIONS = [
		{
			label: 'Profile',
			href: '/private/account/profile'
		},
		{
			label: 'Account',
			href: '/private/account/settings'
		},
		{
			label: 'Appearance',
			href: '/private/account/appearance'
		},
	];

	const isParamMatch = (href: string) => href === $page.url.pathname;
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
		<CardTitle>Settings</CardTitle>
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
