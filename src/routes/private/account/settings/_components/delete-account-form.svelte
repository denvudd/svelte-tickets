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
	} from '$lib/components/ui/alert-dialog';
	import * as m from '$lib/paraglide/messages';

	let isAlertDialogOpen = $state(false);

	const handleToggleAlertDialog = () => (isAlertDialogOpen = !isAlertDialogOpen);
</script>

<section id="delete-account">
	<div class="mb-4 flex items-center gap-2">
		<TrashIcon class="text-destructive h-5 w-5" />
		<h3 class="text-destructive text-lg font-medium">{m.account_delete_title()}</h3>
	</div>
	<Alert variant="destructive">
		<AlertDescription class="flex items-center gap-2">
			<ExternalLinkIcon class="h-4 w-4" />
			{m.account_delete_description()}.
		</AlertDescription>
	</Alert>
	<div class="flex w-full justify-end">
		<Button variant="destructive" type="submit" class="mt-4" onclick={handleToggleAlertDialog}
			>{m.account_delete_button()}</Button
		>
	</div>
</section>

<AlertDialog open={isAlertDialogOpen} onOpenChange={handleToggleAlertDialog}>
	<AlertDialogContent>
		<form method="POST" action="?/deleteAccount" use:enhance>
			<AlertDialogHeader>
				<AlertDialogTitle>{m.account_delete_confirm_title()}</AlertDialogTitle>
				<AlertDialogDescription>
					{m.account_delete_confirm_description()}
				</AlertDialogDescription>
			</AlertDialogHeader>
			<AlertDialogFooter>
				<AlertDialogCancel onclick={handleToggleAlertDialog} type="button">{m.account_delete_confirm_cancel()}</AlertDialogCancel>
				<AlertDialogAction type="submit">{m.account_delete_confirm_continue()}</AlertDialogAction>
			</AlertDialogFooter>
		</form>
	</AlertDialogContent>
</AlertDialog>
