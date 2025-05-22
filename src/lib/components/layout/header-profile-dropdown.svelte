<script lang="ts">
	import LogOutIcon from '@lucide/svelte/icons/log-out';
	import MessageSquareIcon from '@lucide/svelte/icons/message-square';
	import SettingsIcon from '@lucide/svelte/icons/settings';
	import PaintbrushIcon from '@lucide/svelte/icons/paintbrush';
	import UserIcon from '@lucide/svelte/icons/user';
	import {
		DropdownMenu,
		DropdownMenuTrigger,
		DropdownMenuContent,
		DropdownMenuGroup,
		DropdownMenuSeparator,
		DropdownMenuGroupHeading,
		DropdownMenuItem,
		DropdownMenuShortcut
	} from '$lib/components/ui/dropdown-menu';
	import { Avatar, AvatarImage, AvatarFallback } from '$lib/components/ui/avatar';
	import type { Tables } from '$lib/database.types';
	import { ROUTES } from '$lib/constants';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import * as m from '$lib/paraglide/messages.js';

	interface Props {
		profile: Tables<'profiles'>;
		handleLogout: () => Promise<void>;
	}

	const { profile, handleLogout }: Props = $props();
	const { full_name, avatar_url } = $derived(profile);

	const avatarShortcut = full_name?.slice(0, 2).toUpperCase();

	function checkShortcut(event: KeyboardEvent, targetCode: string, modifiers: string[]): boolean {
		const hasAllModifiers = modifiers.every((mod) => {
			switch (mod) {
				case '⌘':
				case 'cmd':
					return event.metaKey || event.ctrlKey;
				case '⇧':
				case 'shift':
					return event.shiftKey;
				case '⌥':
				case 'alt':
					return event.altKey;
				default:
					return false;
			}
		});

		const keyMatches = event.code === targetCode;

		return hasAllModifiers && keyMatches;
	}

	function handleGlobalKeydown(event: KeyboardEvent) {
		const target = event.target as HTMLElement;
		if (
			target?.tagName === 'INPUT' ||
			target?.tagName === 'TEXTAREA' ||
			target?.contentEditable === 'true'
		) {
			return;
		}

		// ⇧⌘P (Shift + Cmd + P)
		if (checkShortcut(event, 'KeyP', ['shift', 'cmd'])) {
			event.preventDefault();
			goto(ROUTES.private.account.profile);
			return;
		}

		// ⌘S (Cmd + S)
		if (checkShortcut(event, 'KeyS', ['cmd'])) {
			event.preventDefault();
			goto(ROUTES.private.account.settings);
			return;
		}

		// ⌘A (Cmd + A)
		if (checkShortcut(event, 'KeyA', ['cmd'])) {
			event.preventDefault();
			goto(ROUTES.private.account.appearence);
			return;
		}

		// ⌘M (Cmd + M)
		if (checkShortcut(event, 'KeyM', ['cmd'])) {
			event.preventDefault();
			goto(ROUTES.private.messages);
			return;
		}

		// ⇧⌘Q (Shift + Cmd + Q)
		if (checkShortcut(event, 'KeyQ', ['shift', 'cmd'])) {
			event.preventDefault();
			handleLogout();
			return;
		}
	}

	onMount(() => {
		document.addEventListener('keydown', handleGlobalKeydown);

		return () => {
			document.removeEventListener('keydown', handleGlobalKeydown);
		};
	});
</script>

<DropdownMenu>
	<DropdownMenuTrigger class="cursor-pointer">
		<Avatar>
			<AvatarImage src={avatar_url} alt="@shadcn" />
			<AvatarFallback>{avatarShortcut}</AvatarFallback>
		</Avatar>
	</DropdownMenuTrigger>
	<DropdownMenuContent class="w-56">
		<DropdownMenuGroup>
			<DropdownMenuGroupHeading>{m.header_my_account()}</DropdownMenuGroupHeading>
			<DropdownMenuSeparator />
			<DropdownMenuGroup>
				<a href={ROUTES.private.account.profile}>
					<DropdownMenuItem>
						<UserIcon class="size-4" />
						<span>{m.header_profile()}</span>
						<DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
					</DropdownMenuItem>
				</a>
				<a href={ROUTES.private.account.settings}>
					<DropdownMenuItem>
						<SettingsIcon class="size-4" />
						<span>{m.header_settings()}</span>
						<DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
					</DropdownMenuItem>
				</a>
				<a href={ROUTES.private.account.appearence}>
					<DropdownMenuItem>
						<PaintbrushIcon class="size-4" />
						<span>{m.header_appearance()}</span>
						<DropdownMenuShortcut>⌘A</DropdownMenuShortcut>
					</DropdownMenuItem>
				</a>
			</DropdownMenuGroup>
			<DropdownMenuSeparator />
			<DropdownMenuGroup>
				<a href={ROUTES.private.messages}>
					<DropdownMenuItem>
						<MessageSquareIcon class="size-4" />
						<span>{m.header_messages()}</span>
						<DropdownMenuShortcut>⌘M</DropdownMenuShortcut>
					</DropdownMenuItem>
				</a>
			</DropdownMenuGroup>
			<DropdownMenuSeparator />
			<DropdownMenuItem onclick={handleLogout}>
				<LogOutIcon class="size-4" />
				<span>{m.header_logout()}</span>
				<DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
			</DropdownMenuItem>
		</DropdownMenuGroup>
	</DropdownMenuContent>
</DropdownMenu>
