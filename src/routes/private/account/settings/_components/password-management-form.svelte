<script lang="ts">
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { PasswordManagementSchema } from '../schema';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { toast } from 'svelte-sonner';
	import KeyIcon from '@lucide/svelte/icons/key';
	import { Label } from '$lib/components/ui/label';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { ROUTES } from '$lib/constants';
	import * as m from '$lib/paraglide/messages';

	interface Props {
		passwordForm: SuperValidated<Infer<typeof PasswordManagementSchema>>;
	}

	let { passwordForm }: Props = $props();

	const { form, errors, tainted, enhance } = superForm<Infer<typeof PasswordManagementSchema>>(
		passwordForm,
		{
			validators: zodClient(PasswordManagementSchema),
			resetForm: true,
			validationMethod: 'oninput',
			onUpdate(event) {
				if (event.result.type === 'success') {
					toast.success('Password updated!');
				}
			}
		}
	);
</script>

<section id="password-management">
	<div class="mb-4 flex items-center gap-2">
		<KeyIcon class="h-5 w-5" />
		<h3 class="text-lg font-medium">{m.account_password_title()}</h3>
	</div>
	<form method="POST" class="space-y-4" use:enhance action="?/password">
		<div class="grid gap-2">
			<Label for="current_password">{m.account_current_password_label()}</Label>
			<Input
				type="password"
				id="current_password"
				name="current_password"
				bind:value={$form.current_password}
				aria-invalid={$tainted?.current_password && $errors.current_password ? 'true' : undefined}
				error={$tainted?.current_password && $errors.current_password}
			/>
			<a class="ml-auto inline-block text-sm underline" href={ROUTES.auth.forgotPassword}
				>{m.account_forgot_password()}</a
			>
		</div>
		<div class="grid gap-2">
			<Label for="new_password">{m.account_new_password_label()}</Label>
			<Input
				type="password"
				id="new_password"
				name="new_password"
				bind:value={$form.new_password}
				aria-invalid={$tainted?.new_password && $errors.new_password ? 'true' : undefined}
				error={$tainted?.new_password && $errors.new_password}
			/>
		</div>
		<div class="grid gap-2">
			<Label for="confirm_password">{m.account_confirm_new_password_label()}</Label>
			<Input
				type="password"
				id="confirm_password"
				name="confirm_password"
				bind:value={$form.confirm_password}
				aria-invalid={$tainted?.confirm_password && $errors.confirm_password ? 'true' : undefined}
				error={$tainted?.confirm_password && $errors.confirm_password}
			/>
		</div>
		<div class="flex w-full justify-end">
			<Button type="submit">{m.account_update_password()}</Button>
		</div>
	</form>
</section>
