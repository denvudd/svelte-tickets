<script lang="ts">
	import { onMount } from 'svelte';
	import { tick } from 'svelte';
	import { Avatar, AvatarImage, AvatarFallback } from '$lib/components/ui/avatar';
	import type { PageProps } from './$types';
	import ArrowLeftIcon from '@lucide/svelte/icons/arrow-left';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import MessageItem from './_components/message-item.svelte';
	import { toast } from 'svelte-sonner';
	import type { MessageWithProfile } from './+page.server';
	import { createMessage } from '$lib/db/messages';
	import { invalidate } from '$app/navigation';

	const { data }: PageProps = $props();

	let {
		messages: initialMessages,
		profileId,
		chatId,
		chatMember,
		supabase,
		profile
	} = $derived(data);

	let messages = $state(initialMessages ?? []);
	let newMessage = $state('');

	let messagesEnd: HTMLDivElement;

	function scrollToBottom() {
		tick().then(() => {
			messagesEnd?.scrollIntoView({ behavior: 'smooth' });
		});
	}

	onMount(() => {
		scrollToBottom();

		const channel = supabase
			.channel('messages-realtime')
			.on<MessageWithProfile>(
				'postgres_changes',
				{
					event: 'INSERT',
					schema: 'public',
					table: 'messages',
					filter: `chat_id=eq.${chatId}`
				},
				async (payload) => {
					const payloadMessage = payload.new;
					messages = [...messages, payloadMessage];
					scrollToBottom();
				}
			)
			.on<MessageWithProfile>(
				'postgres_changes',
				{
					event: 'DELETE',
					schema: 'public',
					table: 'messages'
				},
				async (payload) => {
					await invalidate('messages');
					messages = initialMessages ?? [];
				}
			)
			.subscribe();

		return () => {
			supabase.removeChannel(channel);
		};
	});

	async function sendMessage() {
		if (!newMessage.trim()) return;

		if (!chatId || !profileId) {
			toast.error('Failed to send message');
			return;
		}

		await createMessage(supabase, [
			{
				content: newMessage,
				chat_id: chatId,
				profile_id: profileId
			}
		]);

		newMessage = '';
	}
</script>

<div class="-mt-5 flex h-[calc(100vh-7.3rem)] w-full">
	<div class="grow">
		<div
			class="bg-background fixed inset-0 z-50 flex h-full flex-col p-4 lg:relative lg:z-10 lg:bg-transparent lg:p-0"
		>
			{#if chatMember}
				<div class="border-muted flex justify-between gap-4 border-b pb-4 lg:px-4">
					<div class="flex items-center gap-4">
						<Button variant="outline" size="icon" class="size-8" href="/private/messages">
							<div class="sr-only">Back</div>
							<ArrowLeftIcon class="size-4" />
						</Button>
						<Avatar class="relative flex size-10 shrink-0 lg:size-12">
							<AvatarImage src={chatMember.profiles.avatar_url} alt="@shadcn" />
							<AvatarFallback
								>{chatMember.profiles.full_name?.slice(0, 2).toUpperCase()}</AvatarFallback
							>
						</Avatar>
						<div class="flex flex-col">
							<span class="font-semibold">{chatMember.profiles.full_name}</span>
							<span class="text-muted-foreground text-sm">{chatMember.profiles.occupation}</span>
						</div>
					</div>
				</div>
			{/if}
			<div class="flex-1 overflow-y-auto lg:px-4">
				<div>
					<div class="flex flex-col items-center space-y-4 py-8">
						{#each messages as message}
							<MessageItem {message} {profile} {supabase} />
						{/each}
						<div bind:this={messagesEnd}></div>
					</div>
				</div>
			</div>
			<div class="lg:px-4">
				<form
					onsubmit={(event) => {
						event.preventDefault();
						sendMessage();
					}}
					class="bg-muted relative flex items-center rounded-md border"
				>
					<Input bind:value={newMessage} placeholder="Enter message..." class="h-14 pe-22" />
					<div class="absolute end-4 flex items-center">
						<Button type="submit" class="ml-3">Send</Button>
					</div>
				</form>
			</div>
		</div>
	</div>
</div>
