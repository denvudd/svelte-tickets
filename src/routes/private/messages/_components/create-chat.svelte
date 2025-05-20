<script lang="ts">
	import { applyAction, enhance } from '$app/forms';
	import { buttonVariants } from '$lib/components/ui/button';
	import {
		Dialog,
		DialogContent,
		DialogDescription,
		DialogHeader,
		DialogTitle,
		DialogTrigger
	} from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import { page } from '$app/state';
	import type { EventHandler } from 'svelte/elements';
	import { onMount } from 'svelte';
	import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar';
	import type { Tables } from '$lib/database.types';
	import { toast } from 'svelte-sonner';
	import { goto, invalidate } from '$app/navigation';

	interface Props {
		profiles: Tables<'profiles'>[] | undefined;
	}

	const { profiles }: Props = $props();

	let isDialogOpen = $state(false);
	let query = $state(page.url.searchParams.get('q') ?? '');

	const onDialogOpenChange = (state: boolean) => (isDialogOpen = state);

	let timeout: number;
	const handleInput: EventHandler<Event, HTMLInputElement> = (event) => {
		clearTimeout(timeout);
		const form = event.currentTarget.form;

		if (form) {
			timeout = setTimeout(() => {
				form.requestSubmit();
			}, 300) as unknown as number;
		}
	};

	onMount(() => () => clearTimeout(timeout));
</script>

<Dialog open={isDialogOpen} onOpenChange={onDialogOpenChange}>
	<DialogTrigger class={buttonVariants()}>
		<PlusIcon class="size-4" /> New Chat
	</DialogTrigger>
	<DialogContent>
		<DialogHeader>
			<DialogTitle>New Chat</DialogTitle>
			<DialogDescription
				>Search for a user to start a new conversation with your team members.</DialogDescription
			>
		</DialogHeader>

		<div class="space-y-6">
			<form class="w-full" data-sveltekit-keepfocus data-sveltekit-noscroll>
				<div class="grid gap-2">
					<Label for="q">Title</Label>
					<Input id="q" name="q" placeholder="e.g Alex" oninput={handleInput} value={query} />
				</div>
			</form>

			{#if profiles?.length}
				<form
					method="POST"
					use:enhance={({ formElement, formData, action, cancel }) => {
						return async ({ result }) => {
							if (result.status === 200) {
								invalidate('chats');
								onDialogOpenChange(false);
								toast.success('Chat created!');
							}

							if (result.type === 'redirect') {
								goto(result.location);
							} else {
								await applyAction(result);
							}
						};
					}}
					action="?/createChat"
					class="flex flex-col gap-2"
				>
					{#each profiles as profile}
						<button
							type="submit"
							name="profile_id"
							value={profile.id}
							class="hover:bg-accent flex items-center gap-2 rounded-md p-2 transition-colors"
						>
							<Avatar>
								<AvatarImage src={profile.avatar_url} alt={profile.full_name} />
								<AvatarFallback>{profile.full_name?.slice(0, 2).toUpperCase()}</AvatarFallback>
							</Avatar>
							<div class="flex-1 text-left">
								<p class="font-medium">{profile.full_name}</p>
								{#if profile.occupation}
									<p class="text-muted-foreground text-sm">{profile.occupation}</p>
								{/if}
							</div>
						</button>
					{/each}
				</form>
			{:else}
				<p class="text-muted-foreground text-sm w-full text-center">No users found.</p>
			{/if}
		</div>
	</DialogContent>
</Dialog>
