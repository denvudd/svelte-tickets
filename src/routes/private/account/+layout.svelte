<script>
	import AccountSidebar from './components/account-sidebar.svelte';

	let { children } = $props();
</script>

<div class="grid grid-cols-10 gap-4 auto-rows-auto">
	<div class="col-span-3"><AccountSidebar /></div>
	<div class="col-span-7">{@render children()}</div>
</div>
