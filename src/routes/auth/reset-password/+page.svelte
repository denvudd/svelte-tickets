<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import {
		Card,
		CardHeader,
		CardTitle,
		CardContent,
		CardDescription
	} from '$lib/components/ui/card';
	import { enhance } from '$app/forms';
	import * as m from '$lib/paraglide/messages';

	let { form } = $props();

	let errors = $derived(form?.form?.errors ?? {});

	$effect(() => {
		if (Object.keys(errors).length) {
			document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
		}
	});
</script>

<form method="POST" use:enhance action="?/resetPassword">
	<Card class="mx-auto max-w-sm">
		<CardHeader>
			<CardTitle class="text-2xl">{m.reset_password_title()}</CardTitle>
			<CardDescription>{m.reset_password_description()}</CardDescription>
		</CardHeader>
		<CardContent>
			<div class="space-y-4">
				<div class="grid gap-2">
					<div class="flex items-center">
						<Label for="password">{m.reset_password_new_password_label()}</Label>
					</div>
					<Input
						id="password"
						type="password"
						name="password"
						aria-invalid={errors.password ? 'true' : undefined}
						error={errors.password}
					/>
				</div>
				<div class="grid gap-2">
					<div class="flex items-center">
						<Label for="confirmPassword">{m.reset_password_confirm_password_label()}</Label>
					</div>
					<Input
						id="confirmPassword"
						type="password"
						name="confirmPassword"
						aria-invalid={errors.confirmPassword ? 'true' : undefined}
						error={errors.confirmPassword}
					/>
				</div>
				<Button type="submit" class="w-full">{m.reset_password_button()}</Button>
			</div>
		</CardContent>
	</Card>
</form>
