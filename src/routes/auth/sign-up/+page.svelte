<script lang="ts">
	import InfoIcon from '@lucide/svelte/icons/info';
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
	import { RadioGroup, RadioGroupItem } from '$lib/components/ui/radio-group';
	import { USER_ROLES_DESCRIPTION } from './utils.js';
	import {
		Tooltip,
		TooltipContent,
		TooltipProvider,
		TooltipTrigger
	} from '$lib/components/ui/tooltip/index.js';
	import { cn } from '$lib/utils.js';
	import { ROUTES } from '$lib/constants.js';

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
		<CardTitle class="text-2xl">Sign up</CardTitle>
		<CardDescription
			>Enter your name, email and password below to create a new account</CardDescription
		>
	</CardHeader>
	<CardContent class="space-y-4">
		<form method="POST" use:enhance action="?/signup" class="space-y-4">
			<div class="grid gap-2">
				<Label for="email">Name</Label>
				<Input
					id="full_name"
					name="full_name"
					aria-invalid={errors.full_name ? 'true' : undefined}
					error={errors.full_name}
				/>
			</div>

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
				<Label for="password">Password</Label>
				<Input
					id="password"
					type="password"
					name="password"
					aria-invalid={errors.password ? 'true' : undefined}
					error={errors.password}
				/>
			</div>

			<div class="grid gap-2">
				<Label for="role">Choose your role</Label>
				<RadioGroup name="role">
					{#each USER_ROLES_DESCRIPTION as { role, label, description }}
						<div class="flex items-center space-x-2">
							<RadioGroupItem value={role} id={role} />
							<Label for={role} class="inline-flex items-center gap-2 font-normal">
								{label}
								<TooltipProvider delayDuration={100}>
									<Tooltip>
										<TooltipTrigger>
											<InfoIcon class="size-3" /></TooltipTrigger
										>
										<TooltipContent class="max-w-xs">
											<ul class="flex list-disc flex-col gap-1.5 pl-4">
												{#each description as desc}
													<li>{desc}</li>
												{/each}
											</ul>
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>
							</Label>
						</div>
					{/each}
					{#if errors.role}
						<span class="animate-in fade-in-30 slide-in-from-top text-xs text-red-400"
							>{errors.role}</span
						>{/if}
				</RadioGroup>
			</div>

			<Button type="submit" class="w-full">Sign up</Button>
		</form>
		<form id="socials" method="POST" use:enhance>
			<button
				class={cn(buttonVariants({ variant: 'outline' }), 'w-full')}
				formaction="?/signup&provider=google"
			>
				Login with Google
			</button>
		</form>
		<div class="mt-4 text-center text-sm">
			Already have an account? <a href={ROUTES.auth.login} class="underline">Login</a>
		</div>
	</CardContent>
</Card>
