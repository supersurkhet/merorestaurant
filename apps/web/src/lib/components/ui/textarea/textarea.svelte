<script lang="ts">
	import type { HTMLTextareaAttributes } from 'svelte/elements';

	let {
		class: className = '',
		value = $bindable(''),
		...restProps
	}: { class?: string; value?: string } & HTMLTextareaAttributes = $props();
</script>

<textarea
	bind:value
	class="flex min-h-[80px] w-full resize-none rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 {className}"
	{...restProps}
></textarea>
