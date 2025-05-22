<script lang="ts">
	import {
		Card,
		CardHeader,
		CardTitle,
		CardContent,
		CardDescription,
		CardFooter
	} from '$lib/components/ui/card';
	import type { PageData } from './$types';
	import PasswordManagementForm from './_components/password-management-form.svelte';
	import EmailManagementForm from './_components/email-management-form.svelte';
	import DeleteAccountForm from './_components/delete-account-form.svelte';
	import { Separator } from '$lib/components/ui/separator';
	import * as m from '$lib/paraglide/messages';

	let { data }: { data: PageData } = $props();
	let { passwordForm, emailForm, user } = $derived(data);
</script>

<Card class="mx-auto w-full max-w-full">
	<CardHeader>
		<CardTitle>{m.account_title()}</CardTitle>
		<CardDescription>{m.account_description()}</CardDescription>
	</CardHeader>

	<CardContent class="space-y-6">
		<PasswordManagementForm {passwordForm} />
		<Separator />
		<EmailManagementForm {emailForm} currentUserEmail={user?.email} />
		<Separator />
		<DeleteAccountForm />
	</CardContent>
</Card>
