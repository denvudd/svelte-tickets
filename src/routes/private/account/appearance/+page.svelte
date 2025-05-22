<script lang="ts">
	import {
		Card,
		CardHeader,
		CardTitle,
		CardContent,
		CardDescription
	} from '$lib/components/ui/card';
	import { Label } from '$lib/components/ui/label';
	import PaintbrushIcon from '@lucide/svelte/icons/paintbrush';
	import { mode, setMode } from 'mode-watcher';
	import * as m from '$lib/paraglide/messages';
	</script>

<Card class="mx-auto w-full max-w-full">
	<CardHeader>
		<CardTitle>{m.appearence_title()}</CardTitle>
		<CardDescription
			>{m.appearence_description()}</CardDescription
		>
	</CardHeader>
	<CardContent class="space-y-6">
		<div class="space-y-2">
			<Label for="full_name" class="flex items-center gap-2 text-lg">
				<PaintbrushIcon class="h-5 w-5" />
				{m.appearence_theme()}
			</Label>
			<div class="grid max-w-md grid-cols-2 gap-8 pt-2">
				<div>
					<button
						data-state={mode.current === 'light' ? 'checked' : 'unchecked'}
						class="data-[state=checked]:border-primary w-full border-muted hover:border-accent items-center rounded-md border-2 p-1"
                        aria-label="Light theme"
                        onclick={() => setMode('light')}
					>
						<div class="space-y-2 rounded-sm bg-[#ecedef] p-2">
							<div class="space-y-2 rounded-md bg-white p-2 shadow-sm">
								<div class="h-2 w-[80px] rounded-lg bg-[#ecedef]"></div>
								<div class="h-2 w-[100px] rounded-lg bg-[#ecedef]"></div>
							</div>
							<div class="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm">
								<div class="h-4 w-4 rounded-full bg-[#ecedef]"></div>
								<div class="h-2 w-[100px] rounded-lg bg-[#ecedef]"></div>
							</div>
							<div class="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm">
								<div class="h-4 w-4 rounded-full bg-[#ecedef]"></div>
								<div class="h-2 w-[100px] rounded-lg bg-[#ecedef]"></div>
							</div>
						</div>
					</button>
					<span class="block w-full p-2 text-center font-normal">{m.appearence_light()}</span>
				</div>
				<div>
					<button
						data-state={mode.current === 'dark' ? 'checked' : 'unchecked'}
						class="data-[state=checked]:border-primary w-full border-muted bg-popover hover:bg-accent hover:text-accent-foreground items-center rounded-md border-2 p-1"
                        aria-label="Dark theme"
                        onclick={() => setMode('dark')}
                        >
						<div class="space-y-2 rounded-sm bg-slate-950 p-2">
							<div class="space-y-2 rounded-md bg-slate-800 p-2 shadow-sm">
								<div class="h-2 w-[80px] rounded-lg bg-slate-400"></div>
								<div class="h-2 w-[100px] rounded-lg bg-slate-400"></div>
							</div>
							<div class="flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-sm">
								<div class="h-4 w-4 rounded-full bg-slate-400"></div>
								<div class="h-2 w-[100px] rounded-lg bg-slate-400"></div>
							</div>
							<div class="flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-sm">
								<div class="h-4 w-4 rounded-full bg-slate-400"></div>
								<div class="h-2 w-[100px] rounded-lg bg-slate-400"></div>
							</div>
						</div>
					</button>
					<span class="block w-full p-2 text-center font-normal">{m.appearence_dark()}</span>
				</div>
			</div>
		</div>
	</CardContent>
</Card>
