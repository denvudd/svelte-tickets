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
			<CardTitle class="text-2xl">Forgot Password</CardTitle>
			<CardDescription>Enter your email address to receive a password reset link.</CardDescription>
		</CardHeader>
		<CardContent>
			<div class="space-y-4">
				<div class="grid gap-2">
					<Label for="email">Email</Label>
					<Input
						id="email"
						name="email"
						aria-invalid={errors.email ? 'true' : undefined}
						error={errors.email}
					/>
				</div>
				<Button type="submit" class="w-full">Send Reset Link</Button>
			</div>
		</CardContent>
	</Card>
</form>
