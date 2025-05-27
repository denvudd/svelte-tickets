<script lang="ts">
	import { Button, buttonVariants } from '$lib/components/ui/button';
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
	import { cn } from '$lib/utils.js';
	import { ROUTES } from '$lib/constants.js';
	import * as m from '$lib/paraglide/messages.js';

	let { form } = $props();

	let errors = $derived(form?.form?.errors ?? {});

	$effect(() => {
		if (Object.keys(errors).length) {
			document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
		}
	});
</script>

<Card class="mx-auto max-w-sm">
	<CardHeader>
		<CardTitle class="text-2xl">{m.signup_title()}</CardTitle>
		<CardDescription>{m.signup_description()}</CardDescription>
	</CardHeader>
	<CardContent class="space-y-4">
		<form method="POST" use:enhance action="?/signup" class="space-y-4">
			<div class="grid gap-2">
				<Label for="email">{m.signup_name_label()}</Label>
				<Input
					id="full_name"
					name="full_name"
					aria-invalid={errors.full_name ? 'true' : undefined}
					error={errors.full_name}
				/>
			</div>

			<div class="grid gap-2">
				<Label for="email">{m.signup_email_label()}</Label>
				<Input
					id="email"
					name="email"
					aria-invalid={errors.email ? 'true' : undefined}
					error={errors.email}
				/>
			</div>

			<div class="grid gap-2">
				<Label for="password">{m.signup_password_label()}</Label>
				<Input
					id="password"
					type="password"
					name="password"
					aria-invalid={errors.password ? 'true' : undefined}
					error={errors.password}
				/>
			</div>

			<Button type="submit" class="w-full">{m.signup_button()}</Button>
		</form>
		<form id="socials" method="POST" use:enhance>
			<button
				class={cn(buttonVariants({ variant: 'outline' }), 'w-full')}
				formaction="?/signup&provider=google"
			>
				{m.signup_google()}
			</button>
		</form>
		<div class="mt-4 text-center text-sm">
			{m.signup_have_account()} <a href={ROUTES.auth.login} class="underline">{m.signup_login()}</a>
		</div>
	</CardContent>
</Card>
