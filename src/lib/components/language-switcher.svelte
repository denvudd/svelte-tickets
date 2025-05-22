<script lang="ts">
	import { availableLanguageTags, languageTag } from '$lib/paraglide/runtime.js';
	import { i18n } from '$lib/i18n.js';
	import { page } from '$app/state';
	import {
		DropdownMenu,
		DropdownMenuTrigger,
		DropdownMenuContent,
		DropdownMenuGroup,
		DropdownMenuSeparator,
		DropdownMenuGroupHeading,
		DropdownMenuItem,
	} from '$lib/components/ui/dropdown-menu';
	import LanguagesIcon from '@lucide/svelte/icons/languages';
	import { buttonVariants } from './ui/button';
</script>

<DropdownMenu>
	<DropdownMenuTrigger class={buttonVariants({ variant: 'ghost', size: 'icon' })}>
		<LanguagesIcon />
	</DropdownMenuTrigger>
	<DropdownMenuContent>
		<DropdownMenuGroup>
			<DropdownMenuGroupHeading>Languages</DropdownMenuGroupHeading>
			<DropdownMenuSeparator />
			<DropdownMenuGroup>
				{#each availableLanguageTags as lang}
					<a
						href={i18n.route(page.url.pathname)}
						hreflang={lang}
						aria-current={lang === languageTag() ? 'page' : undefined}
					>
						<DropdownMenuItem>
							<span>{lang.toUpperCase()}</span>
						</DropdownMenuItem>
					</a>
				{/each}
			</DropdownMenuGroup>
		</DropdownMenuGroup>
	</DropdownMenuContent>
</DropdownMenu>
