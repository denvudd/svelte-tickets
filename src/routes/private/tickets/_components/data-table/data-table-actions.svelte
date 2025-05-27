<script lang="ts">
	import Ellipsis from '@lucide/svelte/icons/ellipsis';
	import { Button } from '$lib/components/ui/button/index.js';
	import {
		DropdownMenu,
		DropdownMenuContent,
		DropdownMenuGroup,
		DropdownMenuGroupHeading,
		DropdownMenuItem,
		DropdownMenuSeparator,
		DropdownMenuTrigger
	} from '$lib/components/ui/dropdown-menu';
	import { toast } from 'svelte-sonner';
	import { invalidate } from '$app/navigation';
	import { queryParameters } from 'sveltekit-search-params';
	import { page } from '$app/state';
	import * as m from '$lib/paraglide/messages.js';

	interface Props {
		id: number;
		owner_id: string;
	}

	let { id, owner_id }: Props = $props();
	$inspect("🚀 ~ id:", id)
	const isOwner = $derived(owner_id === page.data.profile?.id);
	const stringifiedId = $derived(String(id));

	const params = queryParameters();

	const handleCopyTicketId = () => {
		if ('navigator' in window) {
			navigator.clipboard.writeText(stringifiedId);
			toast.success(m.tickets_actions_copy_success());
		} else {
			toast.error(m.tickets_actions_copy_failed());
		}
	};

	const handleEditTicket = async () => {
		const newUrl = new URL(window.location.href);
		newUrl.searchParams.set('ticketId', stringifiedId);

		$params = { ticketId: stringifiedId };
		await invalidate('tickets');
	};

	const handleDeleteTicket = async () => {
		try {
			const rawResponse = await fetch(`?/deleteTicket&ticketId=${stringifiedId}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'multipart/form-data'
				}
			});

			const response = await rawResponse.json();
			const parsed = JSON.parse(response.data);
			const message = parsed[1];

			if (response?.status === 200) {
				toast.success(message);
			} else {
				toast.error(message);
			}

			invalidate('tickets');
		} catch (error) {
			console.log('🚀 ~ handleDeleteTicket ~ error:', error);
			toast.error(m.tickets_delete_failed());
		}
	};
</script>

<DropdownMenu>
	<DropdownMenuTrigger>
		{#snippet child({ props })}
			<Button {...props} variant="ghost" size="icon" class="relative size-8 p-0">
				<span class="sr-only">Open menu</span>
				<Ellipsis />
			</Button>
		{/snippet}
	</DropdownMenuTrigger>
	<DropdownMenuContent>
		<DropdownMenuGroup>
			<DropdownMenuGroupHeading>{m.tickets_actions_title()}</DropdownMenuGroupHeading>
			<DropdownMenuItem onclick={handleCopyTicketId}>{m.tickets_actions_copy()}</DropdownMenuItem>
		</DropdownMenuGroup>
		<DropdownMenuSeparator />
		<DropdownMenuItem onclick={handleEditTicket}
			>{isOwner ? m.tickets_actions_edit() : m.tickets_actions_view()}</DropdownMenuItem
		>
		{#if isOwner}
			<DropdownMenuItem onclick={handleDeleteTicket}>{m.tickets_actions_delete()}</DropdownMenuItem>
		{/if}
	</DropdownMenuContent>
</DropdownMenu>
