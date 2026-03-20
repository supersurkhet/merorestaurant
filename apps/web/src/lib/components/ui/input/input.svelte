<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';

	let {
		class: className = '',
		value = $bindable(''),
		...restProps
	}: { class?: string; value?: string } & HTMLInputAttributes = $props();
</script>

<input
	bind:value
	class="flex h-10 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm text-foreground transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 {className}"
	{...restProps}
/>
