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

			<Button type="submit" class="w-full">{m.complete_profile_button()}</Button>
		</CardContent>
	</Card>
</form>
