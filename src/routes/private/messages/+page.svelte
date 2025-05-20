<script lang="ts">
	import type { PageProps } from './$types';
	import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar';
	import CreateChat from './_components/create-chat.svelte';
	import dayjs from 'dayjs';
	import relativeTime from 'dayjs/plugin/relativeTime';
	import { onMount } from 'svelte';
	import { invalidate } from '$app/navigation';
	import type { Tables } from '$lib/database.types';

	dayjs.extend(relativeTime);

	const { data }: PageProps = $props();
	const { chats, profiles, supabase, profile } = $derived(data);

	onMount(() => {
		const currentProfileId = profile?.id;

		const messageSubscription = supabase
			.channel('messages-changes')
			.on<Tables<'messages'>>(
				'postgres_changes',
				{
					event: '*',
					schema: 'public',
					table: 'messages'
				},
				(payload) => {
					// Check if the message was sent by current user
					if (
						payload.new &&
						'profile_id' in payload.new &&
						payload.new.profile_id === currentProfileId
					) {
						// If current user sent the message, update message_reads
						supabase
							.from('message_reads')
							.upsert(
								{
									chat_id: payload.new.chat_id,
									profile_id: currentProfileId,
									last_read_at: payload.new.created_at
								},
								{
									onConflict: 'chat_id,profile_id'
								}
							)
							.then(() => {
								invalidate('chats');
							});
					} else {
						invalidate('chats');
					}
				}
			)
			.subscribe();

		const readStatusSubscription = supabase
			.channel('message-reads-changes')
			.on<Tables<'message_reads'>>(
				'postgres_changes',
				{
					event: '*',
					schema: 'public',
					table: 'message_reads'
				},
				() => {
					invalidate('chats');
				}
			)
			.subscribe();

		// new chats or removed members
		const chatMembersSubscription = supabase
			.channel('chat-members-changes')
			.on<Tables<'chat_members'>>(
				'postgres_changes',
				{
					event: '*',
					schema: 'public',
					table: 'chat_members',
					filter: `profile_id=eq.${profile?.id}`
				},
				() => {
					invalidate('chats');
				}
			)
			.subscribe();

		return () => {
			messageSubscription.unsubscribe();
			readStatusSubscription.unsubscribe();
			chatMembersSubscription.unsubscribe();
		};
	});
</script>

<div class="flex w-full flex-col gap-4">
	<div class="flex items-center justify-between">
		<h1 class="text-lg font-medium">Messages</h1>
		<CreateChat {profiles} />
	</div>

	<ul class="space-y-2">
		{#if chats}
			{#each chats as chat}
				<li>
					<a
						href={`/private/messages/${chat.chat_id}`}
						class="group/item hover:bg-muted dark:bg-muted! relative flex min-w-0 cursor-pointer items-center gap-4 rounded-md bg-gray-200! px-6 py-4"
					>
						<Avatar class="relative flex size-8 shrink-0 md:size-12">
							<AvatarImage src={chat.profile.avatar_url} alt={chat.profile.full_name} />
							<AvatarFallback>{chat.profile.full_name?.slice(0, 2).toUpperCase()}</AvatarFallback>
						</Avatar>
						<div class="min-w-0 grow">
							<div class="flex items-center justify-between">
								<div class="truncate font-medium">{chat.profile.full_name}</div>
								<div class="text-muted-foreground flex-none text-xs">
									{chat.last_message?.created_at
										? dayjs(chat.last_message.created_at).fromNow()
										: ''}
								</div>
							</div>
							<div class="flex items-center gap-2">
								<span class="text-muted-foreground truncate text-start text-sm">
									{#if chat.last_message?.profile_id === profile?.id}
										<strong>You:</strong>
									{/if}
									{chat.last_message?.content || 'No messages yet'}
								</span>
								{#if chat.unread_count > 0}
									<span
										class="ms-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-500 text-sm text-white"
										>{chat.unread_count}</span
									>
								{/if}
							</div>
						</div>
					</a>
				</li>
			{/each}
		{:else}
			<li class="text-muted-foreground py-4 text-center">No conversations yet</li>
		{/if}
	</ul>
</div>
