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

<form method="POST" use:enhance action="?/login" class="space-y-6">
	<Card class="mx-auto max-w-sm">
		<CardHeader>
			<CardTitle class="text-2xl">Login</CardTitle>
			<CardDescription>Enter your email and password below to login to your account</CardDescription
			>
		</CardHeader>
		<CardContent class="space-y-4">
			<div class="grid gap-2">
				<Label for="email">Email</Label>
				<Input
					id="email"
					name="email"
					aria-invalid={errors.email ? 'true' : undefined}
					error={errors.email}
				/>
			</div>

			<div class="grid gap-2">
				<div class="flex items-center">
					<Label for="password">Password</Label>
					<a href="/auth/forgot-password" class="ml-auto inline-block text-sm underline"
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

			<Button type="submit" class="w-full">Login</Button>
			<Button variant="outline" class="w-full">Login with Google</Button>

			<div class="mt-4 text-center text-sm">
				Don't have an account? <a href="/auth/sign-up" class="underline">Sign up</a>
			</div>
		</CardContent>
	</Card>
</form>
