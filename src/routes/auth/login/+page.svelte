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
	import { cn } from '$lib/utils';
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
		<CardTitle class="text-2xl">{m.login_title()}</CardTitle>
		<CardDescription>{m.login_description()}</CardDescription>
	</CardHeader>
	<CardContent class="space-y-4">
		<form method="POST" use:enhance action="?/login" class="space-y-4">
			<div class="grid gap-2">
				<Label for="email">{m.login_email_label()}</Label>
				<Input
					id="email"
					name="email"
					aria-invalid={errors.email ? 'true' : undefined}
					error={errors.email}
				/>
			</div>

			<div class="grid gap-2">
				<div class="flex items-center">
					<Label for="password">{m.login_password_label()}</Label>
					<a href={ROUTES.auth.forgotPassword} class="ml-auto inline-block text-sm underline"
						>Forgot your password?</a
					>
				</div>
				<Input
					id="password"
					type="password"
					name="password"
					aria-invalid={errors.password ? 'true' : undefined}
					error={errors.password}
				/>
			</div>

			<Button type="submit" class="w-full">{m.login_button()}</Button>
		</form>

		<form id="socials" method="POST" use:enhance>
			<button
				class={cn(buttonVariants({ variant: 'outline' }), 'w-full')}
				formaction="?/login&provider=google"
			>
				{m.login_google()}
			</button>
		</form>

		<div class="mt-4 text-center text-sm">
			{m.login_have_account()} <a href={ROUTES.auth.signUp} class="underline">{m.login_signup()}</a>
		</div>
	</CardContent>
</Card>
