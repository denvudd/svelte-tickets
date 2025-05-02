<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
</script>

<form method="POST" action="?/login" class="mx-auto flex max-w-sm w-full flex-col gap-4">
	<div class="flex w-full max-w-sm flex-col gap-2">
		<Label for="email">Email</Label>
		<Input type="email" id="email" placeholder="Your email" />
	</div>
	<div class="flex w-full max-w-sm flex-col gap-2">
		<Label for="password">Password</Label>
		<Input name="password" type="password" placeholder="Your password" />
	</div>
	<div class="flex flex-col gap-2">
		<Button>Login</Button>
		<Button formaction="?/signup">Sign up</Button>
	</div>
</form>
