<script lang="ts">
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { fileProxy, superForm, type Infer } from 'sveltekit-superforms';
	import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar';
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardHeader,
		CardTitle,
		CardContent,
		CardDescription,
		CardFooter
	} from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { ProfileSchema } from './schema';
	import { toast } from 'svelte-sonner';
	import UploadIcon from '@lucide/svelte/icons/upload';
	import UserIcon from '@lucide/svelte/icons/user';
	import MailIcon from '@lucide/svelte/icons/mail';
	import BriefcaseIcon from '@lucide/svelte/icons/briefcase';
	import { invalidate } from '$app/navigation';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { user, profile, form: loadedForm } = $state(data);
	let previewUrl = $state<string | null>(null);

	const { form, errors, enhance } = superForm<Infer<typeof ProfileSchema>>(loadedForm, {
		validators: zodClient(ProfileSchema),
		resetForm: false,
		onUpdate(event) {
			if (event.result.type === 'success') {
				invalidate('supabase:auth');
				toast.success('Profile updated!');
			}
		}
	});

	const avatarShortcut = profile?.full_name?.slice(0, 2).toUpperCase();
	const file = fileProxy(form, 'avatar');

	$effect(() => {
		const currentFile = $file?.[0];

		if (currentFile) {
			const reader = new FileReader();

			reader.onload = () => {
				previewUrl = reader.result as string;
			};
			reader.readAsDataURL(currentFile);
		}
	});
</script>

<Card class="mx-auto w-full max-w-full">
	<CardHeader>
		<CardTitle>Profile</CardTitle>
		<CardDescription>Update your personal information</CardDescription>
	</CardHeader>

	<form method="POST" enctype="multipart/form-data" use:enhance>
		<CardContent class="space-y-6">
			<div class="flex flex-col items-center space-y-4">
				<Avatar class="h-24 w-24">
					<AvatarImage src={previewUrl || profile?.avatar_url || ''} alt={profile?.full_name} />
					<AvatarFallback class="bg-muted text-2xl">{avatarShortcut}</AvatarFallback>
				</Avatar>
				<div class="flex items-center">
					<input
						type="file"
						name="avatar"
						accept="image/*"
						class="hidden"
						id="avatar-upload"
						bind:files={$file}
					/>
					<Button
						type="button"
						variant="outline"
						onclick={() => document.getElementById('avatar-upload')?.click()}
						class="flex items-center gap-2"
					>
						<UploadIcon class="h-4 w-4" />
						Upload Avatar
					</Button>
				</div>
				{#if $errors.avatar}
					<p class="text-destructive text-sm">{$errors.avatar}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<Label for="full_name" class="flex items-center gap-2">
					<UserIcon class="h-4 w-4" />
					Name
				</Label>
				<Input
					name="full_name"
					id="full_name"
					placeholder="Enter your name"
					required
					bind:value={$form.full_name}
					aria-invalid={$errors.full_name ? 'true' : undefined}
					error={$errors.full_name}
				/>
			</div>

			<div class="space-y-2">
				<div class="flex items-center">
					<Label for="email" class="flex items-center gap-2">
						<MailIcon class="h-4 w-4" />
						Email
					</Label>
					<a href="/private/account/settings#email-management" class="ml-auto inline-block text-sm underline">Want to change it?</a>
				</div>
				<Input id="email" value={user?.email} disabled />
			</div>

			<div class="space-y-2">
				<Label for="occupation" class="flex items-center gap-2">
					<BriefcaseIcon class="h-4 w-4" />
					Occupation
				</Label>
				<Input
					name="occupation"
					id="occupation"
					placeholder="Enter your occupation"
					bind:value={$form.occupation}
					aria-invalid={$errors.occupation ? 'true' : undefined}
					error={$errors.occupation}
				/>
			</div>
		</CardContent>

		<CardFooter>
			<Button type="submit" class="w-full">Save Changes</Button>
		</CardFooter>
	</form>
</Card>
