<script lang="ts">
	import type { Tables } from '$lib/database.types';
	import EllipsisIcon from '@lucide/svelte/icons/ellipsis';
	import TrashIcon from '@lucide/svelte/icons/trash';
	import { cn } from '$lib/utils';
	import {
		DropdownMenu,
		DropdownMenuTrigger,
		DropdownMenuContent,
		DropdownMenuGroup,
		DropdownMenuItem
	} from '$lib/components/ui/dropdown-menu';
	import { buttonVariants } from '$lib/components/ui/button';
	import type { MessageWithProfile } from '../+page.server';
	import dayjs from 'dayjs';
	import { page } from '$app/state';
	import { invalidate } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import type { SupabaseClient } from '@supabase/supabase-js';
	import { deleteMessage } from '$lib/db/messages';

	interface Props {
		profile: Tables<'profiles'> | null;
		message: MessageWithProfile;
		supabase: SupabaseClient;
	}

	const { profile, message, supabase }: Props = $props();
	const isAuthor = $derived(message.profile_id === profile?.id);

	const handleDeleteMessage = async () => {
		try {
			const { error: deleteError } = await deleteMessage(supabase, message.id);

			if (!deleteError) {
				toast.success('Message deleted!');
			} else {
				toast.error('Failed to delete message');
			}
		} catch (error) {
			console.log('🚀 ~ handleDeleteTicket ~ error:', error);
			toast.error('Failed to delete message');
		}
	};
</script>

<div
	class={cn('max-w-sm space-y-1', {
		'self-end': isAuthor,
		'self-start': !isAuthor
	})}
>
	<div class="flex items-center gap-2">
		{#if isAuthor}
			<DropdownMenu>
				<DropdownMenuTrigger
					class={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'size-9', {
						'order-0': isAuthor,
						'order-1': !isAuthor
					})}
				>
					<EllipsisIcon />
				</DropdownMenuTrigger>
				<DropdownMenuContent>
					<DropdownMenuGroup>
						<DropdownMenuItem onclick={handleDeleteMessage}>
							<TrashIcon class="size-4" />
							<span>Delete</span>
						</DropdownMenuItem>
					</DropdownMenuGroup>
				</DropdownMenuContent>
			</DropdownMenu>
		{/if}
		<div class="bg-muted inline-flex rounded-md border px-2 py-1.5">
			{message.content}
		</div>
	</div>
	<div
		class={cn('mt-1 flex items-center gap-2', {
			'justify-end': isAuthor,
			'justify-start': !isAuthor
		})}
	>
		<time
			class={cn('text-muted-foreground mt-1 flex items-center text-xs', {
				'justify-start': isAuthor,
				'justify-end': !isAuthor
			})}>{dayjs(message.created_at).format('HH:mm A')}</time
		>
	</div>
</div>
