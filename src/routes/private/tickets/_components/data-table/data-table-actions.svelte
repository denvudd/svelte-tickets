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

	interface Props {
		id: number;
		owner_id: string;
	}

	let { id, owner_id }: Props = $props();
	const isOwner = $derived(owner_id === page.data.profile?.id);
	const stringifiedId = String(id);

	const params = queryParameters();

	const handleCopyTicketId = () => {
		if ('navigator' in window) {
			navigator.clipboard.writeText(stringifiedId);
			toast.success('Ticket ID copied to clipboard!');
		} else {
			toast.error('Clipboard not available');
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
			console.log('🚀 ~ handleDeleteTicket ~ rawResponse:', rawResponse);

			const response = await rawResponse.json();
			const parsed = JSON.parse(response.data);
			const message = parsed[1];

			if (response?.data?.status === 200) {
				toast.success(message);
			} else {
				toast.error(message);
			}

			invalidate('tickets');
		} catch (error) {
			console.log('🚀 ~ handleDeleteTicket ~ error:', error);
			toast.error('Failed to delete ticket');
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
			<DropdownMenuGroupHeading>Actions</DropdownMenuGroupHeading>
			<DropdownMenuItem onclick={handleCopyTicketId}>Copy ID</DropdownMenuItem>
		</DropdownMenuGroup>
		<DropdownMenuSeparator />
		<DropdownMenuItem onclick={handleEditTicket}>{isOwner ? 'Edit' : 'View'}</DropdownMenuItem>
		{#if isOwner}
			<DropdownMenuItem onclick={handleDeleteTicket}>Delete</DropdownMenuItem>
		{/if}
	</DropdownMenuContent>
</DropdownMenu>
