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
	import { deleteTicket } from '$lib/db/tickets';
	import { page } from '$app/state';

	let { id }: { id: number } = $props();
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
			await fetch(page.url.href + `?/deleteTicket&ticketId=${stringifiedId}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'multipart/form-data'
				},
			});
			invalidate('tickets');
			toast.success('Ticket deleted!');
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
		<DropdownMenuItem onclick={handleEditTicket}>Edit</DropdownMenuItem>
		<DropdownMenuItem onclick={handleDeleteTicket}>Delete</DropdownMenuItem>
	</DropdownMenuContent>
</DropdownMenu>
