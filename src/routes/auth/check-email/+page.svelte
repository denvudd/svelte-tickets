<script lang="ts">
	import { Card, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import type { PageData } from './$types';
	import * as m from '$lib/paraglide/messages.js';

	const { data }: { data: PageData } = $props();
	const { reason } = $derived(data);

	const renderReasonLabel = () => {
		switch (reason) {
			case 'forgot-password':
				return 'how to reset your password';
			case 'verify-email':
				return 'how to verify your email';
		}
	};
</script>

<Card class="mx-auto max-w-sm">
	<CardHeader class="pb-6">
		<CardTitle class="text-2xl">{m.check_email_title()}</CardTitle>
		<CardDescription
			>{m.check_email_description()} {renderReasonLabel()}</CardDescription
		>
	</CardHeader>
</Card>
