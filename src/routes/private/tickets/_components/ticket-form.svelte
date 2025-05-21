<script lang="ts">
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import {
		Dialog,
		DialogClose,
		DialogContent,
		DialogHeader,
		DialogTitle,
		DialogDescription,
		DialogTrigger
	} from '$lib/components/ui/dialog';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import {
		superForm,
		type Infer,
		type SuperFormSnapshot,
		type SuperValidated
	} from 'sveltekit-superforms';
	import { type CreateTicketSchemaType, CreateTicketSchema } from '../schema';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { Label } from '$lib/components/ui/label';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import {
		TICKETS_STATUS_OPTIONS,
		TICKET_CATEGORY_OPTIONS,
		TICKET_PRIORITY_OPTIONS
	} from '$lib/constants';
	import { Select, SelectContent, SelectItem, SelectTrigger } from '$lib/components/ui/select';
	import { cn } from '$lib/utils';
	import { toast } from 'svelte-sonner';
	import { queryParameters, queryParam } from 'sveltekit-search-params';
	import { page } from '$app/state';
	import { Badge } from '$lib/components/ui/badge';

	interface Props {
		serverForm: SuperValidated<Infer<CreateTicketSchemaType>>;
	}

	const { serverForm }: Props = $props();

	const params = queryParameters({
		ticketId: {
			encode: (value: string) => value,
			decode: (value: string | null) => value || null
		}
	});
	let ticketId = queryParam('ticketId');
	let isDialogOpen = $state(false);
	const action = $derived($ticketId ? 'edit' : 'create');

	const { form, errors, tainted, enhance, reset, restore } = superForm<
		Infer<CreateTicketSchemaType>,
		{ status: number; text: string }
	>(serverForm, {
		validators: zodClient(CreateTicketSchema),
		resetForm: true,
		onUpdate(event) {
			if (event.result.type === 'success') {
				clearTicketIdParam();
				toast.success(action === 'edit' ? 'Ticket updated!' : 'Ticket created!');

				if (action === 'create') {
					isDialogOpen = false;
				}
			}
		}
	});

	$effect(() => {
		if ($ticketId) {
			restore(serverForm as SuperFormSnapshot<Infer<CreateTicketSchemaType>>);

			isDialogOpen = true;
		} else {
			isDialogOpen = false;
		}
	});

	const clearTicketIdParam = async () => {
		$params = {
			ticketId: null
		};
	};

	const onDialogOpenChange = (state: boolean) => {
		if (!state) {
			reset();
			clearTicketIdParam();
		}

		isDialogOpen = state;
	};

	const isOwner = $derived(page.data.profile?.id === $form._authorId);

	const currentStatusOption = $derived(
		TICKETS_STATUS_OPTIONS.find((f) => f.value === $form.status)
	);
	const currentPriorityOption = $derived(
		TICKET_PRIORITY_OPTIONS.find((f) => f.value === $form.priority)
	);
	const currentCategoryOption = $derived(
		TICKET_CATEGORY_OPTIONS.find((f) => f.value === $form.category)
	);
</script>

