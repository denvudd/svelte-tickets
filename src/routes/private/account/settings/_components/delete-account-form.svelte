<script lang="ts">
	import TrashIcon from '@lucide/svelte/icons/trash';
	import ExternalLinkIcon from '@lucide/svelte/icons/external-link';
	import { Button } from '$lib/components/ui/button';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import { enhance } from '$app/forms';
	import {
		AlertDialog,
		AlertDialogAction,
		AlertDialogCancel,
		AlertDialogContent,
		AlertDialogDescription,
		AlertDialogFooter,
		AlertDialogHeader,
		AlertDialogTitle,
		AlertDialogTrigger
	} from '$lib/components/ui/alert-dialog';

	let isAlertDialogOpen = $state(false);

	const handleToggleAlertDialog = () => (isAlertDialogOpen = !isAlertDialogOpen);
</script>

<section id="delete-account">
	<div class="mb-4 flex items-center gap-2">
		<TrashIcon class="text-destructive h-5 w-5" />
		<h3 class="text-destructive text-lg font-medium">Delete Account</h3>
	</div>
	<Alert variant="destructive">
		<AlertDescription class="flex items-center gap-2">
			<ExternalLinkIcon class="h-4 w-4" />
			This action cannot be undone. This will permanently delete your account and remove your data from
			our servers.
		</AlertDescription>
	</Alert>
	<div class="flex w-full justify-end">
		<Button variant="destructive" type="submit" class="mt-4" onclick={handleToggleAlertDialog}
			>Delete Account</Button
		>
	</div>
</section>

<AlertDialog open={isAlertDialogOpen} onOpenChange={handleToggleAlertDialog}>
	<AlertDialogContent>
		<form method="POST" action="?/deleteAccount" use:enhance>
			<AlertDialogHeader>
				<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
				<AlertDialogDescription>
					This action cannot be undone. This will permanently delete your account and remove your
					data from our servers.
				</AlertDialogDescription>
			</AlertDialogHeader>
			<AlertDialogFooter>
				<AlertDialogCancel onclick={handleToggleAlertDialog} type="button">Cancel</AlertDialogCancel>
				<AlertDialogAction type="submit">Continue</AlertDialogAction>
			</AlertDialogFooter>
		</form>
	</AlertDialogContent>
</AlertDialog>
