<script lang="ts">
	import { Card, CardDescription, CardHeader } from '$lib/components/ui/card';
	import type { PageData } from './$types';

	const { data }: { data: PageData } = $props();
	const { message, errorDescription } = $derived(data);
</script>

<Card class="mx-auto max-w-sm">
	<CardHeader class="pb-6">
		<CardDescription>{message || errorDescription}</CardDescription>
	</CardHeader>
</Card>