<Dialog open={isDialogOpen} onOpenChange={onDialogOpenChange}>
	<DialogTrigger class={buttonVariants()}>
		<PlusIcon class="size-4" /> New Ticket
	</DialogTrigger>
	<DialogContent>
		<form
			method="POST"
			use:enhance
			id="create-ticket"
			action={action === 'edit' ? `?/editTicket&ticketId=${$ticketId}` : '?/createTicket'}
			class="space-y-4"
		>
			<DialogHeader>
				<DialogTitle
					>{isOwner ? (action === 'edit' ? 'Edit Ticket' : 'New Ticket') : 'Details'}</DialogTitle
				>
				<DialogDescription>
					Don't forget to add as much details as possible to help our team resolve this issue.
				</DialogDescription>
			</DialogHeader>

			{#if action === 'edit'}
				<div class="grid gap-2">
					<Label for="author">Author</Label>
					<Badge>
						{#if isOwner}
							You
						{:else}
							{$form.author}
						{/if}
					</Badge>
				</div>
			{/if}

			<div class="grid gap-2">
				<Label for="title">Title</Label>
				<Input
					id="title"
					name="title"
					placeholder="e.g. I can't log in"
					bind:value={$form.title}
					error={$tainted?.title && $errors.title}
					disabled={!$form._isEditable}
				/>
			</div>

			<div class="grid gap-2">
				<Label for="description">Description</Label>
				<Textarea
					id="description"
					name="description"
					placeholder="Describe the issue in detail"
					bind:value={$form.description}
					error={$tainted?.description && $errors.description}
					disabled={!$form._isEditable}
				/>
			</div>

			<div class="grid gap-2">
				<Label for="status">Status</Label>
				<Select type="single" name="status" bind:value={$form.status} disabled={!$form._isEditable}>
					<SelectTrigger
						disabled={!$form._isEditable}
						class="w-full"
						error={$tainted?.status && $errors.status}
					>
						{#if currentStatusOption}
							<div class="flex items-center gap-2">
								<currentStatusOption.Icon class={cn('size-4', currentStatusOption.iconColor)} />
								{currentStatusOption.label}
							</div>
						{:else}
							Select a status
						{/if}
					</SelectTrigger>
					<SelectContent>
						{#each TICKETS_STATUS_OPTIONS as option (option.value)}
							<SelectItem value={option.value} label={option.label} class="flex items-center gap-2">
								<option.Icon class={cn('size-4', option.iconColor)} />
								{option.label}</SelectItem
							>
						{/each}
					</SelectContent>
				</Select>
			</div>

			<div class="grid gap-2">
				<Label for="priority">Priority</Label>
				<Select
					type="single"
					name="priority"
					bind:value={$form.priority}
					disabled={!$form._isEditable}
				>
					<SelectTrigger
						class="w-full"
						error={$tainted?.priority && $errors.priority}
						disabled={!$form._isEditable}
					>
						{#if currentPriorityOption}
							<div class="flex items-center gap-2">
								<currentPriorityOption.Icon class={cn('size-4', currentPriorityOption.iconColor)} />
								{currentPriorityOption.label}
							</div>
						{:else}
							Select a priority
						{/if}
					</SelectTrigger>
					<SelectContent>
						{#each TICKET_PRIORITY_OPTIONS as option (option.value)}
							<SelectItem value={option.value} label={option.label} class="flex items-center gap-2">
								<option.Icon class={cn('size-4', option.iconColor)} />
								{option.label}</SelectItem
							>
						{/each}
					</SelectContent>
				</Select>
			</div>

			<div class="grid gap-2">
				<Label for="category">Category</Label>
				<Select
					type="single"
					name="category"
					bind:value={$form.category}
					disabled={!$form._isEditable}
				>
					<SelectTrigger
						class="w-full"
						error={$tainted?.priority && $errors.category}
						disabled={!$form._isEditable}
					>
						{#if currentCategoryOption}
							<div class="flex items-center gap-2">
								<currentCategoryOption.Icon class={cn('size-4', currentCategoryOption.iconColor)} />
								{currentCategoryOption.label}
							</div>
						{:else}
							Select a category
						{/if}
					</SelectTrigger>
					<SelectContent>
						{#each TICKET_CATEGORY_OPTIONS as option (option.value)}
							<SelectItem value={option.value} label={option.label} class="flex items-center gap-2">
								<option.Icon class={cn('size-4', option.iconColor)} />
								{option.label}</SelectItem
							>
						{/each}
					</SelectContent>
				</Select>
			</div>
			<div class="flex w-full items-center justify-end gap-2">
				<DialogClose type="button" class={buttonVariants({ variant: 'outline' })}
					>Cancel</DialogClose
				>
				<Button type="submit" form="create-ticket" disabled={!$form._isEditable}>Submit</Button>
			</div>
		</form>
	</DialogContent>
</Dialog>
