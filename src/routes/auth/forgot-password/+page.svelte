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

<form method="POST" use:enhance action="?/forgotPassword">
	<Card class="mx-auto max-w-sm">
		<CardHeader>
			<CardTitle class="text-2xl">{m.forgot_password_title()}</CardTitle>
			<CardDescription>{m.forgot_password_description()}</CardDescription>
		</CardHeader>
		<CardContent>
			<div class="space-y-4">
				<div class="grid gap-2">
					<Label for="email">{m.forgot_password_email_label()}</Label>
					<Input
						id="email"
						name="email"
						aria-invalid={errors.email ? 'true' : undefined}
						error={errors.email}
					/>
				</div>
				<Button type="submit" class="w-full">{m.forgot_password_button()}</Button>
			</div>
		</CardContent>
	</Card>
</form>
