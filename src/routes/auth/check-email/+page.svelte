<script>
	import { Card, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';

	const { data } = $props();
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
		<CardTitle class="text-2xl">Check your email</CardTitle>
		<CardDescription
			>We have sent you an email with instructions on {renderReasonLabel()}</CardDescription
		>
	</CardHeader>
</Card>
