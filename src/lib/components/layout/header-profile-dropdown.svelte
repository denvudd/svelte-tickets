<script lang="ts">
	import LogOutIcon from '@lucide/svelte/icons/log-out';
	import MessageSquareIcon from '@lucide/svelte/icons/message-square';
	import SettingsIcon from '@lucide/svelte/icons/settings';
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

	interface Props {
		profile: Tables<'profiles'>;
		handleLogout: () => Promise<void>;
	}

	const { profile, handleLogout }: Props = $props();
	const { full_name, avatar_url } = $derived(profile);

	const avatarShortcut = full_name?.slice(0, 2).toUpperCase();
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
			<DropdownMenuGroupHeading>My Account</DropdownMenuGroupHeading>
			<DropdownMenuSeparator />
			<DropdownMenuGroup>
				<a href="/private/account/profile">
					<DropdownMenuItem>
						<UserIcon class="size-4" />
						<span>Profile</span>
						<DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
					</DropdownMenuItem>
				</a>
				<a href="/private/account/settings">
					<DropdownMenuItem>
						<SettingsIcon class="size-4" />
						<span>Settings</span>
						<DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
					</DropdownMenuItem>
				</a>
			</DropdownMenuGroup>
			<DropdownMenuSeparator />
			<DropdownMenuGroup>
				<a href="/private/messages">
					<DropdownMenuItem>
						<MessageSquareIcon class="size-4" />
						<span>Messages</span>
						<DropdownMenuShortcut>⌘+M</DropdownMenuShortcut>
					</DropdownMenuItem>
				</a>
			</DropdownMenuGroup>
			<DropdownMenuSeparator />
			<DropdownMenuItem onclick={handleLogout}>
				<LogOutIcon class="size-4" />
				<span>Log out</span>
				<DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
			</DropdownMenuItem>
		</DropdownMenuGroup>
	</DropdownMenuContent>
</DropdownMenu>
