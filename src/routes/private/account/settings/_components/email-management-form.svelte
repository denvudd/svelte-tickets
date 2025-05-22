<script lang="ts">
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { EmailManagementSchema } from '../schema';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import MailIcon from '@lucide/svelte/icons/mail';
	import { Label } from '$lib/components/ui/label';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import * as m from '$lib/paraglide/messages';

	interface Props {
		emailForm: SuperValidated<Infer<typeof EmailManagementSchema>>;
		currentUserEmail: string | undefined;
	}

	let { emailForm, currentUserEmail }: Props = $props();

	let showConfirmationMessage = $state(false);

	const { form, errors, tainted, enhance } = superForm<
		Infer<typeof EmailManagementSchema>,
		{ status: number; text: string }
	>(emailForm, {
		validators: zodClient(EmailManagementSchema),
		resetForm: false,
		validationMethod: 'oninput',
		onUpdate(event) {
			if (event.result.type === 'success' && event.result.data.form.message.status === 201) {
				showConfirmationMessage = true;
			}
		}
	});
</script>

<section id="email-management">
	<div class="mb-4 flex flex-col space-y-1.5">
		<div class="flex items-center gap-2">
			<MailIcon class="h-5 w-5" />
			<h3 class="text-lg font-medium">{m.account_email_title()}</h3>
		</div>
		<p class="text-muted-foreground text-sm">
			{m.account_email_description()}
		</p>
	</div>
	<form method="POST" class="space-y-4" use:enhance action="?/email">
		<div class="grid gap-2">
			<Label for="new_email">{m.account_new_email_label()}</Label>
			<Input
				type="email"
				id="new_email"
				name="new_email"
				bind:value={$form.new_email}
				aria-invalid={$tainted?.new_email && $errors.new_email ? 'true' : undefined}
				error={$tainted?.new_email && $errors.new_email}
			/>
			{#if showConfirmationMessage}
				<p class="text-muted-foreground text-sm">
					{m.account_confirmation_link()}
				</p>
			{/if}
			{#if $form.new_email === currentUserEmail}
				<p class="animate-in fade-in-30 slide-in-from-top flex flex-col gap-1 text-xs text-red-400">
					{m.account_new_email_same()}
				</p>
			{/if}
		</div>
		<div class="flex w-full justify-end">
			<Button type="submit">{m.account_update_email()}</Button>
		</div>
	</form>
</section>
