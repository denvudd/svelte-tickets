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

<form method="POST" use:enhance action="?/resetPassword">
	<Card class="mx-auto max-w-sm">
		<CardHeader>
			<CardTitle class="text-2xl">Reset Password</CardTitle>
			<CardDescription>Enter your new password to reset your password.</CardDescription>
		</CardHeader>
		<CardContent>
			<div class="space-y-4">
				<div class="grid gap-2">
					<div class="flex items-center">
						<Label for="password">New Password</Label>
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
						<Label for="confirmPassword">Confirm Password</Label>
					</div>
					<Input
						id="confirmPassword"
						type="password"
						name="confirmPassword"
						aria-invalid={errors.confirmPassword ? 'true' : undefined}
						error={errors.confirmPassword}
					/>
				</div>
				<Button type="submit" class="w-full">Reset Password</Button>
			</div>
		</CardContent>
	</Card>
</form>
