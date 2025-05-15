<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardHeader,
		CardTitle,
		CardContent,
		CardDescription,
		CardFooter
	} from '$lib/components/ui/card';
	import type { PageData } from './$types';
	import PasswordManagementForm from './components/password-management-form.svelte';
	import EmailManagementForm from './components/email-management-form.svelte';
	import DeleteAccountForm from './components/delete-account-form.svelte';
	import { Separator } from '$lib/components/ui/separator';

	let { data }: { data: PageData } = $props();
	let { passwordForm, emailForm, user } = $derived(data);
</script>

<Card class="mx-auto w-full max-w-full">
	<CardHeader>
		<CardTitle>Account</CardTitle>
		<CardDescription>Update your account information</CardDescription>
	</CardHeader>

	<CardContent class="space-y-6">
		<PasswordManagementForm {passwordForm} />
        <Separator/>
		<EmailManagementForm {emailForm} currentUserEmail={user?.email} />
        <Separator/>
		<DeleteAccountForm />
	</CardContent>
</Card>
