<script lang="ts">
	import InfoIcon from '@lucide/svelte/icons/info';
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
	import { RadioGroup, RadioGroupItem } from '$lib/components/ui/radio-group';
	import { USER_ROLES_DESCRIPTION } from '../sign-up/utils';
	import {
		Tooltip,
		TooltipContent,
		TooltipProvider,
		TooltipTrigger
	} from '$lib/components/ui/tooltip';
	import * as m from '$lib/paraglide/messages.js';

	let { form } = $props();

	let errors = $derived(form?.form?.errors ?? {});

	$effect(() => {
		if (Object.keys(errors).length) {
			document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
		}
	});
</script>

<form method="POST" use:enhance action="?/completeProfile" class="space-y-6">
	<Card class="mx-auto max-w-sm">
		<CardHeader>
			<CardTitle class="text-2xl">{m.complete_profile_title()}</CardTitle>
			<CardDescription>{m.complete_profile_description()}</CardDescription>
		</CardHeader>
		<CardContent class="space-y-4">
			<div class="grid gap-2">
				<Label for="email">{m.complete_profile_name_label()}</Label>
				<Input
					id="name"
					name="name"
					aria-invalid={errors.name ? 'true' : undefined}
					error={errors.name}
				/>
			</div>

			<div class="grid gap-2">
				<Label for="role">{m.complete_profile_role_label()}</Label>
				<RadioGroup name="role">
					{#each USER_ROLES_DESCRIPTION() as { role, label, description }}
						<div class="flex items-center space-x-2">
							<RadioGroupItem value={role} id={role} />
							<Label for={role} class="inline-flex items-center gap-2 font-normal">
								{label}
								<TooltipProvider delayDuration={100}>
									<Tooltip>
										<TooltipTrigger>
											<InfoIcon class="size-3" />
										</TooltipTrigger>
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

			<Button type="submit" class="w-full">{m.complete_profile_button()}</Button>
		</CardContent>
	</Card>
</form>
